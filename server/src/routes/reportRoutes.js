const express = require('express');
const router = express.Router();
const {
  createReport,
  getReports,
  updateReportStatus
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/', createReport);
router.get('/', authorize('admin'), getReports);
router.put('/:id/status', authorize('admin'), updateReportStatus);

module.exports = router;

