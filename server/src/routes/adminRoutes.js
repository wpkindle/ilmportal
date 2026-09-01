const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getTutorApprovalQueue,
  approveTutor,
  rejectTutor,
  contactTutor,
  getAllUsers,
  toggleUserStatus,
  getAllDeals,
  verifyDealPayment,
  restrictDealAccess,
  getAllConversations,
  getConversationTranscript,
  getAllReviews,
  overrideReview,
  deleteReview,
  getSessionLogs,
  getAuditLogs,
  createCategory,
  updateCategory,
  deleteCategory,
  createLocation,
  updateLocation,
  deleteLocation,
  updateSystemConfig
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Protect all admin routes
router.use(protect);
router.use(authorize('admin'));

// Analytics
router.get('/stats', getDashboardStats);

// Tutor Approval Queue
router.get('/tutors/queue', getTutorApprovalQueue);
router.put('/tutors/:id/approve', approveTutor);
router.put('/tutors/:id/reject', rejectTutor);
router.put('/tutors/:id/contact', contactTutor);

// User Management
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-status', toggleUserStatus);

// Deals & Payments
router.get('/deals', getAllDeals);
router.put('/deals/:id/verify-payment', verifyDealPayment);
router.put('/deals/:id/restrict', restrictDealAccess);

// Chat Oversight
router.get('/chats', getAllConversations);
router.get('/chats/:conversationId/transcript', getConversationTranscript);

// Reviews Moderation & Override
router.get('/reviews', getAllReviews);
router.put('/reviews/:id/override', overrideReview);
router.delete('/reviews/:id', deleteReview);

// Session Logs & Audit Logs
router.get('/sessions', getSessionLogs);
router.get('/audit-logs', getAuditLogs);

// CMS Categories
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// CMS Locations
router.post('/locations', createLocation);
router.put('/locations/:id', updateLocation);
router.delete('/locations/:id', deleteLocation);

// System Config
router.put('/system-config', updateSystemConfig);

module.exports = router;
