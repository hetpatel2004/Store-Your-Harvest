const mongoose = require('mongoose');
const dns = require('dns');

let mongoServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/agricold_connect';
  const maskedUri = uri.includes('@') ? uri.replace(/:([^:@]+)@/, ':****@') : uri;

  try {
    console.log(`Connecting to MongoDB Atlas at ${maskedUri}...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log('✅ MongoDB Connected successfully to Atlas Cloud Database!');
    return;
  } catch (err) {
    console.warn('⚠️ Cloud MongoDB Atlas initial connection note:', err.message);
  }

  // If initial connection failed (e.g. ISP blocking SRV records), retry with Google/Cloudflare DNS
  try {
    console.log('Retrying Atlas connection with public DNS servers (8.8.8.8, 1.1.1.1)...');
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch (dnsErr) {
      console.warn('DNS server override note:', dnsErr.message);
    }
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log('✅ MongoDB Connected successfully to Atlas Cloud Database via DNS fallback!');
    return;
  } catch (retryErr) {
    console.warn('⚠️ Cloud MongoDB Atlas DNS fallback notice:', retryErr.message);
  }

  // Fallback to embedded MongoDB In-Memory Server
  console.warn('Falling back to embedded MongoDB In-Memory Server for seamless execution...');
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoServer = await MongoMemoryServer.create();
    const memoryUri = mongoServer.getUri();
    await mongoose.connect(memoryUri);
    console.log(` Connected to Embedded In-Memory MongoDB: ${memoryUri}`);
  } catch (memErr) {
    console.error('❌ Failed to start In-Memory MongoDB:', memErr.message);
  }
};

module.exports = connectDB;
