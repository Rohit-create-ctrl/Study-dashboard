const mongoose = require("mongoose");
require("dotenv").config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("❌ MONGODB_URI is missing in the .env file.");
  process.exit(1);
}

async function testConnection() {
  try {
    console.log("🔄 Connecting to MongoDB...");

    await mongoose.connect(uri);

    console.log("✅ Successfully connected to MongoDB!");
    console.log(`📦 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);

    await mongoose.connection.close();
    console.log("🔌 Connection closed.");
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB.");
    console.error(error.message);
    process.exit(1);
  }
}

testConnection();
