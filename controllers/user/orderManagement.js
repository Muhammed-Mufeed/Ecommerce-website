const Product = require('../../models/productSchema')
const Cart = require('../../models/cartSchema')
const Address = require('../../models/addressSchema')
const Order = require('../../models/orderSchema')



// ===============================================CheckoutPage-POST===================================================================//
 exports.postCheckoutAddaddress = async (req,res)=>{
   try {
    const { name, pincode,mobile,locality, address, city, state,  addressType } = req.body;
    const userId = req.session.user.id;

    const newAddress = new Address({
      userId,
      name,
      pincode,
      mobile,
      locality,
      address,
      city,
      state,
      addressType
    });

    await newAddress.save();

    res.status(200).json({ success: true, message: 'Address added successfully.' });
   } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({ success: false, message: 'Failed to add address.'});
   }
 }
   
 
// ===============================================CheckoutPage-GET===================================================================//

exports.getCheckoutPage = async (req, res) => {
  try {

    if(!req.session.user){
      return res.redirect('/login')
    }
    const userId = req.session.user.id;
    
    // Fetch the user's cart and populate product details
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.redirect('/cart'); // Redirect to cart if it's empty
    }

    
    let subtotal = 0;
    const validCartItems = cart.items
      .map((item) => {
        const product = item.product;
        const variant = product.variants.id(item.variant);

        
        if (!product.isListed || !variant || !variant.isListed) {
          return null; // Skip unlisted items
        }

        subtotal += product.sellingPrice * item.quantity;

       
        return {
          product,
          variant,
          quantity: item.quantity,
        };
      })
      .filter((item) => item !== null); 
    if (validCartItems.length === 0) {
      return res.redirect('/cart'); 
    }

    
    const addresses = await Address.find({ userId, isListed: true });

    
    res.render('user-checkout', {
      cartItems: validCartItems,
      addresses,
      subtotal,
    });
  } catch (error) {
    console.error('Error loading checkout page:', error);
    res.status(500).send('Internal Server Error');
  }
};

// ===============================================CheckoutPage-POST===================================================================//

exports.postPlaceOrder = async (req,res) =>{
  try {
    const userId = req.session.user.id;
    const { addressId, paymentMethod } = req.body;

    
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty.' });
    }

   
    const address = await Address.findOne({ _id: addressId, userId });
    if (!address) {
      return res.status(400).json({ success: false, message: 'Invalid address.' });
    }

    
    let subtotal = 0;
    const orderItems = cart.items.map((item) => {
        const product = item.product;
        const variant = product.variants.id(item.variant);

      
        if (!product.isListed || !variant || !variant.isListed || variant.stock < item.quantity) {
          throw new Error(`Product "${product.name}" (${variant.colorName}) is out of stock or unavailable.`);
        }

              
        subtotal += product.sellingPrice * item.quantity;

      
        return {

        productId: product._id,
        variantId: variant._id,
        product: {
          name: product.name,
          actualPrice: product.actualPrice,
          sellingPrice: product.sellingPrice,
        },

        variant: {
          color: variant.color,
          colorName: variant.colorName,
          images: variant.images
        },

        quantity: item.quantity,
        price: product.sellingPrice,
        status: 'Pending'   // Set initial status for each item
        };
    });

    //create order
    const order = new Order({
      user:userId,
      items: orderItems,
      address: {
        name: address.name,
        mobile: address.mobile,
        address: address.address,
        locality: address.locality,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        addressType: address.addressType,
      },
      paymentMethod,
      finalAmount: subtotal,
    });

    
    await order.save();

    // Reduce stock for each product variant
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      const variant = product.variants.id(item.variant);

      if (variant) {
        variant.stock -= item.quantity; 
        await product.save();
      }
    }

    // Clear the user's cart
    await Cart.findOneAndDelete({ user: userId });

    
    return res.status(200).json({ success: true, message: 'Order placed successfully.',redirectUrl:"/" });
  } catch (error) {
    console.error('Error placing order:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to place order.' });
  }
};

// ===============================================userOrdersList-GET===================================================================//
exports.getUserOrderList = async (req,res) => {
  try {
    if(!req.session.user) {
      return res.redirect('/login')
    } 
    
    const userId = req.session.user.id
    
    // Fetch the user's orders
    const orders = await Order.find({user:userId}).sort({createdAt : -1})

    return res.render('user-orders',{orders})
  } catch (error) {
    console.error('Error loading user orders Listing page:', error);
    return res.redirect('/pageNotFound'); 
  }
}

// ===============================================userOrdersHistory-GET===================================================================//
exports.getUserOrderHistory = async (req,res) =>{
  try {

    if(!req.session.user) {
      return res.redirect('/login')
    } 

    const orderId = req.params.orderId;
    const userId = req.session.user.id;

    const order = await Order.findOne({ _id: orderId, user: userId })

    if (!order) {
      return res.status(404).render('error', { message: 'Order not found.' });
    }

    return res.render('user-orderDetails', { order }); 
    
  } catch (error) {
    console.error('Error fetching order details:', error);
    return res.redirect('/pageNotFound');
  }
}

// ===============================================CancelOrder-PATCH===================================================================//

exports.patchCancelItem = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const {reason} = req.body
    const userId = req.session.user.id;

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const item = order.items.id(itemId); // Use item._id to find the item

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    if (item.status !== 'Pending' && item.status !== 'Shipped') {
      return res.status(400).json({ success: false, message: 'Item cannot be cancelled.' });
    }
    
    // Find the product and variant
    const product = await Product.findById(item.productId)
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const variant = product.variants.id(item.variantId);
    if (!variant) {
      return res.status(404).json({ success: false, message: 'Variant not found.' });
    }

    // Increment the stock of the variant after return 
    variant.stock += item.quantity
    
    await product.save()


    item.status = 'Cancelled';
    item.cancellationReason = reason; // Store the cancellation reason


    await order.save();

    return res.status(200).json({ success: true, message: 'Item cancelled successfully.' });
  } catch (error) {
    console.error('Error cancelling item:', error);
    return res.status(500).json({ success: false, message: 'Failed to cancel the item.' });
  }
};