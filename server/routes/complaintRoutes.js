const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { createComplaint, getUserComplaints, getAllComplaints, getCompletedHistory, updateStatus, deleteComplaint } = require('../controllers/complaintController');

// Ensure uploads directory exists
const getUploadDir = () => {
  const dir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

// Safe Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, getUploadDir());
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || 'photo.jpg') || '.jpg';
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Middleware wrapper to handle Multer errors gracefully
const uploadSingleImage = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Multer upload error:', err);
      // Proceed without image if file upload failed
      req.file = null;
    }
    next();
  });
};

router.post('/', authMiddleware, uploadSingleImage, createComplaint);
router.get('/user', authMiddleware, getUserComplaints);
router.get('/all', authMiddleware, adminMiddleware, getAllComplaints);
router.get('/completed-history', authMiddleware, adminMiddleware, getCompletedHistory);
router.patch('/:id/status', authMiddleware, adminMiddleware, updateStatus);
router.delete('/:id', authMiddleware, deleteComplaint);

module.exports = router;
