const mongoose = require('mongoose');
const TutorProfile = require('../models/TutorProfile');
const User = require('../models/User');
const Category = require('../models/Category');
const Location = require('../models/Location');
const Review = require('../models/Review');
const { calculateProfileCompletion } = require('./authController');

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
      verificationStatus: 'approved',
      subjects: { $exists: true, $not: { $size: 0 } },
      sanadDocuments: {
        $elemMatch: {
          status: { $in: ['verified', 'approved'] }
        }
      }
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
      const facultyCondition = {
        $and: [
          { $or: [{ gender: 'female' }, { user: { $in: femaleUserIds } }] },
          {
            $or: [
              { tutoringType: { $in: ['quran', 'both'] } },
              { qualifications: { $regex: /alimah|wifaq|wafaq|dars-e-nizami|sanad|tajweed|hafiz|quran/i } },
              { bio: { $regex: /alimah|wifaq|wafaq|dars-e-nizami|sanad|tajweed|hafiz|quran|islamic/i } },
              { subjects: { $in: quranCatIds } }
            ]
          }
        ]
      };
      query.$and = (query.$and || []).concat([facultyCondition]);
    } else if (faculty === 'female_academic') {
      const acadCats = await Category.find({ type: 'academic' }, '_id');
      const acadCatIds = acadCats.map(c => c._id);
      const femaleUsers = await User.find({ gender: 'female' }, '_id');
      const femaleUserIds = femaleUsers.map(u => u._id);
      const facultyCondition = {
        $and: [
          { $or: [{ gender: 'female' }, { user: { $in: femaleUserIds } }] },
          {
            $or: [
              { tutoringType: { $in: ['academic', 'both'] } },
              { qualifications: { $regex: /bs|ms|msc|mphil|phd|b\.ed|m\.ed|board|matric|fsc|engineer|master|bachelor|academic|doctor|mbbs/i } },
              { bio: { $regex: /math|physics|chemistry|biology|science|english|computer|accounting|economics|matric|board|academic|school/i } },
              { subjects: { $in: acadCatIds } }
            ]
          }
        ]
      };
      query.$and = (query.$and || []).concat([facultyCondition]);
    } else if (faculty === 'male_quran' || faculty === 'qari') {
      const quranCats = await Category.find({ type: 'quran' }, '_id');
      const quranCatIds = quranCats.map(c => c._id);
      const maleUsers = await User.find({ gender: 'male' }, '_id');
      const maleUserIds = maleUsers.map(u => u._id);
      const facultyCondition = {
        $and: [
          { $or: [{ gender: 'male' }, { user: { $in: maleUserIds } }] },
          {
            $or: [
              { tutoringType: { $in: ['quran', 'both'] } },
              { qualifications: { $regex: /qari|hafiz|sanad|wifaq|wafaq|dars-e-nizami|tajweed|quran/i } },
              { bio: { $regex: /qari|hafiz|sanad|wifaq|wafaq|dars-e-nizami|tajweed|quran|islamic/i } },
              { subjects: { $in: quranCatIds } }
            ]
          }
        ]
      };
      query.$and = (query.$and || []).concat([facultyCondition]);
    } else if (faculty === 'male_academic') {
      const acadCats = await Category.find({ type: 'academic' }, '_id');
      const acadCatIds = acadCats.map(c => c._id);
      const maleUsers = await User.find({ gender: 'male' }, '_id');
      const maleUserIds = maleUsers.map(u => u._id);
      const facultyCondition = {
        $and: [
          { $or: [{ gender: 'male' }, { user: { $in: maleUserIds } }] },
          {
            $or: [
              { tutoringType: { $in: ['academic', 'both'] } },
              { qualifications: { $regex: /bs|ms|msc|mphil|phd|b\.ed|m\.ed|board|matric|fsc|engineer|master|bachelor|academic/i } },
              { bio: { $regex: /math|physics|chemistry|biology|science|english|computer|accounting|economics|matric|board|academic|school/i } },
              { subjects: { $in: acadCatIds } }
            ]
          }
        ]
      };
      query.$and = (query.$and || []).concat([facultyCondition]);
    } else if (gender && gender !== 'all') {
      const usersWithGender = await User.find({ gender: gender }, '_id');
      const userIdsWithGender = usersWithGender.map(u => u._id);
      const genderCondition = {
        $or: [
          { gender: gender },
          { user: { $in: userIdsWithGender } }
        ]
      };
      query.$and = (query.$and || []).concat([genderCondition]);
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
      .populate('user', 'name email avatar phone city area age gender role isVerified isActive createdAt')
      .populate('subjects', 'name slug type icon description')
      .populate('cities', 'name province isMajorCity')
      .sort(sortOptions);

    // Strictly enforce 100% completed profile health for public directory visibility
    tutorProfiles = tutorProfiles.filter(tp => {
      if (!tp.user) return false;
      const completion = calculateProfileCompletion(tp.user, tp);
      return completion.percentage === 100;
    });

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

    const total = tutorProfiles.length;
    const paginatedTutors = tutorProfiles.slice(skip, skip + limitNumber);

    const isUserOnline = req.app.get('isUserOnline');
    const tutorsWithOnline = paginatedTutors.map(tp => {
      const obj = tp.toObject ? tp.toObject() : { ...tp };
      const uId = obj.user?._id || obj.user?.id || obj.user;
      obj.isOnline = isUserOnline ? Boolean(isUserOnline(uId)) : false;
      const realCount = obj.ratingCount || 0;
      obj.averageRating = (realCount > 0 && typeof obj.ratingAverage === 'number') ? obj.ratingAverage : 0;
      obj.totalReviews = realCount;
      return obj;
    });

    res.status(200).json({
      success: true,
      count: tutorsWithOnline.length,
      total,
      totalPages: Math.ceil(total / limitNumber),
      currentPage: pageNumber,
      tutors: tutorsWithOnline
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
    let tutor = null;
    const isValidObjectId = mongoose.Types.ObjectId.isValid(req.params.id);

    if (isValidObjectId) {
      tutor = await TutorProfile.findById(req.params.id)
        .populate('user', 'name email avatar phone city area age gender role isVerified isActive createdAt')
        .populate('subjects', 'name slug type icon description')
        .populate('cities', 'name province isMajorCity');

      // If ID was user ID instead of tutor profile ID
      if (!tutor) {
        tutor = await TutorProfile.findOne({ user: req.params.id })
          .populate('user', 'name email avatar phone city area age gender role isVerified isActive createdAt')
          .populate('subjects', 'name slug type icon description')
          .populate('cities', 'name province isMajorCity');
      }
    }

    if (!tutor) {
      const userDoc = await User.findOne({ username: req.params.id.toLowerCase() });
      if (userDoc) {
        tutor = await TutorProfile.findOne({ user: userDoc._id })
          .populate('user', 'name email avatar phone city area age gender role isVerified isActive createdAt')
          .populate('subjects', 'name slug type icon description')
          .populate('cities', 'name province isMajorCity');
      }
    }

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Tutor profile not found'
      });
    }

    // Only approved tutors with 100% completion are visible to public (admin and tutor themselves can view)
    const reqUserId = req.user?._id?.toString() || req.user?.id?.toString();
    const tutorUserId = tutor.user?._id?.toString() || tutor.user?.toString();
    const isAdmin = req.user?.role === 'admin';
    const isOwner = reqUserId && reqUserId === tutorUserId;

    const completion = calculateProfileCompletion(tutor.user, tutor);
    if ((tutor.verificationStatus !== 'approved' || completion.percentage < 100) && !isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'This tutor profile is incomplete (must be 100% complete) or under review and not yet publicly visible.'
      });
    }

    // Fetch verified published reviews for this tutor
    const reviews = await Review.find({
      $and: [
        {
          $or: [
            { tutor: tutorUserId },
            { tutor: tutor._id },
            { targetUser: tutorUserId },
            { targetUser: tutor._id }
          ]
        },
        {
          $or: [
            { targetRole: 'tutor' },
            { reviewerRole: 'student' },
            { targetRole: { $exists: false } }
          ]
        }
      ],
      status: 'published'
    })
      .populate('student', 'name avatar city')
      .populate('reviewer', 'name avatar city role')
      .sort({ createdAt: -1 });

    const isUserOnline = req.app.get('isUserOnline');
    const tutorObj = tutor.toObject ? tutor.toObject() : { ...tutor };
    const uId = tutorObj.user?._id || tutorObj.user?.id || tutorObj.user;
    tutorObj.isOnline = isUserOnline ? Boolean(isUserOnline(uId)) : false;
    const genuineReviewsCount = reviews.length;
    const genuineAverage = genuineReviewsCount > 0
      ? Math.round((reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / genuineReviewsCount) * 10) / 10
      : 0;

    tutorObj.averageRating = genuineAverage;
    tutorObj.totalReviews = genuineReviewsCount;

    res.status(200).json({
      success: true,
      tutor: tutorObj,
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
      hourlyRate,
      subjects,
      cities,
      city,
      localArea,
      area,
      teachingMode,
      teachingModes,
      tutoringType,
      gender,
      sanadDocuments,
      verificationStatus,
      videoIntro,
      paymentMethods
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
        hourlyRate: hourlyRate !== undefined ? Number(hourlyRate) : 1500,
        city: city || '',
        localArea: (localArea !== undefined ? localArea : area || '').trim(),
        tutoringType: tutoringType || 'both',
        gender: gender || 'male',
        videoIntro: typeof videoIntro === 'string' ? videoIntro.trim() : '',
        subjects: Array.isArray(subjects) ? subjects : [],
        teachingModes: Array.isArray(teachingModes) && teachingModes.length > 0
          ? teachingModes
          : (teachingMode ? (teachingMode === 'both' ? ['online', 'in_person'] : [teachingMode === 'physical' ? 'in_person' : teachingMode]) : ['online']),
        verificationStatus: 'under_review'
      });
    } else {
      if (bio !== undefined) profile.bio = bio;
      if (qualifications !== undefined) profile.qualifications = qualifications;
      if (normalizedExp !== undefined) profile.experienceYears = normalizedExp;
      if (hourlyRate !== undefined) profile.hourlyRate = Number(hourlyRate);
      if (gender !== undefined) profile.gender = gender;
      if (tutoringType !== undefined) profile.tutoringType = tutoringType;
      if (videoIntro !== undefined) profile.videoIntro = typeof videoIntro === 'string' ? videoIntro.trim() : '';
      if (subjects !== undefined) profile.subjects = subjects;
      if (cities !== undefined) profile.cities = cities;
      if (city !== undefined) profile.city = city.trim();
      if (localArea !== undefined || area !== undefined) {
        profile.localArea = (localArea !== undefined ? localArea : area).trim();
      }
      if (Array.isArray(teachingModes) && teachingModes.length > 0) {
        profile.teachingModes = teachingModes;
      } else if (teachingMode !== undefined) {
        profile.teachingModes = teachingMode === 'both' ? ['online', 'in_person'] : [teachingMode === 'physical' ? 'in_person' : teachingMode];
      }
      if (Array.isArray(paymentMethods)) {
        profile.paymentMethods = paymentMethods.filter(pm => pm && pm.method && pm.accountTitle && pm.accountNumber).map((pm, idx) => ({
          _id: pm._id,
          method: pm.method,
          bankName: (pm.bankName || '').trim(),
          accountTitle: (pm.accountTitle || '').trim(),
          accountNumber: (pm.accountNumber || '').trim(),
          instructions: (pm.instructions || '').trim(),
          isDefault: Boolean(pm.isDefault || idx === 0)
        }));
      }
    }

    let hasNewlyUploadedDoc = false;
    let newlyUploadedDocTitle = '';

    // Handle Sanad Documents Array & Status Tracking
    if (Array.isArray(sanadDocuments)) {
      const existingDocMap = new Map((profile.sanadDocuments || []).map(d => [d.fileUrl, d]));

      const normalizedDocs = sanadDocuments.map(doc => {
        const existing = existingDocMap.get(doc.fileUrl) || (doc._id ? (profile.sanadDocuments.id ? profile.sanadDocuments.id(doc._id) : null) : null);
        const isNew = !existing;
        if (isNew) {
          hasNewlyUploadedDoc = true;
          newlyUploadedDocTitle = doc.title || 'Sanad / Educational Degree';
        }
        return {
          _id: existing?._id || doc._id,
          title: doc.title || 'Sanad / Educational Degree',
          fileUrl: doc.fileUrl,
          fileType: doc.fileType || (doc.fileUrl && doc.fileUrl.startsWith('data:application/pdf') ? 'application/pdf' : 'image/jpeg'),
          status: isNew ? 'pending' : (existing?.status || 'pending'),
          uploadedAt: existing?.uploadedAt || doc.uploadedAt || new Date(),
          reviewedAt: existing?.reviewedAt,
          reviewedBy: existing?.reviewedBy,
          rejectionReason: existing?.rejectionReason || ''
        };
      });

      profile.sanadDocuments = normalizedDocs;
    }

    // Also sync gender, city and area to the user record first so completion checks are accurate
    const userDoc = await User.findById(req.user.id);
    if (userDoc) {
      let userUpdated = false;
      if (gender && userDoc.gender !== gender) {
        userDoc.gender = gender;
        userUpdated = true;
      }
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

    // Determine verificationStatus updates based on 100% completion requirement
    const completion = calculateProfileCompletion(userDoc, profile);

    const hasUploadedSanad = Array.isArray(profile?.sanadDocuments) && profile.sanadDocuments.length > 0;
    const hasPendingSanad = hasUploadedSanad && profile.sanadDocuments.some(d => d.status === 'pending');

    if (completion.percentage < 100) {
      if (profile.verificationStatus === 'approved') {
        profile.verificationStatus = hasPendingSanad ? 'under_review' : 'incomplete';
      } else if (hasPendingSanad && profile.verificationStatus === 'incomplete') {
        profile.verificationStatus = 'under_review';
      }
    } else {
      // 100% completed
      if (profile.verificationStatus === 'incomplete' || profile.verificationStatus === 'pending') {
        profile.verificationStatus = 'under_review';
      }
    }

    if (hasNewlyUploadedDoc) {
      profile.verificationStatus = 'under_review';

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
      if (profile.verificationStatus !== 'approved' && profile.verificationStatus !== 'suspended' && completion.percentage >= 100) {
        profile.verificationStatus = verificationStatus;
      }
    }

    await profile.save();

    await profile.populate([
      { path: 'subjects', select: 'name slug type description subtopics' },
      { path: 'cities', select: 'name province' }
    ]);

    res.status(200).json({
      success: true,
      message: hasNewlyUploadedDoc
        ? 'Document uploaded successfully! It is now pending admin approval.'
        : 'Profile updated successfully',
      profile,
      completion
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
    const completion = user ? calculateProfileCompletion(user, profile) : { percentage: 0 };

    if (profile.verificationStatus !== 'suspended') {
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

// @desc    Upload Video Intro for tutor profile
// @route   POST /api/tutors/video-intro/upload
exports.uploadVideoIntro = async (req, res) => {
  try {
    let videoUrl = '';

    if (req.file) {
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
        try {
          const { cloudinary } = require('../config/cloudinary');
          if (req.file.path) {
            const result = await cloudinary.uploader.upload(req.file.path, {
              folder: 'ilmportal/tutor-videos',
              resource_type: 'video',
              chunk_size: 6000000
            });
            if (result && result.secure_url) {
              videoUrl = result.secure_url;
              try {
                const fs = require('fs');
                if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
              } catch (_) {}
            }
          } else if (req.file.buffer) {
            videoUrl = await new Promise((resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream(
                { folder: 'ilmportal/tutor-videos', resource_type: 'video' },
                (error, result) => {
                  if (error) return reject(error);
                  resolve(result.secure_url);
                }
              );
              stream.end(req.file.buffer);
            });
          }
        } catch (cloudErr) {
          console.warn('Cloudinary video upload failed, falling back to local file path:', cloudErr);
          videoUrl = `/uploads/${req.file.filename}`;
        }
      } else {
        videoUrl = `/uploads/${req.file.filename}`;
      }
    } else if (req.body.videoUrl || req.body.videoIntro) {
      videoUrl = (req.body.videoUrl || req.body.videoIntro).trim();
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid video file (MP4, WEBM, MOV) or video URL'
      });
    }

    let profile = await TutorProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new TutorProfile({
        user: req.user.id,
        verificationStatus: 'under_review'
      });
    }

    profile.videoIntro = videoUrl;
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Video intro saved successfully!',
      videoIntro: profile.videoIntro,
      profile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error uploading video intro'
    });
  }
};

