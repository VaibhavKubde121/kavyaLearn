# Course Enrollment & Certificate System - Implementation Guide

## Overview
This guide provides step-by-step implementation details for the course enrollment system with payment integration and certificate downloads. All backend work is COMPLETE. Frontend UI enhancements remain.

---

## ✅ COMPLETED WORK

### Backend Implementation (All Done)

#### 1. **Enrollment Model Updates** ✅
- **File**: `backend/models/enrollmentModel.js`
- **Changes**:
  - Added `enrollmentStatus` field (enum: 'pending', 'active', 'completed')
  - Added `paymentId` field (ObjectId ref to Payment model)
  - Added `certificateDownloadedAt` field (Date, tracks when certificate was downloaded)

#### 2. **Enrollment Controller & Routes** ✅
- **File**: `backend/controllers/enrollmentController.js` (NEW)
- **File**: `backend/routes/enrollmentRoutes.js` (NEW)
- **Endpoints Created**:
  ```
  POST   /api/enrollments/create                    - Create pending enrollment
  POST   /api/enrollments/activate/:enrollmentId    - Activate enrollment after payment
  GET    /api/enrollments/course/:courseId          - Get enrollment status for course
  GET    /api/enrollments                            - Get user's all enrollments
  PUT    /api/enrollments/:enrollmentId              - Update enrollment (progress, hours)
  ```

#### 3. **Certificate Download Endpoint** ✅
- **File**: `backend/controllers/courseController.js`
- **Endpoint**: `GET /api/courses/:id/certificate` (Protected)
- **Logic**:
  - Verifies user is enrolled and enrollment is active
  - Checks if course completion is 100%
  - Returns certificate data (student name, course name, instructor, date)
  - Marks certificate as downloaded in enrollment record
  - Can be extended to generate PDF

#### 4. **Payment Integration** ✅
- **File**: `frontend/src/components/PaymentInterface.jsx` (MODIFIED)
- **Changes**:
  - Reads `currentCourseId` and `currentEnrollmentId` from localStorage
  - After payment success: calls `POST /api/enrollments/activate/:enrollmentId`
  - On success modal close: clears localStorage and redirects to course
  - On error: shows error alert

#### 5. **Subscription Page Integration** ✅
- **File**: `frontend/src/pages/Subscription.jsx` (MODIFIED)
- **Changes**:
  - Added axios import
  - Updated `handlePayNow()` to:
    - Create pending enrollment via `POST /api/enrollments/create`
    - Store courseId and enrollmentId in localStorage
    - Navigate to payment page

---

## 📝 REMAINING FRONTEND WORK

### Task 1: Course Lock UI in Courses.jsx

**Objective**: Show enrollment overlay and lock lessons/quizzes until user is enrolled

**Implementation Steps**:

1. **Check Enrollment Status on Load**
   ```javascript
   // In useEffect hook in Courses component (around line 1400):
   
   useEffect(() => {
     const checkEnrollmentStatus = async () => {
       try {
         const token = localStorage.getItem('token');
         const courseId = getCourseIdFromPage(); // Extract from URL or props
         
         if (token && courseId) {
           const res = await fetch(`/api/enrollments/course/${courseId}`, {
             headers: { Authorization: `Bearer ${token}` }
           });
           
           if (res.ok) {
             const data = await res.json();
             setEnrolled(data.enrolled); // Update enrolled state
           }
         }
       } catch (err) {
         console.error('Failed to check enrollment status:', err);
       }
     };
     
     checkEnrollmentStatus();
   }, []);
   ```

2. **Add Lock Overlay Component**
   ```javascript
   // Add before curriculum sections in render (around line 2100):
   
   {!enrolled && (
     <div className="enrollment-lock-overlay">
       <div className="lock-message">
         <i className="bi bi-lock-fill"></i>
         <h3>Enroll to Access Course</h3>
         <p>Subscribe to this course to view lessons and take quizzes</p>
         <button 
           className="btn btn-primary"
           onClick={() => navigate('/subscription', { state: { courseId } })}
         >
           Enroll Now
         </button>
       </div>
     </div>
   )}
   ```

