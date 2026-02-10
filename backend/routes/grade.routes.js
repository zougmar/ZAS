import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import Grade from '../models/Grade.model.js';
import Student from '../models/Student.model.js';

const router = express.Router();

// Create grade (Teacher/Admin only)
router.post('/', authenticate, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { student, subject, examName, grade, maxGrade, remarks } = req.body;

    const gradeData = await Grade.create({
      student,
      subject,
      examName,
      grade,
      maxGrade: maxGrade || 100,
      teacher: req.user._id,
      remarks: remarks || '',
    });

    const populated = await Grade.findById(gradeData._id)
      .populate('student', 'user class')
      .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
      .populate('subject', 'name code')
      .populate('teacher', 'user')
      .populate({ path: 'teacher', populate: { path: 'user', select: 'name email' } });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get grades by student
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

    const grades = await Grade.find({ student: studentId })
      .populate('student', 'user class')
      .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
      .populate('subject', 'name code')
      .populate('teacher', 'user')
      .populate({ path: 'teacher', populate: { path: 'user', select: 'name email' } })
      .sort({ createdAt: -1 });

    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all grades (Admin/Teacher)
router.get('/', authenticate, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { subject, class: classId } = req.query;
    let query = {};

    if (subject) {
      query.subject = subject;
    }

    if (classId) {
      const students = await Student.find({ class: classId });
      query.student = { $in: students.map((s) => s._id) };
    }

    const grades = await Grade.find(query)
      .populate('student', 'user class')
      .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
      .populate('subject', 'name code')
      .populate('teacher', 'user')
      .populate({ path: 'teacher', populate: { path: 'user', select: 'name email' } })
      .sort({ createdAt: -1 });

    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update grade (Teacher/Admin only)
router.put('/:id', authenticate, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    // Teacher can only update their own grades unless admin
    if (req.user.role === 'teacher' && grade.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedGrade = await Grade.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('student', 'user class')
      .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
      .populate('subject', 'name code')
      .populate('teacher', 'user')
      .populate({ path: 'teacher', populate: { path: 'user', select: 'name email' } });

    res.json(updatedGrade);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete grade (Teacher/Admin only)
router.delete('/:id', authenticate, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    // Teacher can only delete their own grades unless admin
    if (req.user.role === 'teacher' && grade.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Grade.findByIdAndDelete(req.params.id);
    res.json({ message: 'Grade deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
