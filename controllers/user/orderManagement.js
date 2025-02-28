const Product = require('../../models/productSchema')
const Cart = require('../../models/cartSchema')


// ===============================================CheckoutPage-GET===================================================================//

exports.getCheckoutPage = async (req,res) =>{
  try {
    return res.render('user-checkout')
  } catch (error) {
   console.log("Error in loading Checkout page",error)
   return res.redirect('/pageNotFound')
  }
}

