
const Category = require('../../models/categorySchema')
const Product = require('../../models/productSchema')
const Brand  = require('../../models/brandSchema');
const Offer = require('../../models/offerSchema')
const Wishlist = require('../../models/wishlistSchema')



// ===============================================UserHome-GET===================================================================//
exports.getHomepage = async (req, res) => {
  try {
    const categories = await Category.find({ isListed: true });

    const products = await Product.find({ isListed: true })
    .populate({
     path: "category",
     match: {isListed:true} })
     .populate({
      path: 'brand',
      match: { isListed: true }
    });

    const categoryOffers = await Offer.find({
      isActive: true,
      validFrom: { $lte: new Date() },
      validTo: { $gte: new Date() }
    });

    const validProducts = products.filter(
      (product) => product.category && product.brand && product.variants.some((variant) => variant.isListed)
    );
    
    //Creating a Discount Lookup Object
    const categoryDiscounts = {};
    categoryOffers.forEach((offer) => {
      categoryDiscounts[offer.categoryId.toString()] = offer.categoryDiscount;
    })
    
    
    const ListedProducts = validProducts.map((product)=> {
      const productOffer = product.productDiscount || 0;
      const categoryOffer = categoryDiscounts[product.category._id.toString()] || 0
     
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
   const category = await Category.findOne({ _id: categoryId, isListed: true });
    if (!category) {
      return res.redirect('/pageNotFound');
    }

   const categoryOffer = await Offer.findOne({ 
    categoryId,
    isActive: true,
    validFrom: { $lte: new Date() },
    validTo: { $gte: new Date() }
   });


   const products = await Product.find({ category: categoryId, isListed: true })
    .populate({
      path: 'brand',
      match: { isListed: true }, 
    });

    // Prepare category-level discount
    const categoryDiscount = categoryOffer ? categoryOffer.categoryDiscount : 0;

    const validProducts = products.filter(
      (product) => product.brand && product.variants.some((variant) => variant.isListed)
    );

     const ListedProducts = validProducts.filter(product => product.variants.some(variant => variant.isListed))
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

    const products = await Product.find(query)
      .populate({
        path: 'category',
        match: { isListed: true }, 
      })
      .populate({
        path: 'brand',
        match: { isListed: true }, 
      });

    const validProducts = products.filter(
      (product) => product.category && product.brand && product.variants.some((variant) => variant.isListed)
    );
    const categoryOffers = await Offer.find({
      isActive: true,
      validFrom: { $lte: new Date() },
      validTo: { $gte: new Date() }
    });
    const categoryDiscounts = {};
    categoryOffers.forEach((offer) => {
      categoryDiscounts[offer.categoryId.toString()] = offer.categoryDiscount;
    });

    const ListedProducts = validProducts.filter((product) => product.variants.some((variant) => variant.isListed))
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
    const userId = req.session.user ? req.session.user.id : null; //for wishlist button(showing)

    const productData = await Product.findOne({ _id: productId, isListed: true })
      .populate({
        path: 'category',
        match: { isListed: true }, 
      })
      .populate({
        path: 'brand',
        match: { isListed: true }, 
      });

    if (!productData || !productData.category || !productData.brand) {
      return res.redirect('/pageNotFound');
    }

     
    const categoryOffers = await Offer.find({
      isActive: true,
      validFrom: { $lte: new Date() },
      validTo: { $gte: new Date() }
    });

     // Creating a Discount Lookup Object
     const categoryDiscounts = {};
     categoryOffers.forEach((offer) => {
       categoryDiscounts[offer.categoryId.toString()] = offer.categoryDiscount;
     });

    
    productData.variants = productData.variants.filter(v => v.isListed);


    
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
 
    
     const maxDiscount = Math.max(productOffer, categoryOffer);
 
    
     const discountedPrice = Math.round(productData.actualPrice - (productData.actualPrice * maxDiscount) / 100);
 
     // Attach the discount details
     const productWithDiscount = {
       ...productData.toObject(),
       sellingPrice: discountedPrice,
       appliedDiscount: maxDiscount,
     };
 

    const relatedProducts = await Product.find({ category: productData.category._id, _id: { $ne: productId } })
      .limit(4);


    let isInWishlist = false;
    if (userId) {
        const wishlist = await Wishlist.findOne({ user: userId });
        if (wishlist) {
            isInWishlist = wishlist.items.some(
                (item) =>
                    item.product.toString() === productId &&
                    item.variant.toString() === selectedVariant._id.toString()
            );
        }
    }

      return res.render('product-detail', { productData: productWithDiscount, selectedVariant, relatedProducts,isInWishlist });
    } catch (error) {
    console.log("Error in loading Product detail page", error);
    return res.redirect('/pageNotFound');
  }
};

// ==================================================================================================================//



