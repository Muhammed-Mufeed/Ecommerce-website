const express= require('express')
const router=express.Router()
const userController=require('../controllers/userController')

router.get('/pageNotFound',userController.getpageNotFound)
router.get('/signup',userController.getSingupPage)
router.post('/signup',userController.postSignupPage)
router.post('/verify-otp',userController.postverifyOtp)
router.get('/',userController.getHomepage)



module.exports=router