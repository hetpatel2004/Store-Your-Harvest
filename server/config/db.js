const mongoose = require('mongoose');

let mongoServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/agricold_connect';
  
  try {
    // Attempt connecting to provided URI with short serverSelectionTimeoutMS
    console.log(`Connecting to MongoDB at ${uri}...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(' MongoDB Connected to Local / Atlas instance');
  } catch (err) {
    console.warn('⚠️ Local MongoDB connection failed. Falling back to embedded MongoDB In-Memory Server for seamless hackathon demo...');
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
