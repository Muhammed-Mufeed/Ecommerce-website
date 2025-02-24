const User=require('../../models/userSchema')

const Category = require('../../models/categorySchema')
const Product = require('../../models/productSchema')



// ===============================================UserHome-GET===================================================================//

exports.getHomepage = async (req, res) => {
  try { 

    const categories = await Category.find({isListed:true})
    const products = await Product.find({isListed:true})
 
    return res.render('home', {categories,products }); 

   
  } catch (error) {
    console.log("Error in loading Homepage:", error);
    return res.redirect('/pageNotFound')
  }

};


// ===================================================ProductDetail-GET==========================================================//

exports.getProductDetailPage = async (req, res) => {
  try {
    const productId = req.params.id;
    const variantId = req.query.variantId; // Get the variantId from the query

    const productData = await Product.findById(productId)
      .populate('category')
      .populate('brand');

    if (!productData) {
      return res.redirect('/pageNotFound');
    }

    // Find the selected variant or default to the first variant
    let selectedVariant;

    if (variantId) {
        selectedVariant = productData.variants.find(v => v._id.toString() === variantId);
    } else {
        selectedVariant = productData.variants[0]; // Default to the first variant
    }

    const relatedProducts = await Product.find({ category: productData.category._id, _id: { $ne: productId } })
      .limit(4);

    return res.render('product-detail', { productData, selectedVariant, relatedProducts });
  } catch (error) {
    console.log("Error in loading Product detail page", error);
    return res.redirect('/pageNotFound');
  }
};


// =======================================================Products-GET============================================================//

exports.getProductspage =async(req,res)=>{
  try {
    
    const products = await Product.find({isListed:true})    
    return res.render('user-products',{products})
      
  }
  catch(error){
    console.log("Error in loading All products page")
    return res.redirect('/pageNotFound')
  }
  
}
// =========================================================CategoryProducts-GET===================================================//

exports.getCategoryProductspage = async (req,res)=>{
 try {
  const categoryId = req.params.categoryId
  const products = await Product.find({category:categoryId,isListed:true})
  
  return res.render('categoryProducts',{products})
 } catch (error) {
  console.log("Error in loading Category related Products page")
   return res.redirect('/pageNotFound')
 }
    
}
