
const Category = require('../../models/categorySchema')
const Product = require('../../models/productSchema')
const Brand  = require('../../models/brandSchema');
const Offer = require('../../models/offerSchema')




// ===============================================UserHome-GET===================================================================//
exports.getHomepage = async (req, res) => {
  try {
    const categories = await Category.find({ isListed: true });
    const products = await Product.find({ isListed: true }).populate("category");
    const categoryOffers = await Offer.find({ isActive: true });
    
    // Map category discounts for quick lookup
    const categoryDiscounts = {};
    categoryOffers.forEach((offer) => {
      categoryDiscounts[offer.categoryId.toString()] = offer.categoryDiscount;
    })
    
    // Filter out products with no listed variants
    const ListedProducts = products.filter((product) => product.variants.some((variant) => variant.isListed))
     .map((product)=> {
      const productOffer = product.productDiscount || 0;
      const categoryOffer = categoryDiscounts[product.category._id.toString()] || 0
     
      // Use the greater discount
      const maxDiscount = Math.max(productOffer,categoryOffer)

      // Calculate the new selling price
      const discountedPrice = Math.round(product.actualPrice - (product.actualPrice * maxDiscount) / 100)

      return {
        ...product.toObject(),  // Convert mongoose document to plain object
        sellingPrice:discountedPrice, // Override selling price
        appliedDiscount:maxDiscount //// Pass applied discount for frontend display
      }

    })

    return res.render('home',{categories,products: ListedProducts})

  } catch (error) {
    console.log("Error in loading Homepage:", error);
    return res.redirect("/pageNotFound");
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

   const categoryOffer = await Offer.findOne({ categoryId, isActive: true });


   const products = await Product.find({category:categoryId,isListed:true}).populate("category")

    // Prepare category-level discount
    const categoryDiscount = categoryOffer ? categoryOffer.categoryDiscount : 0;

    // Filter listed products & apply discount logic
    const ListedProducts = products.filter(product => product.variants.some(variant => variant.isListed))
      .map(product => {
        const productOffer = product.productDiscount || 0;
        const maxDiscount = Math.max(productOffer, categoryDiscount);

        
        const discountedPrice = Math.round(product.actualPrice - (product.actualPrice * maxDiscount) / 100);

        return {
          ...product.toObject(),  
          sellingPrice: discountedPrice, 
          appliedDiscount: maxDiscount,  
        };
      });

 
   return res.render('categoryProducts',{products:ListedProducts,category})
  } catch (error) {
   console.log("Error in loading Category related Products page")
   return res.redirect('/pageNotFound')
  }
     
 }


 // =======================================================Products-GET============================================================//

 exports.getProductspage = async (req, res) => {
  try {

    const { availability, discount, minPrice, maxPrice, category, brand, sort } = req.query;

    let query = { isListed: true };

    if (availability === 'inStock') {
      query['variants'] = { $elemMatch: { stock: { $gt: 0 } } };  
    }

    
    if (minPrice && maxPrice) {
      query.sellingPrice = { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) };
    } else if (minPrice) {
      query.sellingPrice = { $gte: parseInt(minPrice) };
    } else if (maxPrice) {
      query.sellingPrice = { $lte: parseInt(maxPrice) };
    }

    if (category) {
      query.category = { $in: Array.isArray(category) ? category : [category] };
    }

    if (brand) {
      query.brand = { $in: Array.isArray(brand) ? brand : [brand] };
    }

    let products = await Product.find(query).populate('category').populate('brand');
    const categoryOffers = await Offer.find({ isActive: true });

    // Map category discounts for quick lookup
    const categoryDiscounts = {};
    categoryOffers.forEach((offer) => {
      categoryDiscounts[offer.categoryId.toString()] = offer.categoryDiscount;
    });

    // Filter out products with no listed variants & apply discount logic
    const ListedProducts = products.filter((product) => product.variants.some((variant) => variant.isListed))
      .map((product) => {
        const productOffer = product.productDiscount || 0;
        const categoryOffer = categoryDiscounts[product.category._id.toString()] || 0;
        
        // Use the greater discount
        const maxDiscount = Math.max(productOffer, categoryOffer);
        
        // Calculate the new selling price
        const discountedPrice = Math.round(product.actualPrice - (product.actualPrice * maxDiscount) / 100);
        
        return {
          ...product.toObject(), // Convert mongoose document to plain object
          sellingPrice: discountedPrice, // Override selling price
          appliedDiscount: maxDiscount // Pass applied discount for frontend display
        };
      });    

    if (sort === 'aZ') {
      products.sort((a, b) => a.name.localeCompare(b.name)); // Ascending (aA - zZ)
    } else if (sort === 'zA') {
      products.sort((a, b) => b.name.localeCompare(a.name)); // Descending (zZ - aA)
    }

  

    const categories = await Category.find({});
    const brands = await Brand.find({});

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

     // Fetch active category offers
     const categoryOffers = await Offer.find({ isActive: true });

     // Map category discounts for quick lookup
     const categoryDiscounts = {};
     categoryOffers.forEach((offer) => {
       categoryDiscounts[offer.categoryId.toString()] = offer.categoryDiscount;
     });

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

     // Get product and category discount
     const productOffer = productData.productDiscount || 0;
     const categoryOffer = categoryDiscounts[productData.category._id.toString()] || 0;
 
     // Use the greater discount
     const maxDiscount = Math.max(productOffer, categoryOffer);
 
     // Calculate the new selling price
     const discountedPrice = Math.round(productData.actualPrice - (productData.actualPrice * maxDiscount) / 100);
 
     // Attach the discount details
     const productWithDiscount = {
       ...productData.toObject(),
       sellingPrice: discountedPrice,
       appliedDiscount: maxDiscount,
     };
 

    const relatedProducts = await Product.find({ category: productData.category._id, _id: { $ne: productId } })
      .limit(4);

      return res.render('product-detail', { productData: productWithDiscount, selectedVariant, relatedProducts });
    } catch (error) {
    console.log("Error in loading Product detail page", error);
    return res.redirect('/pageNotFound');
  }
};

// ==================================================================================================================//



