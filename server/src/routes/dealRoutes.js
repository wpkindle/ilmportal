const express = require('express');
const router = express.Router();
const multer = require('multer');
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
  setPlatformFee,
  completeDeal
} = require('../controllers/dealController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Memory storage multer for payment proof screenshot (works on Render ephemeral filesystem)
const proofUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for payment proof'), false);
    }
  }
});

router.use(protect);

router.post('/offer', authorize('tutor'), createDealOffer);
router.post('/:id/respond', authorize('student'), respondToDealOffer);
router.post('/:id/trial-decision', authorize('student'), respondToTrialContinuation);
router.post('/:id/set-platform-fee', authorize('admin'), setPlatformFee);
router.post('/:id/clear-fee', authorize('admin'), adminClearTutorFee);
router.post('/:id/restrict-classes', authorize('admin'), adminRestrictTutorClasses);
router.get('/my-deals', getMyDeals);
router.get('/:id', getDealById);
router.post('/:id/submit-payment', authorize('tutor', 'student'), proofUpload.single('proofImage'), submitPaymentProof);
router.put('/:id/cancel', cancelDeal);
router.put('/:id/complete', authorize('tutor', 'admin'), completeDeal);
router.post('/:id/complete', authorize('tutor', 'admin'), completeDeal);

module.exports = router;
