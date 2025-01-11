  const express = require('express')
  const router = express.Router()
  const adminController = require('../controllers/adminController')
  const customerController = require('../controllers/userManagement')
  const{checkLogin,checkLogout} = require('../middlewares/adminAuth')


  router.get('/errorPage', checkLogin,adminController.getAdminErrorPage)
  // ==================================================================================================================//
  router.get('/login', checkLogout, adminController.getAdminLogin)
  router.post('/login', adminController.postAdminLogin)
  // ==================================================================================================================//
  router.post('/logout', checkLogin, adminController.postAdminLogout)
  router.get('/dashboard', checkLogin ,adminController.getAdminDashboard)
  // ==================================================================================================================/
  router.get('/customers',checkLogin,customerController.getuserManagement)
  router.patch('/customers/:userId/update-status',customerController.patchUpdateUserStatus)
  module.exports = router