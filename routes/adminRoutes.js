  const express = require('express')
  const router = express.Router()
  const adminController = require('../controllers/admin/adminController')
  const customerManagement = require('../controllers/admin/customerManagement')
  const categoryManagement = require('../controllers/admin/categoryManagement')
  const productManagement = require('../controllers/admin/productManagement')
  const brandManagement = require('../controllers/admin/brandManagement')
  const orderManagement = require('../controllers/admin/orderManagement')


  const{checkLogin,checkLogout} = require('../middlewares/adminAuth')
  const {uploadCategoryImage, uploadProductImage}= require("../middlewares/multer");

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
  router.post('/categories/add',uploadCategoryImage.single('image'),categoryManagement.postAddCategory)
  router.get('/categories/edit/:id',checkLogin,categoryManagement.getEditCategory)
  router.put('/categories/edit/:id',uploadCategoryImage.single('image'),categoryManagement.putEditCategory)
  router.patch('/categories/:categoryId/update-CategoryStatus',categoryManagement.patchUpdateCategoryStatus)
  // ==================================================================================================================//
  router.get('/products',checkLogin,productManagement.getProductManagement)
  router.get('/products/add',checkLogin,productManagement.getAddProduct)
  router.post('/products/add',productManagement.postAddProduct)
  router.get('/products/edit/:id',checkLogin,productManagement.getEditProduct)
  router.put('/products/edit/:id',productManagement.putEditProduct)
  router.patch('/products/:productId/update-ProductStatus',productManagement.patchUpdateProductStatus)

  router.get('/products/:productId/variants',checkLogin,productManagement.getVariantsManagement)
  router.get('/products/:productId/variants/add',checkLogin,productManagement.getAddVariants)
  router.post('/products/:productId/variants/add',uploadProductImage.array('images',3),productManagement.postAddVariants)
  router.get('/products/:productId/variants/:variantId/edit',checkLogin,productManagement.getEditVariants)
  router.put('/products/:productId/variants/:variantId/edit',uploadProductImage.array('images',3),productManagement.putEditVariants)
  router.patch('/products/:productId/variants/:variantId/update-VariantStatus',productManagement.patchUpdateVariantStatus)
 

  // ==================================================================================================================//
  router.get('/brands', checkLogin, brandManagement.getBrandManagement);
  router.get('/brands/add', checkLogin, brandManagement.getAddBrand);
  router.post('/brands/add', brandManagement.postAddBrand);
  router.get('/brands/edit/:id',checkLogin, brandManagement.getEditBrand);
  router.put('/brands/edit/:id', brandManagement.putEditBrand);
  router.patch('/brands/:brandId/update-BrandStatus',brandManagement.patchUpdateBrandStatus);
  // ==================================================================================================================//
  router.get('/orders',checkLogin,orderManagement.getOrderListPage)
  router.get('/orders/:orderId',checkLogin,orderManagement.getOrderDetailspage)
  router.patch('/orders/:orderId/items/:itemId/update-status',checkLogin,orderManagement.updateOrderStatus)

  
  module.exports = router