const sequelize = require('./config/db');
const User = require('./models/User');
const Complaint = require('./models/Complaint');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('✓ Database synced');

    const adminPassword = await bcrypt.hash('123456', 10);
    
    // Create Admins
    await User.create({ name: 'Admin Official', email: 'jaja@admin.com', password: '123456', role: 'admin' });
    await User.create({ name: 'Admin Official', email: 'admin@test.com', password: 'admin123', role: 'admin' });
    console.log('✓ Admin users created');

    // Create Regular Users
    await User.create({ name: 'John Doe', email: 'user@example.com', password: 'password123', role: 'user' });
    await User.create({ name: 'Eco Citizen', email: 'user@test.com', password: 'password123', role: 'user' });
    console.log('✓ Demo users created');

    const regularUser = await User.findOne({ where: { email: 'user@test.com' } });

    // Create Sample Complaints
    const complaints = [
      {
        userId: regularUser.id,
        description: 'Large pile of plastic bottles and packaging dumped near park entrance. Urgent recycling dispatch needed.',
        imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
        lat: 40.7128,
        lng: -74.0060,
        address: 'Central Park, New York',
        status: 'Pending'
      },
      {
        userId: regularUser.id,
        description: 'Dumped electronic circuitry and batteries creating chemical hazard.',
        imageUrl: 'https://images.unsplash.com/photo-1550041473-d296a3a8a18a?auto=format&fit=crop&w=600&q=80',
        lat: 40.7589,
        lng: -73.9851,
        address: 'Times Square, New York',
        status: 'In Progress'
      },
      {
        userId: regularUser.id,
        description: 'Overflowing municipal waste bin causing foul odor spillover.',
        imageUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80',
        lat: 40.6892,
        lng: -74.0445,
        address: 'Brooklyn, New York',
        status: 'Completed'
      }
    ];

    await Complaint.bulkCreate(complaints);
    console.log(`✓ Created ${complaints.length} sample complaints`);
    console.log('\n✅ Database seeded successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
