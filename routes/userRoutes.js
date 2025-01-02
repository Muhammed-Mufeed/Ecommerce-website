const express= require('express')
const router=express.Router()
const userController=require('../controllers/userController')
const{checkLogin,checkLogout} = require('../middlewares/userAuth')
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




module.exports=router