const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' }); // Fallback

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not found");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB!");

  const email = "test@example.com"; // Guessing the email based on the screenshot, but we can search by name
  
  // Actually, we don't have the User model handy in plain js easily without breaking module imports.
  // Instead, let's just use the raw collection
  const usersCollection = mongoose.connection.collection('users');
  
  const user = await usersCollection.findOne({ name: 'Test' });
  if (!user) {
    console.log("Could not find a user named 'Test'");
    process.exit(1);
  }

  console.log(`Found user: ${user.email}`);

  // Hash new password
  const newPassword = 'password123';
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await usersCollection.updateOne(
    { _id: user._id },
    { $set: { password: hashedPassword } }
  );

  console.log(`\n✅ Password successfully reset!`);
  console.log(`Email: ${user.email}`);
  console.log(`New Password: ${newPassword}`);

  process.exit(0);
}

main().catch(console.error);
