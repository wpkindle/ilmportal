const express = require('express');
const router = express.Router();
const {
  scheduleSession,
  getMySessions,
  getSessionByRoomId,
  updateSessionStatus
} = require('../controllers/sessionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/schedule', scheduleSession);
router.get('/my-sessions', getMySessions);
router.get('/room/:roomId', getSessionByRoomId);
router.put('/:id/status', updateSessionStatus);

module.exports = router;
