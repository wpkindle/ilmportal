const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

let mongoServerInstance = null;

const DEFAULT_MONGODB_URI = 'mongodb://abdulkhaliqwebdeveloper_db_user:pIfVMbVHUwRqrEOY@atlas-27b1a7-shard-00-00.2vvsnhq.mongodb.net:27017,atlas-27b1a7-shard-00-01.2vvsnhq.mongodb.net:27017,atlas-27b1a7-shard-00-02.2vvsnhq.mongodb.net:27017/ilmportal?ssl=true&replicaSet=atlas-27b1a7-shard-0&authSource=admin&retryWrites=true&w=majority';

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
      return;
    }

    // 1. Try env MONGODB_URI if specified
    if (process.env.MONGODB_URI) {
      try {
        console.log('Connecting via process.env.MONGODB_URI...');
        await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
        console.log('✅ MongoDB connected successfully via env MONGODB_URI');
        return;
      } catch (envErr) {
        console.warn('⚠️ env MONGODB_URI note:', envErr.message, '-> Attempting direct Atlas replicaSet...');
      }
    }

    // 2. Connect via direct 3-shard Atlas replicaSet (bypasses SRV/DNS issues)
    try {
      console.log('Connecting to persistent MongoDB Atlas cluster (direct shard URI)...');
      await mongoose.connect(DEFAULT_MONGODB_URI, { serverSelectionTimeoutMS: 12000 });
      console.log('✅ MongoDB connected successfully to persistent Atlas database (ilmportal)');
      return;
    } catch (atlasErr) {
      console.warn('⚠️ Atlas connection note:', atlasErr.message);
      console.log('Falling back to local embedded MongoDB server...');
    }

    if (!mongoServerInstance) {
      const dbDir = path.join(__dirname, '../../data/db');
      fs.mkdirSync(dbDir, { recursive: true });
      console.log(`Starting persistent embedded MongoDB Server at: ${dbDir}...`);
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServerInstance = await MongoMemoryServer.create({
        instance: {
          dbPath: dbDir,
          storageEngine: 'wiredTiger'
        },
        binary: {
          version: '7.0.14'
        }
      });
    }

    const memoryUri = mongoServerInstance.getUri();
    await mongoose.connect(memoryUri);
    console.log(`✅ Persistent MongoDB Server started & connected at: ${memoryUri}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoServerInstance) {
      await mongoServerInstance.stop({ doCleanup: false, force: false });
      mongoServerInstance = null;
    }
  } catch (err) {
    console.error('Error during disconnectDB:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };
