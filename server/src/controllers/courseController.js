const Course = require('../models/Course');
const TutorProfile = require('../models/TutorProfile');
const Category = require('../models/Category');

// Helper to generate unique slug
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);
};

// @desc    Get all published courses
// @route   GET /api/courses
exports.getAllCourses = async (req, res) => {
  try {
    const { category, track, targetAudience, search, instructorId, sortBy } = req.query;
    const query = { isActive: true };

    if (category && category !== 'all') {
      if (category === 'quran' || category === 'academic') {
        query.category = category;
      } else {
        const cleanCat = category.replace(/-/g, ' ');
        query.$or = [
          { category: category },
          { title: new RegExp(cleanCat, 'i') },
          { description: new RegExp(cleanCat, 'i') }
        ];
      }
    }

    if (track && track !== 'all') {
      query.track = track;
    }

    if (targetAudience && targetAudience !== 'all') {
      query.targetAudience = new RegExp(targetAudience.trim(), 'i');
    }

    if (instructorId) {
      query.instructor = instructorId;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { subtitle: searchRegex },
        { description: searchRegex }
      ];
    }

    let sort = { isFeatured: -1, createdAt: -1 };
    if (sortBy === 'newest') {
      sort = { createdAt: -1 };
    } else if (sortBy === 'popular') {
      sort = { totalLessons: -1, createdAt: -1 };
    } else if (sortBy === 'price_low') {
      sort = { 'priceSuggested.amount': 1 };
    } else if (sortBy === 'price_high') {
      sort = { 'priceSuggested.amount': -1 };
    }

    const courses = await Course.find(query)
      .populate('instructor', 'name email avatar city phone isVerified')
      .populate('tutorProfile', 'isSanadVerified qualifications hourlyRate teachingMode averageRating')
      .sort(sort);

    res.status(200).json({
      success: true,
      count: courses.length,
      courses
    });
  } catch (error) {
    console.error('Error in getAllCourses:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching courses'
    });
  }
};

// @desc    Get single course by slug with instructor details and matching faculty
// @route   GET /api/courses/:slug
exports.getCourseBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const course = await Course.findOne({ slug, isActive: true })
      .populate('instructor', 'name email avatar city phone isVerified')
      .populate('tutorProfile', 'isSanadVerified qualifications hourlyRate teachingMode averageRating ratingCount bio');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const isRegisteredUser = Boolean(req.user);
    const courseObj = course.toObject();

    let totalLessonsCount = 0;
    let totalTestsCount = 0;
    let totalAssignmentsCount = 0;

    courseObj.chapters = (courseObj.chapters || []).map(ch => {
      totalLessonsCount += (ch.lessons?.length || 0);
      totalTestsCount += (ch.tests?.length || 0);
      totalAssignmentsCount += (ch.assignments?.length || 0);

      if (!isRegisteredUser) {
        // Redact test questions & answers for public visitors
        const redactedTests = (ch.tests || []).map(t => ({
          _id: t._id,
          testNumber: t.testNumber,
          title: t.title,
          passingScore: t.passingScore,
          questionCount: t.questions?.length || 0,
          isLocked: true
        }));

        // Redact assignment instructions for public visitors
        const redactedAssignments = (ch.assignments || []).map(a => ({
          _id: a._id,
          assignmentNumber: a.assignmentNumber,
          title: a.title,
          submissionType: a.submissionType,
          dueDateDays: a.dueDateDays,
          isLocked: true
        }));

        return {
          ...ch,
          tests: redactedTests,
          assignments: redactedAssignments
        };
      }

      return ch;
    });

    courseObj.stats = {
      totalChapters: courseObj.chapters.length,
      totalLessons: totalLessonsCount,
      totalTests: totalTestsCount,
      totalAssignments: totalAssignmentsCount
    };
    courseObj.isRegisteredUser = isRegisteredUser;

    // Find tutors specialized in the course category
    const matchingTutors = await TutorProfile.find({
      verificationStatus: 'approved'
    })
      .populate('user', 'name email avatar phone city isVerified')
      .populate('subjects', 'name slug type icon')
      .populate('cities', 'name province')
      .limit(6);

    res.status(200).json({
      success: true,
      course: courseObj,
      matchingTutors
    });
  } catch (error) {
    console.error('Error in getCourseBySlug:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching course details'
    });
  }
};

