import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    examName: {
      type: String,
      required: [true, 'Exam name is required'],
    },
    grade: {
      type: Number,
      required: true,
      min: [0, 'Grade cannot be negative'],
      max: [100, 'Grade cannot exceed 100'],
    },
    maxGrade: {
      type: Number,
      default: 100,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Grade', gradeSchema);
