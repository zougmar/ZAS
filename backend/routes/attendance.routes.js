import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import Attendance from '../models/Attendance.model.js';
import Student from '../models/Student.model.js';

const router = express.Router();

// Mark attendance (Teacher only)
router.post('/', authenticate, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { student, date, status, notes } = req.body;

    // Check if attendance already exists for this date
    const existing = await Attendance.findOne({ student, date });
    if (existing) {
      // Update existing attendance
      existing.status = status;
      existing.notes = notes || existing.notes;
      existing.markedBy = req.user._id;
      await existing.save();

      const populated = await Attendance.findById(existing._id)
        .populate('student', 'user class photo')
        .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
        .populate('markedBy', 'user')
        .populate({ path: 'markedBy', populate: { path: 'user', select: 'name email' } });

      return res.json(populated);
    }

    const attendance = await Attendance.create({
      student,
      date: date || new Date(),
      status,
      markedBy: req.user._id,
      notes: notes || '',
    });

    const populated = await Attendance.findById(attendance._id)
      .populate('student', 'user class photo')
      .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
      .populate('markedBy', 'user')
      .populate({ path: 'markedBy', populate: { path: 'user', select: 'name email' } });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance by class
router.get('/class/:classId', authenticate, async (req, res) => {
  try {
    const { classId } = req.params;
    const { date } = req.query;

    // Get all students in the class
    const students = await Student.find({ class: classId });

    if (date) {
      // Get attendance for specific date
      const attendance = await Attendance.find({
        student: { $in: students.map((s) => s._id) },
        date: new Date(date),
      })
        .populate('student', 'user class photo')
        .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
        .populate('markedBy', 'user')
        .populate({ path: 'markedBy', populate: { path: 'user', select: 'name email' } });

      res.json(attendance);
    } else {
      // Get all attendance records for students in this class
      const attendance = await Attendance.find({
        student: { $in: students.map((s) => s._id) },
      })
        .populate('student', 'user class photo')
        .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
        .populate('markedBy', 'user')
        .populate({ path: 'markedBy', populate: { path: 'user', select: 'name email' } })
        .sort({ date: -1 });

      res.json(attendance);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance by student
router.get('/student/:studentId', authenticate, async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check access: student can only view their own, or admin/teacher/parent
    if (
      req.user.role === 'student' &&
      student.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const attendance = await Attendance.find({ student: studentId })
      .populate('student', 'user class photo')
      .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
      .populate('markedBy', 'user')
      .populate({ path: 'markedBy', populate: { path: 'user', select: 'name email' } })
      .sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