// @desc    Get courses authored by the logged-in tutor
// @route   GET /api/courses/tutor/my-courses
exports.getMyAuthoredCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      courses
    });
  } catch (error) {
    console.error('Error in getMyAuthoredCourses:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching your courses'
    });
  }
};

// @desc    Create a new course as a tutor
// @route   POST /api/courses/tutor/create
exports.createCourse = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      description,
      category,
      targetAudience,
      ageRange,
      track,
      sessionDuration,
      tuitionAmount,
      thumbnail
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide course title and description'
      });
    }

    const tutorProfile = await TutorProfile.findOne({ user: req.user._id });

    const slug = generateSlug(title);

    const newCourse = await Course.create({
      instructor: req.user._id,
      tutorProfile: tutorProfile ? tutorProfile._id : undefined,
      title: title.trim(),
      slug,
      subtitle: subtitle || 'Structured curriculum by verified educator',
      description: description.trim(),
      category: category || 'quran',
      targetAudience: targetAudience || 'All Ages',
      ageRange: ageRange || 'General',
      track: track || 'kids',
      sessionDuration: sessionDuration || '20–30 minutes',
      totalLessons: 0,
      thumbnail: thumbnail || 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=600',
      priceSuggested: {
        amount: Number(tuitionAmount) || 3500,
        unit: 'month',
        currency: 'PKR'
      },
      chapters: []
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully! You can now add chapters, lessons, tests, and assignments.',
      course: newCourse
    });
  } catch (error) {
    console.error('Error in createCourse:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating course'
    });
  }
};

// @desc    Update course metadata
// @route   PUT /api/courses/tutor/:id
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      instructor: req.user._id
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or unauthorized'
      });
    }

    const {
      title,
      subtitle,
      description,
      category,
      targetAudience,
      sessionDuration,
      tuitionAmount,
      thumbnail,
      isActive
    } = req.body;

    if (title) course.title = title.trim();
    if (subtitle) course.subtitle = subtitle;
    if (description) course.description = description;
    if (category) course.category = category;
    if (targetAudience) course.targetAudience = targetAudience;
    if (sessionDuration) course.sessionDuration = sessionDuration;
    if (thumbnail) course.thumbnail = thumbnail;
    if (typeof isActive === 'boolean') course.isActive = isActive;
    if (tuitionAmount) {
      course.priceSuggested.amount = Number(tuitionAmount);
    }

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course details updated successfully',
      course
    });
  } catch (error) {
    console.error('Error in updateCourse:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating course'
    });
  }
};

// @desc    Add Chapter to Course
// @route   POST /api/courses/tutor/:id/chapters
exports.addChapter = async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      instructor: req.user._id
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or unauthorized'
      });
    }

    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Chapter title is required'
      });
    }

    const nextChapterNumber = (course.chapters?.length || 0) + 1;

    course.chapters.push({
      chapterNumber: nextChapterNumber,
      title: title.trim(),
      description: description ? description.trim() : '',
      lessons: [],
      tests: [],
      assignments: []
    });

    await course.save();

    res.status(200).json({
      success: true,
      message: `Chapter ${nextChapterNumber} added successfully`,
      course
    });
  } catch (error) {
    console.error('Error in addChapter:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding chapter'
    });
  }
};

