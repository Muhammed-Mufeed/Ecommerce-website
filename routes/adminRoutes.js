  const express = require('express')
  const router = express.Router()
  const adminController = require('../controllers/adminController')
  const customerManagement = require('../controllers/customerManagement')
  const categoryManagement = require('../controllers/categoryManagement')
  const productManagement = require('../controllers/productManagement')
  const brandManagement = require('../controllers/brandManagement')

  const upload = require('../config/multer');
  const{checkLogin,checkLogout} = require('../middlewares/adminAuth')

  // ==================================================================================================================//
  router.get('/errorPage', checkLogin,adminController.getAdminErrorPage)
  // ==================================================================================================================//
  router.get('/login', checkLogout, adminController.getAdminLogin)
  router.post('/login', adminController.postAdminLogin)
  // ==================================================================================================================//
  router.post('/logout', checkLogin, adminController.postAdminLogout)
  router.get('/dashboard', checkLogin ,adminController.getAdminDashboard)
  // ==================================================================================================================//
  router.get('/customers',checkLogin,customerManagement.getuserManagement)
  router.patch('/customers/:userId/update-status',customerManagement.patchUpdateUserStatus)
  // ==================================================================================================================//
  router.get('/categories',checkLogin,categoryManagement.getCategoryManagement)
  router.get('/categories/add',checkLogin,categoryManagement.getAddCategory)
  router.post('/categories/add',upload.single,categoryManagement.postAddCategory)
  router.get('/categories/edit/:id',checkLogin,categoryManagement.getEditCategory)
  router.put('/categories/edit/:id',upload.single,checkLogin,categoryManagement.putEditCategory)
  router.patch('/categories/:categoryId/update-CategoryStatus',categoryManagement.patchUpdateCategoriesStatus)
  // ==================================================================================================================//
  router.get('/products',productManagement.getProductManagement)
  router.get('/products/add',productManagement.getAddProduct)
  // ==================================================================================================================//
  router.get('/brands', checkLogin, brandManagement.getBrandManagement);
  router.get('/brands/add', checkLogin, brandManagement.getAddBrand);
  router.post('/brands/add', brandManagement.postAddBrand);
  router.get('/brands/edit/:id',checkLogin, brandManagement.getEditBrand);
  router.put('/brands/edit/:id', brandManagement.putEditBrand);
  router.patch('/brands/:brandId/update-BrandStatus',brandManagement.patchUpdateBrandStatus);


  module.exports = router