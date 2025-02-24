  const multer = require("multer");
  const { CloudinaryStorage } = require("multer-storage-cloudinary");
  const cloudinary = require("../config/cloudinary");

  // Function to create storage with a dynamic folder
  const createStorage = (folderName) => {
    return new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: folderName, // Dynamic folder name
        allowed_formats: ["jpg", "png", "jpeg", "webp"],
      },
    });
  };

  // Define separate upload handlers
  const uploadCategoryImage = multer({ storage: createStorage("categories") }); // Category images go to "categories"
  const uploadProductImage = multer({ storage: createStorage("products") }); // Product images go to "products"

  module.exports = { uploadCategoryImage, uploadProductImage };
