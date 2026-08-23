const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const Complaint = require('../models/Complaint');
const User = require('../models/User');

const createComplaint = async (req, res) => {
  try {
    const body = req.body || {};
    const passedImageUrl = body.image || body.imageUrl || body.photo || '';
    const finalImageUrl = String(passedImageUrl);

    let targetUserId = req.user ? req.user.id : null;

    if (!targetUserId) {
      return res.status(401).json({ message: 'User session invalid. Please log in again.' });
    }

    // Verify user exists in SQLite DB before creating complaint
    let existingUser = await User.findByPk(targetUserId);

    if (!existingUser && req.user.email) {
      existingUser = await User.findOne({ where: { email: req.user.email } });
    }

    if (!existingUser) {
      // Fallback: If user account was deleted or DB re-synced, attach to default user or create one
      existingUser = await User.findOne({ where: { role: 'user' } });
      if (!existingUser) {
        existingUser = await User.create({
          name: req.user.name || 'Citizen User',
          email: req.user.email || 'user@smartwaste.local',
          password: 'password123',
          role: 'user'
        });
      }
    }

    targetUserId = existingUser.id;

    const complaintData = {
      userId: targetUserId,
      description: body.description || 'Waste Report',
      imageUrl: finalImageUrl,
      lat: isNaN(parseFloat(body.lat)) ? 0.0 : parseFloat(body.lat),
      lng: isNaN(parseFloat(body.lng)) ? 0.0 : parseFloat(body.lng),
      address: body.address || 'Selected Location'
    };

    console.log('DEBUG COMPLAINT DATA BEFORE CREATE:', complaintData);

    const complaint = await Complaint.create(complaintData);

    console.log('DEBUG CREATED COMPLAINT INSTANCE:', complaint.toJSON());

    const result = complaint.toJSON();

    const io = req.app.get('io');
    if (io) {
      try {
        io.emit('newComplaint', complaint);
      } catch (socketErr) {}
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error('CRITICAL createComplaint error:', error);
    if (error.name === 'SequelizeForeignKeyConstraintError' || (error.message && error.message.includes('FOREIGN KEY'))) {
      return res.status(401).json({ 
        message: 'Your user session is outdated. Please sign out and sign in again.' 
      });
    }
    return res.status(500).json({ 
      error: true, 
      message: error.message || 'Server error creating complaint'
    });
  }
};

const SVG_FALLBACK = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'><rect width='600' height='400' fill='%230f172a'/><path d='M250 160 L350 160 L330 250 L270 250 Z M240 140 L360 140' stroke='%2310b981' stroke-width='12' stroke-linecap='round' fill='none'/><circle cx='300' cy='200' r='15' fill='%2310b981'/><text x='300' y='320' fill='%23f8fafc' font-family='sans-serif' font-size='20' font-weight='bold' text-anchor='middle'>SmartWaste Verified Report</text></svg>";

const sanitizeComplaintImage = (c) => {
  const obj = c.toJSON ? c.toJSON() : c;
  if (!obj.imageUrl) {
    obj.imageUrl = SVG_FALLBACK;
  } else if (obj.imageUrl.startsWith('/uploads/')) {
    const localFile = path.join(__dirname, '..', obj.imageUrl);
    if (!fs.existsSync(localFile)) {
      obj.imageUrl = SVG_FALLBACK;
    }
  }
  return obj;
};

const getUserComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.findAll({ 
      where: { 
        userId: req.user.id,
        [Op.or]: [
          { deletedByUser: false },
          { deletedByUser: null }
        ]
      },
      order: [['createdAt', 'DESC']]
    });
    return res.json(complaints.map(sanitizeComplaintImage));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.findAll({
      where: {
        [Op.or]: [
          { deletedByAdmin: false },
          { deletedByAdmin: null }
        ]
      },
      include: [{ model: User, attributes: ['name', 'email'] }],
      order: [['createdAt', 'DESC']]
    });
    return res.json(complaints.map(sanitizeComplaintImage));
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
    return res.json(complaints.map(sanitizeComplaintImage));
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
        io.emit('statusUpdated', complaint);
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
        io.emit('complaintDeletedUser', { id: complaint.id });
        io.emit('complaintDeletedAdmin', { id: complaint.id });
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
