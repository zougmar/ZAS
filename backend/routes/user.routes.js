import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import User from '../models/User.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const usersUploadDir = path.join(__dirname, '../uploads/users');
if (!fs.existsSync(usersUploadDir)) fs.mkdirSync(usersUploadDir, { recursive: true });

// Multer for user (admin) avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, usersUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = (file.mimetype.match(/\/(.+)$/) || [',jpg'])[1] || 'jpg';
    cb(null, `${Date.now()}-${(file.originalname || 'photo').replace(/\s/g, '-')}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /image\/(jpeg|jpg|png|gif|webp)/i;
    if (allowed.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed.'), false);
  },
});

// Upload current user's photo (authenticated user only)
router.post('/upload-photo', authenticate, upload.single('photo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded.' });
    }
    const url = `/api/uploads/users/${req.file.filename}`;
    res.json({ url });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Upload failed' });
  }
});

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
  }
  if (err.message && err.message.includes('Only image files')) {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

// Get all users (Admin only)
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get users for messaging (All authenticated users)
router.get('/for-messaging', authenticate, async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .select('_id name email role')
      .sort({ name: 1 });
    
    // Format to match frontend expectations
    const formattedUsers = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }));
    
    res.json(formattedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user
router.put('/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const allowed = ['name', 'email', 'password', 'photo'];
    const body = req.body || {};
    for (const key of allowed) {
      if (body[key] !== undefined) {
        if (key === 'password') {
          if (body[key] && body[key].trim()) user.password = body[key].trim();
        } else {
          user[key] = key === 'email' ? (body[key] || '').toLowerCase().trim() : body[key];
        }
      }
    }
    await user.save();

    const updated = await User.findById(req.params.id).select('-password');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user (Admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
