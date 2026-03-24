const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.resolve(__dirname, '.env'), 'utf-8');
const match = envContent.match(/MONGODB_URI=(.*)/);
const uri = match ? match[1].trim().replace(/^"|"$/g, '') : null;

if (!uri) {
  console.error('MONGODB_URI is not defined in .env file');
  process.exit(1);
}

console.log('Attempting to connect to MongoDB...');
// Log just the cluster info to see if URI is correct
let logUri = uri;
try { logUri = uri.split('@')[1] || uri.substring(0, 30); } catch(e) {}
console.log('Target cluster:', logUri);

mongoose.connect(uri)
  .then(() => {
    console.log('Successfully connected to MongoDB!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('MongoDB connection error. Details:');
    console.error(err);
    process.exit(1);
  });
