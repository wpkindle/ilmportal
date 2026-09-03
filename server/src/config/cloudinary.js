const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary storage for chat file uploads
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // Determine resource type
    let resourceType = 'auto';
    const isImage = file.mimetype.startsWith('image/');
    const folder = isImage ? 'ilmportal/chat/images' : 'ilmportal/chat/files';

    return {
      folder,
      resource_type: resourceType,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf', 'doc', 'docx', 'txt'],
      transformation: isImage ? [{ quality: 'auto', fetch_format: 'auto' }] : undefined,
      public_id: `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`
    };
  }
});

// Multer upload using Cloudinary storage
const uploadToCloud = multer({
  storage: cloudinaryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Supported: JPG, PNG, WEBP, GIF, PDF, DOC, DOCX, TXT'), false);
    }
  }
});

module.exports = { cloudinary, uploadToCloud };
