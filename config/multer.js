// config/multer.js
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Check which route is being accessed
        let uploadPath;
        if (req.originalUrl.includes('/products')) {
            uploadPath = 'public/admin/uploads/products';
        } else if (req.originalUrl.includes('/categories')) {
            uploadPath = 'public/admin/uploads/categories';
        } else {
            // Default fallback if needed
            uploadPath = 'public/admin/uploads';
        }
        cb(null, uploadPath);
    },

    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image.'), false);
    }
};

// Create different upload middlewares for different uses
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Export both single and array upload middlewares
module.exports = {
    single: upload.single('image'), //this is name attributes given in ejs form inputs.
    array: upload.array('productImages', 3)
};