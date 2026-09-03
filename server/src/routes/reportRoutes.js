const express = require('express');
const router = express.Router();
const {
  createReport,
  getReports,
  updateReportStatus,
  getMyReports
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/', createReport);
router.get('/my-reports', getMyReports);
router.get('/', authorize('admin'), getReports);
router.put('/:id/status', authorize('admin'), updateReportStatus);

module.exports = router;

