const Complaint = require('../models/Complaint');
const User = require('../models/User');

const createComplaint = async (req, res) => {
  try {
    const { description, image, imageUrl: bodyImageUrl, lat, lng, address } = req.body;
    let finalImageUrl = image || bodyImageUrl || '';

    if (!finalImageUrl && req.file && req.file.buffer) {
      const mime = req.file.mimetype || 'image/jpeg';
      finalImageUrl = `data:${mime};base64,${req.file.buffer.toString('base64')}`;
    }

    const complaint = await Complaint.create({
      userId: req.user.id,
      description: description || 'Waste Report',
      imageUrl: finalImageUrl || '',
      lat: isNaN(parseFloat(lat)) ? 0.0 : parseFloat(lat),
      lng: isNaN(parseFloat(lng)) ? 0.0 : parseFloat(lng),
      address: address || 'Selected Location'
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
    console.error('Create complaint error:', error);
    return res.status(500).json({ message: error.message || 'Server error creating complaint' });
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