3. **Lock Lesson Buttons**
   ```javascript
   // For each lesson button (in Getting Started, Core Concepts, etc):
   
   <button 
     className="lesson-action"
     disabled={!enrolled}
     onClick={() => enrolled && handlePlayVideo(lesson)}
   >
     {enrolled ? lesson.status : 'Locked - Enroll to Access'}
   </button>
   ```

4. **Lock Quiz Interface**
   ```javascript
   // In QuizInterface component render (around line 1038):
   
   if (!enrolled) {
     return (
       <div className="quiz-lock-container">
         <div className="lock-message">
           <i className="bi bi-lock-fill"></i>
           <h3>Quiz Locked</h3>
           <p>Enroll in this course to take quizzes</p>
           <button className="btn btn-primary">Enroll Now</button>
         </div>
       </div>
     );
   }
   ```

### Task 2: Certificate Download Button

**Objective**: Add certificate download button visible when course is 100% complete

**Implementation Steps**:

1. **Add Certificate Button in Course Header** (around line 2050)
   ```javascript
   // In course-detail header section:
   
   <div className="certificate-section">
     {progressPercentage === 100 && enrolled && (
       <button 
         className="btn btn-success"
         onClick={handleDownloadCertificate}
       >
         <i className="bi bi-download"></i> Download Certificate
       </button>
     )}
     {progressPercentage === 100 && !enrolled && (
       <span className="text-muted">Enroll to download certificate</span>
     )}
   </div>
   ```

2. **Implement Download Handler**
   ```javascript
   const handleDownloadCertificate = async () => {
     try {
       const token = localStorage.getItem('token');
       const courseId = getCourseIdFromPage();
       
       const res = await fetch(`/api/courses/${courseId}/certificate`, {
         headers: { Authorization: `Bearer ${token}` }
       });
       
       if (!res.ok) {
         const error = await res.json();
         alert(error.message);
         return;
       }
       
       const data = await res.json();
       
       // Option 1: Show certificate data in modal
       showCertificateModal(data.certificate);
       
       // Option 2: Download as PDF (requires additional setup)
       // const pdf = generateCertificatePDF(data.certificate);
       // downloadFile(pdf, `certificate-${courseId}.pdf`);
     } catch (err) {
       alert('Failed to download certificate');
       console.error(err);
     }
   };
   ```

### Task 3: Add CSS for Lock UI

**File**: `frontend/src/assets/Courses.css` (Add at end)

```css
/* Enrollment Lock Styles */
.enrollment-lock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  z-index: 10;
}

.lock-message {
  text-align: center;
  color: white;
  padding: 40px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 12px;
}

.lock-message i {
  font-size: 48px;
  margin-bottom: 20px;
  display: block;
  color: #fbbf24;
}

.lock-message h3 {
  margin-bottom: 10px;
  font-size: 24px;
}

.lock-message p {
  margin-bottom: 20px;
  color: #e5e7eb;
  font-size: 14px;
}

.quiz-lock-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: #f9fafb;
  border-radius: 12px;
}

.certificate-section {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 20px;
}

.btn-success {
  background: #10b981;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-success:hover {
  background: #059669;
}

.lesson-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #d1d5db;
}
```

---

## 🔄 ENROLLMENT FLOW SUMMARY

### User Journey: Browse → Enroll → Pay → Access → Complete → Certificate

1. **Browse Courses** (Subscription.jsx)
   - User clicks "Enroll Now" on course card
   - `handlePayNow()` creates pending enrollment
   - Stores courseId & enrollmentId in localStorage
   - Redirects to `/payment`

2. **Payment** (PaymentInterface.jsx)
   - User completes payment
   - Payment recorded in backend
   - POST `/api/enrollments/activate/:enrollmentId` called with paymentId
   - Enrollment marked as 'active'
   - User added to course's enrolledStudents
   - Success modal shown
   - On close: redirects to course page

3. **Access Course** (Courses.jsx)
   - Component checks enrollment status
   - If enrolled: shows all lessons/quizzes unlocked
   - If not enrolled: shows lock overlay
   - User can watch lessons and take quizzes

4. **Complete Course** (Courses.jsx)
   - User completes all lessons
   - Progress reaches 100%
   - Certificate download button appears

