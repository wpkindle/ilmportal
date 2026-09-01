const express = require('express');
const router = express.Router();
const {
  createDealOffer,
  respondToDealOffer,
  getMyDeals,
  getDealById,
  submitPaymentProof,
  cancelDeal
} = require('../controllers/dealController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/offer', authorize('tutor'), createDealOffer);
router.post('/:id/respond', authorize('student'), respondToDealOffer);
router.get('/my-deals', getMyDeals);
router.get('/:id', getDealById);
router.post('/:id/submit-payment', authorize('student'), submitPaymentProof);
router.put('/:id/cancel', cancelDeal);

module.exports = router;
