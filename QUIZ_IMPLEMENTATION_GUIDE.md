# Quiz Lock/Unlock System - Implementation Guide

## Overview
A complete quiz system where students can only take a quiz once their course performance reaches 100%. Quiz attempts are stored in MongoDB, marks are calculated and persisted, and results are displayed on the frontend.

## Architecture

### Backend Components

#### 1. **Quiz Model** (`backend/models/quizModel.js`)
Extended with:
- `studentMarks[]`: Array tracking each student's quiz attempts with score, percentage, and status
- `attempts[]`: Updated with percentage and better timestamp handling

#### 2. **Enrollment Model** (`backend/models/enrollmentModel.js`)
Enhanced with:
- `coursePerformance`: 0-100% tracking based on lesson completion
- `quizMarks`: Score from latest quiz attempt
- `quizPercentage`: Percentage score
- `quizTaken`: Boolean flag for quiz status
- `quizAttempts[]`: Array of all quiz attempts with quiz ID, marks, percentage, and status

#### 3. **Quiz Controller V2** (`backend/controllers/quizControllerV2.js`)
Four main endpoints:

##### `checkQuizLockStatus(GET /api/quizzes/course/:courseId/lock-status)`
- Checks if student is enrolled in the course
- Verifies `coursePerformance >= 100%`
- Returns lock status, current performance, and marks if already taken

##### `getQuizQuestions(GET /api/quizzes/:quizId/questions)`
- Verifies enrollment and unlock status
- Returns quiz questions without revealing correct answers
- Includes question marks for calculation

##### `submitQuizAnswers(POST /api/quizzes/:quizId/submit)`
- Validates unlock status before grading
- Grades the quiz based on correct answers
- Stores submission in both Quiz.studentMarks and Enrollment.quizAttempts
- Calculates percentage and pass/fail status
- Returns detailed results with question-by-question breakdown

##### `getStudentQuizMarks(GET /api/quizzes/course/:courseId/student-marks)`
- Retrieves student's quiz attempt history for a course
- Includes all attempts with timestamps and scores

#### 4. **Quiz Routes V2** (`backend/routes/quizRoutesV2.js`)
Registers all V2 endpoints with `protect` middleware for authentication

### Frontend Components

#### 1. **QuizModal Component** (`frontend/src/components/QuizModal.jsx`)
A complete modal with multiple states:

**States:**
- **Loading**: Initial data fetch
- **Locked**: Shows lock icon, required vs current performance, progress bar
- **Already Taken**: Displays previous marks and status
- **Active Quiz**: Multi-question interface with:
  - Question display
  - Radio button options
  - Previous/Next navigation
  - Submit button on last question
- **Results**: Shows score, percentage, pass/fail status with detailed results

**Key Features:**
- Persists student answers in local state
- Validates quiz unlock status from API
- Prevents cheating by not revealing answers until submission
- Handles error cases gracefully

#### 2. **Quiz CSS** (`frontend/src/assets/quizModal.css`)
Comprehensive styling for:
- Modal overlay with backdrop blur
- Locked state with progress bar visualization
- Active quiz interface with responsive layout
- Results display with color-coded pass/fail
- Mobile-responsive design

#### 3. **Courses.jsx Integration**
Updated with:
- `quizModalOpen` state to control modal visibility
- `selectedCourseForQuiz` to track which course's quiz is open
- `enrollment` state for user's enrollment data
- `startQuizHandler` opens the QuizModal
- QuizModal component rendered at page level

## API Endpoints

### Check Quiz Lock Status
```
GET /api/quizzes/course/:courseId/lock-status
Headers: Authorization: Bearer <token>

Response: {
  quizId: ObjectId,
  isLocked: boolean,
  isUnlocked: boolean,
  coursePerformance: number (0-100),
  requiredPerformance: 100,
  quizTaken: boolean,
  marks: number || null,
  percentage: number || null,
  status: 'passed' | 'failed' || null
}
```

