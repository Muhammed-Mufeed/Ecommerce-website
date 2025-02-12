const User=require('../../models/userSchema')

const Category = require('../../models/categorySchema')
const Product = require('../../models/productSchema')



// ===============================================UserHome-GET===================================================================//

exports.getHomepage = async (req, res) => {
  try { 
    const user = req.session.user;

    const categories = await Category.find({isListed:true})
    const products = await Product.find({isListed:true})

    if (user) {

      const userData = await User.findOne({_id: user.id}); 
      return res.render('home', { userData,categories,products }); // Pass userData to EJS

    } 
    else {
      
      return res.render('home', { userData: null, categories,products });
    }
  } catch (error) {
    console.log("Error in getHomepage:", error);
    res.status(500).send("Server Error");
  }
};


// ===================================================ProductDetail-GET==========================================================//

exports.getProductDetailPage = async (req,res)=>{
  try {
    

   
}
catch(error){

}
}
// =======================================================Products-GET============================================================//

exports.getProductspage =async(req,res)=>{
  
}
// =========================================================CategoryProducts-GET===================================================//

exports.getCategoryProductspage = async (req,res)=>{
 
    
}
