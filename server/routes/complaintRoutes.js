const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { createComplaint, getUserComplaints, getAllComplaints, getCompletedHistory, updateStatus, deleteComplaint } = require('../controllers/complaintController');

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.post('/', authMiddleware, upload.single('image'), createComplaint);
router.get('/user', authMiddleware, getUserComplaints);
router.get('/all', authMiddleware, adminMiddleware, getAllComplaints);
router.get('/completed-history', authMiddleware, adminMiddleware, getCompletedHistory);
router.patch('/:id/status', authMiddleware, adminMiddleware, updateStatus);
router.delete('/:id', authMiddleware, deleteComplaint);

module.exports = router;
