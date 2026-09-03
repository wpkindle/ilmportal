const express = require('express');
const router = express.Router();
const {
  createDealOffer,
  respondToDealOffer,
  getMyDeals,
  getDealById,
  submitPaymentProof,
  cancelDeal,
  respondToTrialContinuation,
  adminClearTutorFee,
  adminRestrictTutorClasses,
  setPlatformFee
} = require('../controllers/dealController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/offer', authorize('tutor'), createDealOffer);
router.post('/:id/respond', authorize('student'), respondToDealOffer);
router.post('/:id/trial-decision', authorize('student'), respondToTrialContinuation);
router.post('/:id/set-platform-fee', authorize('admin'), setPlatformFee);
router.post('/:id/clear-fee', authorize('admin'), adminClearTutorFee);
router.post('/:id/restrict-classes', authorize('admin'), adminRestrictTutorClasses);
router.get('/my-deals', getMyDeals);
router.get('/:id', getDealById);
router.post('/:id/submit-payment', authorize('tutor', 'student'), submitPaymentProof);
router.put('/:id/cancel', cancelDeal);

module.exports = router;
