import mongoose from 'mongoose';

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Class name is required'],
      unique: true,
      trim: true,
    },
    level: {
      type: String,
      required: [true, 'Class level is required'],
      enum: ['primary', 'secondary', 'high'],
    },
    capacity: {
      type: Number,
      default: 30,
    },
    classTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Class', classSchema);
