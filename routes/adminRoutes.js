const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')
const{checkLogin,checkLogout} = require('../middlewares/adminAuth')

router.get('/errorPage', checkLogin,adminController.getAdminpageNotFound)
router.get('/login', checkLogout, adminController.getAdminLogin)
router.post('/login', adminController.postAdminLogin)
router.post('/logout', checkLogin, adminController.postAdminLogout)
router.get('/dashboard', checkLogin ,adminController.getAdminDashboard)


module.exports = router