5. **Download Certificate** (Courses.jsx → Backend)
   - User clicks "Download Certificate"
   - Backend verifies: enrolled + 100% completion
   - Returns certificate data (name, course, instructor, date)
   - Frontend shows certificate modal or triggers PDF download
   - Backend marks certificate as downloaded

---

## 📊 API Reference

### Enrollment Endpoints

```bash
# Create Pending Enrollment (before payment)
POST /api/enrollments/create
Authorization: Bearer {token}
Body: { courseId: "64a1b2c3d4e5f6g7h8i9j0" }
Response: { message, enrollmentId }

# Activate Enrollment (after payment)
POST /api/enrollments/activate/:enrollmentId
Authorization: Bearer {token}
Body: { paymentId: "64a1b2c3d4e5f6g7h8i9j1" }
Response: { message, enrollment }

# Get Enrollment Status
GET /api/enrollments/course/:courseId
Authorization: Bearer {token}
Response: { enrolled, status, enrollmentId, progressPercentage, completed }

# Update Enrollment Progress
PUT /api/enrollments/:enrollmentId
Authorization: Bearer {token}
Body: { progressPercentage: 75, watchHours: 10, completed: false }
Response: enrollment object

# Get User's Enrollments
GET /api/enrollments
Authorization: Bearer {token}
Response: [enrollment1, enrollment2, ...]
```

### Certificate Endpoint

```bash
GET /api/courses/:courseId/certificate
Authorization: Bearer {token}
Response: {
  message: "Certificate ready for download",
  certificate: {
    id: "CERT-xxx",
    studentName: "John Doe",
    courseName: "Ethical Hacking",
    instructorName: "Instructor Name",
    completionDate: "2024-01-15T10:30:00Z",
    completionPercentage: 100,
    courseId: "xxx",
    enrollmentId: "xxx"
  }
}
```

---

## 🚀 Testing Checklist

- [ ] User can browse courses on Subscription page
- [ ] Clicking "Enroll Now" creates pending enrollment
- [ ] Payment page loads with courseId from localStorage
- [ ] Payment submission calls enrollment activation
- [ ] After payment: enrolledCourses updated in user profile
- [ ] Course page shows unlocked lessons when enrolled
- [ ] Course page shows lock overlay when not enrolled
- [ ] Lessons display "Locked - Enroll to Access" when not enrolled
- [ ] Quiz locked for non-enrolled users
- [ ] At 100% completion: certificate download button shows
- [ ] Download certificate calls backend endpoint
- [ ] Certificate data shows correctly
- [ ] Backend marks certificate as downloaded

---

## 🔐 Security Notes

1. All enrollment and certificate endpoints require `protect` middleware (JWT auth)
2. Users can only activate their own pending enrollments
3. Users can only access certificates for their enrolled courses
4. Payment verification ensures payment belongs to user and course matches enrollment
5. Course is only unlocked if enrollmentStatus = 'active'

---

## 📚 File References

**Backend Files**:
- `backend/models/enrollmentModel.js` - Enrollment schema
- `backend/controllers/enrollmentController.js` - Enrollment logic
- `backend/routes/enrollmentRoutes.js` - Enrollment routes
- `backend/controllers/courseController.js` - Certificate logic
- `backend/routes/courseRoutes.js` - Certificate route
- `backend/server.js` - Route registration (already done)

**Frontend Files**:
- `frontend/src/pages/Subscription.jsx` - Course browsing (MODIFIED)
- `frontend/src/components/PaymentInterface.jsx` - Payment (MODIFIED)
- `frontend/src/pages/Courses.jsx` - Course detail & lock UI (NEEDS UPDATE)
- `frontend/src/assets/Courses.css` - Styles (NEEDS UPDATE)

---

## 🎯 Next Steps

1. Update Courses.jsx to check enrollment status on component mount
2. Add lock overlay and disabled states for lessons/quizzes
3. Implement certificate download button and handler
4. Add CSS for lock UI and certificate button
5. Test end-to-end enrollment flow
6. Optional: Add PDF certificate generation using libraries like `pdfkit` or `html2pdf`

---

**Status**: 🟢 Backend: Complete | 🟡 Frontend: 70% Complete (needs lock UI & cert button)
