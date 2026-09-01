const Session = require('../models/Session');
const Deal = require('../models/Deal');
const Notification = require('../models/Notification');
const crypto = require('crypto');

// @desc    Schedule a live session
// @route   POST /api/sessions/schedule
exports.scheduleSession = async (req, res) => {
  try {
    const { dealId, title, scheduledStartTime, scheduledEndTime, mode, sessionNotes } = req.body;

    const deal = await Deal.findById(dealId)
      .populate('student', 'name email')
      .populate('tutor', 'name email');

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    // Check deal active status or trial status
    if (deal.status === 'cancelled' || deal.status === 'restricted') {
      return res.status(400).json({
        success: false,
        message: 'Cannot schedule session for an inactive or restricted deal'
      });
    }

    const roomId = `ilm-${crypto.randomBytes(4).toString('hex')}-${Date.now().toString().slice(-4)}`;

    const session = await Session.create({
      deal: deal._id,
      roomId,
      tutor: deal.tutor._id,
      student: deal.student._id,
      title: title || `${deal.subject} Live Class`,
      mode: mode || deal.mode || 'online',
      scheduledStartTime: new Date(scheduledStartTime),
      scheduledEndTime: new Date(scheduledEndTime),
      sessionNotes: sessionNotes || ''
    });

    // Notify the other party
    const isTutor = req.user.id.toString() === deal.tutor._id.toString();
    const recipient = isTutor ? deal.student._id : deal.tutor._id;
    const schedulerName = isTutor ? deal.tutor.name : deal.student.name;

    await Notification.create({
      recipient,
      sender: req.user.id,
      title: 'New Class Session Scheduled',
      message: `${schedulerName} scheduled a live class for "${deal.subject}" at ${new Date(scheduledStartTime).toLocaleString()}.`,
      type: 'session_reminder',
      link: `/classroom/${roomId}`
    });

    res.status(201).json({
      success: true,
      message: 'Session scheduled successfully!',
      session
    });
  } catch (error) {
    console.error('Error scheduling session:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error scheduling session'
    });
  }
};

// @desc    Get current user's scheduled & past sessions
// @route   GET /api/sessions/my-sessions
exports.getMySessions = async (req, res) => {
  try {
    const filter = req.user.role === 'tutor'
      ? { tutor: req.user.id }
      : { student: req.user.id };

    const sessions = await Session.find(filter)
      .populate('deal', 'subject price mode status')
      .populate('tutor', 'name avatar email phone city')
      .populate('student', 'name avatar email phone city')
      .sort({ scheduledStartTime: 1 });

    res.status(200).json({
      success: true,
      count: sessions.length,
      sessions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error retrieving sessions'
    });
  }
};

// @desc    Get session details by roomId for Live Classroom
// @route   GET /api/sessions/room/:roomId
exports.getSessionByRoomId = async (req, res) => {
  try {
    const session = await Session.findOne({ roomId: req.params.roomId })
      .populate('deal')
      .populate('tutor', 'name avatar email phone')
      .populate('student', 'name avatar email phone');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Classroom session not found'
      });
    }

    // Verify participant authorization
    const isParticipant =
      req.user.role === 'admin' ||
      session.tutor._id.toString() === req.user.id.toString() ||
      session.student._id.toString() === req.user.id.toString();

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to enter this private classroom session'
      });
    }

    res.status(200).json({
      success: true,
      session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching room'
    });
  }
};

// @desc    Update session status (start live, end session, log duration)
// @route   PUT /api/sessions/:id/status
exports.updateSessionStatus = async (req, res) => {
  try {
    const { status, durationMinutes, sessionNotes } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (status) session.status = status;
    if (status === 'live' && !session.actualStartTime) {
      session.actualStartTime = new Date();
    }
    if (status === 'completed') {
      session.actualEndTime = new Date();
      if (session.actualStartTime) {
        const diffMs = session.actualEndTime - session.actualStartTime;
        session.durationMinutes = Math.round(diffMs / 60000);
      } else if (durationMinutes) {
        session.durationMinutes = durationMinutes;
      }
    }
    if (sessionNotes) session.sessionNotes = sessionNotes;

    await session.save();

    res.status(200).json({
      success: true,
      message: 'Session updated successfully',
      session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating session'
    });
  }
};
