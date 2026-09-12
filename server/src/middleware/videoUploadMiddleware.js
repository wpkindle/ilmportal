const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase() || '.mp4';
    cb(null, 'video-intro-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/ogg',
    'video/x-matroska',
    'video/avi',
    'video/mpeg',
    'video/x-msvideo'
  ];

  if (allowedMimeTypes.includes(file.mimetype) || (file.mimetype && file.mimetype.startsWith('video/'))) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Please upload a valid video file (MP4, WEBM, MOV, etc.).'), false);
  }
};

const videoUpload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: fileFilter
});

module.exports = videoUpload;

