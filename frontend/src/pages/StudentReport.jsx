import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import AppLayout from '../components/AppLayout';
import { useNavigate } from 'react-router-dom';
import './StudentReport.css';

const StudentReport = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is parent
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'parent') {
      navigate('/dashboard');
      return;
    }

    fetchChildren();
  }, [navigate]);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/api/reports/children');
      setChildren(response.data.children || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch children list');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentReport = async (studentId) => {
    try {
      setLoading(true);
      const response = await axiosClient.get(`/api/reports/student/${studentId}`);
      setReportData(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch student report');
      console.error(err);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleChildSelect = (child) => {
    setSelectedChild(child);
    fetchStudentReport(child._id);
  };

  return (
    <AppLayout>
      <div className="student-report-container">
        <h2>Student Report Card</h2>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="report-layout">
          {/* Children List Sidebar */}
          <div className="children-list">
            <h3>Select Student</h3>
            {children.length === 0 ? (
              <p className="no-children">No children added yet</p>
            ) : (
              <div className="children-items">
                {children.map(child => (
                  <button
                    key={child._id}
                    className={`child-item ${selectedChild?._id === child._id ? 'active' : ''}`}
                    onClick={() => handleChildSelect(child)}
                  >
                    <span className="child-name">{child.fullName}</span>
                    <span className="child-email">{child.email}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Report Card Section */}
          <div className="report-card-section">
            {loading && (
              <div className="loading">Loading report...</div>
            )}

            {reportData && !loading && (
              <div className="report-card">
                {/* Student Info */}
                <div className="student-info-section">
                  <div className="info-header">
                    {reportData.student.avatar && (
                      <img src={reportData.student.avatar} alt="avatar" className="student-avatar" />
                    )}
                    <div className="student-details">
                      <h3>{reportData.student.fullName}</h3>
                      <p className="email">{reportData.student.email}</p>
                      {reportData.student.phone && <p className="phone">{reportData.student.phone}</p>}
                    </div>
                  </div>
                </div>

                {/* Statistics Overview */}
                <div className="statistics">
                  <div className="stat-card">
                    <h4>Enrolled Courses</h4>
                    <p className="stat-value">{reportData.statistics.totalEnrollments}</p>
                  </div>
                  <div className="stat-card">
                    <h4>Completed Courses</h4>
                    <p className="stat-value">{reportData.statistics.completedCourses}</p>
                  </div>
                  <div className="stat-card">
                    <h4>Average Quiz Score</h4>
                    <p className="stat-value">{reportData.statistics.averageQuizScore}%</p>
                  </div>
                  <div className="stat-card">
                    <h4>Passed Quizzes</h4>
                    <p className="stat-value">{reportData.statistics.passedQuizzes}/{reportData.statistics.totalQuizzes}</p>
                  </div>
                </div>

                {/* Enrolled Courses */}
                <div className="enrollments-section">
                  <h4>Enrolled Courses</h4>
                  {reportData.enrollments.length === 0 ? (
                    <p>No courses enrolled</p>
                  ) : (
                    <div className="enrollments-list">
                      {reportData.enrollments.map(enrollment => (
                        <div key={enrollment._id} className="enrollment-item">
                          <div className="course-header">
                            <h5>{enrollment.courseTitle}</h5>
                            <span className={`completion-badge ${enrollment.completed ? 'completed' : 'in-progress'}`}>
                              {enrollment.completed ? 'Completed' : 'In Progress'}
                            </span>
                          </div>
                          <p className="course-description">{enrollment.courseDescription}</p>
                          <div className="course-stats">
                            <span>Category: {enrollment.courseCategory}</span>
                            <span>Progress: {enrollment.progressPercentage}%</span>
                            <span>Watch Hours: {enrollment.watchHours}h</span>
                            {enrollment.grade && <span>Grade: {enrollment.grade}</span>}
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${enrollment.progressPercentage}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quiz Scores */}
                <div className="quiz-scores-section">
                  <h4>Quiz Scores</h4>
                  {reportData.quizScores.length === 0 ? (
                    <p>No quiz attempts</p>
                  ) : (
                    <div className="quiz-scores-list">
                      {reportData.quizScores.map((quiz, idx) => (
                        <div key={idx} className={`quiz-item ${quiz.status}`}>
                          <div className="quiz-header">
                            <h5>{quiz.quizTitle}</h5>
                            <span className={`status-badge ${quiz.status}`}>
                              {quiz.status === 'passed' ? '✓ Passed' : '✗ Failed'}
                            </span>
                          </div>
                          <div className="quiz-details">
                            <span>Score: <strong>{quiz.score}/{quiz.totalMarks}</strong></span>
                            <span>Percentage: <strong>{quiz.percentage}%</strong></span>
                            <span>Date: {new Date(quiz.completedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {!selectedChild && !loading && (
              <div className="no-selection">
                <p>Select a student to view their report card</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentReport;
