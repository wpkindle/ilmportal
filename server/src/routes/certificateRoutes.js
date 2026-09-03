const express = require('express');
const router = express.Router();
const {
  issueCertificate,
  getCertificateById,
  getMyCertificates,
  tutorRequestCertificate,
  tutorGetCertificateRequests,
  adminGetCertificateRequests,
  adminSetCertificatePrice,
  studentSubmitCertificatePayment,
  adminApproveCertificate,
  adminRejectCertificatePayment
} = require('../controllers/certificateController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Student earned & pending certificates
router.get('/student/my-certificates', protect, authorize('student'), getMyCertificates);

// Tutor endpoints
router.post('/request', protect, authorize('tutor'), tutorRequestCertificate);
router.get('/tutor/my-requests', protect, authorize('tutor'), tutorGetCertificateRequests);

// Student submits payment proof
router.post('/:id/submit-payment', protect, authorize('student'), studentSubmitCertificatePayment);

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
