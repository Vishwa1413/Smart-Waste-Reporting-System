const Complaint = require('../models/Complaint');
const User = require('../models/User');

const createComplaint = async (req, res) => {
  try {
    const { description, lat, lng, address } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const complaint = await Complaint.create({
      userId: req.user.id,
      description,
      imageUrl,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      address
    });
    
    // Emit for real-time
    const io = req.app.get('io');
    if (io) {
      io.emit('newComplaint', complaint);
    }

    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.findAll({ 
      where: {
        deletedByAdmin: false
      },
      include: [{ model: User, attributes: ['name', 'email'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await Complaint.update({ status }, { where: { id: req.params.id } });
    const complaint = await Complaint.findByPk(req.params.id);
    
    // Emit for real-time
    const io = req.app.get('io');
    if (io) {
      io.emit('statusUpdated', complaint);
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findByPk(id);
    if (!complaint) return res.status(404).json({ message: 'Report not found' });

    const io = req.app.get('io');

    // Rule 1: If User deletes a PENDING (uncompleted) report -> Delete on BOTH sides!
    if (req.user.role !== 'admin' && complaint.status !== 'Completed') {
      if (String(complaint.userId) !== String(req.user.id)) {
        return res.status(403).json({ message: 'Unauthorized to delete this report' });
      }

      await complaint.destroy();
      if (io) {
        io.emit('complaintDeletedGlobal', { id: parseInt(id) });
      }
      return res.json({ message: 'Pending report cancelled on both sides', id: parseInt(id) });
    }

    // Rule 2: If status is COMPLETED or ADMIN deletes -> Independent view deletion
    if (req.user.role === 'admin') {
      complaint.deletedByAdmin = true;
      if (io) {
        io.emit('complaintDeletedAdmin', { id: parseInt(id) });
      }
    } else {
      if (String(complaint.userId) !== String(req.user.id)) {
        return res.status(403).json({ message: 'Unauthorized to delete this report' });
      }
      complaint.deletedByUser = true;
      if (io) {
        io.emit('complaintDeletedUser', { id: parseInt(id), userId: req.user.id });
      }
    }

    if (complaint.deletedByUser && complaint.deletedByAdmin) {
      await complaint.destroy();
    } else {
      await complaint.save();
    }

    res.json({ message: 'Report deleted from view successfully', id: parseInt(id) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCompletedHistory = async (req, res) => {
  try {
    const complaints = await Complaint.findAll({ 
      where: { status: 'Completed' },
      include: [{ model: User, attributes: ['name', 'email'] }],
      order: [['updatedAt', 'DESC']]
    });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createComplaint, getUserComplaints, getAllComplaints, getCompletedHistory, updateStatus, deleteComplaint };
