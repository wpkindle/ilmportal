const Certificate = require('../models/Certificate');
const Course = require('../models/Course');
const Deal = require('../models/Deal');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendCertificateIssuedEmail } = require('../utils/emailService');

// Helper to generate official Certificate ID
const generateCertId = () => {
  const rand = Math.floor(10000 + Math.random() * 90000);
  const year = new Date().getFullYear();
  return `ILM-CERT-${year}-${rand}`;
};

// @desc    Tutor requests/recommends a certificate for a student
// @route   POST /api/certificates/request
exports.tutorRequestCertificate = async (req, res) => {
  try {
    const { studentId, courseId, dealId, subject, notes, grade } = req.body;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required'
      });
    }

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    let courseTitle = subject || 'Verified Quran & Academic Course';
    let courseObj = null;
    if (courseId) {
      courseObj = await Course.findById(courseId);
      if (courseObj) courseTitle = courseObj.title;
    }

    const certificateId = generateCertId();
    const verificationCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    const cert = await Certificate.create({
      certificateId,
      student: student._id,
      studentName: student.name,
      studentEmail: student.email,
      course: courseObj ? courseObj._id : undefined,
      courseTitle,
      deal: dealId || undefined,
      instructor: req.user.id,
      instructorName: req.user.name,
      completionGrade: grade || 'Distinction (Sanad Verified)',
      verificationCode,
      tutorNotes: notes || '',
      status: 'pending_admin_pricing',
      paymentStatus: 'unpaid',
      price: 0
    });

    // Notify all admins that tutor requested a certificate
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        recipient: admin._id,
        sender: req.user.id,
        title: 'New Certificate Request: Price Assignment Required',
        message: `Tutor ${req.user.name} recommended a completion certificate for student ${student.name} (${courseTitle}). Please assign a fee in Admin Center.`,
        type: 'deal_offer',
        link: `/admin/certificates`
      });
    }

    // Real-time socket notification to admin
    const io = req.app.get('io');
    if (io) {
      admins.forEach(admin => {
        io.to(`user_${admin._id}`).emit('notification-alert', {
          title: 'New Certificate Request',
          message: `Tutor ${req.user.name} requested a certificate for ${student.name}.`,
          type: 'certificate_request'
        });
      });
    }

    res.status(201).json({
      success: true,
      message: 'Certificate recommendation submitted! Admin will assign the invoice fee shortly.',
      certificate: cert
    });
  } catch (error) {
    console.error('Error in tutorRequestCertificate:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error requesting certificate'
    });
  }
};

