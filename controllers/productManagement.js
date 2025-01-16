const Product = require('../models/productSchema')
const Category = require('../models/categorySchema')
const Brand= require('../models/brandSchema')
const path = require('path')



// ===============================================ProductManagement-GET===================================================================//

exports.getProductManagement = async (req,res)=>{
  try {
     // Get page and search parameters
    const page = parseInt(req.query.page)|| 1;
    const limit =5;
    const search = req.query.search || '';

    //create search Filter
    const searchFilter = {
      $or:[
        {  name: {$regex: search, $options: 'i'}}
      ]
    }

   // Count total documents of users that match the filter for pagination
     const totalProducts = await Product.countDocuments(searchFilter)
     const totalPages = Math.ceil (totalProducts / limit);

   // Fetch users based on pagination and search filter

   const products = await Product.find(searchFilter)
   .skip( (page - 1)* limit) 
   .limit(limit)             
   .sort({createdAt : 1})   // Newest last

   // Render the page and pass products, pagination info, and search keyword 
   res.render('products',{products,totalPages,currentPage:page,search})


  } catch (error) {
    console.error("Error during loading products page",error)
    res.status(500).send("Internal Server Error")
  }
}

// ===============================================AddProduct-GET===================================================================//
exports.getAddProduct = async (req,res)=>{
  try {
    const categories = await Category.find({isListed:true})
    const brands = await Brand.find({ isListed: true });

    res.render('add-product',{categories,brands}) 
  } catch (error) {
    console.log("Error loading add product page")
    res.status(500).send("Internal Server Error")
  }
}

exports.postAddProduct =  async (req, res) => {
  try {
  
      const { name, description, category, brand, price } = req.body;
      const images = req.files.map(file => file.path); // Paths to uploaded images

      

      res.json({ success: true, message: 'Product added successfully!', product: newProduct });
  } catch (error) {
      res.status(500).json({ success: false, message: error.message });
  }
}