// @desc    Get tutor's payment methods
// @route   GET /api/tutors/payment-methods
exports.getMyPaymentMethods = async (req, res) => {
  try {
    const profile = await TutorProfile.findOne({ user: req.user.id });
    const paymentMethods = profile?.paymentMethods || [];
    res.status(200).json({
      success: true,
      paymentMethods
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching payment methods'
    });
  }
};

// @desc    Add a payment method
// @route   POST /api/tutors/payment-methods
exports.addPaymentMethod = async (req, res) => {
  try {
    const { method, bankName, accountTitle, accountNumber, instructions, isDefault } = req.body;

    const validMethods = ['bank', 'raast', 'easypaisa', 'jazzcash', 'upaisa'];
    if (!validMethods.includes(method)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method. Must be Bank, Raast, EasyPaisa, JazzCash, or UPaisa.'
      });
    }

    if (!accountTitle?.trim() || !accountNumber?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Account Title and Account Number / IBAN are required.'
      });
    }

    if (method === 'bank' && !bankName?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Bank Name is required for Bank Transfer payment method.'
      });
    }

    let profile = await TutorProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new TutorProfile({
        user: req.user.id,
        verificationStatus: 'under_review'
      });
    }

    if (!Array.isArray(profile.paymentMethods)) {
      profile.paymentMethods = [];
    }

    const shouldBeDefault = Boolean(isDefault) || profile.paymentMethods.length === 0;

    if (shouldBeDefault) {
      profile.paymentMethods.forEach(pm => { pm.isDefault = false; });
    }

    profile.paymentMethods.push({
      method,
      bankName: (bankName || '').trim(),
      accountTitle: accountTitle.trim(),
      accountNumber: accountNumber.trim(),
      instructions: (instructions || '').trim(),
      isDefault: shouldBeDefault,
      createdAt: new Date()
    });

    await profile.save();

    const user = await User.findById(req.user.id);
    const completion = calculateProfileCompletion(user, profile);

    res.status(201).json({
      success: true,
      message: 'Payment method added successfully!',
      paymentMethods: profile.paymentMethods,
      completion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error adding payment method'
    });
  }
};

