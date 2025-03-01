const Product = require('../../models/productSchema')
const Cart = require('../../models/cartSchema')


// =========================================================AddtoCart-POST===================================================//

exports.postAddtoCart = async (req,res)=>{
  try {
    const{productId,variantId} = req.body
    const userId = req.session.user.id

    // Fetch the product and check variant stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const variant = product.variants.id(variantId);
    if (!variant) {
      return res.status(404).json({ success: false, message: "Variant not found" });
    }

    if (variant.stock <= 0) {
      return res.status(400).json({ success: false, message: "Out of stock" });
    }

    // Find the user's cart
    let cart = await Cart.findOne({user: userId})

    // If no cart exists, create a new one
    if(!cart){
      cart = new Cart({user: userId , items:[]})
    }

    // Check if the item already exists in the cart
    const existingItem = cart.items.find( (item) => item.product.toString() === productId && item.variant.toString() === variantId) 

    if(existingItem){

      existingItem.quantity += 1;       // If item exists, increment the quantity
    
    }
    else{
      cart.items.push({product:productId ,variant:variantId ,quantity:1})  // If item does not exist, add it to the cart
    }

    await cart.save()
    res.status(200).json({success:true,message:"Item added to the Cart"})

  } catch (error) {
    console.log("Error While posting in the Product detail page",error)
    res.status(500).json({success:false,message:"Internal Server Error"})
    return
  }
}

// =========================================================CartPage-GET============================================================//
exports.getCartPage = async (req,res)=>{
  try {

    // Check if user is logged in
    if (!req.session.user) {
      return res.redirect('/login'); // Redirect to login page
    }

    const userId = req.session.user.id

    const cart = await Cart.findOne({user:userId}).populate('items.product') //forEg: Here, items.product stores only the _id of the product, not the actual product data.Without populate, you would only have the _id of the product, which is not useful for displaying product information
    
    if(!cart){
      return res.render('user-cart',{cartItems: [] , subtotal: 0})

    }
     
    
    // Calculate subtotal
    let subtotal = 0;

    // Manually fetch the correct variant from the product's `variants` array
    const cartItems = cart.items.map((item) => {
      const product = item.product 
      const variant = product.variants.id(item.variant) // Fetch variant manually from array
      
      if(!variant || !variant.isListed){
        return null
      }

      subtotal += product.sellingPrice * item.quantity

      return {
        product,
        variant, 
        quantity:item.quantity
      }

    }).filter(item => item !== null)  // Remove any null values


    return res.render('user-cart',{cartItems,subtotal})

  } catch (error) {
    console.log("Error in loading Cart Page",error)
    return res.redirect('/pageNotFound') 
  }
}

// =========================================================UpdateCartPage-POST============================================================//
exports.putUpdateCartPage = async (req,res)=>{
  try {
    const {productId,variantId,quantity} = req.body
    const userId = req.session.user.id

    const cart = await Cart.findOne({user:userId})

    if(!cart){
      return res.status(404).json({success:false, message:"Cart not found."})
    }

    // Find the item in the cart
    const item = cart.items.find(
      (item) => item.product.toString() === productId && item.variant.toString() === variantId
    )

    if(item){
      // Update the quantity
      item.quantity = quantity;
      await cart.save()
      return res.status(200).json({success:true,message:"Cart updated."})
    }
    else{
      return res.status(404).json({success:false, message:"Item not found in cart"})
    }
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

// =========================================================RemovCartPage-POST============================================================//

exports.deleteRemoveCart = async(req,res) => {
  try {
    const{productId,variantId} = req.body
    const userId = req.session.user.id

    const removedCart = await Cart.findOneAndUpdate(
      {user:userId},
      {$pull: {items: {product: productId, variant: variantId} } },
      {new:true}
    );

    if(!removedCart){
      return res.status(404).json({success:false, message:" Cart not found "})
    }

    //If cart is empty after removal , consider deleting it
    if(removedCart.items.length === 0){
      await Cart.deleteOne({ user: userId})
      return res.json({success:true , message: " Item removed and cart deleted "})
    }

    return res.json({success:true, message:"Item removed from the cart"})
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

// =========================================================checkOut-POST============================================================//

exports.postCartTocheckout = async (req,res) => {
  try {
    const userId = req.session.user.id;
    
    // Fetch the latest cart data
    const cart = await Cart.findOne({user: userId}).populate('items.product')

    if(!cart){
      return res.status(404).json({success:false, message:"Cart Items not found.please add Items in to the cart "})
    }

    // Validate quantity limit and stock availability
    for(const item of cart.items){
      const product = item.product;
      const variant = product.variants.id(item.variant)

      if(item.quantity > 5){
        return res.status(400).json({success:false,message:'You cannot buy more than 5 units of a single product.'})
      }

      if(!variant || variant.stock < item.quantity){
        return res.status(400).json({success:false,message:`Insufficient stock for ${product.name} ${variant.colorName} color.` })
      }
    }

    return res.status(200).json({success:true,message:'Proceed to checkout'})
  } catch (error) {
    console.error('Error during checkout validation:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}