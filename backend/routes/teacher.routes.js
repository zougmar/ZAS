import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import Teacher from '../models/Teacher.model.js';
import User from '../models/User.model.js';

const router = express.Router();

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
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Only admin can update, or teacher can update their own profile
    if (req.user.role !== 'admin' && teacher.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedTeacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('user', 'name email');

    res.json(updatedTeacher);
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
