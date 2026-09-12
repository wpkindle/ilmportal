const User = require('../models/User');
const TutorProfile = require('../models/TutorProfile');
const Notification = require('../models/Notification');
const {
  sendVerificationOtpEmail,
  sendEmailChangeOtpEmail,
  sendEmailDetailed,
  sendPasswordResetEmail,
  sendEarlyTutorRegistrationAdminAlert
} = require('../utils/emailService');
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

  const isTutor = user.role === 'tutor' || !!tutorProfile;
  if (isTutor) {
    const checks = [
      { key: 'name', label: 'Full Name', weight: 10, done: !!user.name?.trim() },
      { key: 'email', label: 'Verified Email', weight: 10, done: !!user.isVerified },
      { key: 'avatar', label: 'Profile Picture', weight: 10, done: !!user.avatar?.trim() },
      { key: 'age', label: 'Tutor Age', weight: 5, done: !!user.age },
      { key: 'gender', label: 'Gender', weight: 5, done: !!(user.gender?.trim() || tutorProfile?.gender?.trim()) },
      { key: 'city', label: 'City Location', weight: 10, done: !!(user.city?.trim() || tutorProfile?.city?.trim()) },
      { key: 'subjects', label: 'Subjects & Classes', weight: 10, done: Array.isArray(tutorProfile?.subjects) && tutorProfile.subjects.length > 0 },
      { key: 'bio', label: 'Teaching Bio', weight: 15, done: !!tutorProfile?.bio?.trim() && tutorProfile.bio.length > 20 && !tutorProfile.bio.includes('Assalam-o-Alaikum! I am an experienced tutor on IlmPortal') && !tutorProfile.bio.includes('Assalam-o-Alaikum! I am an experienced tutor on IlmiDunya') },
      { key: 'qualifications', label: 'Educational Qualifications', weight: 10, done: !!tutorProfile?.qualifications?.trim() && tutorProfile.qualifications !== 'Tutor Qualifications' },
      {
        key: 'sanad',
        label: 'Sanad / Degree Approved',
        weight: 5,
        done: Array.isArray(tutorProfile?.sanadDocuments) &&
              tutorProfile.sanadDocuments.length > 0 &&
              tutorProfile.sanadDocuments.some(doc => doc.status === 'verified' || doc.status === 'approved')
      },
      {
        key: 'paymentMethods',
        label: 'Payment Method (Required)',
        weight: 10,
        done: Array.isArray(tutorProfile?.paymentMethods) && tutorProfile.paymentMethods.length > 0
      }
    ];

    const percentage = Math.min(100, Math.max(0, checks.reduce((sum, item) => sum + (item.done ? item.weight : 0), 0)));
    return { percentage, items: checks };
  } else {
    // Student
    const checks = [
      { key: 'name', label: 'Student Name', weight: 20, done: !!user.name?.trim() },
      { key: 'email', label: 'Verified Email', weight: 20, done: !!user.isVerified },
      { key: 'avatar', label: 'Profile Picture', weight: 15, done: !!user.avatar?.trim() },
      { key: 'age', label: 'Student Age', weight: 15, done: !!user.age },
      { key: 'gender', label: 'Gender', weight: 15, done: !!user.gender?.trim() },
      { key: 'city', label: 'City', weight: 15, done: !!user.city?.trim() }
    ];

    const percentage = Math.min(100, Math.max(0, checks.reduce((sum, item) => sum + (item.done ? item.weight : 0), 0)));
    return { percentage, items: checks };
  }
};
exports.calculateProfileCompletion = calculateProfileCompletion;

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
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const emailClean = email.toLowerCase().trim();

    // Check if email exists
    const emailExists = await User.findOne({ email: emailClean });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    // Optional username handling (if provided)
    let usernameClean = undefined;
    if (username && typeof username === 'string' && username.trim()) {
      const sanitized = username.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');
      if (sanitized.length >= 3) {
        const usernameExists = await User.findOne({ username: sanitized });
        if (usernameExists) {
          return res.status(400).json({ success: false, message: 'Username is already taken. Please choose another.' });
        }
        usernameClean = sanitized;
      }
    }

    const userRole = role === 'tutor' ? 'tutor' : 'student';

    // Generate Verification Token (Email Link)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const newUserData = {
      name: name.trim(),
      email: emailClean,
      phone: userPhone,
      password,
      role: userRole,
      city: (city || '').trim(),
      gender: (gender || '').trim(),
      age: age ? Number(age) : undefined,
      guardianPhone: (guardianPhone || '').trim(),
      isVerified: false,
      verificationOtp: otp,
      verificationOtpExpires: otpExpires,
      verificationToken,
      verificationTokenExpires: otpExpires
    };
    if (usernameClean) {
      newUserData.username = usernameClean;
    }

    const user = await User.create(newUserData);

    // If registered as tutor, create initial TutorProfile in incomplete state
    if (userRole === 'tutor') {
      await TutorProfile.create({
        user: user._id,
        bio: (req.body.bio || '').trim(),
        qualifications: (req.body.qualifications || req.body.whatWillYouTeach || '').trim(),
        experienceYears: req.body.experienceYears ? Number(req.body.experienceYears) : 1,
        hourlyRate: req.body.hourlyRate ? Number(req.body.hourlyRate) : 1500,
        gender: (gender || '').trim(),
        verificationStatus: 'incomplete'
      });

      // Send email alert with tutor data to info@ilmidunya.com
      sendEarlyTutorRegistrationAdminAlert({
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
        whatWillYouTeach: (req.body.qualifications || req.body.whatWillYouTeach || req.body.bio || '').trim(),
        teachingMode: req.body.teachingMode || 'online',
        gender: user.gender
      }).catch((err) => {
        console.error('Admin early tutor registration alert email error:', err.message);
      });

      // Notify admin
      const adminUser = await User.findOne({ role: 'admin' });
      if (adminUser) {
        await Notification.create({
          recipient: adminUser._id,
          sender: user._id,
          title: 'New Tutor Registration',
          message: `${user.name}${user.username ? ` (@${user.username})` : ''} registered as a tutor.`,
          type: 'tutor_application',
          link: '/admin/tutor-approvals'
        });
      }
    }

    // Send Verification Email asynchronously in background
    sendVerificationOtpEmail(user.email, user.name, otp, verificationToken, userRole).catch((err) => {
      console.error('Async email dispatch notification:', err?.message || err);
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful! A verification link has been sent to your email.',
      email: user.email,
      username: user.username,
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
      sendEarlyTutorRegistrationAdminAlert({
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
        whatWillYouTeach: tutorProfile?.qualifications || tutorProfile?.bio || '',
        teachingMode: 'online',
        gender: user.gender
      }).catch((err) => {
        console.error('Admin tutor verification alert email error:', err.message);
      });
    }

    const completion = calculateProfileCompletion(user, tutorProfile);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! Welcome to IlmiDunya Pakistan.',
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
      message: 'Email verified successfully! Welcome to IlmiDunya Pakistan.',
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
    sendVerificationOtpEmail(user.email, user.name, otp, verificationToken, user.role).catch((err) => {
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

      sendVerificationOtpEmail(user.email, user.name, otp, verificationToken, user.role).catch((err) => {
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
        phone: user.phone,
        tuitionMode: user.tuitionMode || user.preferredMode || 'both',
        preferredMode: user.preferredMode || user.tuitionMode || 'both'
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
      area,
      localArea,
      avatar,
      gender,
      age,
      bio,
      qualifications,
      experienceYears,
      hourlyRate,
      teachingMode,
      username
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // If username is changed or set, validate format and check uniqueness
    if (username !== undefined) {
      const cleanUsername = username.toLowerCase().trim();
      if (cleanUsername && cleanUsername !== user.username) {
        if (!/^[a-z0-9_]{3,30}$/.test(cleanUsername)) {
          return res.status(400).json({
            success: false,
            message: 'Username must be 3-30 characters long and contain only letters, numbers, and underscores.'
          });
        }
        const usernameExists = await User.findOne({ username: cleanUsername, _id: { $ne: user._id } });
        if (usernameExists) {
          return res.status(400).json({
            success: false,
            message: 'This username is already taken. Please choose another username.'
          });
        }
        user.username = cleanUsername;
      } else if (!cleanUsername && user.username) {
        user.username = undefined;
      }
    }

    // Email updates require verified OTP via /api/auth/request-email-change
    // Ignore unverified direct email payload in general profile update

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (guardianPhone !== undefined) user.guardianPhone = guardianPhone.trim();
    if (city) user.city = city.trim();
    if (area !== undefined || localArea !== undefined) {
      user.area = (localArea !== undefined ? localArea : area).trim();
    }
    if (avatar !== undefined) user.avatar = avatar;
    if (gender) user.gender = gender;
    if (age !== undefined) user.age = Number(age);
    if (req.body.tuitionMode !== undefined || req.body.preferredMode !== undefined || (user.role === 'student' && teachingMode !== undefined)) {
      const modeVal = req.body.tuitionMode || req.body.preferredMode || teachingMode;
      const normalizedMode = modeVal === 'physical' ? 'in_person' : (['online', 'in_person', 'both'].includes(modeVal) ? modeVal : 'both');
      user.tuitionMode = normalizedMode;
      user.preferredMode = normalizedMode;
    }

    await user.save();

    let tutorProfile = null;
    if (user.role === 'tutor') {
      tutorProfile = await TutorProfile.findOne({ user: user._id });
      if (!tutorProfile) {
        tutorProfile = new TutorProfile({ user: user._id, verificationStatus: 'pending' });
      }

      if (city) tutorProfile.city = city.trim();
      if (area !== undefined || localArea !== undefined) {
        tutorProfile.localArea = (localArea !== undefined ? localArea : area).trim();
      }
      if (bio !== undefined) tutorProfile.bio = bio;
      if (qualifications !== undefined) tutorProfile.qualifications = qualifications;
      if (experienceYears !== undefined) tutorProfile.experienceYears = Number(experienceYears);
      if (hourlyRate !== undefined) tutorProfile.hourlyRate = Number(hourlyRate);
      if (gender) tutorProfile.gender = gender;
      if (req.body.tutoringType !== undefined) tutorProfile.tutoringType = req.body.tutoringType;
      if (req.body.videoIntro !== undefined) {
        tutorProfile.videoIntro = typeof req.body.videoIntro === 'string' ? req.body.videoIntro.trim() : '';
      }
      if (req.body.subjects !== undefined) tutorProfile.subjects = req.body.subjects;
      if (Array.isArray(req.body.teachingModes) && req.body.teachingModes.length > 0) {
        tutorProfile.teachingModes = req.body.teachingModes;
      } else if (teachingMode !== undefined) {
        tutorProfile.teachingModes = teachingMode === 'both' ? ['online', 'in_person'] : [teachingMode === 'physical' ? 'in_person' : teachingMode];
      }

      await tutorProfile.save();
      await tutorProfile.populate('subjects', 'name slug type description subtopics');

      // Auto-transition verification status based on 100% completion
      const completion = calculateProfileCompletion(user, tutorProfile);

      const hasUploadedSanad = Array.isArray(tutorProfile?.sanadDocuments) && tutorProfile.sanadDocuments.length > 0;
      const hasPendingSanad = hasUploadedSanad && tutorProfile.sanadDocuments.some(d => d.status === 'pending');

      if (completion.percentage < 100) {
        if (tutorProfile.verificationStatus === 'approved') {
          tutorProfile.verificationStatus = hasPendingSanad ? 'under_review' : 'incomplete';
          await tutorProfile.save();
        } else if (hasPendingSanad && tutorProfile.verificationStatus === 'incomplete') {
          tutorProfile.verificationStatus = 'under_review';
          await tutorProfile.save();
        }
      } else if (completion.percentage >= 100) {
        if (tutorProfile.verificationStatus === 'incomplete' || tutorProfile.verificationStatus === 'pending') {
          tutorProfile.verificationStatus = 'under_review';
          await tutorProfile.save();

          // Notify admin
          const adminUser = await User.findOne({ role: 'admin' });
          if (adminUser) {
            await Notification.create({
              recipient: adminUser._id,
              title: 'Tutor Profile 100% Complete — Ready for Review',
              message: `${user.name} has completed 100% of their teaching profile and submitted for review.`,
              type: 'system',
              link: '/admin/tutor-approvals'
            });
          }
        }
      }
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

// @desc    Forgot Password Request - Dispatches Reset Link via Email
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account registered with this email address'
      });
    }

    // Generate secure 32-byte token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 60 mins validity
    await user.save();

    const clientUrl = process.env.CLIENT_URL || 'https://ilmportal.org';
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

    // Send password reset email
    try {
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetUrl
      });
    } catch (mailErr) {
      console.error('Failed to dispatch password reset email:', mailErr);
    }

    res.status(200).json({
      success: true,
      message: 'A password reset link has been dispatched to your email address.',
      resetToken // provided for convenience
    });
  } catch (error) {
    console.error('Forgot password error:', error);
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
    const to = req.query.to || 'info@ilmidunya.com';
    const result = await sendEmailDetailed({
      to,
      subject: '🧪 IlmiDunya Diagnostic Email Test',
      html: `<h3>IlmiDunya Email Dispatch Verification</h3><p>This email confirms that live Gmail SMTP is functioning properly from the server to <strong>${to}</strong>.</p>`
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

// @desc    Register Early Tutor (No OTP verification required)
// @route   POST /api/auth/early-tutor
// @access  Public
exports.registerEarlyTutor = async (req, res) => {
  try {
    const { name, email, phone, number, city, whatWillYouTeach, qualifications, teachingMode, gender, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide your full name.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide your email address.' });
    }

    const emailClean = email.toLowerCase().trim();
    const userPhone = (phone || number || '').trim();
    const userCity = (city || '').trim();
    const teachSubject = (whatWillYouTeach || qualifications || '').trim();
    const userGender = (gender || 'male').trim();
    const userTeachingMode = teachingMode || 'online';

    let user = await User.findOne({ email: emailClean });
    let tutorProfile = null;

    if (user) {
      // Update existing user profile
      user.name = name.trim();
      if (userPhone) user.phone = userPhone;
      if (userCity) user.city = userCity;
      if (userGender) user.gender = userGender;
      user.role = 'tutor';
      user.isVerified = true; // No OTP required
      await user.save();

      tutorProfile = await TutorProfile.findOne({ user: user._id });
      if (tutorProfile) {
        if (teachSubject) tutorProfile.qualifications = teachSubject;
        tutorProfile.gender = userGender;
        await tutorProfile.save();
      } else {
        tutorProfile = await TutorProfile.create({
          user: user._id,
          bio: `Experienced ${userGender === 'female' ? 'female Alimah / educator' : 'Qari / tutor'} specializing in ${teachSubject || 'Quran & Academics'}. Available for ${userTeachingMode} sessions.`,
          qualifications: teachSubject,
          experienceYears: 1,
          hourlyRate: 1500,
          gender: userGender,
          verificationStatus: 'incomplete'
        });
      }
    } else {
      // Create new user (No OTP verification needed)
      const autoPassword = password && password.length >= 6 ? password : ('IlmDunya_' + crypto.randomBytes(4).toString('hex'));
      user = await User.create({
        name: name.trim(),
        email: emailClean,
        phone: userPhone,
        password: autoPassword,
        role: 'tutor',
        city: userCity,
        gender: userGender,
        isVerified: true // Direct verified, no OTP hurdle
      });

      tutorProfile = await TutorProfile.create({
        user: user._id,
        bio: `Experienced ${userGender === 'female' ? 'female Alimah / educator' : 'Qari / tutor'} specializing in ${teachSubject || 'Quran & Academics'}. Available for ${userTeachingMode} sessions.`,
        qualifications: teachSubject,
        experienceYears: 1,
        hourlyRate: 1500,
        gender: userGender,
        verificationStatus: 'incomplete'
      });
    }

    // Send detailed email with tutor data to info@ilmidunya.com
    // (Registrar does NOT receive any email; admin will follow up manually with info@ilmidunya.com)
    sendEarlyTutorRegistrationAdminAlert({
      name: user.name,
      email: user.email,
      phone: user.phone || userPhone,
      city: user.city || userCity,
      whatWillYouTeach: teachSubject || tutorProfile?.qualifications || '',
      teachingMode: userTeachingMode,
      gender: user.gender || userGender
    }).catch((err) => {
      console.error('Admin early tutor registration alert email error:', err.message);
    });

    // Notify admin in database
    const adminUser = await User.findOne({ role: 'admin' });
    if (adminUser) {
      await Notification.create({
        recipient: adminUser._id,
        sender: user._id,
        title: 'New Early Tutor Registration',
        message: `${user.name} registered interest to teach ${teachSubject || 'Quran & Academics'}.`,
        type: 'tutor_application',
        link: '/admin/tutor-approvals'
      }).catch(() => {});
    }

    return res.status(200).json({
      success: true,
      message: 'Welcome to the IlmiDunya teaching family! You are now placed on our VIP priority list for launch day. When we go live, students will be connected directly with you with 0% commission. We will contact you soon with all the details!',
      tutor: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
        whatWillYouTeach: teachSubject
      }
    });
  } catch (error) {
    console.error('Early tutor registration error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration. Please try again.'
    });
  }
};

// @desc    Request Email Change (sends 6-digit OTP to new email)
// @route   POST /api/auth/request-email-change
// @access  Private
exports.requestEmailChange = async (req, res) => {
  try {
    const { newEmail, currentPassword } = req.body;

    if (!newEmail || typeof newEmail !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide a valid new email address.' });
    }

    const cleanEmail = newEmail.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email format.' });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (cleanEmail === user.email) {
      return res.status(400).json({ success: false, message: 'New email cannot be the same as your current email.' });
    }

    // Require current password verification
    if (user.password) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password is required to request an email change.' });
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
      }
    }

    // Check if new email is already taken by another account
    const existing = await User.findOne({ email: cleanEmail, _id: { $ne: user._id } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'This email address is already registered to another account.' });
    }

    // Generate 6-digit OTP code (15 minutes validity)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    user.pendingEmail = cleanEmail;
    user.pendingEmailOtp = otp;
    user.pendingEmailOtpExpires = expires;
    await user.save();

    console.log(`🔐 [EMAIL CHANGE OTP] Generated OTP for ${user.email} -> ${cleanEmail}: ${otp}`);

    // Send email with OTP via Resend / SMTP
    sendEmailChangeOtpEmail(cleanEmail, user.name, otp).catch((err) => {
      console.error('Email change OTP send error:', err.message);
    });

    return res.status(200).json({
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanEmail}. Please enter it below to confirm.`
    });
  } catch (error) {
    console.error('Request Email Change Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error requesting email change' });
  }
};

// @desc    Verify and Apply New Email Address
// @route   POST /api/auth/verify-email-change
// @access  Private
exports.verifyEmailChange = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp || !otp.toString().trim()) {
      return res.status(400).json({ success: false, message: 'Please provide the 6-digit verification code.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.pendingEmail || !user.pendingEmailOtp) {
      return res.status(400).json({
        success: false,
        message: 'No pending email change request found. Please request a change first.'
      });
    }

    if (user.pendingEmailOtpExpires && user.pendingEmailOtpExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired (15 minute limit). Please request a new code.'
      });
    }

    if (user.pendingEmailOtp.trim() !== otp.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please check your inbox and enter the 6-digit code.'
      });
    }

    // Ensure new email wasn't taken in the interim
    const existing = await User.findOne({ email: user.pendingEmail, _id: { $ne: user._id } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'This email was registered by another account while waiting. Please use a different email.'
      });
    }

    const previousEmail = user.email;
    user.email = user.pendingEmail;
    user.isVerified = true;
    user.pendingEmail = undefined;
    user.pendingEmailOtp = undefined;
    user.pendingEmailOtpExpires = undefined;
    await user.save();

    console.log(`✅ [EMAIL CHANGE] User ${user._id} successfully updated email from ${previousEmail} to ${user.email}`);

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({
      success: true,
      message: 'Email address updated and verified successfully!',
      user: userObj
    });
  } catch (error) {
    console.error('Verify Email Change Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error verifying email change' });
  }
};


