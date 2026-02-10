import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import Student from '../models/Student.model.js';
import Teacher from '../models/Teacher.model.js';
import Parent from '../models/Parent.model.js';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register new user
export const register = async (req, res) => {
  try {
    const { name, email, password, role, ...additionalData } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create user
    const user = await User.create({ name, email, password, role });

    // Create role-specific profile
    if (role === 'student') {
      await Student.create({
        user: user._id,
        class: additionalData.class,
        parent: additionalData.parent,
        dateOfBirth: additionalData.dateOfBirth,
        gender: additionalData.gender,
        photo: additionalData.photo || '',
      });
    } else if (role === 'teacher') {
      await Teacher.create({
        user: user._id,
        phone: additionalData.phone,
        specialization: additionalData.specialization,
      });
    } else if (role === 'parent') {
      await Parent.create({
        user: user._id,
        phone: additionalData.phone,
        address: additionalData.address || '',
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message || 'Registration failed' });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    // Get role-specific profile
    let profile = null;
    if (user.role === 'student') {
      profile = await Student.findOne({ user: user._id }).populate('class parent');
    } else if (user.role === 'teacher') {
      profile = await Teacher.findOne({ user: user._id });
    } else if (user.role === 'parent') {
      profile = await Parent.findOne({ user: user._id });
    }

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message || 'Login failed' });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Get role-specific profile
    let profile = null;
    if (user.role === 'student') {
      profile = await Student.findOne({ user: user._id })
        .populate('class parent')
        .populate({ path: 'class', populate: { path: 'classTeacher' } });
    } else if (user.role === 'teacher') {
      profile = await Teacher.findOne({ user: user._id });
    } else if (user.role === 'parent') {
      profile = await Parent.findOne({ user: user._id }).populate({
        path: 'user',
        select: 'name email',
      });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: error.message || 'Failed to get user' });
  }
};

// Logout (client-side token removal, but we can track it here if needed)
export const logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};
