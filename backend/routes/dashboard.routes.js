import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import User from '../models/User.model.js';
import Student from '../models/Student.model.js';
import Teacher from '../models/Teacher.model.js';
import Parent from '../models/Parent.model.js';
import Class from '../models/Class.model.js';
import Subject from '../models/Subject.model.js';
import Attendance from '../models/Attendance.model.js';
import Grade from '../models/Grade.model.js';
import Message from '../models/Message.model.js';

const router = express.Router();

// Get dashboard stats (Admin)
router.get('/admin', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const [
      totalStudents,
      totalTeachers,
      totalParents,
      totalClasses,
      totalSubjects,
      recentAttendance,
      recentGrades,
      unreadMessages,
    ] = await Promise.all([
      Student.countDocuments(),
      Teacher.countDocuments(),
      Parent.countDocuments(),
      Class.countDocuments(),
      Subject.countDocuments(),
      Attendance.countDocuments({ date: new Date().toISOString().split('T')[0] }),
      Grade.countDocuments(),
      Message.countDocuments({ receiver: req.user._id, isRead: false }),
    ]);

    // Get attendance stats for today
    const todayAttendance = await Attendance.find({
      date: new Date().toISOString().split('T')[0],
    });
    const presentCount = todayAttendance.filter((a) => a.status === 'present').length;
    const absentCount = todayAttendance.filter((a) => a.status === 'absent').length;
    const lateCount = todayAttendance.filter((a) => a.status === 'late').length;

    res.json({
      totalStudents,
      totalTeachers,
      totalParents,
      totalClasses,
      totalSubjects,
      todayAttendance: {
        total: todayAttendance.length,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
      },
      recentGrades,
      unreadMessages,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get dashboard stats (Teacher)
router.get('/teacher', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    // Get classes and subjects assigned to this teacher
    // This would require TeacherSubject model queries
    const todayAttendance = await Attendance.find({
      markedBy: teacher._id,
      date: new Date().toISOString().split('T')[0],
    });

    const unreadMessages = await Message.countDocuments({
      receiver: req.user._id,
      isRead: false,
    });

    res.json({
      todayAttendance: todayAttendance.length,
      unreadMessages,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get dashboard stats (Student)
router.get('/student', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const [totalGrades, totalAttendance, unreadMessages] = await Promise.all([
      Grade.countDocuments({ student: student._id }),
      Attendance.countDocuments({ student: student._id }),
      Message.countDocuments({ receiver: req.user._id, isRead: false }),
    ]);

    // Get recent grades
    const recentGrades = await Grade.find({ student: student._id })
      .populate('subject', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalGrades,
      totalAttendance,
      unreadMessages,
      recentGrades,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get dashboard stats (Parent)
router.get('/parent', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'parent') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const parent = await Parent.findOne({ user: req.user._id });
    if (!parent) {
      return res.status(404).json({ message: 'Parent profile not found' });
    }

    // Get children
    const children = await Student.find({ parent: parent._id });

    const [totalGrades, totalAttendance, unreadMessages] = await Promise.all([
      Grade.countDocuments({ student: { $in: children.map((c) => c._id) } }),
      Attendance.countDocuments({ student: { $in: children.map((c) => c._id) } }),
      Message.countDocuments({ receiver: req.user._id, isRead: false }),
    ]);

    res.json({
      childrenCount: children.length,
      totalGrades,
      totalAttendance,
      unreadMessages,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
