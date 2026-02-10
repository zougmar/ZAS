import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model.js';
import Student from '../models/Student.model.js';
import Teacher from '../models/Teacher.model.js';
import Parent from '../models/Parent.model.js';
import Class from '../models/Class.model.js';
import Subject from '../models/Subject.model.js';
import TeacherSubject from '../models/TeacherSubject.model.js';
import Timetable from '../models/Timetable.model.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zas');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Student.deleteMany({});
    await Teacher.deleteMany({});
    await Parent.deleteMany({});
    await Class.deleteMany({});
    await Subject.deleteMany({});
    await TeacherSubject.deleteMany({});
    await Timetable.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@zas.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log('✅ Created admin user');

    // Create Classes
    const class1 = await Class.create({
      name: 'Grade 1A',
      level: 'primary',
      capacity: 30,
    });
    const class2 = await Class.create({
      name: 'Grade 2A',
      level: 'primary',
      capacity: 30,
    });
    const class3 = await Class.create({
      name: 'Grade 10A',
      level: 'high',
      capacity: 30,
    });
    console.log('✅ Created classes');

    // Create Subjects
    const math = await Subject.create({ name: 'Mathematics', code: 'MATH' });
    const english = await Subject.create({ name: 'English', code: 'ENG' });
    const science = await Subject.create({ name: 'Science', code: 'SCI' });
    const history = await Subject.create({ name: 'History', code: 'HIS' });
    console.log('✅ Created subjects');

    // Create Teachers
    const teacher1User = await User.create({
      name: 'John Teacher',
      email: 'teacher1@zas.com',
      password: 'teacher123',
      role: 'teacher',
    });
    const teacher1 = await Teacher.create({
      user: teacher1User._id,
      phone: '+1234567890',
      specialization: 'Mathematics',
      employeeId: 'T001',
    });

    const teacher2User = await User.create({
      name: 'Jane Teacher',
      email: 'teacher2@zas.com',
      password: 'teacher123',
      role: 'teacher',
    });
    const teacher2 = await Teacher.create({
      user: teacher2User._id,
      phone: '+1234567891',
      specialization: 'English',
      employeeId: 'T002',
    });
    console.log('✅ Created teachers');

    // Assign class teachers
    class1.classTeacher = teacher1._id;
    await class1.save();
    class2.classTeacher = teacher2._id;
    await class2.save();

    // Create Parents
    const parent1User = await User.create({
      name: 'Parent One',
      email: 'parent1@zas.com',
      password: 'parent123',
      role: 'parent',
    });
    const parent1 = await Parent.create({
      user: parent1User._id,
      phone: '+1234567892',
      address: '123 Main St',
    });

    const parent2User = await User.create({
      name: 'Parent Two',
      email: 'parent2@zas.com',
      password: 'parent123',
      role: 'parent',
    });
    const parent2 = await Parent.create({
      user: parent2User._id,
      phone: '+1234567893',
      address: '456 Oak Ave',
    });
    console.log('✅ Created parents');

    // Create Students
    const student1User = await User.create({
      name: 'Alice Student',
      email: 'student1@zas.com',
      password: 'student123',
      role: 'student',
    });
    const student1 = await Student.create({
      user: student1User._id,
      class: class1._id,
      parent: parent1._id,
      dateOfBirth: new Date('2010-05-15'),
      gender: 'female',
      admissionNumber: 'S001',
    });

    const student2User = await User.create({
      name: 'Bob Student',
      email: 'student2@zas.com',
      password: 'student123',
      role: 'student',
    });
    const student2 = await Student.create({
      user: student2User._id,
      class: class1._id,
      parent: parent1._id,
      dateOfBirth: new Date('2010-08-20'),
      gender: 'male',
      admissionNumber: 'S002',
    });

    const student3User = await User.create({
      name: 'Charlie Student',
      email: 'student3@zas.com',
      password: 'student123',
      role: 'student',
    });
    const student3 = await Student.create({
      user: student3User._id,
      class: class2._id,
      parent: parent2._id,
      dateOfBirth: new Date('2009-03-10'),
      gender: 'male',
      admissionNumber: 'S003',
    });
    console.log('✅ Created students');

    // Assign teachers to subjects and classes
    await TeacherSubject.create({
      teacher: teacher1._id,
      subject: math._id,
      class: class1._id,
    });
    await TeacherSubject.create({
      teacher: teacher2._id,
      subject: english._id,
      class: class1._id,
    });
    await TeacherSubject.create({
      teacher: teacher1._id,
      subject: math._id,
      class: class2._id,
    });
    console.log('✅ Created teacher-subject assignments');

    // Create Timetable entries
    await Timetable.create({
      class: class1._id,
      subject: math._id,
      teacher: teacher1._id,
      dayOfWeek: 'monday',
      startTime: '09:00',
      endTime: '10:00',
      room: 'Room 101',
    });
    await Timetable.create({
      class: class1._id,
      subject: english._id,
      teacher: teacher2._id,
      dayOfWeek: 'monday',
      startTime: '10:00',
      endTime: '11:00',
      room: 'Room 102',
    });
    await Timetable.create({
      class: class1._id,
      subject: math._id,
      teacher: teacher1._id,
      dayOfWeek: 'wednesday',
      startTime: '09:00',
      endTime: '10:00',
      room: 'Room 101',
    });
    console.log('✅ Created timetable entries');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Default Credentials:');
    console.log('Admin: admin@zas.com / admin123');
    console.log('Teacher: teacher1@zas.com / teacher123');
    console.log('Student: student1@zas.com / student123');
    console.log('Parent: parent1@zas.com / parent123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
