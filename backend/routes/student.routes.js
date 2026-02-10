import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import Student from '../models/Student.model.js';
import User from '../models/User.model.js';

const router = express.Router();

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
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Only admin can update, or student can update their own profile
    if (req.user.role !== 'admin' && student.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('user', 'name email')
      .populate('class', 'name level')
      .populate('parent');

    res.json(updatedStudent);
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
