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
    res.status(500).json({ success: false, message: 'Failed to add address.' });
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

    // Calculate subtotal and filter out unlisted products and variants
    let subtotal = 0;
    const validCartItems = cart.items
      .map((item) => {
        const product = item.product;
        const variant = product.variants.id(item.variant);

        // Check if the product and variant are listed
        if (!product.isListed || !variant || !variant.isListed) {
          return null; // Skip unlisted items
        }

        // Calculate subtotal
        subtotal += product.sellingPrice * item.quantity;

        // Return the valid cart item
        return {
          product,
          variant,
          quantity: item.quantity,
        };
      })
      .filter((item) => item !== null); // Remove null values

    if (validCartItems.length === 0) {
      return res.redirect('/cart'); // Redirect if no valid items are left
    }

    // Fetch the user's addresses
    const addresses = await Address.find({ userId, isListed: true });

    // Render the checkout page with the necessary data
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

exports.postCheckoutpage = async (req,res) =>{
  try {
    const userId = req.session.user.id;
    const { addressId, paymentMethod } = req.body;

    // Fetch the user's cart and populate product details
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty.' });
    }

    // Fetch the selected address
    const address = await Address.findOne({ _id: addressId, userId });
    if (!address) {
      return res.status(400).json({ success: false, message: 'Invalid address.' });
    }

    // Calculate subtotal and validate products/variants
    let subtotal = 0;
    const orderItems = cart.items.map((item) => {
      const product = item.product;
      const variant = product.variants.id(item.variant);

      // Check if the product and variant are listed and in stock
      if (!product.isListed || !variant || !variant.isListed || variant.stock < item.quantity) {
        throw new Error(`Product "${product.name}" (${variant.colorName}) is out of stock or unavailable.`);
      }

      // Calculate subtotal
      subtotal += product.sellingPrice * item.quantity;

      // Return order item details
      return {
        product: product._id,
        variant: variant._id,
        quantity: item.quantity,
        price: product.sellingPrice,
      };
    });

    // Create the order
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
      status: paymentMethod === 'cod' ? 'Pending' : 'Paid', // Update status based on payment method
    });

    // Save the order
    await order.save();

    // Reduce stock for each product variant
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      const variant = product.variants.id(item.variant);

      if (variant) {
        variant.stock -= item.quantity; // Reduce stock
        await product.save();
      }
    }

    // Clear the user's cart
    await Cart.findOneAndDelete({ user: userId });

    // Send success response
    res.status(200).json({ success: true, message: 'Order placed successfully.' });
  } catch (error) {
    console.error('Error placing order:', error);

    // Send error response to the client
    res.status(500).json({ success: false, message: error.message || 'Failed to place order.' });
  }
};
