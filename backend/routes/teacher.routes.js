import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import Teacher from '../models/Teacher.model.js';
import User from '../models/User.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const teachersUploadDir = path.join(__dirname, '../uploads/teachers');
if (!fs.existsSync(teachersUploadDir)) fs.mkdirSync(teachersUploadDir, { recursive: true });

// Multer for teacher avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, teachersUploadDir);
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

// Upload current teacher's photo
router.post('/upload-photo', authenticate, upload.single('photo'), (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded.' });
    }
    const url = `/api/uploads/teachers/${req.file.filename}`;
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

// Get all teachers
router.get('/', authenticate, async (req, res) => {
  try {
    const teachers = await Teacher.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current teacher's profile (must be before /:id)
router.get('/me', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const teacher = await Teacher.findOne({ user: req.user._id }).populate('user', 'name email');
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get teacher by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).populate('user', 'name email');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create teacher (Admin only)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, phone, specialization } = req.body;

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ 
        message: `A user with email "${email}" already exists. Please use a different email.` 
      });
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: password || 'password123',
      role: 'teacher',
    });

    // Create teacher
    const teacher = await Teacher.create({
      user: user._id,
      phone,
      specialization,
    });

    const populatedTeacher = await Teacher.findById(teacher._id).populate('user', 'name email');

    res.status(201).json(populatedTeacher);
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `A user with this ${field} already exists. Please use a different ${field}.` 
      });
    }
    res.status(500).json({ message: error.message || 'Failed to create teacher' });
  }
});

// Update teacher
router.put('/:id', authenticate, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).populate('user', 'name email');
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const isSelf = teacher.user._id.toString() === req.user._id.toString();

    if (req.user.role !== 'admin' && !isSelf) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name, email, password, phone, specialization, photo } = req.body;

    if (isSelf) {
      if (name !== undefined) teacher.user.name = name;
      if (email !== undefined) teacher.user.email = email;
      if (password && password.trim()) {
        teacher.user.password = password;
      }
      await teacher.user.save();
      const update = {};
      if (phone !== undefined) update.phone = phone;
      if (specialization !== undefined) update.specialization = specialization;
      if (photo !== undefined) update.photo = photo;
      if (Object.keys(update).length) {
        await Teacher.findByIdAndUpdate(req.params.id, update, { runValidators: true });
      }
    } else {
      await Teacher.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
    }

    const updated = await Teacher.findById(req.params.id).populate('user', 'name email');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete teacher (Admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    await User.findByIdAndDelete(teacher.user);
    await Teacher.findByIdAndDelete(req.params.id);

    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
