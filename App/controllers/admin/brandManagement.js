const Brand= require('../../models/brandSchema')


// ====================================================brandManagement-GET========================================================================//
exports.getBrandManagement = async (req,res)=>{
  try {
    
       const page = parseInt(req.query.page) || 1;
       const limit = 5;
       const search = req.query.search || '';
    
       const searchFilter ={ 
        $or:[
          {name: {$regex: search, $options: 'i'}}, 
         ] 
       }
       
         
        const totalBrands = await Brand.countDocuments(searchFilter)    
    
        const totalPages = Math.ceil(totalBrands / limit)  
    
       
        const brands = await Brand.find(searchFilter)
         .skip( (page - 1)* limit) 
         .limit(limit)             
         .sort({createdAt : 1})   // Newest last
        
        
         res.render('brands',{brands,currentPage:page,totalPages,search})
      } 
      catch (error) {
        console.error("Error during loading category page",error)
        res.redirect('/admin/errorPage')
      }
}


// ===============================================AddBrand-GET===================================================================//

exports.getAddBrand = (req,res)=>{
  try {
    res.render('add-brand')
  } catch (error) {
    console.error("Error during loading Brand adding page",error)
    res.redirect('/admin/errorPage')
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

      
       
        if (name.trim().length < 2 || name.trim().length > 20) {
            return res.status(400).json({ 
                success: false, 
                message: 'Brand name must be between 2 and 20 characters' 
            });
        }

        const existingBrand = await Brand.findOne({
            name: { $regex: `^${name.trim()}$`, $options: "i" }
        });

        if (existingBrand) {
            return res.status(400).json({ 
                success: false, 
                message: 'Brand already exists' 
            });
        }

        // Create new brand
        const newBrand = new Brand({
            name: name.trim(),
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
      res.redirect('/admin/errorPage')
  }
}


// ===============================================EditBrand-PUT===================================================================//

exports.putEditBrand = async (req, res) => {
    try {
        const { name } = req.body;
        const brandId =req.params.id
        // Basic validation:

        if (!name || name.trim() === '') {
            return res.status(400).json({ message: 'Brand name is required' });
        }

      
        const existingBrand = await Brand.findById(brandId);
        if (!existingBrand) {
            return res.status(404).json({ message: 'Brand not found' });
        }

        // Check if another brand already has this name
       const duplicateBrand = await Brand.findOne({ 
               name: { $regex: `^${name.trim()}$`, $options: "i" }, 
               _id: { $ne: brandId } 
             });
        
        if (duplicateBrand) {
            return res.status(400).json({ message: 'Brand name already exists' });
        }

        
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

    
    const message = brand.isListed  ? 'The Brand Listed successfully.' : 'The Brand Unlisted successfully.';
    
    res.status(200).json({success:true, isListed:brand.isListed, message})   // Current Listed status after toggling
    
   }

   catch (error) {
    console.log("Error occured while updating Brand Status",error)
    res.status(500).json({message:"Internal Server Error"})
  }
}