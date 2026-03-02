const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');

// Ensure upload directories exist
const ensureUploadDirs = () => {
  const dirs = [
    './uploads',
    './uploads/profile_photos',
    './uploads/documents',
    './uploads/notices',
    './uploads/complaints'
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Initialize upload directories
ensureUploadDirs();

// File filter function
const fileFilter = (allowedTypes) => (req, file, cb) => {
  const allowedMimes = allowedTypes.map(type => {
    switch (type) {
      case 'image':
        return ['image/jpeg', 'image/jpg', 'image/png'];
      case 'pdf':
        return ['application/pdf'];
      case 'document':
        return ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      default:
        return [];
    }
  }).flat();

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = './uploads';
    
    // Determine upload path based on field name or custom logic
    if (file.fieldname === 'profilePhoto') {
      uploadPath = './uploads/profile_photos';
    } else if (file.fieldname === 'document') {
      uploadPath = './uploads/documents';
    } else if (file.fieldname === 'noticeAttachment') {
      uploadPath = './uploads/notices';
    } else if (file.fieldname === 'complaintAttachment') {
      uploadPath = './uploads/complaints';
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const filename = `${name}-${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

// Multer configurations for different upload types
const uploadProfilePhoto = multer({
  storage: storage,
  limits: {
    fileSize: config.MAX_FILE_SIZE
  },
  fileFilter: fileFilter(['image'])
});

const uploadDocument = multer({
  storage: storage,
  limits: {
    fileSize: config.MAX_FILE_SIZE
  },
  fileFilter: fileFilter(['document'])
});

const uploadNoticeAttachment = multer({
  storage: storage,
  limits: {
    fileSize: config.MAX_FILE_SIZE
  },
  fileFilter: fileFilter(['document'])
});

const uploadComplaintAttachment = multer({
  storage: storage,
  limits: {
    fileSize: config.MAX_FILE_SIZE
  },
  fileFilter: fileFilter(['document'])
});

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.'
      });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
};

module.exports = {
  uploadProfilePhoto,
  uploadDocument,
  uploadNoticeAttachment,
  uploadComplaintAttachment,
  handleUploadError
};
