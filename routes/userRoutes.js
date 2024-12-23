const express= require('express')
const router=express.Router()
const userController=require('../controllers/userController')

router.get('/pageNotFound',userController.getpageNotFound)
router.get('/',userController.getHomepage)

module.exports=router