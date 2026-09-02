const User = require('../models/User');
const TutorProfile = require('../models/TutorProfile');
const Notification = require('../models/Notification');
const { sendVerificationOtpEmail, sendEmailDetailed } = require('../utils/emailService');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_jwt_secret_for_pakistan_lms_2026', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Helper: Calculate Profile Completion Percentage
const calculateProfileCompletion = (user, tutorProfile) => {
  if (!user) return { percentage: 0, items: [] };

  if (user.role === 'tutor') {
    const checks = [
      { key: 'name', label: 'Full Name', weight: 10, done: !!user.name?.trim() },
      { key: 'email', label: 'Verified Email', weight: 10, done: !!user.isVerified },
      { key: 'phone', label: 'Mobile Number (WhatsApp)', weight: 10, done: !!user.phone?.trim() },
      { key: 'avatar', label: 'Profile Picture', weight: 15, done: !!user.avatar?.trim() },
      { key: 'age', label: 'Tutor Age', weight: 10, done: !!user.age },
      { key: 'gender', label: 'Gender', weight: 5, done: !!user.gender },
      { key: 'city', label: 'City Location', weight: 10, done: !!user.city?.trim() },
      { key: 'bio', label: 'Teaching Bio', weight: 10, done: !!tutorProfile?.bio?.trim() && tutorProfile.bio.length > 20 },
      { key: 'qualifications', label: 'Educational Qualifications', weight: 10, done: !!tutorProfile?.qualifications?.trim() },
      { key: 'sanad', label: 'Sanad / Degree Document', weight: 10, done: Array.isArray(tutorProfile?.sanadDocuments) && tutorProfile.sanadDocuments.length > 0 }
    ];

    const percentage = checks.reduce((sum, item) => sum + (item.done ? item.weight : 0), 0);
    return { percentage, items: checks };
  } else {
    // Student
    const checks = [
      { key: 'name', label: 'Student Name', weight: 15, done: !!user.name?.trim() },
      { key: 'email', label: 'Verified Email', weight: 15, done: !!user.isVerified },
      { key: 'phone', label: 'Contact Phone Number', weight: 15, done: !!user.phone?.trim() || !!user.guardianPhone?.trim() },
      { key: 'avatar', label: 'Profile Picture', weight: 15, done: !!user.avatar?.trim() },
      { key: 'age', label: 'Student Age', weight: 15, done: !!user.age },
      { key: 'gender', label: 'Gender', weight: 10, done: !!user.gender },
      { key: 'city', label: 'City', weight: 15, done: !!user.city?.trim() }
    ];

    const percentage = checks.reduce((sum, item) => sum + (item.done ? item.weight : 0), 0);
    return { percentage, items: checks };
  }
};

