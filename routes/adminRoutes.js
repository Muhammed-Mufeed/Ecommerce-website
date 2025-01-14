  const express = require('express')
  const router = express.Router()
  const adminController = require('../controllers/adminController')
  const customerManagement = require('../controllers/customerManagement')
  const categoryManagement = require('../controllers/categoryManagement')

  const upload = require('../config/multer');
  const{checkLogin,checkLogout} = require('../middlewares/adminAuth')


  router.get('/errorPage', checkLogin,adminController.getAdminErrorPage)
  // ==================================================================================================================//
  router.get('/login', checkLogout, adminController.getAdminLogin)
  router.post('/login', adminController.postAdminLogin)
  // ==================================================================================================================//
  router.post('/logout', checkLogin, adminController.postAdminLogout)
  router.get('/dashboard', checkLogin ,adminController.getAdminDashboard)
  // ==================================================================================================================/
  router.get('/customers',checkLogin,customerManagement.getuserManagement)
  router.patch('/customers/:userId/update-status',customerManagement.patchUpdateUserStatus)
  // ==================================================================================================================/
  router.get('/categories',checkLogin,categoryManagement.getCategoryManagement)
  router.get('/categories/add',checkLogin,categoryManagement.getAddCategory)
  router.post('/categories/add',upload.single('image'),categoryManagement.postAddCategory)
  router.get('/categories/edit/:id',checkLogin,categoryManagement.getEditCategory)
  router.put('/categories/edit/:id',upload.single('image'),checkLogin,categoryManagement.putEditCategory)
  router.patch('/categories/:categoryId/update-CategoryStatus',categoryManagement.patchUpdateCategoriesStatus)
  // ==================================================================================================================/
  module.exports = router