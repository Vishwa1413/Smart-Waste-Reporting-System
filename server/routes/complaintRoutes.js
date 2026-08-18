const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { createComplaint, getUserComplaints, getAllComplaints, getCompletedHistory, updateStatus, deleteComplaint } = require('../controllers/complaintController');

// Use Memory Storage for 100% Cloud Hosting (Render / Vercel) Compatibility
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB file limit
});

// Safe wrapper to handle file uploads without throwing uncaught route errors
const uploadSingleImage = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Multer memory upload notice:', err.message);
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
