const express= require('express')
const router=express.Router()
const userController=require('../controllers/userController')
const{checkLogin,checkLogout} = require('../middlewares/userAuth')
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
// ==================================================================================================================//

router.get('/', userController.getHomepage)
router.post('/logout', userController.postLogoutPage)
// ==================================================================================================================//

router.get('/auth/google',passport.authenticate('google',{ scope: ['profile','email'] }))
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }),userController.googleLogin);
//Here session auth middleware(no need to give authmiddleware) is present, if loged failed goes to '/login'. else goes to '/'(that callbackFn written in cntrller) 

// ==================================================================================================================//

module.exports=router