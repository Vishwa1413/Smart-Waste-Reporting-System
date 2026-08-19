const sequelize = require('./config/db');
const User = require('./models/User');
const Complaint = require('./models/Complaint');

const emailToDelete = process.argv[2];

if (!emailToDelete) {
  console.log('\n❌ Please provide an email address to delete.');
  console.log('Example usage: node delete_user.js user@example.com\n');
  process.exit(1);
}

const deleteSpecificUser = async () => {
  try {
    await sequelize.authenticate();
    
    // Find the user
    const user = await User.findOne({ where: { email: emailToDelete } });

    if (!user) {
      console.log(`\n⚠️  No account found with email: ${emailToDelete}\n`);
      process.exit(0);
    }

    // Delete user complaints first
    const deletedComplaints = await Complaint.destroy({ where: { userId: user.id } });
    console.log(`✓ Deleted ${deletedComplaints} complaint(s) associated with ${emailToDelete}`);

    // Delete user account
    await user.destroy();
    console.log(`✓ User account '${emailToDelete}' successfully deleted from SQLite database.\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error deleting account:', error.message);
    process.exit(1);
  }
};

deleteSpecificUser();
