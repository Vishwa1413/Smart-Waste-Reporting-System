const fs = require('fs');
const path = require('path');
const sequelize = require('./config/db');
const User = require('./models/User');
const Complaint = require('./models/Complaint');
const bcrypt = require('bcryptjs');

const resetDatabase = async () => {
  try {
    console.log('🧹 Resetting database...');
    await sequelize.sync({ force: true });
    console.log('✓ All database tables wiped clean.');

    // Seed default Admin
    const adminPassword = await bcrypt.hash('Vishwa@45', 10);
    await User.create({
      name: 'Vishwa Admin',
      email: 'vishwa124@gmail.com',
      password: adminPassword,
      role: 'admin'
    });
    console.log('✓ Default Admin created (vishwa124@gmail.com)');

    // Seed default User
    const userPassword = await bcrypt.hash('Vishwa@45', 10);
    await User.create({
      name: 'Vishwa User',
      email: 'vishwa123@gmail.com',
      password: userPassword,
      role: 'user'
    });
    console.log('✓ Default User created (vishwa123@gmail.com)');

    // Clean uploads directory
    const uploadDir = path.join(__dirname, 'uploads');
    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      for (const file of files) {
        fs.unlinkSync(path.join(uploadDir, file));
      }
      console.log('✓ Uploaded image files cleared.');
    }

    console.log('\n✅ Database & account data successfully reset!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
    process.exit(1);
  }
};

resetDatabase();