// @desc    Add Lesson to a Chapter
// @route   POST /api/courses/tutor/:id/chapters/:chapterId/lessons
exports.addLesson = async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      instructor: req.user._id
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or unauthorized'
      });
    }

    const chapter = course.chapters.id(req.params.chapterId);
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found'
      });
    }

    const { title, content, duration, videoUrl } = req.body;
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Lesson title and content notes are required'
      });
    }

    const nextLessonNumber = (chapter.lessons?.length || 0) + 1;

    chapter.lessons.push({
      lessonNumber: nextLessonNumber,
      title: title.trim(),
      content: content.trim(),
      duration: duration || '15 mins',
      videoUrl: videoUrl ? videoUrl.trim() : ''
    });

    // Update totalLessons across course
    let total = 0;
    course.chapters.forEach(c => { total += (c.lessons?.length || 0); });
    course.totalLessons = total;

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Lesson added successfully to chapter',
      course
    });
  } catch (error) {
    console.error('Error in addLesson:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding lesson'
    });
  }
};

// @desc    Add Test / Quiz to a Chapter
// @route   POST /api/courses/tutor/:id/chapters/:chapterId/tests
exports.addTest = async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      instructor: req.user._id
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or unauthorized'
      });
    }

    const chapter = course.chapters.id(req.params.chapterId);
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found'
      });
    }

    const { title, instructions, passingScore, questions } = req.body;
    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Test title and at least one quiz question are required'
      });
    }

    const nextTestNumber = (chapter.tests?.length || 0) + 1;

    chapter.tests.push({
      testNumber: nextTestNumber,
      title: title.trim(),
      instructions: instructions || 'Read carefully and answer all questions.',
      passingScore: Number(passingScore) || 70,
      questions
    });

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Test added successfully to chapter',
      course
    });
  } catch (error) {
    console.error('Error in addTest:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding test'
    });
  }
};

// @desc    Add Assignment to a Chapter
// @route   POST /api/courses/tutor/:id/chapters/:chapterId/assignments
exports.addAssignment = async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      instructor: req.user._id
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or unauthorized'
      });
    }

    const chapter = course.chapters.id(req.params.chapterId);
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found'
      });
    }

    const { title, instructions, submissionType, dueDateDays } = req.body;
    if (!title || !instructions) {
      return res.status(400).json({
        success: false,
        message: 'Assignment title and instructions are required'
      });
    }

    const nextAssignmentNumber = (chapter.assignments?.length || 0) + 1;

    chapter.assignments.push({
      assignmentNumber: nextAssignmentNumber,
      title: title.trim(),
      instructions: instructions.trim(),
      submissionType: submissionType || 'audio_recitation',
      dueDateDays: Number(dueDateDays) || 7
    });

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Assignment added successfully to chapter',
      course
    });
  } catch (error) {
    console.error('Error in addAssignment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding assignment'
    });
  }
};

// @desc    Update Chapter in Course
// @route   PUT /api/courses/tutor/:id/chapters/:chapterId
exports.updateChapter = async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      instructor: req.user._id
    });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found or unauthorized' });

    const chapter = course.chapters.id(req.params.chapterId);
    if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found' });

    const { title, description } = req.body;
    if (title) chapter.title = title.trim();
    if (description !== undefined) chapter.description = description.trim();

    await course.save();
    res.status(200).json({ success: true, message: 'Chapter updated successfully', course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error updating chapter' });
  }
};

// @desc    Delete Chapter from Course
// @route   DELETE /api/courses/tutor/:id/chapters/:chapterId
exports.deleteChapter = async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      instructor: req.user._id
    });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found or unauthorized' });

    course.chapters.pull({ _id: req.params.chapterId });
    let total = 0;
    course.chapters.forEach(c => { total += (c.lessons?.length || 0); });
    course.totalLessons = total;

    await course.save();
    res.status(200).json({ success: true, message: 'Chapter deleted successfully', course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error deleting chapter' });
  }
};

// @desc    Update Lesson in Chapter
// @route   PUT /api/courses/tutor/:id/chapters/:chapterId/lessons/:lessonId
exports.updateLesson = async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      instructor: req.user._id
    });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found or unauthorized' });

    const chapter = course.chapters.id(req.params.chapterId);
    if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found' });

    const lesson = chapter.lessons.id(req.params.lessonId);
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

    const { title, content, duration, videoUrl } = req.body;
    if (title) lesson.title = title.trim();
    if (content) lesson.content = content.trim();
    if (duration) lesson.duration = duration;
    if (videoUrl !== undefined) lesson.videoUrl = videoUrl.trim();

    await course.save();
    res.status(200).json({ success: true, message: 'Lesson updated successfully', course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error updating lesson' });
  }
};

