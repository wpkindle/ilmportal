const express = require('express');
const router = express.Router();
const {
  createPaymentRequest,
  getPaymentRequestsByDeal,
  getPaymentRequestById,
  submitPaymentProof,
  clearPaymentRequest,
  cancelPaymentRequest
} = require('../controllers/paymentRequestController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const multer = require('multer');

// Memory storage multer for tuition payment proof screenshot
const proofUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for payment proof'), false);
    }
  }
});

router.post('/', protect, authorize('tutor', 'admin'), createPaymentRequest);
router.get('/deal/:dealId', protect, getPaymentRequestsByDeal);
router.get('/:id', protect, getPaymentRequestById);
router.post('/:id/proof', protect, proofUpload.single('proofImage'), submitPaymentProof);
router.post('/:id/clear', protect, authorize('tutor', 'admin'), clearPaymentRequest);
router.post('/:id/cancel', protect, authorize('tutor', 'admin'), cancelPaymentRequest);

module.exports = router;

