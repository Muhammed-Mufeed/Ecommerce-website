const Brand= require('../models/brandSchema')


// ====================================================brandManagement-GET========================================================================//
exports.getBrandManagement = async (req,res)=>{
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
       
         // Count total documents of Brands that match the filter for pagination
        const totalBrands = await Brand.countDocuments(searchFilter)    
    
        const totalPages = Math.ceil(totalBrands / limit)  // Calculate total pages
    
        // Fetch Brands based on pagination and search filter
        const brands = await Brand.find(searchFilter)
         .skip( (page - 1)* limit) 
         .limit(limit)             
         .sort({createdAt : 1})   // Newest last
        
        // Render the page and pass brands, pagination info, and search keyword 
         res.render('brands',{brands,currentPage:page,totalPages,search})
      } 
      catch (error) {
        console.error("Error during loading category page",error)
        res.status(500).send("Internal Server Error")
      }
}


// ===============================================AddBrand-GET===================================================================//

exports.getAddBrand = (req,res)=>{
  try {
    res.render('add-brand')
  } catch (error) {
    console.error("Error during loading Brand adding page",error)
    res.status(500).send("Internal Server Error")
  }
}

// ===============================================AddBrand-POST===================================================================//

exports.postAddBrand = async (req, res) => {
    
      try {
        const { name } = req.body;

        // Server-side validation
        if (!name || typeof name !== 'string') {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid brand name' 
            });
        }

        // Trim and validate brand name
        const trimmedName = name.trim();

        if (trimmedName.length < 2 || trimmedName.length > 10) {
            return res.status(400).json({ 
                success: false, 
                message: 'Brand name must be between 2 and 10 characters' 
            });
        }

        // Check if brand already exists (case-insensitive)
        const existingBrand = await Brand.findOne({
            name: { $regex: new RegExp(`^${trimmedName}$`, 'i') }
        });

        if (existingBrand) {
            return res.status(400).json({ 
                success: false, 
                message: 'Brand already exists' 
            });
        }

        // Create new brand
        const newBrand = new Brand({
            name: trimmedName,
        });

        await newBrand.save();

        res.status(201).json({ 
            success: true, 
            message: 'Brand added successfully',
            brand: newBrand 
        });

    } catch (error) {
        console.error('Error in addBrand:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }

};

// ===============================================EditBrand-GET===================================================================//

exports.getEditBrand =  async (req, res) => {
  try {
      const brand = await Brand.findById(req.params.id);
      if (!brand) {
          return res.status(404).render('error', { message: 'Brand not found' });
      }
      res.render('edit-brand', { brand });
  } catch (error) {
      console.error('Error in getEditBrand:', error);
      res.status(500).render('error', { message: 'Error due to loading edit brand page ' });
  }
}


// ===============================================EditBrand-PUT===================================================================//

exports.putEditBrand = async (req, res) => {
    try {
        const { name } = req.body;
        
        // Basic validation
        if (!name || name.trim() === '') {
            return res.status(400).json({ message: 'Brand name is required' });
        }

        // Check if brand exists
        const existingBrand = await Brand.findById(req.params.id);
        if (!existingBrand) {
            return res.status(404).json({ message: 'Brand not found' });
        }

        // Check if another brand already has this name
        const duplicateBrand = await Brand.findOne({ 
            name: name.trim(), 
            _id: { $ne: req.params.id } 
        });
        if (duplicateBrand) {
            return res.status(400).json({ message: 'Brand name already exists' });
        }

        // Update brand
        const updatedBrand = await Brand.findByIdAndUpdate(  req.params.id, { name: name.trim() },  { new: true });

        res.status(200).json({ 
            message: 'Brand updated successfully', 
            brand: updatedBrand 
        });
    } catch (error) {
        console.error('Error updating brand:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// ====================================================updateBrandStatus-PATCH========================================================================//
exports.patchUpdateBrandStatus = async (req,res)=>{
  try {

    const brandId =  req.params.brandId
    const brand =  await Brand.findById(brandId)
     
     
    if(!brand){
      return res.status(404).json({success:false,message:"Brand not found"  })
    }


    brand.isListed = !brand.isListed;
   
    
    await brand.save()

    //To return success response with a message
    const message = brand.isListed  ? 'The Brand Listed successfully.' : 'The Brand Unlisted successfully.';
    
    res.status(200).json({success:true, isListed:brand.isListed, message})   // Current Listed status after toggling
    
   }

   catch (error) {
    res.status(500).json({success:false,message:"Internal server Error"})
  }
}