// @desc    Admin sets price on certificate and sends invoice to student
// @route   PUT /api/certificates/:id/set-price
exports.adminSetCertificatePrice = async (req, res) => {
  try {
    const { price, adminNotes } = req.body;
    const cert = await Certificate.findById(req.params.id)
      .populate('student', 'name email')
      .populate('instructor', 'name email');

    if (!cert) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    if (!price || Number(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid price in PKR'
      });
    }

    cert.price = Number(price);
    cert.adminNotes = adminNotes || '';
    cert.status = 'awaiting_payment';
    cert.paymentStatus = 'unpaid';
    await cert.save();

    // Notify Student
    await Notification.create({
      recipient: cert.student._id,
      sender: req.user.id,
      title: 'Certificate Issued - Payment Required',
      message: `Your certificate for ${cert.courseTitle} has been processed! Fee: PKR ${cert.price}. Please submit payment proof to unlock PDF download.`,
      type: 'deal_offer',
      link: `/student/certificates`
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${cert.student._id}`).emit('notification-alert', {
        title: 'Certificate Payment Ready',
        message: `Please complete payment of PKR ${cert.price} to receive your verified certificate.`,
        type: 'certificate_payment'
      });
    }

    res.status(200).json({
      success: true,
      message: `Certificate fee set to PKR ${cert.price}. Student has been invoiced.`,
      certificate: cert
    });
  } catch (error) {
    console.error('Error in adminSetCertificatePrice:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error setting certificate price'
    });
  }
};

// @desc    Student submits payment proof for certificate
// @route   POST /api/certificates/:id/submit-payment
exports.studentSubmitCertificatePayment = async (req, res) => {
  try {
    const { paymentMethod, paymentProofReference, paymentProofNotes, paymentProofReceipt } = req.body;
    const cert = await Certificate.findById(req.params.id)
      .populate('student', 'name email')
      .populate('instructor', 'name email');

    if (!cert) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    if (cert.student._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the enrolled student can submit payment proof.'
      });
    }

    if (!paymentProofReference && !paymentProofReceipt) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a transaction ID (Trx ID) or payment screenshot receipt.'
      });
    }

    cert.paymentMethod = paymentMethod || 'meezan_bank';
    cert.paymentProofReference = paymentProofReference || '';
    cert.paymentProofReceipt = paymentProofReceipt || '';
    cert.paymentProofNotes = paymentProofNotes || '';
    cert.paymentSubmittedAt = new Date();
    cert.paymentStatus = 'submitted_proof';
    cert.status = 'payment_submitted';
    await cert.save();

    // Notify Admin to review
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        recipient: admin._id,
        sender: req.user.id,
        title: 'Certificate Payment Proof Submitted',
        message: `Student ${cert.student.name} submitted payment proof for ${cert.courseTitle} (PKR ${cert.price}). Please review and approve.`,
        type: 'deal_offer',
        link: `/admin/certificates`
      });
    }

    const io = req.app.get('io');
    if (io) {
      admins.forEach(admin => {
        io.to(`user_${admin._id}`).emit('notification-alert', {
          title: 'Certificate Proof Submitted',
          message: `${cert.student.name} submitted payment proof for certificate ${cert.certificateId}.`,
          type: 'proof_submitted'
        });
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment proof submitted successfully! Admin will verify and unlock your certificate shortly.',
      certificate: cert
    });
  } catch (error) {
    console.error('Error in studentSubmitCertificatePayment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error submitting payment proof'
    });
  }
};

// @desc    Admin approves payment proof and releases certificate
// @route   PUT /api/certificates/:id/approve
exports.adminApproveCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id)
      .populate('student', 'name email')
      .populate('instructor', 'name email');

    if (!cert) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    cert.paymentStatus = 'verified';
    cert.status = 'issued';
    cert.adminApprovedAt = new Date();
    cert.adminApprovedBy = req.user.id;
    cert.issueDate = new Date();
    await cert.save();

    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/certificates/${cert.certificateId}`;

    // Send email with downloadable certificate link
    try {
      await sendCertificateIssuedEmail({
        to: cert.student.email,
        studentName: cert.student.name,
        courseTitle: cert.courseTitle,
        instructorName: cert.instructorName,
        certificateId: cert.certificateId,
        verificationUrl
      });
    } catch (mailErr) {
      console.error('Failed to send certificate email:', mailErr);
    }

    // In-app notification to Student
    await Notification.create({
      recipient: cert.student._id,
      sender: req.user.id,
      title: '🎓 Certificate Verified & Released!',
      message: `Your payment was verified. You can now view and download your official PDF completion certificate for ${cert.courseTitle}!`,
      type: 'deal_accepted',
      link: `/certificates/${cert.certificateId}`
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${cert.student._id}`).emit('notification-alert', {
        title: 'Certificate Ready for Download!',
        message: `Your verified certificate for ${cert.courseTitle} is now unlocked.`,
        type: 'certificate_released',
        link: `/certificates/${cert.certificateId}`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Certificate verified and released! Student can now download PDF.',
      certificate: cert,
      verificationUrl
    });
  } catch (error) {
    console.error('Error in adminApproveCertificate:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error approving certificate'
    });
  }
};

// @desc    Admin rejects payment proof
// @route   PUT /api/certificates/:id/reject-proof
exports.adminRejectCertificatePayment = async (req, res) => {
  try {
    const { reason } = req.body;
    const cert = await Certificate.findById(req.params.id)
      .populate('student', 'name email');

    if (!cert) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    cert.paymentStatus = 'rejected';
    cert.status = 'awaiting_payment';
    cert.adminNotes = reason || 'Payment proof could not be verified. Please re-check Trx ID or screenshot.';
    await cert.save();

    await Notification.create({
      recipient: cert.student._id,
      sender: req.user.id,
      title: 'Certificate Payment Proof Rejected',
      message: `Your payment proof for ${cert.courseTitle} was declined: "${cert.adminNotes}". Please resubmit valid proof.`,
      type: 'account_warning',
      link: `/student/certificates`
    });

    res.status(200).json({
      success: true,
      message: 'Payment proof rejected. Student has been notified to resubmit.',
      certificate: cert
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error rejecting proof'
    });
  }
};

// @desc    Get all certificate requests for Admin Center
// @route   GET /api/certificates/admin/requests
exports.adminGetCertificateRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status && status !== 'all' ? { status } : {};

    const certificates = await Certificate.find(query)
      .populate('student', 'name email avatar phone city')
      .populate('instructor', 'name email avatar phone city')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: certificates.length,
      certificates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching certificate requests'
    });
  }
};

// @desc    Get certificate requests initiated by the logged-in tutor
// @route   GET /api/certificates/tutor/my-requests
exports.tutorGetCertificateRequests = async (req, res) => {
  try {
    const certificates = await Certificate.find({ instructor: req.user.id })
      .populate('student', 'name email avatar city')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: certificates.length,
      certificates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching tutor certificate requests'
    });
  }
};

// @desc    Verify and view certificate by certificateId (Public)
// @route   GET /api/certificates/:certificateId
exports.getCertificateById = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const cert = await Certificate.findOne({ certificateId })
      .populate('student', 'name email avatar city')
      .populate('instructor', 'name avatar city isVerified')
      .populate('course', 'title subtitle category sessionDuration');

    if (!cert) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found or invalid certificate ID'
      });
    }

    res.status(200).json({
      success: true,
      certificate: cert
    });
  } catch (error) {
    console.error('Error in getCertificateById:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving certificate'
    });
  }
};

// @desc    Get certificates earned by logged-in student (including payment states)
// @route   GET /api/certificates/student/my-certificates
exports.getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ student: req.user._id })
      .populate('instructor', 'name email avatar city')
      .populate('course', 'title subtitle thumbnail')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: certificates.length,
      certificates
    });
  } catch (error) {
    console.error('Error in getMyCertificates:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving your certificates'
    });
  }
};

// @desc    Legacy direct issue (kept for backwards compatibility)
// @route   POST /api/certificates/issue
exports.issueCertificate = async (req, res) => {
  try {
    const { studentId, courseId, grade, totalLessonsCompleted } = req.body;
    const student = await User.findById(studentId);
    const course = await Course.findById(courseId).populate('instructor', 'name email');

    if (!student || !course) {
      return res.status(404).json({ success: false, message: 'Student or course not found' });
    }

    const certificateId = generateCertId();
    const verificationCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    const cert = await Certificate.create({
      certificateId,
      student: student._id,
      studentName: student.name,
      studentEmail: student.email,
      course: course._id,
      courseTitle: course.title,
      instructor: course.instructor?._id || req.user._id,
      instructorName: course.instructor?.name || req.user.name,
      completionGrade: grade || 'Distinction (Sanad Verified)',
      totalLessonsCompleted: totalLessonsCompleted || 38,
      verificationCode,
      status: 'issued',
      paymentStatus: 'verified'
    });

    res.status(201).json({ success: true, certificate: cert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
