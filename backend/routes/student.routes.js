import express from 'express';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import Student from '../models/Student.model.js';
import User from '../models/User.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// On Vercel use /tmp (writable); locally use backend/uploads/students
const studentsUploadDir = process.env.VERCEL
  ? path.join(os.tmpdir(), 'zas-uploads', 'students')
  : path.join(__dirname, '../uploads/students');

// Multer config for student photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (process.env.VERCEL) {
      try { fs.mkdirSync(studentsUploadDir, { recursive: true }); } catch (_) {}
    }
    cb(null, studentsUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = (file.mimetype.match(/\/(.+)$/) || [',jpg'])[1] || 'jpg';
    cb(null, `${Date.now()}-${(file.originalname || 'photo').replace(/\s/g, '-')}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /image\/(jpeg|jpg|png|gif|webp)/i;
    if (allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed.'), false);
    }
  },
});

// Get all students
router.get('/', authenticate, async (req, res) => {
  try {
    const students = await Student.find()
      .populate('user', 'name email')
      .populate('class', 'name level')
      .populate('parent', 'user phone')
      .populate({ path: 'parent', populate: { path: 'user', select: 'name email' } })
      .sort({ createdAt: -1 });

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload student photo (Admin or student for own profile)
router.post('/upload-photo', authenticate, upload.single('photo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded.' });
    }
    const url = `/api/uploads/students/${req.file.filename}`;
    res.json({ url });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Upload failed' });
  }
});

// Multer error handler (e.g. file too large, wrong type)
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
  }
  if (err.message && err.message.includes('Only image files')) {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

// Get current student's profile (must be before /:id)
router.get('/me', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const student = await Student.findOne({ user: req.user._id })
      .populate('user', 'name email')
      .populate('class', 'name level')
      .populate('parent', 'user phone')
      .populate({ path: 'parent', populate: { path: 'user', select: 'name email' } });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('user', 'name email')
      .populate('class', 'name level')
      .populate('parent', 'user phone')
      .populate({ path: 'parent', populate: { path: 'user', select: 'name email' } });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Students can only view their own profile unless admin/teacher
    if (
      req.user.role === 'student' &&
      student.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create student (Admin only)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, class: classId, parent, dateOfBirth, gender, photo } =
      req.body;

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
      role: 'student',
    });

    // Create student
    const student = await Student.create({
      user: user._id,
      class: classId,
      parent,
      dateOfBirth,
      gender,
      photo: photo || '',
    });

    const populatedStudent = await Student.findById(student._id)
      .populate('user', 'name email')
      .populate('class', 'name level')
      .populate('parent');

    res.status(201).json(populatedStudent);
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `A user with this ${field} already exists. Please use a different ${field}.` 
      });
    }
    res.status(500).json({ message: error.message || 'Failed to create student' });
  }
});

// Update student
router.put('/:id', authenticate, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('user', 'name email')
      .populate('class', 'name level')
      .populate('parent', 'user phone');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const isSelf = student.user._id.toString() === req.user._id.toString();

    if (req.user.role !== 'admin' && !isSelf) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name, email, password, photo, dateOfBirth, gender } = req.body;

    if (isSelf) {
      if (name !== undefined) student.user.name = name;
      if (email !== undefined) student.user.email = email;
      if (password && password.trim()) {
        student.user.password = password;
      }
      await student.user.save();
      const studentUpdate = {};
      if (photo !== undefined) studentUpdate.photo = photo;
      if (dateOfBirth !== undefined) studentUpdate.dateOfBirth = dateOfBirth;
      if (gender !== undefined) studentUpdate.gender = gender;
      if (Object.keys(studentUpdate).length) {
        await Student.findByIdAndUpdate(req.params.id, studentUpdate, { runValidators: true });
      }
    } else {
      await Student.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
    }

    const updated = await Student.findById(req.params.id)
      .populate('user', 'name email')
      .populate('class', 'name level')
      .populate('parent', 'user phone')
      .populate({ path: 'parent', populate: { path: 'user', select: 'name email' } });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete student (Admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await User.findByIdAndDelete(student.user);
    await Student.findByIdAndDelete(req.params.id);

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
