const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { createComplaint, getUserComplaints, getAllComplaints, getCompletedHistory, updateStatus, deleteComplaint } = require('../controllers/complaintController');

// Ensure uploads directory exists automatically
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
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
