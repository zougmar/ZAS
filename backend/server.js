import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import studentRoutes from './routes/student.routes.js';
import teacherRoutes from './routes/teacher.routes.js';
import parentRoutes from './routes/parent.routes.js';
import classRoutes from './routes/class.routes.js';
import subjectRoutes from './routes/subject.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import gradeRoutes from './routes/grade.routes.js';
import timetableRoutes from './routes/timetable.routes.js';
import messageRoutes from './routes/message.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ping immediately (no DB) – before any heavy work so /api/ping never 504
app.use((req, res, next) => {
  const p = (req.path || req.url || '').split('?')[0];
  if (req.method === 'GET' && (p === '/api' || p === '/api/ping')) {
    return res.json({ ok: true, message: 'API is reachable' });
  }
  next();
});

// Serve uploaded files (e.g. student photos)
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Ping (no DB) – must be before ensureDb; handle both /api and /api/ping for Vercel rewrites
app.get('/api/ping', (req, res) => {
  res.json({ ok: true, message: 'API is reachable' });
});
app.get('/api', (req, res) => {
  res.json({ ok: true, message: 'API is reachable' });
});

// Database connection - expose promise for serverless so we can wait before handling
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zas';
// Keep under Vercel Hobby 10s limit: fail DB quickly so we return 503, not 504
const DB_TIMEOUT_MS = 8000;
const MONGO_OPTS = { serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000 };

const connectPromise = mongoose.connect(MONGODB_URI, MONGO_OPTS)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    return true;
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    throw err;
  });

// On Vercel: never wait longer than DB_TIMEOUT_MS for DB (avoid 504)
const connectWithTimeout = () =>
  Promise.race([
    connectPromise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database connection timeout')), DB_TIMEOUT_MS)
    ),
  ]);

// In serverless (Vercel), wait for DB before handling API routes (with hard timeout)
const ensureDb = async (req, res, next) => {
  if (process.env.VERCEL) {
    // Fail immediately if DB not configured (avoid 504)
    if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('localhost')) {
      return res.status(503).json({
        message: 'Database not configured. In Vercel: set MONGODB_URI (MongoDB Atlas) and JWT_SECRET in Settings → Environment Variables, then redeploy.',
      });
    }
    try {
      await connectWithTimeout();
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ message: 'Database not ready. Please try again.' });
      }
    } catch (err) {
      console.error('DB ensure error:', err);
      return res.status(503).json({
        message: 'Database unavailable. Set MONGODB_URI and JWT_SECRET in Vercel, and allow 0.0.0.0/0 in MongoDB Atlas Network Access.',
      });
    }
  }
  next();
};
app.use('/api', ensureDb);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'ZAS API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

// Only start listening when not on Vercel (serverless)
if (!process.env.VERCEL) {
  connectPromise.then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 ZAS Server running on port ${PORT}`);
    });
  }).catch((err) => {
    console.error('Cannot start server:', err);
  });
}

export default app;
export { connectPromise };
