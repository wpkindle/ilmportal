const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const { connectDB } = require('./config/db');
const initSocket = require('./socket/socketHandler');
const seedDatabase = require('./utils/seedData');
const User = require('./models/User');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Attach socket handler
initSocket(io);
app.set('io', io);

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static uploads serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tutors', require('./routes/tutorRoutes'));
app.use('/api/deals', require('./routes/dealRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/sessions', require('./routes/sessionRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/cms', require('./routes/cmsRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/certificates', require('./routes/certificateRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// Root status endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    project: 'Pakistan-Wide Quran & Academic Tutoring LMS Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      tutors: '/api/tutors',
      courses: '/api/courses',
      deals: '/api/deals',
      reports: '/api/reports'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    message: 'IlmiDunya Pakistan LMS API is running smoothly'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if empty
    if (process.env.NODE_ENV !== 'test') {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('Database empty. Automatically running Pakistan initial seed...');
        await seedDatabase();
      }

      // Clear legacy unintended default city/gender for accounts registered without them
      try {
        await User.updateMany(
          { role: { $ne: 'admin' }, age: { $exists: false }, avatar: { $in: ['', null] }, city: 'Lahore' },
          { $set: { city: '' } }
        );
        await User.updateMany(
          { role: { $ne: 'admin' }, age: { $exists: false }, avatar: { $in: ['', null] }, gender: 'male' },
          { $set: { gender: '' } }
        );
      } catch (cleanupErr) {
        console.warn('Profile defaults cleanup note:', cleanupErr.message);
      }

      server.on('error', (e) => {
        if (e.code === 'EADDRINUSE') {
          console.error(`Port ${PORT} is currently in use. Exiting for clean supervisor restart...`);
          process.exit(1);
        } else {
          console.error('Server error:', e);
        }
      });

      server.listen(PORT, '0.0.0.0', () => {
        console.log(`\n======================================================`);
        console.log(`🚀 IlmiDunya Pakistan LMS Backend running on http://0.0.0.0:${PORT}`);
        console.log(`📡 WebSocket server initialized`);
        console.log(`🔗 API Base URL: http://127.0.0.1:${PORT}/api`);
        console.log(`======================================================\n`);
      });
    }
  } catch (err) {
    console.error('Failed to start server:', err);
  }
};

const gracefulShutdown = async (signal) => {
  try {
    if (server && server.listening) {
      server.close();
    }
    await disconnectDB();
  } catch (e) {
    // ignore
  } finally {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.once('SIGUSR2', async () => {
  try {
    if (server && server.listening) {
      server.close();
    }
    await disconnectDB();
  } catch (e) {}
  process.kill(process.pid, 'SIGUSR2');
});

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { app, server, startServer };
