const User=require('../../models/userSchema')
const Wallet = require('../../models/WalletSchema')
const Product = require('../../models/productSchema')
const Offer = require('../../models/offerSchema')
const Wishlist = require('../../models/wishlistSchema')
const bcrypt=require('bcrypt')


// =============================================UserProfile-GET=====================================================================//

exports. getUserProfile = async (req,res)=>{
  try {
    if(!req.session.user){
      return res.redirect('/login')
    }

    const user = await User.findById(req.session.user.id)
    if(!user){
      return res.status(404).json({success:false,message:"User not found."})
    }
    return res.render('user-profile',{user})
  } catch (error) {
    console.log("Error loading User profile page",error)
    return res.redirect('/pageNotFound')
  }
}

// =============================================UserChangePassword-GET=====================================================================//

exports.getChangePassword = async (req,res) => {
  try {
    if(!req.session.user){
      return res.redirect('/login')
    }
    return res.render('user-changePassword')
  } catch (error) {
    console.log("Error loading User change password page",error)
    return res.redirect('/pageNotFound')
  }
}

// =============================================UserChangePassword-POST=====================================================================//

exports.putChangePassword = async (req,res) =>{
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userId = req.session.user.id

    const user = await User.findById(userId)

    if(!user){
      return res.status(404).json({success:false,message:"User not found."})
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
        return res.status(400).json({ message: 'Old password is incorrect' });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: 'New passwords do not match' });
    }
   
    const hashedPassword =  await bcrypt.hash(newPassword,10)

    user.password = hashedPassword
    await user.save()

    return res.status(200).json({ success:true,message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({ success:false,message: 'Internal Server Error' }); 
  }
}

// =============================================EditUserProfile-GET========================================================================//
exports.getEditUserProfile = async (req,res) => {
  try {
    if(!req.session.user){
      return res.redirect('/login')
    }
    const user = await User.findById(req.session.user.id)
    if(!user){
      return res.status(404).json({success:false,message:"User not found."})
    }
    return res.render('user-profile-edit',{user})
  } catch (error) {
    console.log("Error loading User edit profile page",error)
    return res.redirect('/pageNotFound')
  }
}

// =============================================EditUserProfile-POST========================================================================//
exports.putEditUserProfile = async (req,res) => {
  try {
    
    const{fullName,email,mobile} = req.body
    const userId = req.session.user.id

    const user = await User.findById(userId)
   

    if(!user){
      return res.status(404).json({success:false,message:"User not found."})
    }
  // Check if email is already in use
    const existingUser = await User.findOne({ email });
    
    if(existingUser && existingUser._id.toString() !== userId.toString()){
      return res.status(400).json({ success:false,message: 'Email is already in use' });  
    }

     // Update user profile
     user.name = fullName;
     user.email = email;
     user.phone = mobile;

     await user.save();
     return res.status(200).json({success:true, message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ success:false,message: 'Internal Server Error' });
  }
}



// ===============================================WalletPage-GET===================================================================//

exports.getWallet = async (req, res) => {
  try {
    if (!req.session.user){
       return res.redirect('/login');
    }
    const userId = req.session.user.id;

    let wallet = await Wallet.findOne({ user: userId })
    
    if (!wallet) {
       wallet = new Wallet({
         user: userId,
          balance: 0,
           transactions: [] 
      });

      await wallet.save();
    }


    return res.render('user-wallet', { wallet });
  } catch (error) {
    console.error('Error fetching wallet:', error);
    return res.redirect('/pageNotFound');
  }
};

// ===============================================WishlistPage-GET===================================================================//
exports.getWishlistPage = async (req,res) => {
  try {
    if(!req.session.user){
      return res.redirect('/login')
    }
   const userId = req.session.user.id

   const wishlist = await Wishlist.findOne({user:userId})
   .populate({
    path:'items.product',
      populate: [
        {path:'category' , match: {isListed:true} },
        {path:'brand' , match: {isListed:true}}
      ]
    })
   if(!wishlist || wishlist.items.length === 0){
     return res.render('user-wishlist',{ wishlistItems:[] } )
   }

   const categoryOffers = await Offer.find({
    isActive:true,
     validFrom:{$lte: new Date() },
     validTo:{$gte: new Date() },
    })

    const categoryDiscounts = {} 
    categoryOffers.forEach((offer) => {
      categoryDiscounts[offer.categoryId.toString()] = offer.categoryDiscount
    })

    const wishlistItems = wishlist.items.map((item) =>{

      const product = item.product
      if(!product || !product.isListed || !product.category || !product.brand){
        return null
      }

      const variant = product.variants.id(item.variant)
      if(!variant || !variant.isListed){
        return null
      }

      const productOffer = product.productDiscount || 0
      const categoryOffer = categoryDiscounts[product.category._id.toString()] || 0;
      const maxDiscount = Math.max(productOffer,categoryOffer)
      const discountedPrice = Math.round(product.actualPrice - (product.actualPrice * maxDiscount) / 100)

      return{
        product: {
          ...product.toObject(),
          sellingPrice:discountedPrice,
          appliedDiscount:maxDiscount

        },
        variant
      };

    }).filter((item) => item !== null)
    return res.render('user-wishlist', { wishlistItems })
  } catch (error) {
    console.log("Error in loading Wishlist Page:", error);
    res.redirect('/pageNotFound');
  }
}

// ===============================================WishlistPage-POST===================================================================//
exports.postaddToWishlist = async (req,res) => {
  try {

    const {productId,variantId} = req.body
    const userId = req.session.user.id
    
    let wishlist = await Wishlist.findOne({user:userId})
    if(!wishlist){
      wishlist =  new Wishlist({
        user: userId,
        items:[{
          product:productId,
          variant:variantId
        }]
      })

      await wishlist.save()
      return res.status(200).json({success:true,action:'added',message:'Added to wishlist'})
    }

    const Itemindex = wishlist.items.findIndex((item) =>{
    return  item.product.toString() === productId && item.variant.toString() === variantId
    })

    if(Itemindex > -1){
      wishlist.items.splice(Itemindex,1)
      await wishlist.save()
      return res.status(200).json({success:true,action:'removed',message:'Removed from the wishlist'})
    }
    else{
      wishlist.items.push({product:productId,variant:variantId})
      await wishlist.save()
      return res.status(200).json({success:true,action:'added',message:'Added to wishlist'})
    }
  } catch (error) {
    console.log("Error in addToWishlist:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}


// ===============================================WishlistStatus-GET(home,products,productdetail)===================================================================//

exports.getWishlistItemsStatus = async (req, res) => {
  try {
      if(!req.session.user){
        return res.redirect('/login')
      }
      
      const userId = req.session.user.id;
      const wishlist = await Wishlist.findOne({ user: userId });
      if (!wishlist || !wishlist.items.length) {
          return res.status(200).json({ success: true, items: [] });
      }
      return res.status(200).json({ 
          success: true, 
          items: wishlist.items.map(item => ({
              productId: item.product.toString(),
              variantId: item.variant.toString()
          }))
      });
  } catch (error) {
      console.log("Error fetching wishlist items:", error);
      res.status(500).json({ success: false, message: "Server error" });
  }
};