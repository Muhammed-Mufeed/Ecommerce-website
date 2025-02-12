const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Configure Multer to use Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "categories", // Cloudinary folder where images will be stored
    allowed_formats: ["jpg", "png", "jpeg", "webp"], // Allowed file types
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
