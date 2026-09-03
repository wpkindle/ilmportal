const express = require('express');
const router = express.Router();
const {
  issueCertificate,
  getCertificateById,
  getMyCertificates,
  studentRequestCertificate,
  tutorEvaluateCertificate,
  tutorGetCertificateRequests,
  adminGetCertificateRequests,
  adminSetCertificatePrice,
  studentSubmitCertificatePayment,
  adminApproveCertificate,
  adminRejectCertificatePayment
} = require('../controllers/certificateController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Student requests certificate & views certificates
router.get('/student/my-certificates', protect, authorize('student'), getMyCertificates);
router.post('/request', protect, authorize('student'), studentRequestCertificate);
router.post('/:id/submit-payment', protect, authorize('student'), studentSubmitCertificatePayment);

// Tutor endpoints (review requests & evaluate marks/grade)
router.get('/tutor/my-requests', protect, authorize('tutor'), tutorGetCertificateRequests);
router.put('/:id/tutor-evaluate', protect, authorize('tutor'), tutorEvaluateCertificate);

// Admin endpoints
router.get('/admin/requests', protect, authorize('admin'), adminGetCertificateRequests);
router.put('/:id/set-price', protect, authorize('admin'), adminSetCertificatePrice);
router.put('/:id/approve', protect, authorize('admin'), adminApproveCertificate);
router.put('/:id/reject-proof', protect, authorize('admin'), adminRejectCertificatePayment);

// Legacy direct issue (Tutor or Admin)
router.post('/issue', protect, authorize('tutor', 'admin'), issueCertificate);

// Public verification endpoint
router.get('/:certificateId', getCertificateById);

module.exports = router;
