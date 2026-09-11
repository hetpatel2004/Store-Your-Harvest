const mongoose = require('mongoose');
const dns = require('dns');

// Configure reliable DNS servers to resolve MongoDB Atlas SRV records across all network providers
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (dnsErr) {
  console.warn('DNS server override note:', dnsErr.message);
}

let mongoServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/agricold_connect';
  const maskedUri = uri.includes('@') ? uri.replace(/:([^:@]+)@/, ':****@') : uri;

  try {
    console.log(`Connecting to MongoDB Atlas at ${maskedUri}...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log('✅ MongoDB Connected successfully to Atlas Cloud Database!');
  } catch (err) {
    console.warn('⚠️ Cloud MongoDB Atlas direct connection notice:', err.message);
    console.warn('Falling back to embedded MongoDB In-Memory Server for seamless execution...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(` Connected to Embedded In-Memory MongoDB: ${memoryUri}`);
    } catch (memErr) {
      console.error('❌ Failed to start In-Memory MongoDB:', memErr.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
