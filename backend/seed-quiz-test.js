/**
 * Seed script to create test data for quiz lock/unlock testing
 * Creates a course, quiz, and students with different performance levels
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./models/userModel');
const Course = require('./models/courseModel');
const Quiz = require('./models/quizModel');
const Enrollment = require('./models/enrollmentModel');

async function seedQuizData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📦 MongoDB Connected');

    // Clear existing test data
    await User.deleteMany({ email: { $regex: /^test.*@example\.com$/ } });
    await Enrollment.deleteMany({ studentId: { $exists: true } });
    console.log('🗑️  Cleared previous test data');

    // Create test instructor
    const instructor = await User.create({
      fullName: 'Quiz Instructor',
      email: 'instructor@example.com',
      password: 'password123',
      userType: 'instructor',
      phone: '9999999999'
    });
    console.log('✅ Created instructor:', instructor.email);

    // Create test course
    const course = await Course.create({
      title: 'Quiz Lock Testing Course',
      description: 'Course designed to test quiz lock/unlock functionality',
      instructor: instructor._id,
      category: 'Testing',
      level: 'Beginner',
      duration: 4,
      price: 999,
      thumbnail: 'https://via.placeholder.com/300x200',
      videoLink: 'https://www.youtube.com/embed/w_oxcjPOWos'
    });
    console.log('✅ Created course:', course.title);

    // Create test quiz with 5 questions
    const quiz = await Quiz.create({
      title: 'Module 1 Final Assessment',
      course: course._id,
      duration: 30,
      totalMarks: 100,
      passingPercentage: 60,
      questions: [
        {
          question: 'What is the capital of France?',
          options: [
            { text: 'London', isCorrect: false },
            { text: 'Paris', isCorrect: true },
            { text: 'Berlin', isCorrect: false },
            { text: 'Madrid', isCorrect: false }
          ],
          marks: 20
        },
        {
          question: 'Which planet is closest to the sun?',
          options: [
            { text: 'Venus', isCorrect: false },
            { text: 'Mercury', isCorrect: true },
            { text: 'Earth', isCorrect: false },
            { text: 'Mars', isCorrect: false }
          ],
          marks: 20
        },
        {
          question: 'What is 2 + 2?',
          options: [
            { text: '3', isCorrect: false },
            { text: '4', isCorrect: true },
            { text: '5', isCorrect: false },
            { text: '6', isCorrect: false }
          ],
          marks: 20
        },
        {
          question: 'Who wrote Romeo and Juliet?',
          options: [
            { text: 'Jane Austen', isCorrect: false },
            { text: 'Charles Dickens', isCorrect: false },
            { text: 'William Shakespeare', isCorrect: true },
            { text: 'Oscar Wilde', isCorrect: false }
          ],
          marks: 20
        },
        {
          question: 'What is the largest ocean?',
          options: [
            { text: 'Atlantic', isCorrect: false },
            { text: 'Indian', isCorrect: false },
            { text: 'Arctic', isCorrect: false },
            { text: 'Pacific', isCorrect: true }
          ],
          marks: 20
        }
      ],
      isPublished: true
    });
    console.log('✅ Created quiz with 5 questions');

    // Create students with different performance levels
    const students = await User.insertMany([
      {
        fullName: 'Locked Quiz Student',
        email: 'locked@example.com',
        password: 'password123',
        userType: 'student',
        phone: '8888888880'
      },
      {
        fullName: 'Unlocked Quiz Student',
        email: 'unlocked@example.com',
        password: 'password123',
        userType: 'student',
        phone: '8888888881'
      },
      {
        fullName: 'Completed Quiz Student',
        email: 'completed@example.com',
        password: 'password123',
        userType: 'student',
        phone: '8888888882'
      }
    ]);
    console.log('✅ Created 3 test students');

    // Create enrollments with different states
    // Student 1: 50% progress (locked)
    const enrollment1 = await Enrollment.create({
      studentId: students[0]._id,
      courseId: course._id,
      coursePerformance: 50,
      progressPercentage: 50,
      quizTaken: false
    });
    console.log('✅ Enrolled student 1 with 50% progress (LOCKED)');

    // Student 2: 100% progress (unlocked but not taken)
    const enrollment2 = await Enrollment.create({
      studentId: students[1]._id,
      courseId: course._id,
      coursePerformance: 100,
      progressPercentage: 100,
      quizTaken: false
    });
    console.log('✅ Enrolled student 2 with 100% progress (UNLOCKED, NOT TAKEN)');

    // Student 3: 100% progress with quiz taken (75% score - passed)
    const enrollment3 = await Enrollment.create({
      studentId: students[2]._id,
      courseId: course._id,
      coursePerformance: 100,
      progressPercentage: 100,
      quizTaken: true,
      quizMarks: 75,
      quizPercentage: 75,
      quizAttempts: [{
        quizId: quiz._id,
        marks: 75,
        percentage: 75,
        status: 'passed',
        attemptedAt: new Date(Date.now() - 86400000) // 1 day ago
      }]
    });

    // Also add to quiz.studentMarks
    quiz.studentMarks.push({
      student: students[2]._id,
      score: 75,
      percentage: 75,
      status: 'passed'
    });
    await quiz.save();
    console.log('✅ Enrolled student 3 with 100% progress and completed quiz (75% - PASSED)');

    console.log('\n📊 Test Data Summary:');
    console.log('─────────────────────────────────────────');
    console.log(`Course: ${course._id} (${course.title})`);
    console.log(`Quiz: ${quiz._id} (${quiz.title})`);
    console.log('');
    console.log('🔒 LOCKED STUDENT:');
    console.log(`  Email: locked@example.com | Pass: password123`);
    console.log(`  Course Progress: 50%`);
    console.log(`  Status: Quiz is LOCKED`);
    console.log('');
    console.log('🔓 UNLOCKED (NOT TAKEN) STUDENT:');
    console.log(`  Email: unlocked@example.com | Pass: password123`);
    console.log(`  Course Progress: 100%`);
    console.log(`  Status: Quiz is UNLOCKED, ready to take`);
    console.log('');
    console.log('✅ COMPLETED QUIZ STUDENT:');
    console.log(`  Email: completed@example.com | Pass: password123`);
    console.log(`  Course Progress: 100%`);
    console.log(`  Quiz Score: 75/100 (75%) - PASSED`);
    console.log('');
    console.log('─────────────────────────────────────────');
    console.log('');
    console.log('🧪 Testing Instructions:');
    console.log('1. Start backend: npm start');
    console.log('2. Start frontend: npm run dev');
    console.log('3. Login as locked@example.com → Quiz should show locked state');
    console.log('4. Login as unlocked@example.com → Quiz should be available to take');
    console.log('5. Login as completed@example.com → Quiz should show previous marks');
    console.log('');
    console.log('✅ Test data seeded successfully!');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedQuizData();
