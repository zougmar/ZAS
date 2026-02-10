import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import Timetable from '../models/Timetable.model.js';
import { authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get timetable by class
router.get('/class/:classId', authenticate, async (req, res) => {
  try {
    const { classId } = req.params;
    const timetable = await Timetable.find({ class: classId })
      .populate('class', 'name level')
      .populate('subject', 'name code')
      .populate('teacher', 'user')
      .populate({ path: 'teacher', populate: { path: 'user', select: 'name email' } })
      .sort({ dayOfWeek: 1, startTime: 1 });

    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all timetables (Admin/Teacher)
router.get('/', authenticate, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const timetables = await Timetable.find()
      .populate('class', 'name level')
      .populate('subject', 'name code')
      .populate('teacher', 'user')
      .populate({ path: 'teacher', populate: { path: 'user', select: 'name email' } })
      .sort({ class: 1, dayOfWeek: 1, startTime: 1 });

    res.json(timetables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create timetable entry (Admin only)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const timetable = await Timetable.create(req.body);

    const populated = await Timetable.findById(timetable._id)
      .populate('class', 'name level')
      .populate('subject', 'name code')
      .populate('teacher', 'user')
      .populate({ path: 'teacher', populate: { path: 'user', select: 'name email' } });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update timetable entry (Admin only)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const timetable = await Timetable.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('class', 'name level')
      .populate('subject', 'name code')
      .populate('teacher', 'user')
      .populate({ path: 'teacher', populate: { path: 'user', select: 'name email' } });

    if (!timetable) {
      return res.status(404).json({ message: 'Timetable entry not found' });
    }

    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete timetable entry (Admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const timetable = await Timetable.findByIdAndDelete(req.params.id);
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable entry not found' });
    }

    res.json({ message: 'Timetable entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
