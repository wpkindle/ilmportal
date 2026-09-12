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

router.post('/', protect, authorize('tutor', 'admin'), createPaymentRequest);
router.get('/deal/:dealId', protect, getPaymentRequestsByDeal);
router.get('/:id', protect, getPaymentRequestById);
router.post('/:id/proof', protect, submitPaymentProof);
router.post('/:id/clear', protect, authorize('tutor', 'admin'), clearPaymentRequest);
router.post('/:id/cancel', protect, authorize('tutor', 'admin'), cancelPaymentRequest);

module.exports = router;

