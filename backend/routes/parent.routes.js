import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import Parent from '../models/Parent.model.js';
import User from '../models/User.model.js';

const router = express.Router();

// Get all parents
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const parents = await Parent.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json(parents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get parent by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const parent = await Parent.findById(req.params.id).populate('user', 'name email');

    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }

    res.json(parent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create parent (Admin only)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

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
      role: 'parent',
    });

    // Create parent
    const parent = await Parent.create({
      user: user._id,
      phone,
      address: address || '',
    });

    const populatedParent = await Parent.findById(parent._id).populate('user', 'name email');

    res.status(201).json(populatedParent);
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `A user with this ${field} already exists. Please use a different ${field}.` 
      });
    }
    res.status(500).json({ message: error.message || 'Failed to create parent' });
  }
});

// Update parent
router.put('/:id', authenticate, async (req, res) => {
  try {
    const parent = await Parent.findById(req.params.id);
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }

    // Only admin can update, or parent can update their own profile
    if (req.user.role !== 'admin' && parent.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedParent = await Parent.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('user', 'name email');

    res.json(updatedParent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete parent (Admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const parent = await Parent.findById(req.params.id);
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }

    await User.findByIdAndDelete(parent.user);
    await Parent.findByIdAndDelete(req.params.id);

    res.json({ message: 'Parent deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
