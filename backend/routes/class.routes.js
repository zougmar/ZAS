import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import Class from '../models/Class.model.js';

const router = express.Router();

// Get all classes
router.get('/', authenticate, async (req, res) => {
  try {
    const classes = await Class.find()
      .populate('classTeacher', 'user')
      .populate({ path: 'classTeacher', populate: { path: 'user', select: 'name email' } })
      .sort({ name: 1 });

    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get class by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
      .populate('classTeacher', 'user')
      .populate({ path: 'classTeacher', populate: { path: 'user', select: 'name email' } });

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.json(classData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create class (Admin only)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const classData = await Class.create(req.body);
    const populated = await Class.findById(classData._id)
      .populate('classTeacher', 'user')
      .populate({ path: 'classTeacher', populate: { path: 'user', select: 'name email' } });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update class (Admin only)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const classData = await Class.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('classTeacher', 'user')
      .populate({ path: 'classTeacher', populate: { path: 'user', select: 'name email' } });

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.json(classData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete class (Admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const classData = await Class.findByIdAndDelete(req.params.id);
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
