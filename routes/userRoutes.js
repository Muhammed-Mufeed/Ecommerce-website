const express= require('express')
const router=express.Router()
const userController=require('../controllers/user/userController')
const productController = require('../controllers/user/productController')
const{checkLogin,checkLogout,checkBlocked} = require('../middlewares/userAuth')
const passport = require('../config/passport')
const User = require('../models/userSchema')
// ==================================================================================================================//

router.get('/pageNotFound',checkLogin,userController.getpageNotFound)
// ==================================================================================================================//

router.get('/signup', checkLogout,userController.getSignupPage)
router.post('/signup',userController.postSignupPage)
// ==================================================================================================================//

router.post('/verify-otp',userController.postverifyOtp)
router.post('/resend-otp',userController.postResendOtp)
// ==================================================================================================================//

router.get('/login', checkLogout, userController.getLoginPage)
router.post('/login',userController.postLoginPage)
router.post('/logout', userController.postLogoutPage)

// ==================================================================================================================//

router.get('/',checkBlocked, productController.getHomepage)
router.get('/userproducts',checkBlocked,productController.getProductspage)
router.get('/productdetail/:id',checkBlocked, productController.getProductDetailPage)
router.get('/categoryProducts/:categoryId',checkBlocked,productController.getCategoryProductspage)
// ==================================================================================================================//

router.get('/auth/google',passport.authenticate('google',{ scope: ['profile','email'] }))
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }),userController.googleLogin);
//Here session auth middleware(no need to give authmiddleware) is present, if loged failed goes to '/login'. else goes to '/'(that callbackFn written in cntrller) 

// ==================================================================================================================//

module.exports=router