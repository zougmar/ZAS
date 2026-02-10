import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import Message from '../models/Message.model.js';
import User from '../models/User.model.js';

const router = express.Router();

// Send message
router.post('/', authenticate, async (req, res) => {
  try {
    const { receiver, message } = req.body;

    if (!receiver) {
      return res.status(400).json({ message: 'Receiver is required' });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Check if receiver exists
    const receiverUser = await User.findById(receiver);
    if (!receiverUser) {
      return res.status(404).json({ message: 'Receiver user not found' });
    }

    // Don't allow sending message to yourself
    if (req.user._id.toString() === receiver) {
      return res.status(400).json({ message: 'Cannot send message to yourself' });
    }

    const messageData = await Message.create({
      sender: req.user._id,
      receiver,
      message: message.trim(),
    });

    const populated = await Message.findById(messageData._id)
      .populate('sender', 'name email role')
      .populate('receiver', 'name email role');

    res.status(201).json(populated);
  } catch (error) {
    console.error('Message creation error:', error);
    res.status(500).json({ message: error.message || 'Failed to send message' });
  }
});

// Get messages for a user
router.get('/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;

    // Users can only view their own messages
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate('sender', 'name email role')
      .populate('receiver', 'name email role')
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark message as read
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only receiver can mark as read
    if (message.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    const populated = await Message.findById(message._id)
      .populate('sender', 'name email role')
      .populate('receiver', 'name email role');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete message
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only sender or receiver can delete
    if (
      message.sender.toString() !== req.user._id.toString() &&
      message.receiver.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Message.findByIdAndDelete(req.params.id);
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