### Get Quiz Questions
```
GET /api/quizzes/:quizId/questions
Headers: Authorization: Bearer <token>

Response: {
  quizId: ObjectId,
  title: string,
  totalMarks: number,
  duration: number,
  passingPercentage: number,
  questions: [{
    _id: ObjectId,
    question: string,
    options: [{ text: string }],
    marks: number
  }]
}
```

### Submit Quiz
```
POST /api/quizzes/:quizId/submit
Headers: Authorization: Bearer <token>
Body: {
  answers: [{
    questionIndex: number,
    selectedOption: number (0-indexed)
  }]
}

Response: {
  success: boolean,
  score: number,
  totalMarks: number,
  percentage: number,
  passed: boolean,
  passingPercentage: number,
  results: [{
    questionIndex: number,
    question: string,
    userAnswer: string,
    correctAnswer: string,
    isCorrect: boolean,
    marksAwarded: number
  }]
}
```

### Get Student Quiz Marks
```
GET /api/quizzes/course/:courseId/student-marks
Headers: Authorization: Bearer <token>

Response: {
  quizTaken: boolean,
  currentMarks: number,
  currentPercentage: number,
  attempts: [{
    quizId: { _id, title },
    marks: number,
    percentage: number,
    status: 'passed' | 'failed',
    attemptedAt: date
  }]
}
```

## Database Schema Changes

### Enrollment
```javascript
{
  // ... existing fields
  coursePerformance: { type: Number, default: 0 }, // 0-100%
  quizMarks: { type: Number, default: 0 },
  quizPercentage: { type: Number, default: 0 },
  quizTaken: { type: Boolean, default: false },
  quizAttempts: [{
    quizId: ObjectId,
    marks: Number,
    percentage: Number,
    status: String, // 'passed' | 'failed'
    attemptedAt: Date
  }]
}
```

### Quiz
```javascript
{
  // ... existing fields
  studentMarks: [{
    student: ObjectId,
    score: Number,
    percentage: Number,
    status: String, // 'passed' | 'failed'
    attemptedAt: Date
  }]
}
```

## User Flow

1. **Student Enrolls**: `coursePerformance` = 0
2. **Student Completes Lessons**: `coursePerformance` increases (implement lesson tracking)
3. **Student Reaches 100%**: Quiz becomes unlocked
4. **Student Opens Quiz**: Modal checks lock status and loads questions
5. **Student Answers**: Submissions validated on backend
6. **Quiz Submitted**: Results calculated, stored in DB, displayed in modal
7. **Next Attempt**: Shows previous marks with option to retake (configurable)

## Implementation Checklist

- [x] Quiz Model updated with studentMarks
- [x] Enrollment Model extended with quiz tracking
- [x] quizControllerV2 created with all endpoints
- [x] quizRoutesV2 registered in server
- [x] QuizModal component created
- [x] Quiz CSS styling completed
- [x] Courses.jsx integration started
- [ ] Implement coursePerformance calculation (from lesson completion)
- [ ] Test full flow end-to-end
- [ ] Seed test data with 100% performance students
- [ ] Error handling refinements

## Testing

### Test Scenario 1: Locked Quiz
1. Student logs in with 50% course performance
2. Navigate to quiz
3. Should see "Quiz Locked" with progress bar
4. Verify API returns `isLocked: true`

### Test Scenario 2: Unlock and Take Quiz
1. Student with 100% performance opens quiz
2. Should see questions without answers revealed
3. Select answers and click Submit
4. Should see results with marks
5. Verify DB stores marks in Enrollment.quizAttempts and Quiz.studentMarks

### Test Scenario 3: Previous Attempt
1. Student who already took quiz opens quiz again
2. Should see "Quiz Already Completed" with previous marks
3. Option to close modal

## Future Enhancements

- Multiple quiz attempts with best score tracking
- Time-limited quiz with countdown timer
- Instant feedback on each question (optional)
- Leaderboard based on quiz scores
- Certificate issuance on passing quiz
- Quiz analytics dashboard for instructors
- Difficulty levels and randomized questions
