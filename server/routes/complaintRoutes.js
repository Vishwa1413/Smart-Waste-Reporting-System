const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { createComplaint, getUserComplaints, getAllComplaints, getCompletedHistory, updateStatus, deleteComplaint } = require('../controllers/complaintController');

// Use Memory Storage for Cloud Compatibility
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Conditional upload handler: Only run Multer if request is multipart/form-data
const handleImageUpload = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    return upload.single('image')(req, res, (err) => {
      if (err) {
        console.error('Multer memory upload notice:', err.message);
        req.file = null;
      }
      next();
    });
  }
  next();
};

router.post('/', authMiddleware, handleImageUpload, createComplaint);
router.get('/user', authMiddleware, getUserComplaints);
router.get('/all', authMiddleware, adminMiddleware, getAllComplaints);
router.get('/completed-history', authMiddleware, adminMiddleware, getCompletedHistory);
router.patch('/:id/status', authMiddleware, adminMiddleware, updateStatus);
router.delete('/:id', authMiddleware, deleteComplaint);

module.exports = router;
