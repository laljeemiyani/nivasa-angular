const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const FamilyMember = require('../models/FamilyMember');
const Vehicle = require('../models/Vehicle');
const Complaint = require('../models/Complaint');
const Notice = require('../models/Notice');
const Notification = require('../models/Notification');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
};

const run = async () => {
  const demoEmails = ['owner@nivasa.com', 'tenant@nivasa.com', 'resident@nivasa.com'];
  const query = {
    $or: [{ email: { $regex: /^(demo_test_|test_)/ } }, { email: { $in: demoEmails } }],
  };

  await connectDB();

  const users = await User.find(query).select('_id email');
  const userIds = users.map((u) => u._id);

  if (userIds.length === 0) {
    console.log('No demo/test users found. Nothing to delete.');
    await mongoose.disconnect();
    return;
  }

  const [fam, veh, comp, noti, notice, usersDeleted] = await Promise.all([
    FamilyMember.deleteMany({ userId: { $in: userIds } }),
    Vehicle.deleteMany({ userId: { $in: userIds } }),
    Complaint.deleteMany({ userId: { $in: userIds } }),
    Notification.deleteMany({ userId: { $in: userIds } }),
    Notice.deleteMany({ userId: { $in: userIds } }),
    User.deleteMany({ _id: { $in: userIds } }),
  ]);

  console.log('Deleted demo/test data:');
  console.log(`- users: ${usersDeleted.deletedCount}`);
  console.log(`- family members: ${fam.deletedCount}`);
  console.log(`- vehicles: ${veh.deletedCount}`);
  console.log(`- complaints: ${comp.deletedCount}`);
  console.log(`- notifications: ${noti.deletedCount}`);
  console.log(`- notices: ${notice.deletedCount}`);

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error('Cleanup failed:', error.message);
  try {
    await mongoose.disconnect();
  } catch (e) {}
  process.exit(1);
});
