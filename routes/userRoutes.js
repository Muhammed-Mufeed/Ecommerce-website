const express= require('express')
const router=express.Router()
const userController=require('../controllers/userController')
// ==================================================================================================================//

router.get('/pageNotFound',userController.getpageNotFound)
// ==================================================================================================================//

router.get('/signup',userController.getSingupPage)
router.post('/signup',userController.postSignupPage)
// ==================================================================================================================//

router.post('/verify-otp',userController.postverifyOtp)
router.post('/resend-otp',userController.postResendOtp)
// ==================================================================================================================//

router.get('/login',userController.getLoginPage)
router.post('/login',userController.postLoginPage)
// ==================================================================================================================//

router.get('/',userController.getHomepage)
router.post('/logout',userController.postLogoutPage)
// ==================================================================================================================//




module.exports=router