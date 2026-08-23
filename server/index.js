// Production Server Trigger - 2026-08-18
require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const sequelize = require('./config/db');

let compression;
try {
  compression = require('compression');
} catch (e) {}

// Import routes
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');

const app = express();
if (compression) {
  app.use(compression());
}
app.get('/api/ping', (req, res) => res.send('pong'));
app.get('/api/debug-version', (req, res) => res.json({ version: 'v1.0.9-jwt-fixed' }));

// Serve Android Digital Asset Links for full screen TWA App
app.get('/.well-known/assetlinks.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify([
    {
      "relation": [
        "delegate_permission/common.handle_all_urls"
      ],
      "target": {
        "namespace": "android_app",
        "package_name": "com.onrender.smart_waste_reporting_system_3wlx.twa",
        "sha256_cert_fingerprints": [
          "09:4D:BA:91:58:59:A9:C8:AD:C7:02:EC:1D:1A:0B:7E:89:13:CC:99:65:B4:90:07:F1:A8:DD:F1:FC:D3:59:CB",
          "4F:0A:3D:8A:94:33:E7:31:CF:D6:C6:AC:F5:EB:A3:22:DB:2E:AF:EC:E2:3D:ED:E2:50:6E:2A:AA:89:15:33:D7",
          "FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C"
        ]
      }
    },
    {
      "relation": [
        "delegate_permission/common.handle_all_urls"
      ],
      "target": {
        "namespace": "android_app",
        "package_name": "com.smartwaste.app",
        "sha256_cert_fingerprints": [
          "09:4D:BA:91:58:59:A9:C8:AD:C7:02:EC:1D:1A:0B:7E:89:13:CC:99:65:B4:90:07:F1:A8:DD:F1:FC:D3:59:CB",
          "4F:0A:3D:8A:94:33:E7:31:CF:D6:C6:AC:F5:EB:A3:22:DB:2E:AF:EC:E2:3D:ED:E2:50:6E:2A:AA:89:15:33:D7"
        ]
      }
    }
  ], null, 2));
});
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"]
  }
});

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir, { maxAge: '7d' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);

// Serve static client build if available (Unified Render Deployment)
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html') || filePath.endsWith('sw.js') || filePath.endsWith('manifest.json')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=31536000');
      }
    },
    etag: true,
    dotfiles: 'allow'
  }));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/.well-known')) {
      return next();
    }
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ message: 'Smart Waste Reporting API Server is running live!' });
  });
}

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

    // Enable SQLite Write-Ahead Logging (WAL) & busy timeout for concurrent multi-user support
    try {
      await sequelize.query('PRAGMA journal_mode = WAL;');
      await sequelize.query('PRAGMA busy_timeout = 10000;');
    } catch (pragmaErr) {
      console.log('PRAGMA WAL notice:', pragmaErr.message);
    }
    
    // Auto-seed default Admin & User accounts on startup if not present
    try {
      const User = require('./models/User');
      const bcrypt = require('bcryptjs');

      // Admin Account
      let existingAdmin = await User.findOne({ where: { email: 'vishwa124@gmail.com' } });
      if (!existingAdmin) {
        await User.create({
          name: 'Vishwa Admin',
          email: 'vishwa124@gmail.com',
          password: 'Vishwa@45',
          role: 'admin'
        });
        console.log('✓ Auto-seeded Admin account (vishwa124@gmail.com)');
      } else {
        const isValid = await existingAdmin.comparePassword('Vishwa@45');
        if (!isValid) {
          const hashedPassword = await bcrypt.hash('Vishwa@45', 10);
          await existingAdmin.update({ password: hashedPassword, role: 'admin' }, { hooks: false });
        }
      }

      // User Account
      let existingUser = await User.findOne({ where: { email: 'vishwa123@gmail.com' } });
      if (!existingUser) {
        await User.create({
          name: 'Vishwa User',
          email: 'vishwa123@gmail.com',
          password: 'Vishwa@45',
          role: 'user'
        });
        console.log('✓ Auto-seeded User account (vishwa123@gmail.com)');
      } else {
        const isValid = await existingUser.comparePassword('Vishwa@45');
        if (!isValid) {
          const hashedPassword = await bcrypt.hash('Vishwa@45', 10);
          await existingUser.update({ password: hashedPassword, role: 'user' }, { hooks: false });
        }
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
