const express = require('express');
const router = express.Router();
const {
  issueCertificate,
  getCertificateById,
  getMyCertificates
} = require('../controllers/certificateController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Student earned certificates
router.get('/student/my-certificates', protect, authorize('student'), getMyCertificates);

// Issue certificate (Tutor or Admin)
router.post('/issue', protect, authorize('tutor', 'admin'), issueCertificate);

// Public verification endpoint
router.get('/:certificateId', getCertificateById);

module.exports = router;

