const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

let mongoServerInstance = null;

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
      return;
    }

    const uri = process.env.MONGODB_URI;
    if (uri) {
      console.log('Connecting to provided MongoDB URI...');
      await mongoose.connect(uri);
      console.log('✅ MongoDB connected successfully to external URI');
      return;
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
