const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const sequelize = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"]
  }
});

// Create uploads folder if not exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);

// Socket.io
app.set('io', io);
io.on('connection', (socket) => {
  console.log('A user connected: ', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 5000;

// Sync database and start server
sequelize.sync()
  .then(async () => {
    console.log('✓ Connected to SQLite and database synced');
    
    // Auto-seed default Admin Vishwa account on startup if not present
    try {
      const User = require('./models/User');
      const bcrypt = require('bcryptjs');
      const existingAdmin = await User.findOne({ where: { email: 'vishwa124@gmail.com' } });
      if (!existingAdmin) {
        await User.create({
          name: 'Vishwa',
          email: 'vishwa124@gmail.com',
          password: 'Vishwa@45',
          role: 'admin'
        });
        console.log('✓ Auto-seeded Admin account (vishwa124@gmail.com)');
      } else {
        const hashedPassword = await bcrypt.hash('Vishwa@45', 10);
        await existingAdmin.update({ password: hashedPassword }, { hooks: false });
        console.log('✓ Updated Admin account (vishwa124@gmail.com) password hash');
      }
    } catch (seedErr) {
      console.log('Admin auto-seed notice:', seedErr.message);
    }

    try {
      const queryInterface = sequelize.getQueryInterface();
      const tableInfo = await queryInterface.describeTable('Complaints');
      
      if (!tableInfo.deletedByUser) {
        await queryInterface.addColumn('Complaints', 'deletedByUser', {
          type: require('sequelize').DataTypes.BOOLEAN,
          defaultValue: false
        });
        console.log('✓ Added deletedByUser column to Complaints table');
      }
      
      if (!tableInfo.deletedByAdmin) {
        await queryInterface.addColumn('Complaints', 'deletedByAdmin', {
          type: require('sequelize').DataTypes.BOOLEAN,
          defaultValue: false
        });
        console.log('✓ Added deletedByAdmin column to Complaints table');
      }
    } catch (colErr) {
      console.log('Column sync status:', colErr.message);
    }

    server.listen(PORT, () => console.log(`✓ Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('✗ Unable to connect to database:', err);
  });
