const API_BASE = typeof window === 'undefined'
  ? (process.env.INTERNAL_API_URL || 'http://127.0.0.1:5000/api')
  : '/api';

const getHeaders = (isMultipart = false) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('ilm_token') : null;
  const headers = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  let data = {};
  try {
    data = await response.json();
  } catch (e) {
    data = {
      message: response.status === 502 || response.status === 500 || response.status === 504
        ? 'Server is starting up. Please try again in 2 seconds.'
        : (response.statusText || 'Unable to connect to service. Please try again.')
    };
  }
  if (!response.ok) {
    const error = new Error(data.message || 'An error occurred while processing request');
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
};

export const api = {
  // Auth
  register: (body) => fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  }).then(handleResponse),

  verifyOtp: (body) => fetch(`${API_BASE}/auth/verify-otp`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  }).then(handleResponse),

  resendOtp: (body) => fetch(`${API_BASE}/auth/resend-otp`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  }).then(handleResponse),

  login: async (body) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body)
      });
      return await handleResponse(res);
    } catch (err) {
      if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        try {
          const directRes = await fetch(`http://${window.location.hostname}:5000/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          if (directRes.ok) {
            return await directRes.json();
          }
        } catch (directErr) {
          // fall through
        }
      }
      throw err;
    }
  },

  getMe: () => fetch(`${API_BASE}/auth/me`, {
    headers: getHeaders()
  }).then(handleResponse),

  updateProfile: (body) => fetch(`${API_BASE}/auth/update-profile`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body)
  }).then(handleResponse),

  changePassword: (body) => fetch(`${API_BASE}/auth/change-password`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body)
  }).then(handleResponse),

  forgotPassword: (body) => fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  }).then(handleResponse),

  resetPassword: (body) => fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  }).then(handleResponse),

  // CMS
  getCategories: () => fetch(`${API_BASE}/cms/categories`).then(handleResponse),
  getLocations: () => fetch(`${API_BASE}/cms/locations`).then(handleResponse),
  getSystemConfig: () => fetch(`${API_BASE}/cms/config`).then(handleResponse),

  // Courses
  getCourses: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/courses?${query}`).then(handleResponse);
  },
  getCourseBySlug: (slug) => fetch(`${API_BASE}/courses/${slug}`, {
    headers: getHeaders()
  }).then(handleResponse),
  getTutorCourses: (tutorUserId) => fetch(`${API_BASE}/courses/by-tutor/${tutorUserId}`).then(handleResponse),

  // Tutor Course Studio Authoring (Protected)
  getMyTutorCourses: () => fetch(`${API_BASE}/courses/tutor/my-courses`, {
    headers: getHeaders()
  }).then(handleResponse),

  createTutorCourse: (body) => fetch(`${API_BASE}/courses/tutor/create`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  }).then(handleResponse),

  updateTutorCourse: (id, body) => fetch(`${API_BASE}/courses/tutor/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body)
  }).then(handleResponse),

  deleteTutorCourse: (id) => fetch(`${API_BASE}/courses/tutor/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  }).then(handleResponse),

  addCourseChapter: (courseId, chapterData) => fetch(`${API_BASE}/courses/tutor/${courseId}/chapters`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(chapterData)
  }).then(handleResponse),

  updateCourseChapter: (courseId, chapterId, chapterData) => fetch(`${API_BASE}/courses/tutor/${courseId}/chapters/${chapterId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(chapterData)
  }).then(handleResponse),

  deleteCourseChapter: (courseId, chapterId) => fetch(`${API_BASE}/courses/tutor/${courseId}/chapters/${chapterId}`, {
    method: 'DELETE',
    headers: getHeaders()
  }).then(handleResponse),

  addCourseLesson: (courseId, chapterId, lessonData) => fetch(`${API_BASE}/courses/tutor/${courseId}/chapters/${chapterId}/lessons`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(lessonData)
  }).then(handleResponse),

  updateCourseLesson: (courseId, chapterId, lessonId, lessonData) => fetch(`${API_BASE}/courses/tutor/${courseId}/chapters/${chapterId}/lessons/${lessonId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(lessonData)
  }).then(handleResponse),

  deleteCourseLesson: (courseId, chapterId, lessonId) => fetch(`${API_BASE}/courses/tutor/${courseId}/chapters/${chapterId}/lessons/${lessonId}`, {
    method: 'DELETE',
    headers: getHeaders()
  }).then(handleResponse),

  addCourseTest: (courseId, chapterId, testData) => fetch(`${API_BASE}/courses/tutor/${courseId}/chapters/${chapterId}/tests`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(testData)
  }).then(handleResponse),

  updateCourseTest: (courseId, chapterId, testId, testData) => fetch(`${API_BASE}/courses/tutor/${courseId}/chapters/${chapterId}/tests/${testId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(testData)
  }).then(handleResponse),

  deleteCourseTest: (courseId, chapterId, testId) => fetch(`${API_BASE}/courses/tutor/${courseId}/chapters/${chapterId}/tests/${testId}`, {
    method: 'DELETE',
    headers: getHeaders()
  }).then(handleResponse),

  addCourseAssignment: (courseId, chapterId, assignmentData) => fetch(`${API_BASE}/courses/tutor/${courseId}/chapters/${chapterId}/assignments`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(assignmentData)
  }).then(handleResponse),

  updateCourseAssignment: (courseId, chapterId, assignmentId, assignmentData) => fetch(`${API_BASE}/courses/tutor/${courseId}/chapters/${chapterId}/assignments/${assignmentId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(assignmentData)
  }).then(handleResponse),

  deleteCourseAssignment: (courseId, chapterId, assignmentId) => fetch(`${API_BASE}/courses/tutor/${courseId}/chapters/${chapterId}/assignments/${assignmentId}`, {
    method: 'DELETE',
    headers: getHeaders()
  }).then(handleResponse),

  // Certificates
  getCertificate: (id) => fetch(`${API_BASE}/certificates/${id}`).then(handleResponse),
  getMyCertificates: () => fetch(`${API_BASE}/certificates/student/my-certificates`, {
    headers: getHeaders()
  }).then(handleResponse),
  issueCertificate: (body) => fetch(`${API_BASE}/certificates/issue`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  }).then(handleResponse),

  // Tutors
  getPublicTutors: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/tutors?${query}`).then(handleResponse);
  },
  getTutors: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/tutors?${query}`).then(handleResponse);
  },
  getTutorById: (id) => fetch(`${API_BASE}/tutors/${id}`).then(handleResponse),

  getMyTutorProfile: () => fetch(`${API_BASE}/tutors/profile/me`, {
    headers: getHeaders()
  }).then(handleResponse),

  updateMyTutorProfile: (body) => fetch(`${API_BASE}/tutors/profile/me`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body)
  }).then(handleResponse),

  uploadSanad: (formData) => fetch(`${API_BASE}/tutors/sanad/upload`, {
    method: 'POST',
    headers: getHeaders(true),
    body: formData
  }).then(handleResponse),

  // Deals
  createDealOffer: (body) => fetch(`${API_BASE}/deals/offer`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  }).then(handleResponse),

  respondToDeal: (id, action) => fetch(`${API_BASE}/deals/${id}/respond`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ action })
  }).then(handleResponse),

  getMyDeals: () => fetch(`${API_BASE}/deals/my-deals`, {
    headers: getHeaders()
  }).then(handleResponse),

  getDealById: (id) => fetch(`${API_BASE}/deals/${id}`, {
    headers: getHeaders()
  }).then(handleResponse),

  submitPaymentProof: (id, body) => fetch(`${API_BASE}/deals/${id}/submit-payment`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  }).then(handleResponse),

  cancelDeal: (id) => fetch(`${API_BASE}/deals/${id}/cancel`, {
    method: 'PUT',
    headers: getHeaders()
  }).then(handleResponse),

  // Chat
  getConversations: () => fetch(`${API_BASE}/chat/conversations`, {
    headers: getHeaders()
  }).then(handleResponse),

  getMessages: (conversationId) => fetch(`${API_BASE}/chat/${conversationId}/messages`, {
    headers: getHeaders()
  }).then(handleResponse),
  getChatMessages: (conversationId) => fetch(`${API_BASE}/chat/${conversationId}/messages`, {
    headers: getHeaders()
  }).then(handleResponse),

  sendMessage: (body) => fetch(`${API_BASE}/chat/send`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  }).then(handleResponse),
  sendChatMessage: (body) => fetch(`${API_BASE}/chat/send`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  }).then(handleResponse),
  sendChatInvitationEmail: (body) => fetch(`${API_BASE}/chat/send-invitation-email`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  }).then(handleResponse),

  // Reviews
  createReview: (body) => fetch(`${API_BASE}/reviews`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  }).then(handleResponse),

  getTutorReviews: (tutorId) => fetch(`${API_BASE}/reviews/tutor/${tutorId}`).then(handleResponse),

  // Sessions
  scheduleSession: (body) => fetch(`${API_BASE}/sessions/schedule`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  }).then(handleResponse),

  getMySessions: () => fetch(`${API_BASE}/sessions/my-sessions`, {
    headers: getHeaders()
  }).then(handleResponse),

  getSessionByRoomId: (roomId) => fetch(`${API_BASE}/sessions/room/${roomId}`, {
    headers: getHeaders()
  }).then(handleResponse),

  updateSessionStatus: (id, body) => fetch(`${API_BASE}/sessions/${id}/status`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body)
  }).then(handleResponse),

  // Notifications
  getNotifications: () => fetch(`${API_BASE}/notifications`, {
    headers: getHeaders()
  }).then(handleResponse),

  markNotificationRead: (id) => fetch(`${API_BASE}/notifications/${id}/read`, {
    method: 'PUT',
    headers: getHeaders()
  }).then(handleResponse),

  markAllNotificationsRead: () => fetch(`${API_BASE}/notifications/read-all`, {
    method: 'PUT',
    headers: getHeaders()
  }).then(handleResponse),

  // Admin APIs
  getAdminStats: () => fetch(`${API_BASE}/admin/stats`, {
    headers: getHeaders()
  }).then(handleResponse),

  getTutorQueue: (status = 'pending') => fetch(`${API_BASE}/admin/tutors/queue?status=${status}`, {
    headers: getHeaders()
  }).then(handleResponse),

  approveTutor: (id) => fetch(`${API_BASE}/admin/tutors/${id}/approve`, {
    method: 'PUT',
    headers: getHeaders()
  }).then(handleResponse),

  rejectTutor: (id, reason) => fetch(`${API_BASE}/admin/tutors/${id}/reject`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ reason })
  }).then(handleResponse),

  contactTutor: (id, notes) => fetch(`${API_BASE}/admin/tutors/${id}/contact`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ notes })
  }).then(handleResponse),

  getAdminUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/admin/users?${query}`, {
      headers: getHeaders()
    }).then(handleResponse);
  },

  toggleUserStatus: (id) => fetch(`${API_BASE}/admin/users/${id}/toggle-status`, {
    method: 'PUT',
    headers: getHeaders()
  }).then(handleResponse),

  getAdminDeals: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/admin/deals?${query}`, {
      headers: getHeaders()
    }).then(handleResponse);
  },

  verifyPayment: (id, status = 'verified') => fetch(`${API_BASE}/admin/deals/${id}/verify-payment`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ status })
  }).then(handleResponse),

  restrictDeal: (id, body) => fetch(`${API_BASE}/admin/deals/${id}/restrict`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body)
  }).then(handleResponse),

  getAdminChats: () => fetch(`${API_BASE}/admin/chats`, {
    headers: getHeaders()
  }).then(handleResponse),

  getAdminTranscript: (conversationId) => fetch(`${API_BASE}/admin/chats/${conversationId}/transcript`, {
    headers: getHeaders()
  }).then(handleResponse),

  getAdminReviews: (status = 'all') => fetch(`${API_BASE}/admin/reviews?status=${status}`, {
    headers: getHeaders()
  }).then(handleResponse),

  overrideReview: (id, body) => fetch(`${API_BASE}/admin/reviews/${id}/override`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body)
  }).then(handleResponse),

  deleteReview: (id) => fetch(`${API_BASE}/admin/reviews/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  }).then(handleResponse),

  getSessionLogs: () => fetch(`${API_BASE}/admin/sessions`, {
    headers: getHeaders()
  }).then(handleResponse),

  getAuditLogs: () => fetch(`${API_BASE}/admin/audit-logs`, {
    headers: getHeaders()
  }).then(handleResponse),

  createCategory: (body) => fetch(`${API_BASE}/admin/categories`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  }).then(handleResponse),

  updateCategory: (id, body) => fetch(`${API_BASE}/admin/categories/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body)
  }).then(handleResponse),

  deleteCategory: (id) => fetch(`${API_BASE}/admin/categories/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  }).then(handleResponse),

  createLocation: (body) => fetch(`${API_BASE}/admin/locations`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  }).then(handleResponse),

  updateLocation: (id, body) => fetch(`${API_BASE}/admin/locations/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body)
  }).then(handleResponse),

  deleteLocation: (id) => fetch(`${API_BASE}/admin/locations/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  }).then(handleResponse),

  updateSystemConfig: (body) => fetch(`${API_BASE}/admin/system-config`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body)
  }).then(handleResponse),

  // User Management & Moderation
  getAdminUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/admin/users?${query}`, {
      headers: getHeaders()
    }).then(handleResponse);
  },

  issueUserWarning: (id, body) => fetch(`${API_BASE}/admin/users/${id}/warning`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body)
  }).then(handleResponse),

  updateUserStatus: (id, body) => fetch(`${API_BASE}/admin/users/${id}/status`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body)
  }).then(handleResponse),

  deleteUserAccount: (id) => fetch(`${API_BASE}/admin/users/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  }).then(handleResponse),

  toggleUserStatus: (id) => fetch(`${API_BASE}/admin/users/${id}/toggle-status`, {
    method: 'PUT',
    headers: getHeaders()
  }).then(handleResponse),

  // Safety & Incident Reports
  createReport: (body) => fetch(`${API_BASE}/reports`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  }).then(handleResponse),

  getReports: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/reports?${query}`, {
      headers: getHeaders()
    }).then(handleResponse);
  },

  updateReportStatus: (id, body) => fetch(`${API_BASE}/reports/${id}/status`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body)
  }).then(handleResponse)
};
