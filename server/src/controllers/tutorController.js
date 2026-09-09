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
      area,
      province,
      mode,
      gender,
      faculty,
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
        const cityUsers = await User.find({ city: new RegExp('^' + city + '$', 'i') }, '_id');
        const cityUserIds = cityUsers.map((u) => u._id);
        const cityConditions = [];
        if (loc) cityConditions.push({ cities: { $in: [loc._id] } });
        if (cityUserIds.length > 0) cityConditions.push({ user: { $in: cityUserIds } });
        cityConditions.push({ city: new RegExp('^' + city + '$', 'i') });
        if (cityConditions.length > 0) {
          query.$or = (query.$or || []).concat(cityConditions);
        }
      }
    }

    // Filter by Area / Locality
    if (area && area !== 'all') {
      const areaUsers = await User.find({ area: new RegExp('^' + area + '$', 'i') }, '_id');
      const areaUserIds = areaUsers.map((u) => u._id);
      const areaConditions = [
        { localArea: new RegExp('^' + area + '$', 'i') }
      ];
      if (areaUserIds.length > 0) areaConditions.push({ user: { $in: areaUserIds } });
      query.$or = (query.$or || []).concat(areaConditions);
    }

    // Filter by Teaching Mode
    if (mode && mode !== 'all') {
      const modeKey = (mode === 'physical' || mode === 'in-person') ? 'in_person' : mode;
      query.teachingModes = { $in: [modeKey] };
    }

    // Filter by Faculty / Gender
    if (faculty === 'alimah' || faculty === 'female_alimah' || faculty === 'female_quran') {
      const quranCats = await Category.find({ type: 'quran' }, '_id');
      const quranCatIds = quranCats.map(c => c._id);
      const femaleUsers = await User.find({ gender: 'female' }, '_id');
      const femaleUserIds = femaleUsers.map(u => u._id);
      query.$and = [
        { $or: [{ gender: 'female' }, { user: { $in: femaleUserIds } }] },
        {
          $or: [
            { qualifications: { $regex: /alimah|wifaq|wafaq|dars-e-nizami|sanad|tajweed|hafiz|quran/i } },
            { bio: { $regex: /alimah|wifaq|wafaq|dars-e-nizami|sanad|tajweed|hafiz|quran|islamic/i } },
            { subjects: { $in: quranCatIds } }
          ]
        }
      ];
    } else if (faculty === 'female_academic') {
      const acadCats = await Category.find({ type: 'academic' }, '_id');
      const acadCatIds = acadCats.map(c => c._id);
      const femaleUsers = await User.find({ gender: 'female' }, '_id');
      const femaleUserIds = femaleUsers.map(u => u._id);
      query.$and = [
        { $or: [{ gender: 'female' }, { user: { $in: femaleUserIds } }] },
        {
          $or: [
            { qualifications: { $regex: /bs|ms|msc|mphil|phd|b\.ed|m\.ed|board|matric|fsc|engineer|master|bachelor|academic|doctor|mbbs/i } },
            { bio: { $regex: /math|physics|chemistry|biology|science|english|computer|accounting|economics|matric|board|academic|school/i } },
            { subjects: { $in: acadCatIds } }
          ]
        }
      ];
    } else if (faculty === 'male_quran' || faculty === 'qari') {
      query.gender = 'male';
      const quranCats = await Category.find({ type: 'quran' }, '_id');
      const quranCatIds = quranCats.map(c => c._id);
      query.$or = [
        { qualifications: { $regex: /qari|hafiz|sanad|wifaq|wafaq|dars-e-nizami|tajweed|quran/i } },
        { bio: { $regex: /qari|hafiz|sanad|wifaq|wafaq|dars-e-nizami|tajweed|quran|islamic/i } },
        { subjects: { $in: quranCatIds } }
      ];
    } else if (faculty === 'male_academic') {
      query.gender = 'male';
      const acadCats = await Category.find({ type: 'academic' }, '_id');
      const acadCatIds = acadCats.map(c => c._id);
      query.$or = [
        { qualifications: { $regex: /bs|ms|msc|mphil|phd|b\.ed|m\.ed|board|matric|fsc|engineer|master|bachelor|academic/i } },
        { bio: { $regex: /math|physics|chemistry|biology|science|english|computer|accounting|economics|matric|board|academic|school/i } },
        { subjects: { $in: acadCatIds } }
      ];
    } else if (gender && gender !== 'all') {
      const usersWithGender = await User.find({ gender: gender }, '_id');
      const userIdsWithGender = usersWithGender.map(u => u._id);
      query.$or = [
        { gender: gender },
        { user: { $in: userIdsWithGender } }
      ];
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
      .populate('user', 'name email avatar phone city area isVerified isActive')
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
      .populate('user', 'name email avatar phone city area isVerified isActive')
      .populate('subjects', 'name slug type icon description')
      .populate('cities', 'name province isMajorCity');

    // If ID was user ID instead of tutor profile ID
    if (!tutor) {
      tutor = await TutorProfile.findOne({ user: req.params.id })
        .populate('user', 'name email avatar phone city area isVerified isActive')
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
      city,
      localArea,
      area,
      teachingMode,
      tutoringType,
      gender,
      sanadDocuments,
      verificationStatus
    } = req.body;

    const normalizedExp = (experienceYears !== undefined && experienceYears !== null && experienceYears !== '')
      ? Number(experienceYears)
      : undefined;

    let profile = await TutorProfile.findOne({ user: req.user.id });

    if (!profile) {
      profile = new TutorProfile({
        user: req.user.id,
        bio: bio || '',
        qualifications: qualifications || '',
        experienceYears: normalizedExp !== undefined ? normalizedExp : 1,
        city: city || '',
        localArea: (localArea !== undefined ? localArea : area || '').trim(),
        tutoringType: tutoringType || 'both',
        gender: gender || 'male',
        verificationStatus: 'under_review'
      });
    } else {
      if (bio !== undefined) profile.bio = bio;
      if (qualifications !== undefined) profile.qualifications = qualifications;
      if (normalizedExp !== undefined) profile.experienceYears = normalizedExp;
      if (gender !== undefined) profile.gender = gender;
      if (tutoringType !== undefined) profile.tutoringType = tutoringType;
      if (subjects !== undefined) profile.subjects = subjects;
      if (cities !== undefined) profile.cities = cities;
      if (city !== undefined) profile.city = city.trim();
      if (localArea !== undefined || area !== undefined) {
        profile.localArea = (localArea !== undefined ? localArea : area).trim();
      }
      if (teachingMode !== undefined) {
        profile.teachingModes = teachingMode === 'both' ? ['online', 'in_person'] : [teachingMode === 'physical' ? 'in_person' : teachingMode];
      }
    }

    let hasNewlyUploadedDoc = false;
    let newlyUploadedDocTitle = '';

    // Handle Sanad Documents Array & Status Tracking
    if (Array.isArray(sanadDocuments)) {
      const existingUrls = new Set((profile.sanadDocuments || []).map(d => d.fileUrl));

      const normalizedDocs = sanadDocuments.map(doc => {
        const isNew = !existingUrls.has(doc.fileUrl);
        if (isNew) {
          hasNewlyUploadedDoc = true;
          newlyUploadedDocTitle = doc.title || 'Sanad / Educational Degree';
        }
        return {
          _id: doc._id,
          title: doc.title || 'Sanad / Educational Degree',
          fileUrl: doc.fileUrl,
          fileType: doc.fileType || (doc.fileUrl && doc.fileUrl.startsWith('data:application/pdf') ? 'application/pdf' : 'image/jpeg'),
          status: isNew ? 'pending' : (doc.status || 'pending'),
          uploadedAt: doc.uploadedAt || new Date(),
          rejectionReason: doc.rejectionReason || ''
        };
      });

      profile.sanadDocuments = normalizedDocs;
    }

    // Determine verificationStatus updates
    if (hasNewlyUploadedDoc) {
      if (profile.verificationStatus !== 'approved') {
        profile.verificationStatus = 'under_review';
      }

      // Dispatch Admin Notification for new document
      try {
        const Notification = require('../models/Notification');
        const adminUsers = await User.find({ role: 'admin' });
        const tutorUser = await User.findById(req.user.id);
        for (const admin of adminUsers) {
          await Notification.create({
            recipient: admin._id,
            sender: req.user.id,
            title: 'New Tutor Document Uploaded for Review',
            message: `${tutorUser?.name || 'A tutor'} uploaded "${newlyUploadedDocTitle}" for admin approval.`,
            type: 'verification_status',
            link: '/admin/tutor-approvals'
          });
        }
      } catch (notifErr) {
        console.error('Failed to notify admin of new document upload:', notifErr);
      }
    } else if (verificationStatus && ['pending', 'under_review'].includes(verificationStatus)) {
      if (profile.verificationStatus !== 'approved' && profile.verificationStatus !== 'suspended') {
        profile.verificationStatus = verificationStatus;
      }
    }

    await profile.save();

    // Also sync city and area to the user record
    const userDoc = await User.findById(req.user.id);
    if (userDoc) {
      let userUpdated = false;
      if (city && userDoc.city !== city.trim()) {
        userDoc.city = city.trim();
        userUpdated = true;
      }
      const targetArea = (localArea !== undefined ? localArea : area || '').trim();
      if (targetArea && userDoc.area !== targetArea) {
        userDoc.area = targetArea;
        userUpdated = true;
      }
      if (userUpdated) await userDoc.save();
    }

    res.status(200).json({
      success: true,
      message: hasNewlyUploadedDoc
        ? 'Document uploaded successfully! It is now pending admin approval.'
        : 'Profile updated successfully',
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
        verificationStatus: 'under_review'
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const newDoc = {
      title: req.body.title || 'Sanad / Degree Document',
      fileUrl,
      fileType: req.file.mimetype,
      status: 'pending',
      uploadedAt: new Date()
    };

    profile.sanadDocuments.push(newDoc);

    const user = await User.findById(req.user.id);
    const { calculateProfileCompletion } = require('./authController');
    const completion = user ? calculateProfileCompletion(user, profile) : { percentage: 0 };

    if (profile.verificationStatus !== 'approved' && profile.verificationStatus !== 'suspended') {
      profile.verificationStatus = 'under_review';
    }

    await profile.save();

    // Notify admins immediately
    try {
      const Notification = require('../models/Notification');
      const adminUsers = await User.find({ role: 'admin' });
      for (const admin of adminUsers) {
        await Notification.create({
          recipient: admin._id,
          sender: req.user.id,
          title: 'New Tutor Document Uploaded for Review',
          message: `${user?.name || 'A tutor'} uploaded "${newDoc.title}" for admin approval.`,
          type: 'verification_status',
          link: '/admin/tutor-approvals'
        });
      }
    } catch (notifErr) {
      console.error('Error creating admin notification for sanad upload:', notifErr);
    }

    res.status(200).json({
      success: true,
      message: 'Sanad / Degree document uploaded and submitted to admin for approval (Pending Approval).',
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