// @desc    Update a payment method
// @route   PUT /api/tutors/payment-methods/:id
exports.updatePaymentMethod = async (req, res) => {
  try {
    const { method, bankName, accountTitle, accountNumber, instructions, isDefault } = req.body;
    const { id } = req.params;

    let profile = await TutorProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Tutor profile not found' });
    }

    const item = profile.paymentMethods.id(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Payment method not found' });
    }

    if (method) {
      const validMethods = ['bank', 'raast', 'easypaisa', 'jazzcash', 'upaisa'];
      if (!validMethods.includes(method)) {
        return res.status(400).json({ success: false, message: 'Invalid payment method' });
      }
      item.method = method;
    }

    if (accountTitle !== undefined) item.accountTitle = accountTitle.trim();
    if (accountNumber !== undefined) item.accountNumber = accountNumber.trim();
    if (bankName !== undefined) item.bankName = bankName.trim();
    if (instructions !== undefined) item.instructions = instructions.trim();

    if (isDefault) {
      profile.paymentMethods.forEach(pm => {
        pm.isDefault = pm._id.toString() === id.toString();
      });
    }

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Payment method updated successfully!',
      paymentMethods: profile.paymentMethods
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating payment method'
    });
  }
};

// @desc    Delete a payment method
// @route   DELETE /api/tutors/payment-methods/:id
exports.deletePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;

    let profile = await TutorProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Tutor profile not found' });
    }

    const item = profile.paymentMethods.id(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Payment method not found' });
    }

    const wasDefault = item.isDefault;
    profile.paymentMethods.pull(id);

    if (wasDefault && profile.paymentMethods.length > 0) {
      profile.paymentMethods[0].isDefault = true;
    }

    await profile.save();

    const user = await User.findById(req.user.id);
    const completion = calculateProfileCompletion(user, profile);

    res.status(200).json({
      success: true,
      message: 'Payment method removed successfully!',
      paymentMethods: profile.paymentMethods,
      completion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting payment method'
    });
  }
};

// @desc    Set default payment method
// @route   PATCH /api/tutors/payment-methods/:id/default
exports.setDefaultPaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;

    let profile = await TutorProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Tutor profile not found' });
    }

    let found = false;
    profile.paymentMethods.forEach(pm => {
      if (pm._id.toString() === id.toString()) {
        pm.isDefault = true;
        found = true;
      } else {
        pm.isDefault = false;
      }
    });

    if (!found) {
      return res.status(404).json({ success: false, message: 'Payment method not found' });
    }

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Default payment method updated!',
      paymentMethods: profile.paymentMethods
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error setting default payment method'
    });
  }
};

