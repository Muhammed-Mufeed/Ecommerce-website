
const Category = require('../../models/categorySchema')
const Product = require('../../models/productSchema')
const Brand  = require('../../models/brandSchema');
const { query } = require('express');



// ===============================================UserHome-GET===================================================================//

exports.getHomepage = async (req, res) => {
  try { 

    const categories = await Category.find({isListed:true})
    const products = await Product.find({isListed:true})
    
    // Filter out products that have no listed variants
    const ListedProducts = products.filter((product) => product.variants.some((variant)=>variant.isListed) )
 
    return res.render('home', {categories,products:ListedProducts }); 

   
  } catch (error) {
    console.log("Error in loading Homepage:", error);
    return res.redirect('/pageNotFound')
  }

};


// =========================================================CategoryProducts-GET===================================================//

exports.getCategoryProductspage = async (req,res)=>{
  try {
   const categoryId = req.params.categoryId

   // Fetch category details
   const category = await Category.findById(categoryId);
   if (!category) {
     return res.redirect('/pageNotFound');
   }

   const products = await Product.find({category:categoryId,isListed:true})

   const ListedProducts = products.filter((product) => product.variants.some((variant)=>variant.isListed) )
 
   return res.render('categoryProducts',{products:ListedProducts,category})
  } catch (error) {
   console.log("Error in loading Category related Products page")
   return res.redirect('/pageNotFound')
  }
     
 }


 // =======================================================Products-GET============================================================//

 exports.getProductspage = async (req, res) => {
  try {
    // Extract query parameters from the request
    const { availability, discount, minPrice, maxPrice, category, brand, sort } = req.query;

    // Base query to find listed products
    let query = { isListed: true };

    // Availability Filter
    if (availability === 'inStock') {
      query['variants'] = { $elemMatch: { stock: { $gt: 0 } } };  // Only include products with stock > 0
    }

    
    // Price Range Filter
    if (minPrice && maxPrice) {
      query.sellingPrice = { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) };
    } else if (minPrice) {
      query.sellingPrice = { $gte: parseInt(minPrice) };
    } else if (maxPrice) {
      query.sellingPrice = { $lte: parseInt(maxPrice) };
    }

    // Category Filter
    if (category) {
      query.category = { $in: Array.isArray(category) ? category : [category] };
    }

    // Brand Filter
    if (brand) {
      query.brand = { $in: Array.isArray(brand) ? brand : [brand] };
    }

    // Fetch Products from the Database
    let products = await Product.find(query).populate('category').populate('brand');

    // Sort Products
    if (sort === 'aZ') {
      products.sort((a, b) => a.name.localeCompare(b.name)); // Ascending (aA - zZ)
    } else if (sort === 'zA') {
      products.sort((a, b) => b.name.localeCompare(a.name)); // Descending (zZ - aA)
    }

    // Filter Products with Listed Variants
    const ListedProducts = products.filter((product) => product.variants.some((variant) => variant.isListed));

    // Fetch Categories and Brands for Filters
    const categories = await Category.find({});
    const brands = await Brand.find({});

    // Render the EJS Template with Filtered Data
    return res.render('user-products', { products: ListedProducts, categories, brands });
  } catch (error) {
    console.log("Error in loading All products page", error);
    return res.redirect('/pageNotFound');
  }
};

// ===================================================ProductDetail-GET==========================================================//

exports.getProductDetailPage = async (req, res) => {
  try {
    const productId = req.params.id;
    const variantId = req.query.variantId; 

    const productData = await Product.findById(productId)
      .populate('category')
      .populate('brand');

    if (!productData) {
      return res.status(404).json({success:false,message:"Product  not found."})
    }

    // Filter out unlisted variants
    productData.variants = productData.variants.filter(v => v.isListed);


    // Find the selected variant or default to the first variant
    let selectedVariant;

    if (variantId) {
        selectedVariant = productData.variants.find(v => v._id.toString() === variantId);
    } else {
        selectedVariant = productData.variants[0]; // Default to the first variant
    }
    
    if (!selectedVariant) {
      return res.redirect('/pageNotFound');
    }

    const relatedProducts = await Product.find({ category: productData.category._id, _id: { $ne: productId } })
      .limit(4);

    return res.render('product-detail', { productData, selectedVariant, relatedProducts });
  } catch (error) {
    console.log("Error in loading Product detail page", error);
    return res.redirect('/pageNotFound');
  }
};

// ==================================================================================================================//



