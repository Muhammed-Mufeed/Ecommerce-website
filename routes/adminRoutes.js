const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')


router.get('/errorPage',adminController.getAdminpageNotFound)
router.get('/login',adminController.getAdminLogin)
router.post('/login',adminController.postAdminLogin)
router.post('/logout',adminController.postAdminLogout)
router.get('/dashboard',adminController.getAdminDashboard)


module.exports = router