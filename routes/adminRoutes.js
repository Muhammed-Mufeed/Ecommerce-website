  const express = require('express')
  const router = express.Router()
  const adminController = require('../controllers/admin/adminController')
  const customerManagement = require('../controllers/admin/customerManagement')
  const categoryManagement = require('../controllers/admin/categoryManagement')
  // const productManagement = require('../controllers/admin/productManagement')
  const brandManagement = require('../controllers/admin/brandManagement')


  const{checkLogin,checkLogout} = require('../middlewares/adminAuth')
  const upload = require("../middlewares/multer");

  // ==================================================================================================================//
  router.get('/errorPage', checkLogin,adminController.getAdminErrorPage)
  // ==================================================================================================================//
  router.get('/login', checkLogout, adminController.getAdminLogin)
  router.post('/login', adminController.postAdminLogin)
  // ==================================================================================================================//
  router.post('/logout',  adminController.postAdminLogout)
  router.get('/dashboard', checkLogin ,adminController.getAdminDashboard)
  // ==================================================================================================================//
  router.get('/customers',checkLogin,customerManagement.getuserManagement)
  router.patch('/customers/:userId/update-status',customerManagement.patchUpdateUserStatus)
  // ==================================================================================================================//
  router.get('/categories',checkLogin,categoryManagement.getCategoryManagement)
  router.get('/categories/add',checkLogin,categoryManagement.getAddCategory)
  router.post('/categories/add',upload.single('image'),categoryManagement.postAddCategory)
  router.get('/categories/edit/:id',checkLogin,categoryManagement.getEditCategory)
  router.put('/categories/edit/:id',checkLogin,upload.single('image'),categoryManagement.putEditCategory)
  router.patch('/categories/:categoryId/update-CategoryStatus',categoryManagement.patchUpdateCategoriesStatus)
  // ==================================================================================================================//
  // router.get('/products',checkLogin,productManagement.getProductManagement)
  // router.get('/products/add',checkLogin,productManagement.getAddProduct)
  // router.post('/products/add',upload.array,productManagement.postAddProduct)
  // router.get('/products/edit/:id',checkLogin,productManagement.getEditProduct)
  // router.put('/products/edit/:id',upload.array,productManagement.putEditProduct)
  // router.patch('/products/:productId/update-ProductStatus',productManagement.patchUpdateProductStatus)

  // ==================================================================================================================//
  router.get('/brands', checkLogin, brandManagement.getBrandManagement);
  router.get('/brands/add', checkLogin, brandManagement.getAddBrand);
  router.post('/brands/add', brandManagement.postAddBrand);
  router.get('/brands/edit/:id',checkLogin, brandManagement.getEditBrand);
  router.put('/brands/edit/:id', brandManagement.putEditBrand);
  router.patch('/brands/:brandId/update-BrandStatus',brandManagement.patchUpdateBrandStatus);


  module.exports = router