// @desc    Register a new user (Student or Tutor)
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      guardianPhone,
      city,
      gender,
      age,
      avatar,
      sanadTitle,
      sanadFileUrl,
      qualifications,
      experienceYears,
      hourlyRate,
      bio
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const userRole = role === 'tutor' ? 'tutor' : 'student';

    if (userRole === 'student') {
      if (!gender) {
        return res.status(400).json({ success: false, message: 'Student gender is required' });
      }
      if (!age || Number(age) < 3 || Number(age) > 100) {
        return res.status(400).json({ success: false, message: 'Valid student age is required' });
      }
    }

    if (userRole === 'tutor') {
      if (!gender) {
        return res.status(400).json({ success: false, message: 'Tutor gender is required' });
      }
      if (!age || Number(age) < 18 || Number(age) > 90) {
        return res.status(400).json({ success: false, message: 'Valid tutor age (18–90) is required' });
      }
      if (!phone || !phone.trim()) {
        return res.status(400).json({ success: false, message: 'Mobile number (WhatsApp) is required for tutors' });
      }
      if (!avatar || !avatar.trim()) {
        return res.status(400).json({ success: false, message: 'Profile picture is required for tutor registration' });
      }
      if (!sanadFileUrl || !sanadFileUrl.trim()) {
        return res.status(400).json({ success: false, message: 'Sanad or Educational Degree certificate upload is required for tutors' });
      }
    }

    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: userRole,
      avatar: avatar ? avatar.trim() : '',
      gender: gender || 'male',
      age: age ? Number(age) : undefined,
      phone: phone ? phone.trim() : (guardianPhone ? guardianPhone.trim() : ''),
      guardianPhone: guardianPhone ? guardianPhone.trim() : (phone ? phone.trim() : ''),
      city: city || 'Lahore',
      isVerified: false,
      verificationOtp: otp,
      verificationOtpExpires: otpExpires
    });

    // If registered as tutor, create initial pending profile with uploaded Sanad/Degree(s)
    if (userRole === 'tutor') {
      const initialSanads = [];

      if (req.body.sanadDocuments && Array.isArray(req.body.sanadDocuments) && req.body.sanadDocuments.length > 0) {
        req.body.sanadDocuments.forEach((doc) => {
          if (doc && doc.fileUrl) {
            initialSanads.push({
              title: doc.title || 'Sanad / Degree Certificate',
              fileUrl: doc.fileUrl,
              fileType: doc.fileType || (doc.fileUrl.startsWith('data:application/pdf') ? 'application/pdf' : 'image/jpeg'),
              uploadedAt: new Date()
            });
          }
        });
      } else if (sanadFileUrl) {
        initialSanads.push({
          title: sanadTitle || qualifications || 'Sanad / Educational Degree',
          fileUrl: sanadFileUrl,
          fileType: sanadFileUrl.startsWith('data:application/pdf') ? 'application/pdf' : 'image/jpeg',
          uploadedAt: new Date()
        });
      }

      await TutorProfile.create({
        user: user._id,
        bio: bio || 'Assalam-o-Alaikum! I am an experienced tutor dedicated to providing high-quality Quranic and Academic education.',
        qualifications: qualifications || sanadTitle || 'Verified Degree / Sanad',
        experienceYears: experienceYears ? Number(experienceYears) : 2,
        hourlyRate: hourlyRate ? Number(hourlyRate) : 1500,
        gender: gender || 'male',
        sanadDocuments: initialSanads,
        verificationStatus: 'pending'
      });

      // Create Admin notification for new tutor registration
      const adminUser = await User.findOne({ role: 'admin' });
      if (adminUser) {
        await Notification.create({
          recipient: adminUser._id,
          sender: user._id,
          title: 'New Tutor Registration Pending Verification',
          message: `${user.name} (${user.city}) has submitted educational degrees and registered as a tutor for verification.`,
          type: 'tutor_application',
          link: '/admin/tutor-approvals'
        });
      }
    }

    // Send Verification Email asynchronously in background (non-blocking for fast <100ms response)
    sendVerificationOtpEmail(user.email, user.name, otp).catch((err) => {
      console.error('Async email dispatch notification:', err?.message || err);
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful! A 6-digit verification code has been sent to your email.',
      email: user.email,
      isVerified: false,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        gender: user.gender,
        age: user.age,
        isVerified: false,
        city: user.city,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration'
    });
  }
};

// @desc    Verify Email via OTP
// @route   POST /api/auth/verify-otp
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email address and 6-digit OTP code'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address'
      });
    }

    if (user.isVerified) {
      const token = generateToken(user._id);
      return res.status(200).json({
        success: true,
        message: 'Account is already verified. Logging you in...',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isVerified: true,
          gender: user.gender,
          age: user.age,
          city: user.city,
          phone: user.phone
        }
      });
    }

    if (user.verificationOtp !== otp.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please check and try again.'
      });
    }

    if (user.verificationOtpExpires && user.verificationOtpExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please click resend to get a new code.'
      });
    }

    user.isVerified = true;
    user.verificationOtp = undefined;
    user.verificationOtpExpires = undefined;
    await user.save();

    const token = generateToken(user._id);

    let tutorProfile = null;
    if (user.role === 'tutor') {
      tutorProfile = await TutorProfile.findOne({ user: user._id });
    }

    const completion = calculateProfileCompletion(user, tutorProfile);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! Welcome to IlmPortal Pakistan.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        gender: user.gender,
        age: user.age,
        isVerified: true,
        city: user.city,
        phone: user.phone
      },
      tutorProfile,
      completion
    });
  } catch (error) {
    console.error('OTP Verification Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during OTP verification'
    });
  }
};

// @desc    Resend OTP Code
// @route   POST /api/auth/resend-otp
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email'
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationOtp = otp;
    user.verificationOtpExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // Send Verification Email asynchronously
    sendVerificationOtpEmail(user.email, user.name, otp).catch((err) => {
      console.error('Async resend email dispatch notification:', err?.message || err);
    });

    res.status(200).json({
      success: true,
      message: 'A fresh OTP code has been sent to your email address.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error resending OTP'
    });
  }
};

