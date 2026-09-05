const TutorProfile = require('../models/TutorProfile');
const User = require('../models/User');
const Category = require('../models/Category');
const Location = require('../models/Location');
const Review = require('../models/Review');

// @desc    Get all public verified tutors with filters & pagination
// @route   GET /api/tutors
exports.getPublicTutors = async (req, res) => {
  try {
    const {
      search,
      subject,
      category,
      city,
      province,
      mode,
      gender,
      minRating,
      maxPrice,
      sortBy = 'rating',
      page = 1,
      limit = 20
    } = req.query;

    const query = {
      verificationStatus: 'approved'
    };

    // Filter by subject/category
    const targetCategory = subject || category;
    if (targetCategory && targetCategory !== 'all') {
      if (targetCategory.match(/^[0-9a-fA-F]{24}$/)) {
        query.subjects = { $in: [targetCategory] };
      } else {
        const cat = await Category.findOne({
          $or: [
            { slug: targetCategory },
            { name: new RegExp('^' + targetCategory + '$', 'i') }
          ]
        });
        if (cat) {
          query.subjects = { $in: [cat._id] };
        }
      }
    }

    // Filter by city / location
    if (city && city !== 'all') {
      if (city.match(/^[0-9a-fA-F]{24}$/)) {
        query.cities = { $in: [city] };
      } else {
        const loc = await Location.findOne({ name: new RegExp('^' + city + '$', 'i') });
        if (loc) {
          query.cities = { $in: [loc._id] };
        }
      }
    }

    // Filter by Teaching Mode
    if (mode && mode !== 'all') {
      const modeKey = (mode === 'physical' || mode === 'in-person') ? 'in_person' : mode;
      query.teachingModes = { $in: [modeKey, 'online', 'in_person'] };
    }

    // Filter by Gender
    if (gender && gender !== 'all') {
      query.gender = gender;
    }

    // Filter by Minimum Rating
    if (minRating) {
      query.ratingAverage = { $gte: parseFloat(minRating) };
    }

    // Sorting
    let sortOptions = { ratingCount: -1, ratingAverage: -1 };
    if (sortBy === 'popular') {
      sortOptions = { ratingCount: -1, ratingAverage: -1 };
    } else if (sortBy === 'newest') {
      sortOptions = { createdAt: -1 };
    } else if (sortBy === 'rating') {
      sortOptions = { ratingAverage: -1, ratingCount: -1 };
    } else if (sortBy === 'experience') {
      sortOptions = { experienceYears: -1 };
    }

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 20;
    const skip = (pageNumber - 1) * limitNumber;

    let tutorProfiles = await TutorProfile.find(query)
      .populate('user', 'name email avatar phone city isVerified isActive')
      .populate('subjects', 'name slug type icon description')
      .populate('cities', 'name province isMajorCity')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNumber);

    // Apply text search on tutor name, bio, qualifications, subjects, cities
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      tutorProfiles = tutorProfiles.filter(tp => {
        const nameMatch = tp.user && searchRegex.test(tp.user.name);
        const bioMatch = searchRegex.test(tp.bio);
        const qualMatch = searchRegex.test(tp.qualifications);
        const subjMatch = tp.subjects && tp.subjects.some(s => searchRegex.test(s.name));
        const cityMatch = (tp.cities && tp.cities.some(c => searchRegex.test(c.name))) || (tp.user && searchRegex.test(tp.user.city));
        return nameMatch || bioMatch || qualMatch || subjMatch || cityMatch;
      });
    }

    const total = await TutorProfile.countDocuments(query);

    res.status(200).json({
      success: true,
      count: tutorProfiles.length,
      total,
      totalPages: Math.ceil(total / limitNumber),
      currentPage: pageNumber,
      tutors: tutorProfiles
    });
  } catch (error) {
    console.error('Error in getPublicTutors:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching tutor profiles'
    });
  }
};

