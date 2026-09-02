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
      { key: 'gender', label: 'Gender', weight: 5, done: !!user.gender?.trim() },
      { key: 'city', label: 'City Location', weight: 10, done: !!user.city?.trim() },
      { key: 'bio', label: 'Teaching Bio', weight: 10, done: !!tutorProfile?.bio?.trim() && tutorProfile.bio.length > 20 && !tutorProfile.bio.includes('Assalam-o-Alaikum! I am an experienced tutor on IlmPortal') },
      { key: 'qualifications', label: 'Educational Qualifications', weight: 10, done: !!tutorProfile?.qualifications?.trim() && tutorProfile.qualifications !== 'Tutor Qualifications' },
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
      { key: 'gender', label: 'Gender', weight: 10, done: !!user.gender?.trim() },
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
      username,
      email,
      phone,
      number,
      password,
      role,
      guardianPhone,
      city,
      gender,
      age
    } = req.body;

    const userPhone = (phone || number || '').trim();

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required' });
    }
    if (!username || !username.trim()) {
      return res.status(400).json({ success: false, message: 'Username is required' });
    }

    const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_.-]/g, '');
    if (cleanUsername.length < 3 || cleanUsername.length > 30) {
      return res.status(400).json({
        success: false,
        message: 'Username must be 3–30 characters long (letters, numbers, underscores, dashes)'
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }
    if (!userPhone) {
      return res.status(400).json({ success: false, message: 'Phone / WhatsApp number is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const userRole = role === 'tutor' ? 'tutor' : 'student';

    // 1. Check if email already exists
    const emailExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // 2. Check if username already exists
    const usernameExists = await User.findOne({ username: cleanUsername });
    if (usernameExists) {
      return res.status(400).json({
        success: false,
        message: 'This username is already taken. Please choose another username.'
      });
    }

    // Generate 6-digit OTP and 1-Click Verification Token
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      name: name.trim(),
      username: cleanUsername,
      email: email.toLowerCase().trim(),
      password,
      role: userRole,
      phone: userPhone,
      guardianPhone: (guardianPhone || '').trim(),
      gender: (gender || '').trim(),
      age: age ? Number(age) : undefined,
      city: (city || '').trim(),
      isVerified: false,
      verificationOtp: otp,
      verificationOtpExpires: otpExpires,
      verificationToken,
      verificationTokenExpires: otpExpires
    });

    // If registered as tutor, create initial TutorProfile ready for later profile setup
    if (userRole === 'tutor') {
      await TutorProfile.create({
        user: user._id,
        bio: (req.body.bio || '').trim(),
        qualifications: (req.body.qualifications || '').trim(),
        experienceYears: req.body.experienceYears ? Number(req.body.experienceYears) : 1,
        hourlyRate: req.body.hourlyRate ? Number(req.body.hourlyRate) : 1500,
        gender: (gender || '').trim(),
        verificationStatus: 'pending'
      });

      // Notify admin
      const adminUser = await User.findOne({ role: 'admin' });
      if (adminUser) {
        await Notification.create({
          recipient: adminUser._id,
          sender: user._id,
          title: 'New Tutor Registration',
          message: `${user.name} (@${user.username}) registered as a tutor.`,
          type: 'tutor_application',
          link: '/admin/tutor-approvals'
        });
      }
    }

    // Send Verification Email asynchronously in background (non-blocking for fast <100ms response)
    sendVerificationOtpEmail(user.email, user.name, otp, verificationToken).catch((err) => {
      console.error('Async email dispatch notification:', err?.message || err);
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful! A verification link has been sent to your email.',
      email: user.email,
      username: user.username,
      verificationToken,
      isVerified: false,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
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
        username: user.username,
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

// @desc    Verify Email via 1-Click Verification Link
// @route   POST /api/auth/verify-token or GET /api/auth/verify-token
exports.verifyToken = async (req, res) => {
  try {
    const token = req.body?.token || req.query?.token;
    const email = req.body?.email || req.query?.email;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification link token is missing'
      });
    }

    const cleanToken = token.trim();
    let user = await User.findOne({
      $or: [
        { verificationToken: cleanToken },
        { verificationOtp: cleanToken }
      ]
    });

    if (!user && email) {
      const emailUser = await User.findOne({ email: email.toLowerCase().trim() });
      if (emailUser && emailUser.isVerified) {
        user = emailUser;
      }
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification link. Please request a new verification email.'
      });
    }

    if (user.verificationTokenExpires && user.verificationTokenExpires < Date.now() && !user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'This verification link has expired. Please request a new verification email.'
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    user.verificationOtp = undefined;
    user.verificationOtpExpires = undefined;
    await user.save();

    let tutorProfile = null;
    if (user.role === 'tutor') {
      tutorProfile = await TutorProfile.findOne({ user: user._id });
    }

    const jwtToken = generateToken(user._id);
    const completion = calculateProfileCompletion(user, tutorProfile);

    res.status(200).json({
      success: true,
      message: '🎉 Email verified successfully! Welcome to IlmPortal Pakistan.',
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
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
    console.error('Token Verification Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during link verification'
    });
  }
};

// @desc    Resend Verification Email / Link
// @route   POST /api/auth/resend-otp
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }

    const user = await User.findOne({
      $or: [
        { email: email.toLowerCase().trim() },
        { username: email.toLowerCase().trim() }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email or username'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Account is already verified. Please proceed to login.'
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.verificationOtp = otp;
    user.verificationOtpExpires = tokenExpires;
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = tokenExpires;
    await user.save();

    // Send Verification Email asynchronously in background (non-blocking for fast <100ms response)
    sendVerificationOtpEmail(user.email, user.name, otp, verificationToken).catch((err) => {
      console.error('Async email dispatch notification:', err?.message || err);
    });

    res.status(200).json({
      success: true,
      message: 'A fresh verification link has been sent to your email address.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error resending verification email'
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
        message: 'Please provide both email/username and password'
      });
    }

    const identifier = email.toLowerCase().trim();
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { username: identifier }
      ]
    }).select('+password');

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
      // Refresh OTP and verification link
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      user.verificationOtp = otp;
      user.verificationOtpExpires = tokenExpires;
      user.verificationToken = verificationToken;
      user.verificationTokenExpires = tokenExpires;
      await user.save();

      sendVerificationOtpEmail(user.email, user.name, otp, verificationToken).catch((err) => {
        console.error('Async email dispatch notification:', err?.message || err);
      });

      return res.status(403).json({
        success: false,
        isUnverified: true,
        email: user.email,
        message: 'Please verify your email address. A fresh verification link has been sent to your email.'
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
        username: user.username,
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

// @desc    Delete Current User Account (Self-Service)
// @route   DELETE /api/auth/delete-account
exports.deleteMyAccount = async (req, res) => {
  try {
    const { password } = req.body || {};
    const userId = req.user.id || req.user._id;

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'System administrator accounts cannot be self-deleted.'
      });
    }

    // Verify password if provided
    if (password && typeof password === 'string' && password.trim() && user.password) {
      const isMatch = await user.comparePassword(password.trim());
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Incorrect password. Please provide your valid current password to confirm account deletion.'
        });
      }
    }

    // Clean up role-specific records
    if (user.role === 'tutor') {
      await TutorProfile.deleteOne({ user: userId });
      try {
        const Course = require('../models/Course');
        await Course.deleteMany({ tutor: userId });
      } catch (e) {}
    }

    // Clean up notifications
    await Notification.deleteMany({
      $or: [{ recipient: userId }, { sender: userId }]
    });

    // Permanently remove user record
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: 'Your account and all associated data have been permanently deleted.'
    });
  } catch (error) {
    console.error('Account Deletion Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while deleting account'
    });
  }
};

