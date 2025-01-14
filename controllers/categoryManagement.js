const Category = require('../models/categorySchema')
const path =  require('path')



exports.getCategoryManagement = async (req,res)=>{
  try {
      // Get page and search parameters
   const page = parseInt(req.query.page) || 1;
   const limit = 5;
   const search = req.query.search || '';

   //create search Filter
   const searchFilter ={ 
    $or:[
      {name: {$regex: search, $options: 'i'}}, // Search in 'name' field
     ] 
   }
   
     // Count total documents of Categories that match the filter for pagination
    const totalCategories = await Category.countDocuments(searchFilter)    

    const totalPages = Math.ceil(totalCategories / limit)  // Calculate total pages

    // Fetch Categories based on pagination and search filter
    const categories = await Category.find(searchFilter)
     .skip( (page - 1)* limit) 
     .limit(limit)             
     .sort({createdAt : 1})   // Newest last
    
    // Render the page and pass categories, pagination info, and search keyword 
     res.render('categories',{categories,currentPage:page,totalPages,search})
  } 
  catch (error) {
    console.error("Error during loading category page",error)
    res.status(500).send("Internal Server Error")
  }
}


// ===============================================AddCategory-GET===================================================================//

exports.getAddCategory = (req,res)=>{
  try {
    res.render('add-category')
  } catch (error) {
    console.error("Error during loading Add category page",error)
    res.status(500).send("Internal Server Error")
  }
}

// ===============================================AddCategory-POST===================================================================//

exports.postAddCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        
        //  backend validations
        if (!name || name.trim().length < 3) {
            return res.status(400).json({
                success: false,
                message: 'Category name must be at least 3 characters'
            });
        }

        if (!description || description.trim().length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Description must be at least 10 characters'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image'
            });
        }

        // Check if category already exists
        const existingCategory = await Category.findOne({ 
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
        });
        
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Category with this name already exists'
            });
        }

        // Create new category
        const category = new Category({
            name: name.trim(),
            description: description.trim(),
            image: `/admin/uploads/categories/${req.file.filename}`
        });

        await category.save();

        res.status(200).json({
            success: true,
            message: 'Category added successfully'
        });

    } catch (error) {
        console.error('Error in postAddCategory:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add category'
        });
    }
};

// ===============================================EditCategory-GET===================================================================//
exports.getEditCategory = async (req, res) => {
  try {
      const categoryId = req.params.id;
      const category = await Category.findById(categoryId);
      
      if (!category) {
        return res.render('admin/error', {errroMessage: 'Category not found',  redirectUrl: '/admin/categories' });
      }

      res.render('edit-category', { category });

  } catch (error) {
      console.error('Error during loading EditCategory page:', error);
      res.status(500).send("Internal Server Error");
  }
}

// ===============================================EditCategory-PUT===================================================================//

 exports.putEditCategory = async (req,res)=>{
  try {

      const categoryId = req.params.id;
      const { name, description } = req.body;


      // backend validation 
      if (!name || name.trim().length < 3) {
        return res.status(400).json({
            success: false,
            message: 'Category name must be at least 3 characters'
        });
      }

      if (!description || description.trim().length < 10) {
        return res.status(400).json({
            success: false,
            message: 'Description must be at least 10 characters'
        });
      }

      
      // Find existing category
      const category = await Category.findById(categoryId);
      if (!category) {
          return res.status(404).json({ success: false, message: 'Category not found' });
      }

      // Handle image update
      let imagePath = category.image; // Keep existing image path by default

      if (req.file) {
         // Generate new image path
         imagePath = `/admin/uploads/categories/${req.file.filename}`   
      
       // Delete old image if it exists
        if (category.image) {
         const oldImagePath = path.join(__dirname, '../public', category.image);
          try {
            require('fs').promises.unlink(oldImagePath);
           } catch (error) {
            console.error('Error deleting old image:', error);
           }
        }   
     }  
         
      // Update category
      const updatedCategory = await Category.findByIdAndUpdate(categoryId, {name, description,image: imagePath  }, { new: true } );

       res.json({ success: true, message: 'Category updated successfully', category: updatedCategory });
   
 } 

  catch (error) {
  console.error('Error in updateCategory:', error);
  res.status(500).json({ success: false, message: 'Failed to update category' });
  } 
}

// ===============================================UpdateCategoryStatus-PATCH===================================================================//


exports.patchUpdateCategoriesStatus = async (req,res)=>{
  try {

    const categoryId =  req.params.categoryId
    const category =  await Category.findById(categoryId)

    if(!category){
      return res.status(404).json({success:false,message:"Category not found"  })
    }


    category.isListed = !category.isListed;

    await category.save()

    //To return success response with a message
    const message = category.isListed  ? 'The Category Listed successfully.' : 'The Category Unlisted successfully.';
    
    res.status(200).json({success:true,isListed:category.isListed,message})   // Current Listed status after toggling
    
   }

   catch (error) {
    res.status(500).json({success:false,message:"Internal server Error"})
  }
}