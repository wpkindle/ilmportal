'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Plus,
  Layers,
  FileText,
  HelpCircle,
  ClipboardList,
  CheckCircle2,
  Trash2,
  Edit,
  Clock,
  Video,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  ChevronDown,
  X,
  AlertCircle,
  Users,
  CreditCard
} from 'lucide-react';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

export default function TutorCoursesPage() {
  const { user, isTutor } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  // Create Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [chapterModalOpen, setChapterModalOpen] = useState(false);
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);

  // Edit Modals state
  const [editCourseModalOpen, setEditCourseModalOpen] = useState(false);
  const [editChapterModalOpen, setEditChapterModalOpen] = useState(false);
  const [editLessonModalOpen, setEditLessonModalOpen] = useState(false);
  const [editTestModalOpen, setEditTestModalOpen] = useState(false);
  const [editAssignmentModalOpen, setEditAssignmentModalOpen] = useState(false);

  // Active target IDs
  const [activeChapterId, setActiveChapterId] = useState(null);
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [activeTestId, setActiveTestId] = useState(null);
  const [activeAssignmentId, setActiveAssignmentId] = useState(null);

  // Forms State
  const [courseForm, setCourseForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    category: 'quran',
    targetAudience: 'Kids (Ages ~5–12)',
    sessionDuration: '15–20 minutes',
    tuitionAmount: '3500',
    thumbnail: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=600'
  });

  const [editCourseForm, setEditCourseForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    category: 'quran',
    targetAudience: 'Kids (Ages ~5–12)',
    sessionDuration: '15–20 minutes',
    tuitionAmount: '3500',
    thumbnail: '',
    isActive: true
  });

  const [chapterForm, setChapterForm] = useState({
    title: '',
    description: ''
  });

  const [editChapterForm, setEditChapterForm] = useState({
    title: '',
    description: ''
  });

  const [lessonForm, setLessonForm] = useState({
    title: '',
    content: '',
    duration: '15 mins',
    videoUrl: ''
  });

  const [editLessonForm, setEditLessonForm] = useState({
    title: '',
    content: '',
    duration: '15 mins',
    videoUrl: ''
  });

  const [testForm, setTestForm] = useState({
    title: '',
    instructions: 'Read carefully and select the correct option.',
    passingScore: '75',
    questions: [
      { question: '', options: ['', '', '', ''], correctAnswer: 0 }
    ]
  });

  const [editTestForm, setEditTestForm] = useState({
    title: '',
    instructions: '',
    passingScore: 75,
    questions: [
      { question: '', options: ['', '', '', ''], correctAnswer: 0 }
    ]
  });

  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    instructions: '',
    submissionType: 'audio_recitation',
    dueDateDays: '7'
  });

  const [editAssignmentForm, setEditAssignmentForm] = useState({
    title: '',
    instructions: '',
    submissionType: 'audio_recitation',
    dueDateDays: 7
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchMyCourses = async () => {
    setLoading(true);
    try {
      const res = await api.getMyTutorCourses();
      if (res.success) {
        setCourses(res.courses);
        if (res.courses.length > 0) {
          if (!selectedCourse) {
            setSelectedCourse(res.courses[0]);
          } else {
            const updated = res.courses.find(c => c._id === selectedCourse._id);
            setSelectedCourse(updated || res.courses[0]);
          }
        } else {
          setSelectedCourse(null);
        }
      }
    } catch (err) {
      console.error('Error fetching tutor courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCourses();
  }, []);

  // --- Course Handlers ---
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await api.createTutorCourse(courseForm);
      if (res.success) {
        setMessage('Course created successfully! Now add chapters and lessons.');
        setCreateModalOpen(false);
        setCourseForm({
          title: '',
          subtitle: '',
          description: '',
          category: 'quran',
          targetAudience: 'Kids (Ages ~5–12)',
          sessionDuration: '15–20 minutes',
          tuitionAmount: '3500',
          thumbnail: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=600'
        });
        await fetchMyCourses();
        setSelectedCourse(res.course);
      }
    } catch (err) {
      setError(err.message || 'Failed to create course');
    } finally {
      setActionLoading(false);
    }
  };

  const openEditCourseModal = () => {
    if (!selectedCourse) return;
    setEditCourseForm({
      title: selectedCourse.title || '',
      subtitle: selectedCourse.subtitle || '',
      description: selectedCourse.description || '',
      category: selectedCourse.category || 'quran',
      targetAudience: selectedCourse.targetAudience || 'All Ages',
      sessionDuration: selectedCourse.sessionDuration || '20–30 minutes',
      tuitionAmount: selectedCourse.priceSuggested?.amount?.toString() || '3500',
      thumbnail: selectedCourse.thumbnail || '',
      isActive: selectedCourse.isActive ?? true
    });
    setEditCourseModalOpen(true);
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;
    setActionLoading(true);
    setError('');
    try {
      const res = await api.updateTutorCourse(selectedCourse._id, editCourseForm);
      if (res.success) {
        setMessage('Course updated successfully!');
        setEditCourseModalOpen(false);
        await fetchMyCourses();
      }
    } catch (err) {
      setError(err.message || 'Failed to update course');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;
    if (!window.confirm(`Are you sure you want to permanently delete course "${selectedCourse.title}"? This cannot be undone.`)) return;
    setActionLoading(true);
    setError('');
    try {
      const res = await api.deleteTutorCourse(selectedCourse._id);
      if (res.success) {
        setMessage('Course deleted successfully');
        setSelectedCourse(null);
        await fetchMyCourses();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete course');
    } finally {
      setActionLoading(false);
    }
  };

  // --- Chapter Handlers ---
  const handleAddChapter = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;
    setActionLoading(true);
    setError('');
    try {
      const res = await api.addCourseChapter(selectedCourse._id, chapterForm);
      if (res.success) {
        setChapterModalOpen(false);
        setChapterForm({ title: '', description: '' });
        await fetchMyCourses();
      }
    } catch (err) {
      setError(err.message || 'Failed to add chapter');
    } finally {
      setActionLoading(false);
    }
  };

  const openEditChapterModal = (chapter) => {
    setActiveChapterId(chapter._id);
    setEditChapterForm({
      title: chapter.title || '',
      description: chapter.description || ''
    });
    setEditChapterModalOpen(true);
  };

  const handleUpdateChapter = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !activeChapterId) return;
    setActionLoading(true);
    setError('');
    try {
      const res = await api.updateCourseChapter(selectedCourse._id, activeChapterId, editChapterForm);
      if (res.success) {
        setMessage('Chapter updated successfully!');
        setEditChapterModalOpen(false);
        await fetchMyCourses();
      }
    } catch (err) {
      setError(err.message || 'Failed to update chapter');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteChapter = async (chapterId, chapterTitle) => {
    if (!selectedCourse) return;
    if (!window.confirm(`Delete chapter "${chapterTitle}" and all its lessons, tests, and assignments?`)) return;
    setActionLoading(true);
    setError('');
    try {
      const res = await api.deleteCourseChapter(selectedCourse._id, chapterId);
      if (res.success) {
        setMessage('Chapter deleted successfully');
        await fetchMyCourses();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete chapter');
    } finally {
      setActionLoading(false);
    }
  };

  // --- Lesson Handlers ---
  const handleAddLesson = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !activeChapterId) return;
    setActionLoading(true);
    setError('');
    try {
      const res = await api.addCourseLesson(selectedCourse._id, activeChapterId, lessonForm);
      if (res.success) {
        setLessonModalOpen(false);
        setLessonForm({ title: '', content: '', duration: '15 mins', videoUrl: '' });
        await fetchMyCourses();
      }
    } catch (err) {
      setError(err.message || 'Failed to add lesson');
    } finally {
      setActionLoading(false);
    }
  };

  const openEditLessonModal = (chapterId, lesson) => {
    setActiveChapterId(chapterId);
    setActiveLessonId(lesson._id);
    setEditLessonForm({
      title: lesson.title || '',
      content: lesson.content || '',
      duration: lesson.duration || '15 mins',
      videoUrl: lesson.videoUrl || ''
    });
    setEditLessonModalOpen(true);
  };

  const handleUpdateLesson = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !activeChapterId || !activeLessonId) return;
    setActionLoading(true);
    setError('');
    try {
      const res = await api.updateCourseLesson(selectedCourse._id, activeChapterId, activeLessonId, editLessonForm);
      if (res.success) {
        setMessage('Lesson updated successfully!');
        setEditLessonModalOpen(false);
        await fetchMyCourses();
      }
    } catch (err) {
      setError(err.message || 'Failed to update lesson');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteLesson = async (chapterId, lessonId, lessonTitle) => {
    if (!selectedCourse) return;
    if (!window.confirm(`Delete lesson "${lessonTitle}"?`)) return;
    setActionLoading(true);
    setError('');
    try {
      const res = await api.deleteCourseLesson(selectedCourse._id, chapterId, lessonId);
      if (res.success) {
        setMessage('Lesson deleted successfully');
        await fetchMyCourses();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete lesson');
    } finally {
      setActionLoading(false);
    }
  };

  // --- Test Handlers ---
  const handleAddTest = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !activeChapterId) return;
    setActionLoading(true);
    setError('');
    try {
      const res = await api.addCourseTest(selectedCourse._id, activeChapterId, testForm);
      if (res.success) {
        setTestModalOpen(false);
        setTestForm({
          title: '',
          instructions: 'Read carefully and select the correct option.',
          passingScore: '75',
          questions: [
            { question: '', options: ['', '', '', ''], correctAnswer: 0 }
          ]
        });
        await fetchMyCourses();
      }
    } catch (err) {
      setError(err.message || 'Failed to add test');
    } finally {
      setActionLoading(false);
    }
  };

  const openEditTestModal = (chapterId, test) => {
    setActiveChapterId(chapterId);
    setActiveTestId(test._id);
    setEditTestForm({
      title: test.title || '',
      instructions: test.instructions || '',
      passingScore: test.passingScore || 75,
      questions: test.questions?.length > 0 ? JSON.parse(JSON.stringify(test.questions)) : [
        { question: '', options: ['', '', '', ''], correctAnswer: 0 }
      ]
    });
    setEditTestModalOpen(true);
  };

  const handleUpdateTest = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !activeChapterId || !activeTestId) return;
    setActionLoading(true);
    setError('');
    try {
      const res = await api.updateCourseTest(selectedCourse._id, activeChapterId, activeTestId, editTestForm);
      if (res.success) {
        setMessage('Test updated successfully!');
        setEditTestModalOpen(false);
        await fetchMyCourses();
      }
    } catch (err) {
      setError(err.message || 'Failed to update test');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTest = async (chapterId, testId, testTitle) => {
    if (!selectedCourse) return;
    if (!window.confirm(`Delete test "${testTitle}"?`)) return;
    setActionLoading(true);
    setError('');
    try {
      const res = await api.deleteCourseTest(selectedCourse._id, chapterId, testId);
      if (res.success) {
        setMessage('Test deleted successfully');
        await fetchMyCourses();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete test');
    } finally {
      setActionLoading(false);
    }
  };

  // --- Assignment Handlers ---
  const handleAddAssignment = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !activeChapterId) return;
    setActionLoading(true);
    setError('');
    try {
      const res = await api.addCourseAssignment(selectedCourse._id, activeChapterId, assignmentForm);
      if (res.success) {
        setAssignmentModalOpen(false);
        setAssignmentForm({
          title: '',
          instructions: '',
          submissionType: 'audio_recitation',
          dueDateDays: '7'
        });
        await fetchMyCourses();
      }
    } catch (err) {
      setError(err.message || 'Failed to add assignment');
    } finally {
      setActionLoading(false);
    }
  };

  const openEditAssignmentModal = (chapterId, asg) => {
    setActiveChapterId(chapterId);
    setActiveAssignmentId(asg._id);
    setEditAssignmentForm({
      title: asg.title || '',
      instructions: asg.instructions || '',
      submissionType: asg.submissionType || 'audio_recitation',
      dueDateDays: asg.dueDateDays || 7
    });
    setEditAssignmentModalOpen(true);
  };

  const handleUpdateAssignment = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !activeChapterId || !activeAssignmentId) return;
    setActionLoading(true);
    setError('');
    try {
      const res = await api.updateCourseAssignment(selectedCourse._id, activeChapterId, activeAssignmentId, editAssignmentForm);
      if (res.success) {
        setMessage('Assignment updated successfully!');
        setEditAssignmentModalOpen(false);
        await fetchMyCourses();
      }
    } catch (err) {
      setError(err.message || 'Failed to update assignment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAssignment = async (chapterId, asgId, asgTitle) => {
    if (!selectedCourse) return;
    if (!window.confirm(`Delete assignment "${asgTitle}"?`)) return;
    setActionLoading(true);
    setError('');
    try {
      const res = await api.deleteCourseAssignment(selectedCourse._id, chapterId, asgId);
      if (res.success) {
        setMessage('Assignment deleted successfully');
        await fetchMyCourses();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete assignment');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading your course studio..." />;

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
              <BookOpen className="w-4 h-4" />
              <span>Tutor Curriculum Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Manage Courses, Chapters & Outlines
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Publish and edit structured courses, customize lesson plans, diagnostic quizzes, and student homework.
            </p>
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Course</span>
          </button>
        </div>

        {/* Global Feedback Banners */}
        {message && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{message}</span>
            </div>
            <button onClick={() => setMessage('')} className="p-1 text-emerald-700 hover:text-emerald-950 font-bold text-xs"><X className="w-4 h-4" /></button>
          </div>
        )}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="p-1 text-rose-700 hover:text-rose-950 font-bold text-xs"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Studio Workspace Grid */}
        {courses.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
            <Layers className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">You haven&apos;t created any courses yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Create your first structured course with custom chapters, lessons, diagnostic tests, and student homework assignments.
            </p>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-6 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-500 transition-all cursor-pointer"
            >
              Start Course Builder
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Courses Selector */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Your Courses ({courses.length})
                </span>
                <span className="text-[11px] text-slate-400">Select to manage</span>
              </div>

              <div className="space-y-3">
                {courses.map((course) => {
                  const isSelected = selectedCourse?._id === course._id;
                  return (
                    <button
                      key={course._id}
                      onClick={() => setSelectedCourse(course)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'bg-slate-900 border-emerald-500 text-white shadow-lg ring-2 ring-emerald-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            isSelected ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-800'
                          }`}>
                            {course.category}
                          </span>
                          <span className={`text-[10px] font-bold ${course.isActive ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {course.isActive ? '● Live' : '○ Draft'}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-sm leading-snug line-clamp-1">
                          {course.title}
                        </h3>
                        <p className={`text-xs mt-0.5 line-clamp-1 ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                          {course.subtitle || course.description}
                        </p>
                      </div>

                      <div className={`flex items-center justify-between text-[11px] pt-2 border-t font-semibold ${
                        isSelected ? 'border-slate-800 text-slate-300' : 'border-slate-100 text-slate-500'
                      }`}>
                        <span>{course.chapters?.length || 0} Chapters &bull; {course.totalLessons || 0} Lessons</span>
                        <span className="font-bold">PKR {course.priceSuggested?.amount || 3500}/mo</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Selected Course Editor Studio */}
            <div className="lg:col-span-8">
              {selectedCourse && (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                  
                  {/* Selected Course Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-200/90">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          Active Course Editor
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedCourse.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {selectedCourse.isActive ? '● Published' : '○ Draft'}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                        {selectedCourse.title}
                      </h2>
                      <p className="text-xs text-slate-500">
                        {selectedCourse.subtitle}
                      </p>
                      <div className="flex items-center flex-wrap gap-2.5 mt-2 text-xs text-slate-600 font-semibold">
                        <span className="bg-slate-100 px-2 py-1 rounded-md flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                          <span>PKR {selectedCourse.priceSuggested?.amount || 3500}/mo</span>
                        </span>
                        <span className="bg-slate-100 px-2 py-1 rounded-md flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{selectedCourse.sessionDuration || '20–30 mins'}</span>
                        </span>
                        <span className="bg-slate-100 px-2 py-1 rounded-md flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-teal-600" />
                          <span>{selectedCourse.targetAudience || 'All Ages'}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center flex-wrap gap-2 shrink-0">
                      <button
                        onClick={openEditCourseModal}
                        className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit Course</span>
                      </button>

                      <Link
                        href={`/courses/${selectedCourse.slug}`}
                        target="_blank"
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                      >
                        Preview
                      </Link>

                      <button
                        onClick={() => setChapterModalOpen(true)}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Chapter</span>
                      </button>

                      <button
                        onClick={handleDeleteCourse}
                        title="Delete Course"
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Chapters List */}
                  {selectedCourse.chapters?.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
                      <p className="text-xs font-bold text-slate-600">No chapters added yet to this course</p>
                      <button
                        onClick={() => setChapterModalOpen(true)}
                        className="text-xs text-emerald-600 font-extrabold hover:underline cursor-pointer"
                      >
                        + Click here to add Chapter 1
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {selectedCourse.chapters?.map((chapter) => (
                        <div
                          key={chapter._id}
                          className="bg-slate-50/70 rounded-2xl border border-slate-200/90 p-5 space-y-4"
                        >
                          {/* Chapter Title Bar */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/60">
                            <div className="flex items-center gap-2.5">
                              <span className="w-7 h-7 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                                {chapter.chapterNumber}
                              </span>
                              <div>
                                <h4 className="font-extrabold text-sm text-slate-900">
                                  {chapter.title}
                                </h4>
                                {chapter.description && (
                                  <p className="text-xs text-slate-500">{chapter.description}</p>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons for Chapter */}
                            <div className="flex items-center gap-1.5 self-end sm:self-auto flex-wrap">
                              <button
                                onClick={() => {
                                  setActiveChapterId(chapter._id);
                                  setLessonModalOpen(true);
                                }}
                                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Add Lesson</span>
                              </button>

                              <button
                                onClick={() => {
                                  setActiveChapterId(chapter._id);
                                  setTestModalOpen(true);
                                }}
                                className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                              >
                                <HelpCircle className="w-3 h-3" />
                                <span>Add Test</span>
                              </button>

                              <button
                                onClick={() => {
                                  setActiveChapterId(chapter._id);
                                  setAssignmentModalOpen(true);
                                }}
                                className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                              >
                                <ClipboardList className="w-3 h-3" />
                                <span>Add Assignment</span>
                              </button>

                              <button
                                onClick={() => openEditChapterModal(chapter)}
                                title="Edit Chapter"
                                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteChapter(chapter._id, chapter.title)}
                                title="Delete Chapter"
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* 1. Lessons inside Chapter */}
                          <div className="space-y-2 pt-1">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                              Lessons ({chapter.lessons?.length || 0})
                            </span>
                            {chapter.lessons?.map((lesson) => (
                              <div
                                key={lesson._id}
                                className="p-3 bg-white rounded-xl border border-slate-200 text-xs flex items-center justify-between gap-3 shadow-2xs"
                              >
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <span className="font-bold text-slate-800">{lesson.title}</span>
                                  <span className="text-[10px] text-slate-400 font-semibold">&bull; {lesson.duration}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  {lesson.videoUrl && (
                                    <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-bold border border-teal-200 flex items-center gap-1">
                                      <Video className="w-3 h-3" />
                                      <span>Video Lecture</span>
                                    </span>
                                  )}
                                  <button
                                    onClick={() => openEditLessonModal(chapter._id, lesson)}
                                    title="Edit Lesson"
                                    className="p-1 text-slate-400 hover:text-slate-800 rounded transition-colors cursor-pointer"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteLesson(chapter._id, lesson._id, lesson.title)}
                                    title="Delete Lesson"
                                    className="p-1 text-rose-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* 2. Tests / Quizzes inside Chapter */}
                          {chapter.tests?.length > 0 && (
                            <div className="space-y-2 pt-2 border-t border-slate-200/60">
                              <span className="text-[10px] font-black uppercase text-purple-700 tracking-wider block">
                                Diagnostic Tests & Quizzes ({chapter.tests.length})
                              </span>
                              {chapter.tests.map((test) => (
                                <div
                                  key={test._id}
                                  className="p-3 bg-purple-50/50 rounded-xl border border-purple-200 text-xs flex items-center justify-between gap-3"
                                >
                                  <div className="flex items-center gap-2">
                                    <HelpCircle className="w-4 h-4 text-purple-600 shrink-0" />
                                    <span className="font-bold text-purple-950">{test.title}</span>
                                    <span className="text-[10px] text-purple-700">&bull; Pass: {test.passingScore}%</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded">
                                      {test.questions?.length || 0} Questions
                                    </span>
                                    <button
                                      onClick={() => openEditTestModal(chapter._id, test)}
                                      title="Edit Test"
                                      className="p-1 text-purple-400 hover:text-purple-900 rounded transition-colors cursor-pointer"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTest(chapter._id, test._id, test.title)}
                                      title="Delete Test"
                                      className="p-1 text-rose-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* 3. Homework Assignments inside Chapter */}
                          {chapter.assignments?.length > 0 && (
                            <div className="space-y-2 pt-2 border-t border-slate-200/60">
                              <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider block">
                                Recitation & Homework Assignments ({chapter.assignments.length})
                              </span>
                              {chapter.assignments.map((asg) => (
                                <div
                                  key={asg._id}
                                  className="p-3 bg-blue-50/50 rounded-xl border border-blue-200 text-xs flex items-center justify-between gap-3"
                                >
                                  <div className="flex items-center gap-2">
                                    <ClipboardList className="w-4 h-4 text-blue-600 shrink-0" />
                                    <span className="font-bold text-blue-950">{asg.title}</span>
                                    <span className="text-[10px] text-blue-700">&bull; Due in {asg.dueDateDays} days</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded capitalize">
                                      {asg.submissionType?.replace('_', ' ')}
                                    </span>
                                    <button
                                      onClick={() => openEditAssignmentModal(chapter._id, asg)}
                                      title="Edit Assignment"
                                      className="p-1 text-blue-400 hover:text-blue-900 rounded transition-colors cursor-pointer"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteAssignment(chapter._id, asg._id, asg.title)}
                                      title="Delete Assignment"
                                      className="p-1 text-rose-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* 1. Modal: Create New Course */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-lg text-slate-900">Create New Course</h3>
              </div>
              <button onClick={() => setCreateModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Course Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Noorani Qaida & Makharij for Kids"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Subtitle / Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. Step-by-step foundation with live 1-on-1 recitation drills"
                  value={courseForm.subtitle}
                  onChange={(e) => setCourseForm({ ...courseForm, subtitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Target Audience</label>
                  <select
                    value={courseForm.targetAudience}
                    onChange={(e) => setCourseForm({ ...courseForm, targetAudience: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-500 font-semibold"
                  >
                    <option value="Kids (Ages ~5–12)">Kids (Ages ~5–12)</option>
                    <option value="Teens & Adults (Ages 13+)">Teens & Adults (Ages 13+)</option>
                    <option value="Females Only">Females Only</option>
                    <option value="All Ages">All Ages</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Session Duration</label>
                  <select
                    value={courseForm.sessionDuration}
                    onChange={(e) => setCourseForm({ ...courseForm, sessionDuration: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-500 font-semibold"
                  >
                    <option value="15–20 minutes">15–20 minutes (Kids)</option>
                    <option value="30–45 minutes">30–45 minutes (Standard)</option>
                    <option value="50–60 minutes">50–60 minutes (Comprehensive)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Suggested Monthly Tuition (PKR)</label>
                  <input
                    type="number"
                    value={courseForm.tuitionAmount}
                    onChange={(e) => setCourseForm({ ...courseForm, tuitionAmount: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Category</label>
                  <select
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-500 font-semibold"
                  >
                    <option value="quran">Quran & Tajweed</option>
                    <option value="academic">Academic & School Subjects</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Detailed Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Outline who this course is designed for and the pedagogical learning goals..."
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Creating...' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Edit Course Details */}
      {editCourseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-lg text-slate-900">Edit Course Details</h3>
              </div>
              <button onClick={() => setEditCourseModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCourse} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Course Title *</label>
                <input
                  type="text"
                  required
                  value={editCourseForm.title}
                  onChange={(e) => setEditCourseForm({ ...editCourseForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Subtitle / Tagline</label>
                <input
                  type="text"
                  value={editCourseForm.subtitle}
                  onChange={(e) => setEditCourseForm({ ...editCourseForm, subtitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Target Audience</label>
                  <select
                    value={editCourseForm.targetAudience}
                    onChange={(e) => setEditCourseForm({ ...editCourseForm, targetAudience: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-500 font-semibold"
                  >
                    <option value="Kids (Ages ~5–12)">Kids (Ages ~5–12)</option>
                    <option value="Teens & Adults (Ages 13+)">Teens & Adults (Ages 13+)</option>
                    <option value="Females Only">Females Only</option>
                    <option value="All Ages">All Ages</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Session Duration</label>
                  <select
                    value={editCourseForm.sessionDuration}
                    onChange={(e) => setEditCourseForm({ ...editCourseForm, sessionDuration: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-500 font-semibold"
                  >
                    <option value="15–20 minutes">15–20 minutes (Kids)</option>
                    <option value="30–45 minutes">30–45 minutes (Standard)</option>
                    <option value="50–60 minutes">50–60 minutes (Comprehensive)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Monthly Tuition (PKR)</label>
                  <input
                    type="number"
                    value={editCourseForm.tuitionAmount}
                    onChange={(e) => setEditCourseForm({ ...editCourseForm, tuitionAmount: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Publication Status</label>
                  <select
                    value={editCourseForm.isActive ? 'true' : 'false'}
                    onChange={(e) => setEditCourseForm({ ...editCourseForm, isActive: e.target.value === 'true' })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-500 font-semibold"
                  >
                    <option value="true">● Published (Live)</option>
                    <option value="false">○ Draft (Hidden)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Thumbnail Image URL</label>
                <input
                  type="text"
                  value={editCourseForm.thumbnail}
                  onChange={(e) => setEditCourseForm({ ...editCourseForm, thumbnail: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Detailed Description *</label>
                <textarea
                  rows={3}
                  required
                  value={editCourseForm.description}
                  onChange={(e) => setEditCourseForm({ ...editCourseForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditCourseModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal: Add Chapter */}
      {chapterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              <span>Add Chapter to Syllabus</span>
            </h3>

            <form onSubmit={handleAddChapter} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Chapter Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 1: Arabic Alphabet Recognition"
                  value={chapterForm.title}
                  onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Chapter Goals / Overview</label>
                <textarea
                  rows={2}
                  placeholder="Short explanation of concepts mastered in this chapter..."
                  value={chapterForm.description}
                  onChange={(e) => setChapterForm({ ...chapterForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setChapterModalOpen(false)} className="px-3 py-1.5 text-xs font-bold text-slate-500">Cancel</button>
                <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">
                  {actionLoading ? 'Saving...' : 'Add Chapter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal: Edit Chapter */}
      {editChapterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <Edit className="w-5 h-5 text-emerald-600" />
              <span>Edit Chapter</span>
            </h3>

            <form onSubmit={handleUpdateChapter} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Chapter Title *</label>
                <input
                  type="text"
                  required
                  value={editChapterForm.title}
                  onChange={(e) => setEditChapterForm({ ...editChapterForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Chapter Goals / Overview</label>
                <textarea
                  rows={2}
                  value={editChapterForm.description}
                  onChange={(e) => setEditChapterForm({ ...editChapterForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditChapterModalOpen(false)} className="px-3 py-1.5 text-xs font-bold text-slate-500">Cancel</button>
                <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">
                  {actionLoading ? 'Saving...' : 'Update Chapter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Modal: Add Lesson */}
      {lessonModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <span>Add Lesson to Chapter</span>
            </h3>

            <form onSubmit={handleAddLesson} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Lesson Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lesson 1: Alif to Khaa Articulation"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Pacing Duration</label>
                  <input
                    type="text"
                    value={lessonForm.duration}
                    onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Lecture / Video URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={lessonForm.videoUrl}
                    onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Teaching Notes & Concepts *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Summary of pronunciation points or exercise steps..."
                  value={lessonForm.content}
                  onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setLessonModalOpen(false)} className="px-3 py-1.5 text-xs font-bold text-slate-500">Cancel</button>
                <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">
                  {actionLoading ? 'Saving...' : 'Add Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Modal: Edit Lesson */}
      {editLessonModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <Edit className="w-5 h-5 text-emerald-600" />
              <span>Edit Lesson</span>
            </h3>

            <form onSubmit={handleUpdateLesson} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Lesson Title *</label>
                <input
                  type="text"
                  required
                  value={editLessonForm.title}
                  onChange={(e) => setEditLessonForm({ ...editLessonForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Pacing Duration</label>
                  <input
                    type="text"
                    value={editLessonForm.duration}
                    onChange={(e) => setEditLessonForm({ ...editLessonForm, duration: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Lecture / Video URL</label>
                  <input
                    type="text"
                    value={editLessonForm.videoUrl}
                    onChange={(e) => setEditLessonForm({ ...editLessonForm, videoUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Teaching Notes & Concepts *</label>
                <textarea
                  rows={3}
                  required
                  value={editLessonForm.content}
                  onChange={(e) => setEditLessonForm({ ...editLessonForm, content: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditLessonModalOpen(false)} className="px-3 py-1.5 text-xs font-bold text-slate-500">Cancel</button>
                <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">
                  {actionLoading ? 'Saving...' : 'Update Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Modal: Add Test */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl my-8">
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-purple-600" />
              <span>Add Chapter Diagnostic Quiz / Test</span>
            </h3>

            <form onSubmit={handleAddTest} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Test Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 1: Makharij Diagnostic Test"
                  value={testForm.title}
                  onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-purple-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Passing Percentage (%)</label>
                  <input
                    type="number"
                    value={testForm.passingScore}
                    onChange={(e) => setTestForm({ ...testForm, passingScore: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Instructions</label>
                  <input
                    type="text"
                    value={testForm.instructions}
                    onChange={(e) => setTestForm({ ...testForm, instructions: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Question 1 Editor */}
              <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-200 space-y-2">
                <span className="text-xs font-black text-purple-900 block">Diagnostic MCQ Question:</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Which letter articulates from the throat (Halq)?"
                  value={testForm.questions[0]?.question || ''}
                  onChange={(e) => {
                    const q = [...testForm.questions];
                    q[0].question = e.target.value;
                    setTestForm({ ...testForm, questions: q });
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                />

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {[0, 1, 2, 3].map((optIdx) => (
                    <div key={optIdx}>
                      <input
                        type="text"
                        required
                        placeholder={`Option ${optIdx + 1}`}
                        value={testForm.questions[0]?.options[optIdx] || ''}
                        onChange={(e) => {
                          const q = [...testForm.questions];
                          q[0].options[optIdx] = e.target.value;
                          setTestForm({ ...testForm, questions: q });
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-1">
                  <label className="text-[11px] font-bold text-slate-600 mr-2">Correct Answer:</label>
                  <select
                    value={testForm.questions[0]?.correctAnswer || 0}
                    onChange={(e) => {
                      const q = [...testForm.questions];
                      q[0].correctAnswer = Number(e.target.value);
                      setTestForm({ ...testForm, questions: q });
                    }}
                    className="px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-bold text-emerald-700"
                  >
                    <option value={0}>Option 1 is correct</option>
                    <option value={1}>Option 2 is correct</option>
                    <option value={2}>Option 3 is correct</option>
                    <option value={3}>Option 4 is correct</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setTestModalOpen(false)} className="px-3 py-1.5 text-xs font-bold text-slate-500">Cancel</button>
                <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold">
                  {actionLoading ? 'Saving...' : 'Save Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Modal: Edit Test */}
      {editTestModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl my-8">
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <Edit className="w-5 h-5 text-purple-600" />
              <span>Edit Diagnostic Test</span>
            </h3>

            <form onSubmit={handleUpdateTest} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Test Title *</label>
                <input
                  type="text"
                  required
                  value={editTestForm.title}
                  onChange={(e) => setEditTestForm({ ...editTestForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-purple-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Passing Percentage (%)</label>
                  <input
                    type="number"
                    value={editTestForm.passingScore}
                    onChange={(e) => setEditTestForm({ ...editTestForm, passingScore: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Instructions</label>
                  <input
                    type="text"
                    value={editTestForm.instructions}
                    onChange={(e) => setEditTestForm({ ...editTestForm, instructions: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Question 1 Editor */}
              {editTestForm.questions?.length > 0 && (
                <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-200 space-y-2">
                  <span className="text-xs font-black text-purple-900 block">MCQ Question:</span>
                  <input
                    type="text"
                    required
                    value={editTestForm.questions[0]?.question || ''}
                    onChange={(e) => {
                      const q = [...editTestForm.questions];
                      q[0].question = e.target.value;
                      setEditTestForm({ ...editTestForm, questions: q });
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {[0, 1, 2, 3].map((optIdx) => (
                      <div key={optIdx}>
                        <input
                          type="text"
                          required
                          placeholder={`Option ${optIdx + 1}`}
                          value={editTestForm.questions[0]?.options[optIdx] || ''}
                          onChange={(e) => {
                            const q = [...editTestForm.questions];
                            q[0].options[optIdx] = e.target.value;
                            setEditTestForm({ ...editTestForm, questions: q });
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="pt-1">
                    <label className="text-[11px] font-bold text-slate-600 mr-2">Correct Answer:</label>
                    <select
                      value={editTestForm.questions[0]?.correctAnswer || 0}
                      onChange={(e) => {
                        const q = [...editTestForm.questions];
                        q[0].correctAnswer = Number(e.target.value);
                        setEditTestForm({ ...editTestForm, questions: q });
                      }}
                      className="px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-bold text-emerald-700"
                    >
                      <option value={0}>Option 1 is correct</option>
                      <option value={1}>Option 2 is correct</option>
                      <option value={2}>Option 3 is correct</option>
                      <option value={3}>Option 4 is correct</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditTestModalOpen(false)} className="px-3 py-1.5 text-xs font-bold text-slate-500">Cancel</button>
                <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold">
                  {actionLoading ? 'Saving...' : 'Update Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. Modal: Add Assignment */}
      {assignmentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-600" />
              <span>Add Student Assignment</span>
            </h3>

            <form onSubmit={handleAddAssignment} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Assignment Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Audio Recitation of First 8 Letters"
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Submission Type</label>
                  <select
                    value={assignmentForm.submissionType}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, submissionType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="audio_recitation">Audio Recitation</option>
                    <option value="file_upload">File / Photo Upload</option>
                    <option value="text">Written Answer</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Due in (Days)</label>
                  <input
                    type="number"
                    value={assignmentForm.dueDateDays}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDateDays: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Task Instructions *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail what the student needs to submit and how you will evaluate it..."
                  value={assignmentForm.instructions}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, instructions: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setAssignmentModalOpen(false)} className="px-3 py-1.5 text-xs font-bold text-slate-500">Cancel</button>
                <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
                  {actionLoading ? 'Saving...' : 'Save Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 10. Modal: Edit Assignment */}
      {editAssignmentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-600" />
              <span>Edit Assignment</span>
            </h3>

            <form onSubmit={handleUpdateAssignment} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Assignment Title *</label>
                <input
                  type="text"
                  required
                  value={editAssignmentForm.title}
                  onChange={(e) => setEditAssignmentForm({ ...editAssignmentForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Submission Type</label>
                  <select
                    value={editAssignmentForm.submissionType}
                    onChange={(e) => setEditAssignmentForm({ ...editAssignmentForm, submissionType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="audio_recitation">Audio Recitation</option>
                    <option value="file_upload">File / Photo Upload</option>
                    <option value="text">Written Answer</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Due in (Days)</label>
                  <input
                    type="number"
                    value={editAssignmentForm.dueDateDays}
                    onChange={(e) => setEditAssignmentForm({ ...editAssignmentForm, dueDateDays: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Task Instructions *</label>
                <textarea
                  rows={3}
                  required
                  value={editAssignmentForm.instructions}
                  onChange={(e) => setEditAssignmentForm({ ...editAssignmentForm, instructions: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditAssignmentModalOpen(false)} className="px-3 py-1.5 text-xs font-bold text-slate-500">Cancel</button>
                <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
                  {actionLoading ? 'Saving...' : 'Update Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