// @desc    Delete Lesson from Chapter
// @route   DELETE /api/courses/tutor/:id/chapters/:chapterId/lessons/:lessonId
exports.deleteLesson = async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      instructor: req.user._id
    });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found or unauthorized' });

    const chapter = course.chapters.id(req.params.chapterId);
    if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found' });

    chapter.lessons.pull({ _id: req.params.lessonId });
    let total = 0;
    course.chapters.forEach(c => { total += (c.lessons?.length || 0); });
    course.totalLessons = total;

    await course.save();
    res.status(200).json({ success: true, message: 'Lesson deleted successfully', course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error deleting lesson' });
  }
};

// @desc    Update Test in Chapter
// @route   PUT /api/courses/tutor/:id/chapters/:chapterId/tests/:testId
exports.updateTest = async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      instructor: req.user._id
    });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found or unauthorized' });

    const chapter = course.chapters.id(req.params.chapterId);
    if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found' });

    const test = chapter.tests.id(req.params.testId);
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });

    const { title, instructions, passingScore, questions } = req.body;
    if (title) test.title = title.trim();
    if (instructions) test.instructions = instructions.trim();
    if (passingScore) test.passingScore = Number(passingScore);
    if (questions && Array.isArray(questions)) test.questions = questions;

    await course.save();
    res.status(200).json({ success: true, message: 'Test updated successfully', course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error updating test' });
  }
};

// @desc    Delete Test from Chapter
// @route   DELETE /api/courses/tutor/:id/chapters/:chapterId/tests/:testId
exports.deleteTest = async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      instructor: req.user._id
    });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found or unauthorized' });

    const chapter = course.chapters.id(req.params.chapterId);
    if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found' });

    chapter.tests.pull({ _id: req.params.testId });
    await course.save();
    res.status(200).json({ success: true, message: 'Test deleted successfully', course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error deleting test' });
  }
};

// @desc    Update Assignment in Chapter
// @route   PUT /api/courses/tutor/:id/chapters/:chapterId/assignments/:assignmentId
exports.updateAssignment = async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      instructor: req.user._id
    });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found or unauthorized' });

    const chapter = course.chapters.id(req.params.chapterId);
    if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found' });

    const assignment = chapter.assignments.id(req.params.assignmentId);
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });

    const { title, instructions, submissionType, dueDateDays } = req.body;
    if (title) assignment.title = title.trim();
    if (instructions) assignment.instructions = instructions.trim();
    if (submissionType) assignment.submissionType = submissionType;
    if (dueDateDays) assignment.dueDateDays = Number(dueDateDays);

    await course.save();
    res.status(200).json({ success: true, message: 'Assignment updated successfully', course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error updating assignment' });
  }
};

// @desc    Delete Assignment from Chapter
// @route   DELETE /api/courses/tutor/:id/chapters/:chapterId/assignments/:assignmentId
exports.deleteAssignment = async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      instructor: req.user._id
    });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found or unauthorized' });

    const chapter = course.chapters.id(req.params.chapterId);
    if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found' });

    chapter.assignments.pull({ _id: req.params.assignmentId });
    await course.save();
    res.status(200).json({ success: true, message: 'Assignment deleted successfully', course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error deleting assignment' });
  }
};

// @desc    Delete Course
// @route   DELETE /api/courses/tutor/:id
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findOneAndDelete({
      _id: req.params.id,
      instructor: req.user._id
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteCourse:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting course'
    });
  }
};

// @desc    Get public courses authored by a specific tutor
// @route   GET /api/courses/by-tutor/:tutorUserId
exports.getTutorPublicCourses = async (req, res) => {
  try {
    const { tutorUserId } = req.params;
    const courses = await Course.find({
      instructor: tutorUserId,
      isActive: true
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      courses
    });
  } catch (error) {
    console.error('Error in getTutorPublicCourses:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching tutor courses'
    });
  }
};
