const Product = require('../../models/productSchema')
const Cart = require('../../models/cartSchema')
const Address = require('../../models/addressSchema')
const Order = require('../../models/orderSchema')
const Offer = require('../../models/offerSchema')
const Coupon = require('../../models/couponSchema')
const Razorpay = require('razorpay')
const crypto = require('crypto');
const env = require('dotenv').config()
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


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
      return res.redirect('/');     // Redirect to home if it's empty
    }

    const categoryOffers =  await Offer.find({isActive:true});

    const categoryDiscounts = {};
    categoryOffers.forEach((offer) => {
      categoryDiscounts[offer.categoryId.toString()] = offer.categoryDiscount
    })


    let subtotal = 0;
    const validCartItems = cart.items
      .map((item) => {
        const product = item.product;
        const variant = product.variants.id(item.variant);

        
        if (!product.isListed || !variant || !variant.isListed) {
          return null; // Skip unlisted items
        }

        const productOffer = product.productDiscount || 0;
        const categoryOffer = categoryDiscounts[product.category.toString()] || 0

        const maxDiscount = Math.max(productOffer,categoryOffer)

        const discountedPrice = Math.round(product.actualPrice - (product.actualPrice * maxDiscount) / 100)

        subtotal += discountedPrice * item.quantity;


       
        return {
          product: {
            ...product.toObject(),
            sellingPrice:discountedPrice  //changed Selling Price
          },
          variant,
          quantity: item.quantity,
        };
      })
      .filter((item) => item !== null); 
    if (validCartItems.length === 0) {
      return res.redirect('/cart'); 
    }

    
    const addresses = await Address.find({ userId, isListed: true });
    
    const currentDate = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: currentDate },
      validTo: { $gte: currentDate },
      usageLimit: { $gt: 0 },
      usedBy: { $ne: userId }
    });

    res.render('user-checkout', {
      cartItems: validCartItems,
      addresses,
      subtotal,
      coupons,
      user:req.session.user
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
    const { addressId, paymentMethod,couponCode } = req.body;

    
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty.' });
    }

   
    const address = await Address.findOne({ _id: addressId, userId });
    if (!address) {
      return res.status(400).json({ success: false, message: 'Invalid address.' });
    }

    // Fetch category offers (same as getCheckoutPage)
    const categoryOffers = await Offer.find({ isActive: true });
    const categoryDiscounts = {};
    categoryOffers.forEach((offer) => {
      categoryDiscounts[offer.categoryId.toString()] = offer.categoryDiscount;
    });

    
    let subtotal = 0;
    const orderItems = cart.items.map((item) => {
        const product = item.product;
        const variant = product.variants.id(item.variant);

      
        if (!product.isListed || !variant || !variant.isListed || variant.stock < item.quantity) {
          throw new Error(`Product "${product.name}" (${variant.colorName}) is out of stock or unavailable.`);
        }

        // Apply product and category discounts (same logic as getCheckoutPage)
        const productOffer = product.productDiscount || 0;
        const categoryOffer = categoryDiscounts[product.category.toString()] || 0;
        const maxDiscount = Math.max(productOffer, categoryOffer);
        const discountedPrice = Math.round(product.actualPrice - (product.actualPrice * maxDiscount) / 100);

              
        subtotal += discountedPrice * item.quantity;

      
        return {

        productId: product._id,
        variantId: variant._id,
        product: {
          name: product.name,
          actualPrice: product.actualPrice,
          sellingPrice: discountedPrice,
        },

        variant: {
          color: variant.color,
          colorName: variant.colorName,
          images: variant.images
        },

        quantity: item.quantity,
        price: discountedPrice,
        status: 'Pending'   // Set initial status for each item
        };
    });

    
    let discountAmount = 0;
    let appliedCouponCode = null;
    
    if (couponCode) {
      const coupon = await Coupon.findOne({
        couponCode,
        isActive: true,
        validFrom: { $lte: new Date() },
        validTo: { $gte: new Date() },
        usageLimit: { $gt: 0 },
        usedBy: { $ne: userId }
      });

      if (!coupon) { 
        return res.status(400).json({  success: false,  message: 'Invalid or expired coupon.'});
      }

      if (subtotal < coupon.minPurchaseAmount) {
        return res.status(400).json({  success: false,  message: `Minimum purchase amount for this coupon is ₹${coupon.minPurchaseAmount}`});
      }

      discountAmount = coupon.discountAmount;
      appliedCouponCode = coupon.couponCode;

      coupon.usedBy.push(userId);
      coupon.usageLimit -= 1;
      await coupon.save();
    }

    const finalAmount = subtotal - discountAmount; 
    
    if (paymentMethod === 'online') {
        // Create Razorpay order
        const razorpayOrder = await razorpay.orders.create({
          amount: finalAmount * 100, // Convert to paise
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
        });

        // Save order with "Pending" payment status
        const order = new Order({
          user: userId,
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
          finalAmount,
          coupon: {
            couponCode: appliedCouponCode,
            discountAmount: discountAmount,
          },
          paymentStatus: 'Pending', // Add this field to track payment
          paymentDetails: {
            razorpayOrderId: razorpayOrder.id, // Store Razorpay order ID
          }, 
        });

        await order.save();

        // Return order details to trigger Razorpay popup
        return res.status(200).json({ success: true, message: 'Order created, proceed to payment.',  orderId: razorpayOrder.id,finalAmount,
        });

    } 
    else {
            // COD flow
            const order = new Order({
              user: userId,
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
              finalAmount,
              coupon: {
                couponCode: appliedCouponCode,
                discountAmount: discountAmount,
              },
              paymentStatus: 'Pending', // For COD, payment is pending until delivery
            });

          await order.save();

            // Reduce stock
            for (const item of cart.items) {
              const product = await Product.findById(item.product._id);
              const variant = product.variants.id(item.variant);
              if (variant) {
                variant.stock -= item.quantity;
                await product.save();
              }
            }

            await Cart.findOneAndDelete({ user: userId });

          return res.status(200).json({ success: true,message: 'Order placed successfully.',redirectUrl: '/',});
        }

  } catch (error) {
    console.error('Error placing order:', error);
    return res.status(500).json({ success: false, message: 'Failed to place order.' });
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


// ===============================================Online Payment-POST===================================================================//

exports.verifyOnlinePayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify the payment signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature === razorpay_signature) {
      // Payment is valid, update order
      const order = await Order.findOneAndUpdate(
        { 'paymentDetails.razorpayOrderId': razorpay_order_id }, 
        {
          paymentStatus: 'Paid',
          'paymentDetails.razorpayPaymentId': razorpay_payment_id, 
          'paymentDetails.razorpaySignature': razorpay_signature,  
        },
        { new: true }
      );

      // Reduce stock
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        const variant = product.variants.id(item.variantId);
        if (variant) {
          variant.stock -= item.quantity;
          await product.save();
        }
      }

      // Clear cart
      await Cart.findOneAndDelete({ user: req.session.user.id });

      return res.status(200).json({success: true,message: 'Payment verified and order placed.',redirectUrl: '/'});
    } 
    else {
      return res.status(400).json({ success: false,message: 'Invalid payment signature.' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({ success: false, message: 'Payment verification failed.' });
  }
};

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

