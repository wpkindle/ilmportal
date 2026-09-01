const Certificate = require('../models/Certificate');
const Course = require('../models/Course');
const User = require('../models/User');
const { sendCertificateIssuedEmail } = require('../utils/emailService');

// Helper to generate official Certificate ID
const generateCertId = () => {
  const rand = Math.floor(10000 + Math.random() * 90000);
  const year = new Date().getFullYear();
  return `ILM-CERT-${year}-${rand}`;
};

// @desc    Issue a completion certificate (by Tutor or Admin)
// @route   POST /api/certificates/issue
exports.issueCertificate = async (req, res) => {
  try {
    const { studentId, courseId, grade, totalLessonsCompleted } = req.body;

    if (!studentId || !courseId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both studentId and courseId'
      });
    }

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const course = await Course.findById(courseId).populate('instructor', 'name email');
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Verify instructor ownership if tutor is calling
    if (req.user.role === 'tutor' && course.instructor?._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only issue certificates for courses you author.'
      });
    }

    // Check if certificate already exists
    let existingCert = await Certificate.findOne({
      student: student._id,
      course: course._id
    });

    if (existingCert) {
      return res.status(200).json({
        success: true,
        message: 'Certificate has already been issued for this course.',
        certificate: existingCert
      });
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
      totalLessonsCompleted: totalLessonsCompleted || course.totalLessons || 38,
      verificationCode
    });

    // Send email with downloadable certificate link
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/certificates/${cert.certificateId}`;
    try {
      await sendCertificateIssuedEmail({
        to: student.email,
        studentName: student.name,
        courseTitle: course.title,
        instructorName: cert.instructorName,
        certificateId: cert.certificateId,
        verificationUrl
      });
    } catch (mailErr) {
      console.error('Failed to send certificate email:', mailErr);
    }

    res.status(201).json({
      success: true,
      message: 'Certificate issued successfully and dispatched to student email!',
      certificate: cert,
      verificationUrl
    });
  } catch (error) {
    console.error('Error in issueCertificate:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error issuing certificate'
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

// @desc    Get certificates earned by logged-in student
// @route   GET /api/certificates/student/my-certificates
exports.getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ student: req.user._id })
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