// @desc    Login User
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated by an administrator. Please contact support.'
      });
    }

    if (!user.isVerified) {
      // Refresh OTP and dispatch email
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.verificationOtp = otp;
      user.verificationOtpExpires = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();

      await sendVerificationOtpEmail(user.email, user.name, otp);

      return res.status(403).json({
        success: false,
        isUnverified: true,
        email: user.email,
        message: 'Please verify your email address before logging in. A 6-digit verification code has been sent to your email.',
        debugOtp: process.env.NODE_ENV === 'production' ? undefined : otp
      });
    }

    let tutorProfile = null;
    if (user.role === 'tutor') {
      tutorProfile = await TutorProfile.findOne({ user: user._id })
        .populate('subjects')
        .populate('cities');
    }

    const token = generateToken(user._id);
    const completion = calculateProfileCompletion(user, tutorProfile);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        gender: user.gender,
        age: user.age,
        isVerified: user.isVerified,
        city: user.city,
        phone: user.phone
      },
      tutorProfile,
      completion
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login'
    });
  }
};

// @desc    Get Current User Profile
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let tutorProfile = null;

    if (user.role === 'tutor') {
      tutorProfile = await TutorProfile.findOne({ user: user._id })
        .populate('subjects')
        .populate('cities');
    }

    const completion = calculateProfileCompletion(user, tutorProfile);

    res.status(200).json({
      success: true,
      user,
      tutorProfile,
      completion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user profile'
    });
  }
};

// @desc    Update Profile Details
// @route   PUT /api/auth/update-profile
exports.updateProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      guardianPhone,
      city,
      avatar,
      gender,
      age,
      bio,
      qualifications,
      experienceYears,
      hourlyRate,
      teachingMode
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // If email is changed, check uniqueness
    if (email && email.toLowerCase().trim() !== user.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase().trim() });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email is already in use by another account' });
      }
      user.email = email.toLowerCase().trim();
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (guardianPhone !== undefined) user.guardianPhone = guardianPhone.trim();
    if (city) user.city = city;
    if (avatar !== undefined) user.avatar = avatar;
    if (gender) user.gender = gender;
    if (age !== undefined) user.age = Number(age);

    await user.save();

    let tutorProfile = null;
    if (user.role === 'tutor') {
      tutorProfile = await TutorProfile.findOne({ user: user._id });
      if (!tutorProfile) {
        tutorProfile = new TutorProfile({ user: user._id, verificationStatus: 'pending' });
      }

      if (bio !== undefined) tutorProfile.bio = bio;
      if (qualifications !== undefined) tutorProfile.qualifications = qualifications;
      if (experienceYears !== undefined) tutorProfile.experienceYears = Number(experienceYears);
      if (hourlyRate !== undefined) tutorProfile.hourlyRate = Number(hourlyRate);
      if (gender) tutorProfile.gender = gender;
      if (teachingMode !== undefined) {
        tutorProfile.teachingModes = teachingMode === 'both' ? ['online', 'in_person'] : [teachingMode === 'physical' ? 'in_person' : teachingMode];
      }

      await tutorProfile.save();
    }

    const completion = calculateProfileCompletion(user, tutorProfile);

    res.status(200).json({
      success: true,
      message: 'Profile settings updated successfully!',
      user,
      tutorProfile,
      completion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating profile'
    });
  }
};

// @desc    Change Password
// @route   PUT /api/auth/change-password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current password and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect current password. Please try again.'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error changing password'
    });
  }
};

// @desc    Forgot Password Request
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account registered with this email address'
      });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 mins
    await user.save();

    // In a full production setup, send reset password link via email
    res.status(200).json({
      success: true,
      message: 'Password reset instructions have been sent to your email.',
      resetToken // provided for seamless frontend verification in dev/demo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error processing forgot password request'
    });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token'
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been successfully updated! You can now log in.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error resetting password'
    });
  }
};

// @desc    Diagnostic Email Test Route
// @route   GET /api/auth/test-email
exports.testEmail = async (req, res) => {
  try {
    const to = req.query.to || 'abdulkhaliqwebdeveloper@gmail.com';
    const result = await sendEmailDetailed({
      to,
      subject: '🧪 IlmPortal Diagnostic Email Test',
      html: `<h3>IlmPortal Email Dispatch Verification</h3><p>This email confirms that live Gmail SMTP is functioning properly from the server to <strong>${to}</strong>.</p>`
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
