# Course Enrollment System - Quick Implementation Snippets

## Quick Copy-Paste Code for Remaining Frontend Tasks

---

## 🔒 Task 1: Course Lock UI - Code Snippets

### Snippet 1: Check Enrollment Status on Component Mount

**Add to `frontend/src/pages/Courses.jsx` around line 1380 in the useEffect hooks**

```javascript
// Check enrollment status when component loads or courseId changes
useEffect(() => {
  const checkEnrollmentStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const courseId = new URLSearchParams(window.location.search).get('id') || 'default';
      
      if (token && courseId) {
        const res = await fetch(`/api/enrollments/course/${courseId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          setEnrolled(data.enrolled || false);
          console.log('Enrollment status:', data.enrolled);
        }
      }
    } catch (err) {
      console.warn('Failed to check enrollment status:', err);
    }
  };
  
  checkEnrollmentStatus();
}, []);
```

---

### Snippet 2: Lock Overlay Component

**Add before the curriculum sections render (around line 2100 in Courses.jsx)**

```javascript
// Show enrollment lock overlay if not enrolled
{!enrolled && (
  <div className="enrollment-lock-overlay">
    <div className="lock-message">
      <i className="bi bi-lock-fill"></i>
      <h3>Course Locked</h3>
      <p>Enroll in this course to access lessons and quizzes</p>
      <button 
        className="btn btn-primary"
        onClick={() => navigate('/subscription')}
      >
        Enroll Now
      </button>
    </div>
  </div>
)}
```

---

### Snippet 3: Disable Lesson Buttons

**Find lesson button rendering (search for "lesson-action" class) and modify**

```javascript
// OLD CODE:
<button onClick={() => handlePlayVideo(lesson)} className="lesson-action">
  {lesson.status}
</button>

// NEW CODE:
<button 
  onClick={() => enrolled && handlePlayVideo(lesson)}
  disabled={!enrolled}
  className="lesson-action"
  title={enrolled ? lesson.status : 'Enroll to access this lesson'}
>
  {enrolled ? lesson.status : 'Locked'}
</button>
```

---

### Snippet 4: Conditional Quiz Rendering

**Modify QuizInterface component (around line 1038)**

```javascript
// Add this at the start of QuizInterface render:
if (!enrolled) {
  return (
    <div className="quiz-lock-container">
      <div className="lock-message" style={{ width: '100%' }}>
        <i className="bi bi-lock-fill"></i>
        <h3>Quiz Locked</h3>
        <p>Enroll in this course to take quizzes</p>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/subscription')}
        >
          Enroll Now
        </button>
      </div>
    </div>
  );
}

// Rest of QuizInterface component continues...
```

---

## 📜 Task 2: Certificate Download - Code Snippets

### Snippet 5: Certificate Download Button

**Add to course header section (around line 1950 in Courses.jsx)**

```javascript
// Add after other course meta information:
{enrolled && progressPercentage === 100 && (
  <button 
    className="btn btn-success certificate-download-btn"
    onClick={handleDownloadCertificate}
    title="Download your course completion certificate"
  >
    <i className="bi bi-download"></i> Download Certificate
  </button>
)}

{enrolled && progressPercentage < 100 && (
  <div className="certificate-progress-text">
    <span>Complete {100 - progressPercentage}% more to unlock certificate</span>
  </div>
)}

