const fs = require('fs');
const path = require('path');
const Complaint = require('../models/Complaint');
const User = require('../models/User');

const createComplaint = async (req, res) => {
  try {
    const body = req.body || {};
    let rawImage = body.image || body.imageUrl || body.photo || '';

    let finalImageUrl = rawImage || '';

    // 1. Process Multer uploaded image memory buffer
    if (req.file && req.file.buffer) {
      try {
        const uploadDir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const ext = req.file.mimetype ? (req.file.mimetype.split('/')[1] || 'jpg') : 'jpg';
        const filename = `waste-${Date.now()}-${Math.round(Math.random() * 1E9)}.${ext}`;
        const filePath = path.join(uploadDir, filename);
        fs.writeFileSync(filePath, req.file.buffer);
        finalImageUrl = `/uploads/${filename}`;
      } catch (e) {
        console.error('File buffer write notice:', e.message);
      }
    }
    // 2. Process Base64 Data URL string
    else if (rawImage && typeof rawImage === 'string' && rawImage.startsWith('data:image')) {
      try {
        const uploadDir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const parts = rawImage.split(';base64,');
        if (parts.length === 2) {
          const mimePart = parts[0];
          const base64Data = parts[1];
          const ext = (mimePart.split('/')[1] || 'jpg').replace('+xml', '');
          const filename = `waste-${Date.now()}-${Math.round(Math.random() * 1E9)}.${ext}`;
          const filePath = path.join(uploadDir, filename);
          fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
          finalImageUrl = `/uploads/${filename}`;
        }
      } catch (imgParseErr) {
        console.error('Base64 parse notice:', imgParseErr.message);
        finalImageUrl = rawImage;
      }
    }

    const complaint = await Complaint.create({
      userId: req.user.id,
      description: body.description || 'Waste Report',
      imageUrl: finalImageUrl || '',
      lat: isNaN(parseFloat(body.lat)) ? 0.0 : parseFloat(body.lat),
      lng: isNaN(parseFloat(body.lng)) ? 0.0 : parseFloat(body.lng),
      address: body.address || 'Selected Location'
    });

    // Emit for real-time socket
    const io = req.app.get('io');
    if (io) {
      try {
        io.emit('newComplaint', complaint);
      } catch (socketErr) {
        console.error('Socket emit notice:', socketErr);
      }
    }

    return res.status(201).json(complaint);
  } catch (error) {
    console.error('CRITICAL createComplaint error:', error);
    return res.status(500).json({ 
      error: true, 
      message: error.message || 'Server error creating complaint'
    });
  }
};

const getUserComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.findAll({ 
      where: { 
        userId: req.user.id,
        deletedByUser: false
      },
      order: [['createdAt', 'DESC']]
    });
    return res.json(complaints);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.findAll({
      where: { deletedByAdmin: false },
      include: [{ model: User, attributes: ['name', 'email'] }],
      order: [['createdAt', 'DESC']]
    });
    return res.json(complaints);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getCompletedHistory = async (req, res) => {
  try {
    const complaints = await Complaint.findAll({
      where: { status: 'Completed' },
      include: [{ model: User, attributes: ['name', 'email'] }],
      order: [['updatedAt', 'DESC']]
    });
    return res.json(complaints);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findByPk(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    complaint.status = status;
    await complaint.save();

    const io = req.app.get('io');
    if (io) {
      try {
        io.emit('updateComplaint', complaint);
      } catch (socketErr) {}
    }

    return res.json(complaint);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByPk(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    if (req.user.role === 'admin') {
      complaint.deletedByAdmin = true;
    } else if (complaint.userId === req.user.id) {
      complaint.deletedByUser = true;
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }

    await complaint.save();

    const io = req.app.get('io');
    if (io) {
      try {
        io.emit('deleteComplaint', req.params.id);
      } catch (socketErr) {}
    }

    return res.json({ message: 'Complaint soft deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createComplaint,
  getUserComplaints,
  getAllComplaints,
  getCompletedHistory,
  updateStatus,
  deleteComplaint
};
