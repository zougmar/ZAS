import mongoose from 'mongoose';

const teacherSubjectSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate assignments
teacherSubjectSchema.index({ teacher: 1, subject: 1, class: 1 }, { unique: true });

export default mongoose.model('TeacherSubject', teacherSubjectSchema);