{!enrolled && (
  <span className="text-muted">Enroll and complete course for certificate</span>
)}
```

---

### Snippet 6: Download Handler Function

**Add to Courses component (with other handlers around line 1500)**

```javascript
const handleDownloadCertificate = async () => {
  try {
    const token = localStorage.getItem('token');
    const courseId = new URLSearchParams(window.location.search).get('id') || 'default';
    
    if (!token) {
      alert('Please login to download certificate');
      return;
    }
    
    const res = await fetch(`/api/courses/${courseId}/certificate`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!res.ok) {
      const error = await res.json();
      alert('Error: ' + (error.message || 'Failed to download certificate'));
      return;
    }
    
    const data = await res.json();
    
    // Show certificate modal with data
    showCertificateModal(data.certificate);
    
  } catch (err) {
    console.error('Certificate download error:', err);
    alert('Failed to download certificate. Please try again.');
  }
};
```

---

### Snippet 7: Certificate Modal Component

**Add new component to Courses.jsx**

```javascript
// Add this function before the main Courses component
function CertificateModal({ certificate, onClose }) {
  if (!certificate) return null;
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="certificate-modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <div className="certificate-container">
          <div className="certificate-header">
            <h1>Certificate of Completion</h1>
            <div className="certificate-seal">🏅</div>
          </div>
          
          <div className="certificate-body">
            <p className="certificate-text">This is to certify that</p>
            <h2 className="certificate-name">{certificate.studentName}</h2>
            <p className="certificate-text">has successfully completed the course</p>
            <h3 className="certificate-course">{certificate.courseName}</h3>
            <p className="certificate-text">with a completion percentage of {certificate.completionPercentage}%</p>
            <p className="certificate-text">Completed on {formatDate(certificate.completionDate)}</p>
            <p className="certificate-text">Instructor: {certificate.instructorName}</p>
          </div>
          
          <div className="certificate-footer">
            <p>Certificate ID: {certificate.id}</p>
            <button className="btn btn-primary" onClick={() => {
              // Optional: Implement PDF download here
              alert('PDF download coming soon!');
            }}>
              Download as PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### Snippet 8: Add State for Certificate Modal

**Add to Courses component state section (around line 1350)**

```javascript
// Add this state hook:
const [certificateData, setCertificateData] = useState(null);

// Add this function after handleDownloadCertificate:
const showCertificateModal = (cert) => {
  setCertificateData(cert);
};

const closeCertificateModal = () => {
  setCertificateData(null);
};
```

---

### Snippet 9: Render Certificate Modal

**Add to the return statement of Courses component (after other modals)**

```javascript
{/* Certificate Modal */}
{certificateData && (
  <CertificateModal 
    certificate={certificateData}
    onClose={closeCertificateModal}
  />
)}
```

---

## 🎨 CSS Snippets

### Snippet 10: Lock UI Styling

**Add to `frontend/src/assets/Courses.css` at the end**

```css
/* ===== ENROLLMENT LOCK STYLES ===== */

.enrollment-lock-overlay {
  position: relative;
  height: 500px;
  background: linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(30,30,30,0.8) 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 30px 0;
  overflow: hidden;
}

.lock-message {
  text-align: center;
  color: white;
  padding: 40px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  max-width: 400px;
  backdrop-filter: blur(10px);
}

.lock-message i {
  font-size: 64px;
  margin-bottom: 20px;
  display: block;
  color: #fbbf24;
  text-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
}

.lock-message h3 {
  margin: 0 0 12px 0;
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
}

.lock-message p {
  margin: 0 0 24px 0;
  color: #e5e7eb;
  font-size: 15px;
  line-height: 1.6;
}

.lock-message .btn {
  min-width: 160px;
  padding: 12px 24px;
  font-size: 15px;
}

.quiz-lock-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%);
  border-radius: 12px;
  padding: 20px;
}

/* Lesson button disabled state */
.lesson-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #d1d5db !important;
  color: #6b7280 !important;
  border-color: #9ca3af !important;
  transition: all 0.3s ease;
}

.lesson-action:disabled:hover {
  background: #d1d5db !important;
  transform: none;
}

.certificate-download-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: 12px;
}

.certificate-download-btn:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.certificate-progress-text {
  display: inline-block;
  margin-left: 12px;
  padding: 8px 12px;
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  color: #92400e;
  border-radius: 4px;
  font-size: 14px;
}

/* ===== CERTIFICATE MODAL STYLES ===== */

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(5px);
}

.certificate-modal {
  position: relative;
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 32px;
  cursor: pointer;
  color: #6b7280;
  z-index: 10;
  transition: color 0.3s;
}

.close-btn:hover {
  color: #000;
}

.certificate-container {
  padding: 60px 40px;
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
  border: 3px solid #10b981;
  border-radius: 12px;
  margin: 20px;
  text-align: center;
  font-family: 'Georgia', serif;
}

.certificate-header {
  margin-bottom: 40px;
  position: relative;
}

.certificate-header h1 {
  font-size: 36px;
  color: #10b981;
  margin: 0 0 20px 0;
  font-weight: 700;
  letter-spacing: 2px;
}

.certificate-seal {
  font-size: 60px;
  margin-bottom: 15px;
}

.certificate-body {
  margin: 40px 0;
}

.certificate-text {
  font-size: 16px;
  color: #374151;
  margin: 12px 0;
  line-height: 1.8;
}

.certificate-name {
  font-size: 32px;
  color: #1f2937;
  margin: 20px 0;
  font-weight: 700;
  text-decoration: underline;
  text-decoration-color: #10b981;
  text-decoration-thickness: 2px;
  text-underline-offset: 8px;
}

.certificate-course {
  font-size: 24px;
  color: #10b981;
  margin: 20px 0;
  font-weight: 600;
}

.certificate-footer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 2px solid #e5e7eb;
}

.certificate-footer p {
  font-size: 13px;
  color: #6b7280;
  margin: 10px 0;
}

.certificate-footer .btn {
  margin-top: 15px;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .certificate-container {
    padding: 40px 20px;
  }
  
  .certificate-header h1 {
    font-size: 24px;
  }
  
  .certificate-name {
    font-size: 22px;
  }
  
  .certificate-course {
    font-size: 18px;
  }
  
  .lock-message {
    margin: 20px;
  }
  
  .certificate-download-btn {
    margin-left: 0;
    margin-top: 10px;
    width: 100%;
  }
}
```

---

## ✅ Implementation Checklist

- [ ] Add enrollment status check hook
- [ ] Add lock overlay component
- [ ] Disable lesson buttons
- [ ] Disable quiz interface
- [ ] Add certificate download button
- [ ] Create certificate modal component
- [ ] Add download handler function
- [ ] Add CSS for lock UI
- [ ] Add CSS for certificate modal
- [ ] Test enrollment flow
- [ ] Test certificate display
- [ ] Test mobile responsiveness
- [ ] Handle error cases

---

## 🔗 Integration Points

1. **Courses.jsx imports needed**:
   ```javascript
   import axios from 'axios'; // Add if not present
   ```

2. **localStorage keys used**:
   - `currentCourseId` - Set by Subscription.jsx, read by PaymentInterface
   - `currentEnrollmentId` - Set by Subscription.jsx, read by PaymentInterface
   - `token` - JWT token for API calls

3. **API calls made**:
   - `GET /api/enrollments/course/:courseId` - Check enrollment
   - `GET /api/courses/:courseId/certificate` - Get certificate

4. **State management**:
   - `enrolled` - Boolean flag for UI
   - `certificateData` - Holds certificate info for modal

---

## 🐛 Common Issues & Fixes

### Issue: "Enrollment check is not working"
**Solution**: Verify courseId is correctly extracted from URL
```javascript
const courseId = new URLSearchParams(window.location.search).get('id');
console.log('CourseId:', courseId); // Debug
```

### Issue: "Lock overlay covers everything"
**Solution**: Check z-index values in CSS
```css
.enrollment-lock-overlay {
  z-index: 10; /* Ensure it's above content but below modals */
}
```

### Issue: "Certificate button doesn't appear at 100%"
**Solution**: Verify progressPercentage state is updating
```javascript
console.log('Progress:', progressPercentage);
console.log('Enrolled:', enrolled);
```

### Issue: "API calls failing with 401"
**Solution**: Ensure token is in localStorage and valid
```javascript
const token = localStorage.getItem('token');
console.log('Token:', token ? 'Present' : 'Missing');
```

---

## 📞 Support

For issues with:
- **Backend**: Check enrollmentController.js for error handling
- **Frontend**: Check browser console for API errors
- **UI**: Inspect element to debug CSS z-index and display issues
- **API**: Use Postman to test endpoints directly

All API responses include error messages for debugging.

---

**Ready to implement?** Start with Snippet 1 (enrollment check) then work through to Snippet 10 (CSS styling).