// @desc    Get single tutor public profile with reviews
// @route   GET /api/tutors/:id
exports.getTutorById = async (req, res) => {
  try {
    let tutor = await TutorProfile.findById(req.params.id)
      .populate('user', 'name email avatar phone city isVerified isActive')
      .populate('subjects', 'name slug type icon description')
      .populate('cities', 'name province isMajorCity');

    // If ID was user ID instead of tutor profile ID
    if (!tutor) {
      tutor = await TutorProfile.findOne({ user: req.params.id })
        .populate('user', 'name email avatar phone city isVerified isActive')
        .populate('subjects', 'name slug type icon description')
        .populate('cities', 'name province isMajorCity');
    }

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Tutor profile not found'
      });
    }

    // Only approved tutors are visible to public (admin and tutor themselves can view)
    const reqUserId = req.user?._id?.toString() || req.user?.id?.toString();
    const tutorUserId = tutor.user?._id?.toString() || tutor.user?.toString();
    const isAdmin = req.user?.role === 'admin';
    const isOwner = reqUserId && reqUserId === tutorUserId;

    if (tutor.verificationStatus !== 'approved' && !isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'This tutor profile is currently under review by administration and not yet publicly visible.'
      });
    }

    // Fetch verified reviews for this tutor
    const reviews = await Review.find({ tutor: tutor.user._id, isHidden: false })
      .populate('student', 'name avatar city')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      tutor,
      reviews
    });
  } catch (error) {
    console.error('Error fetching tutor by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving tutor profile'
    });
  }
};

// @desc    Get current tutor profile for logged-in tutor
// @route   GET /api/tutors/profile/me
exports.getMyTutorProfile = async (req, res) => {
  try {
    const profile = await TutorProfile.findOne({ user: req.user.id })
      .populate('subjects', 'name slug type')
      .populate('cities', 'name province');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Tutor profile not found'
      });
    }

    res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update current tutor profile
// @route   PUT /api/tutors/profile/me
exports.updateMyTutorProfile = async (req, res) => {
  try {
    const {
      bio,
      qualifications,
      experienceYears,
      subjects,
      cities,
      teachingMode,
      gender
    } = req.body;

    let profile = await TutorProfile.findOne({ user: req.user.id });

    if (!profile) {
      profile = new TutorProfile({
        user: req.user.id,
        bio: bio || '',
        qualifications: qualifications || '',
        experienceYears: experienceYears || 1,
        gender: gender || 'male',
        verificationStatus: 'pending'
      });
    } else {
      if (bio !== undefined) profile.bio = bio;
      if (qualifications !== undefined) profile.qualifications = qualifications;
      if (experienceYears !== undefined) profile.experienceYears = Number(experienceYears);
      if (gender !== undefined) profile.gender = gender;
      if (subjects !== undefined) profile.subjects = subjects;
      if (cities !== undefined) profile.cities = cities;
      if (teachingMode !== undefined) {
        profile.teachingModes = teachingMode === 'both' ? ['online', 'in_person'] : [teachingMode === 'physical' ? 'in_person' : teachingMode];
      }
    }

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Upload Sanad Document for verification
// @route   POST /api/tutors/sanad/upload
exports.uploadSanad = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a valid document file (JPG, PNG, PDF)'
      });
    }

    let profile = await TutorProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new TutorProfile({
        user: req.user.id,
        verificationStatus: 'pending'
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const newDoc = {
      title: req.body.title || 'Sanad / Degree Document',
      fileUrl,
      fileType: req.file.mimetype,
      uploadedAt: new Date()
    };

    profile.sanadDocuments.push(newDoc);

    const user = await User.findById(req.user.id);
    const { calculateProfileCompletion } = require('./authController');
    const completion = user ? calculateProfileCompletion(user, profile) : { percentage: 0 };

    if (profile.verificationStatus !== 'approved' && profile.verificationStatus !== 'suspended') {
      if (completion.percentage >= 100) {
        profile.verificationStatus = 'under_review';
        const adminUser = await User.findOne({ role: 'admin' });
        if (adminUser) {
          const Notification = require('../models/Notification');
          await Notification.create({
            recipient: adminUser._id,
            title: 'Tutor Profile 100% Complete — Ready for Review',
            message: `${user.name} has completed 100% of their teaching profile with Sanad documents.`,
            type: 'system',
            link: '/admin/tutor-approvals'
          });
        }
      } else {
        profile.verificationStatus = 'incomplete';
      }
    }
    await profile.save();

    res.status(200).json({
      success: true,
      message: completion.percentage >= 100
        ? 'Sanad document uploaded and profile is 100% complete! Submitted to administration for review.'
        : `Sanad document uploaded. Profile is ${completion.percentage}% complete. Complete remaining fields to submit for review.`,
      sanadDocuments: profile.sanadDocuments,
      verificationStatus: profile.verificationStatus,
      completion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
