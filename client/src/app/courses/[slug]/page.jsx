'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  BookOpen,
  Sparkles,
  Clock,
  Award,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Baby,
  Users,
  Video,
  Star,
  Check,
  Calendar,
  MessageSquare,
  Volume2,
  Layers,
  HelpCircle,
  ClipboardList,
  FileText,
  Lock
} from 'lucide-react';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import TutorCard from '../../../components/tutor/TutorCard';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { slug } = params;
  const { user, isAuthenticated } = useAuth();

  const [course, setCourse] = useState(null);
  const [matchingTutors, setMatchingTutors] = useState([]);
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [curriculumTab, setCurriculumTab] = useState('stages');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const res = await api.getCourseBySlug(slug);
        if (res.success) {
          setCourse(res.course);
          setMatchingTutors(res.matchingTutors || []);
          if ((!res.course.stages || res.course.stages.length === 0) && res.course.chapters?.length > 0) {
            setCurriculumTab('chapters');
          }
        }
      } catch (err) {
        console.error('Error fetching course:', err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchCourse();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Course Not Found</h2>
        <p className="text-slate-500 mt-2">The requested curriculum could not be located.</p>
        <Link href="/courses" className="mt-4 px-6 py-2.5 bg-[#b85d34] hover:bg-[#9e4e2a] text-white rounded-xl font-bold text-xs shadow-md">
          Return to Courses
        </Link>
      </div>
    );
  }

  const activeStage = course.stages?.[activeStageIndex] || course.stages?.[0];

  const allTests = [];
  const allAssignments = [];
  course?.chapters?.forEach(ch => {
    ch.tests?.forEach(t => allTests.push({ ...t, chapterTitle: ch.title, chapterNumber: ch.chapterNumber }));
    ch.assignments?.forEach(a => allAssignments.push({ ...a, chapterTitle: ch.title, chapterNumber: ch.chapterNumber }));
  });

  const totalChaptersCount = course?.chapters?.length || 0;
  let totalLessonsCount = 0;
  course?.chapters?.forEach(ch => {
    totalLessonsCount += (ch.lessons?.length || 0);
  });
  if (totalLessonsCount === 0 && course?.totalLessons) {
    totalLessonsCount = course.totalLessons;
  }

  const courseJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Course',
        '@id': `https://pakistanlms.pk/courses/${slug}#course`,
        name: course.title,
        description: course.shortDescription || course.description || `${course.title} curriculum on IlmiDunya Pakistan`,
        provider: {
          '@type': 'EducationalOrganization',
          name: 'IlmiDunya Pakistan',
          sameAs: 'https://pakistanlms.pk'
        },
        educationalLevel: course.targetAudience || 'All Ages',
        inLanguage: 'en',
        offers: {
          '@type': 'Offer',
          category: 'Paid',
          priceCurrency: 'PKR',
          availability: 'https://schema.org/InStock'
        }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://pakistanlms.pk'
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Courses',
            item: 'https://pakistanlms.pk/courses'
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: course.title,
            item: `https://pakistanlms.pk/courses/${slug}`
          }
        ]
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      <div className="min-h-screen bg-[#faf8f5] py-8 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-[#b85d34]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/courses" className="hover:text-[#b85d34]">Courses</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 font-bold truncate">{course.title}</span>
        </div>

        {/* Hero Section Banner */}
        <div className="bg-gradient-to-br from-slate-950 via-[#0c2217] to-slate-950 rounded-3xl p-6 sm:p-12 text-white border border-[#d4a359]/30 shadow-2xl relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-5">
              <div className="flex flex-wrap gap-2">
                <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-[#b85d34] text-white flex items-center gap-1.5 shadow-md">
                  <Baby className="w-3.5 h-3.5" />
                  <span>{course.targetAudience}</span>
                </span>
                
                <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-white/10 text-[#d4a359] border border-[#d4a359]/30 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{course.sessionDuration} per class</span>
                </span>

                <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{course.totalLessons} Structured Lessons in {course.stages?.length} Stages</span>
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                {course.title}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
                {course.description}
              </p>

              {/* Quick Key Facts */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Attention Span</span>
                  <span className="text-sm font-extrabold text-[#d4a359]">15–20 Min Micro-Lessons</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Free Trial</span>
                  <span className="text-sm font-extrabold text-[#d4a359]">3 Days (Stage 1, L1–2)</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Parent Updates</span>
                  <span className="text-sm font-extrabold text-[#d4a359]">Post-Class Summaries</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/tutors?category=nazra-quran"
                  className="px-8 py-3.5 bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-black text-sm rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Book 3-Day Free Trial for Child</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#curriculum"
                  className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-2xl border border-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <span>View 4 Stages & Lessons</span>
                  <ChevronDown className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Right Card / Tuition Highlight */}
            <div className="lg:col-span-4">
              <div className="bg-slate-950/80 rounded-3xl border border-[#d4a359]/40 p-6 sm:p-7 space-y-4 shadow-xl backdrop-blur-xl">
                <div className="p-3 bg-[#0c2217]/60 rounded-2xl border border-[#d4a359]/30 text-center">
                  <span className="text-[11px] font-bold text-[#d4a359] uppercase tracking-wider block">Recommended Tuition</span>
                  <span className="text-2xl font-black text-white">
                    PKR {course.priceSuggested?.amount?.toLocaleString() || '3,500'}
                    <span className="text-xs font-normal text-slate-400"> / {course.priceSuggested?.unit || 'month'}</span>
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Direct tutor agreement with flexible scheduling</p>
                </div>

                {/* Course Instructor Attribution */}
                {course.instructor && (
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                    <img
                      src={course.instructor.avatar || '/images/tutors/qari-huzaifa.jpg'}
                      alt={course.instructor.name}
                      className="w-12 h-12 rounded-xl object-cover border border-[#d4a359]/40 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-[#d4a359] block">Course Instructor</span>
                      <h4 className="font-extrabold text-sm text-white truncate">{course.instructor.name}</h4>
                      <p className="text-[11px] text-slate-300">
                        <span>{course.instructor.city || 'Pakistan'}</span>
                        {course.tutorProfile?.isSanadVerified && (
                          <span className="text-[#d4a359] font-bold ml-1">
                            &bull; Sanad Verified Tutor
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#d4a359] shrink-0" />
                    <span>1-on-1 Dedicated Sanad-Certified Teacher</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#d4a359] shrink-0" />
                    <span>Interactive WebRTC Video Classroom</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#d4a359] shrink-0" />
                    <span>Digital Stage Badges & Certificate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#d4a359] shrink-0" />
                    <span>No credit card required for 3-day trial</span>
                  </div>
                </div>

                <Link
                  href="/login?role=student"
                  className="block w-full py-3 bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-bold text-xs rounded-xl text-center shadow-lg transition-all"
                >
                  Start with Free Trial
                </Link>
              </div>
            </div>

          </div>

        </div>

        {/* Pediatric Design Principles */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#b85d34]" />
              <span>Design Principles for Kids&apos; Lessons</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              How our curriculum is specifically calibrated for young attention spans (Ages 5–12)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {course.designPrinciples?.map((dp, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-[#d4a359]/40 hover:shadow-md transition-all space-y-2"
              >
                <div className="w-9 h-9 rounded-2xl bg-[#f0ece1] text-[#0c2217] flex items-center justify-center font-bold text-xs">
                  {idx + 1}
                </div>
                <h3 className="font-extrabold text-sm text-slate-900">{dp.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{dp.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Curriculum with Chapters, Tests & Assignments */}
        <section id="curriculum" className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Award className="w-6 h-6 text-[#b85d34]" />
                <span>Curriculum, Chapters, Tests & Homework</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Explore the complete modular syllabus crafted by the instructor tutor.
              </p>
            </div>

            {/* Curriculum Tab Switcher */}
            <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-200/80 rounded-2xl self-start sm:self-auto">
              {course.stages?.length > 0 && (
                <button
                  onClick={() => setCurriculumTab('stages')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    curriculumTab === 'stages'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Stages Roadmap
                </button>
              )}

              {course.chapters?.length > 0 && (
                <button
                  onClick={() => setCurriculumTab('chapters')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    curriculumTab === 'chapters'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Chapters & Lessons ({course.chapters.length})
                </button>
              )}

              {allTests.length > 0 && (
                <button
                  onClick={() => setCurriculumTab('tests')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    curriculumTab === 'tests'
                      ? 'bg-white text-purple-900 shadow-xs'
                      : 'text-slate-600 hover:text-purple-800'
                  }`}
                >
                  Tests & Quizzes ({allTests.length})
                </button>
              )}

              {allAssignments.length > 0 && (
                <button
                  onClick={() => setCurriculumTab('assignments')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    curriculumTab === 'assignments'
                      ? 'bg-white text-blue-900 shadow-xs'
                      : 'text-slate-600 hover:text-blue-800'
                  }`}
                >
                  Assignments ({allAssignments.length})
                </button>
              )}
            </div>
          </div>

          {/* Public & Registered Metric Summary Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 p-4 sm:p-5 bg-gradient-to-r from-[#0c2217] via-slate-950 to-[#0c2217] text-white rounded-3xl border border-[#d4a359]/30 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#0c2217] border border-[#d4a359]/40 text-[#d4a359] flex items-center justify-center font-black shrink-0">
                <BookOpen className="w-5 h-5 text-[#d4a359]" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#d4a359] block">
                  Course Outline
                </span>
                <span className="text-sm font-black text-white">
                  {totalChaptersCount} Chapters &bull; {totalLessonsCount} Lessons
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-900/70 border border-purple-500/40 text-purple-200 flex items-center justify-center font-black shrink-0">
                <HelpCircle className="w-5 h-5 text-purple-300" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 block">
                  Diagnostic Quizzes
                </span>
                <span className="text-sm font-black text-white">
                  {allTests.length} Diagnostic Tests
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-900/70 border border-blue-500/40 text-blue-200 flex items-center justify-center font-black shrink-0">
                <ClipboardList className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 block">
                  Homework & Recitation
                </span>
                <span className="text-sm font-black text-white">
                  {allAssignments.length} Assignments
                </span>
              </div>
            </div>
          </div>

          {/* Tab 1: Stages Roadmap */}
          {curriculumTab === 'stages' && course.stages?.length > 0 && (
            <div className="space-y-6">
              {/* Stage Selector Tabs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {course.stages.map((stage, idx) => {
                  const isSelected = activeStageIndex === idx;
                  return (
                    <button
                      key={stage.stageNumber}
                      onClick={() => setActiveStageIndex(idx)}
                      className={`p-4 rounded-3xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-slate-900 border-[#d4a359] text-white shadow-xl ring-2 ring-[#d4a359]/40 scale-[1.02]'
                          : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <span className={`text-[10px] font-black uppercase tracking-wider block ${isSelected ? 'text-[#d4a359]' : 'text-slate-400'}`}>
                          Stage {stage.stageNumber}
                        </span>
                        <h4 className="font-extrabold text-xs sm:text-sm mt-0.5 leading-snug">
                          {stage.name}
                        </h4>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200/40 flex items-center justify-between text-[11px]">
                        <span className={isSelected ? 'text-slate-300' : 'text-slate-500'}>
                          {stage.lessonCount} Lessons
                        </span>
                        <span className="text-[#d4a359] font-bold truncate ml-1">
                          {stage.badgeReward}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Stage Detailed Lesson Cards */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-[#0c2217] bg-[#f0ece1] px-3 py-1 rounded-full border border-[#d4a359]/40 inline-block mb-1">
                      Active View: Stage {activeStage.stageNumber} of {course.stages?.length}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                      {activeStage.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {activeStage.description}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-right shrink-0">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Milestone Reward</span>
                    <span className="text-xs font-black text-[#0c2217]">{activeStage.badgeReward}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {activeStage.lessons?.map((lesson) => (
                    <div
                      key={lesson.lessonNumber}
                      className="p-4 rounded-2xl bg-slate-50/80 hover:bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#0c2217] text-[#d4a359] font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                          {lesson.lessonNumber}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                            {lesson.title}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium">
                            {lesson.content}
                          </p>
                        </div>
                      </div>

                        <div className="sm:text-right text-left bg-[#f0ece1] text-[#0c2217] border border-[#d4a359]/40 px-3 py-1.5 rounded-xl text-[11px] font-semibold shrink-0 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span><strong className="font-bold">Kid-Friendly Approach:</strong> {lesson.approach}</span>
                        </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Chapters & Lessons */}
          {curriculumTab === 'chapters' && (
            <div className="space-y-6">
              {course.chapters?.map((chapter) => (
                <div key={chapter._id} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <span className="w-9 h-9 rounded-2xl bg-[#0c2217] text-[#d4a359] font-black text-sm flex items-center justify-center shadow-sm shrink-0">
                      {chapter.chapterNumber}
                    </span>
                    <div>
                      <h3 className="font-extrabold text-base sm:text-lg text-slate-900">{chapter.title}</h3>
                      {chapter.description && <p className="text-xs text-slate-500">{chapter.description}</p>}
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {chapter.lessons?.map((l) => (
                      <div key={l._id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-[#b85d34] shrink-0" />
                          <div>
                            <h5 className="font-bold text-slate-900">{l.title}</h5>
                            <p className="text-[11px] text-slate-500">{l.content}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-semibold text-slate-500">{l.duration}</span>
                          {l.videoUrl && (
                            <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                              <Video className="w-3 h-3" />
                              <span>Lecture</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Diagnostic Tests & Quizzes */}
          {curriculumTab === 'tests' && (
            <div className="space-y-6">
              {!isAuthenticated && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-purple-900 font-bold">
                    <Lock className="w-4 h-4 text-purple-700 shrink-0" />
                    <span>Public Preview: There are {allTests.length} diagnostic tests in this course. Test questions & quiz options are reserved for registered users.</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/login?redirect=/courses/${slug}`}
                      className="px-3 py-1.5 bg-purple-700 text-white font-bold rounded-xl hover:bg-purple-800 transition-all text-[11px]"
                    >
                      Sign In
                    </Link>
                    <Link
                      href={`/register?redirect=/courses/${slug}`}
                      className="px-3 py-1.5 bg-white border border-purple-300 text-purple-800 font-bold rounded-xl hover:bg-purple-50 transition-all text-[11px]"
                    >
                      Register Free
                    </Link>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {allTests.map((test) => (
                  <div key={test._id} className="bg-white rounded-3xl border border-purple-200 p-6 shadow-sm space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                          <HelpCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold uppercase text-purple-600 block">
                            {test.chapterTitle}
                          </span>
                          <h4 className="font-black text-sm text-slate-900">{test.title}</h4>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                        Passing: {test.passingScore}%
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">{test.instructions}</p>

                    {isAuthenticated ? (
                      <div className="p-3 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-2">
                        <span className="text-[11px] font-bold text-purple-900 block">Quiz Questions ({test.questions?.length || 0}):</span>
                        {test.questions?.map((q, qIdx) => (
                          <div key={qIdx} className="text-xs space-y-1">
                            <p className="font-semibold text-slate-800">Q{qIdx + 1}. {q.question}</p>
                            <div className="grid grid-cols-2 gap-1.5 pl-2 text-[11px] text-slate-600">
                              {q.options?.map((opt, oIdx) => (
                                <div key={oIdx} className="flex items-center gap-1">
                                  <span className="w-4 h-4 rounded-full bg-white border border-slate-300 text-[9px] flex items-center justify-center font-bold">{oIdx + 1}</span>
                                  <span className="truncate">{opt}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2.5">
                        <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto shadow-2xs">
                          <Lock className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-800">
                            {test.questionCount || test.questions?.length || 4} Quiz Questions & Answer Key
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm mx-auto">
                            Questions and automated grading are locked for public visitors. Sign in or register to take this test.
                          </p>
                        </div>
                        <div className="flex items-center justify-center gap-2 pt-1">
                          <Link
                            href={`/login?redirect=/courses/${slug}`}
                            className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-[11px] transition-all"
                          >
                            Sign In to Access
                          </Link>
                          <Link
                            href={`/register?redirect=/courses/${slug}`}
                            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-bold text-[11px] transition-all"
                          >
                            Register Free
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Student Homework Assignments */}
          {curriculumTab === 'assignments' && (
            <div className="space-y-6">
              {!isAuthenticated && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-blue-900 font-bold">
                    <Lock className="w-4 h-4 text-blue-700 shrink-0" />
                    <span>Public Preview: There are {allAssignments.length} homework assignments in this course. Detailed instructions & submission portals are reserved for registered users.</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/login?redirect=/courses/${slug}`}
                      className="px-3 py-1.5 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 transition-all text-[11px]"
                    >
                      Sign In
                    </Link>
                    <Link
                      href={`/register?redirect=/courses/${slug}`}
                      className="px-3 py-1.5 bg-white border border-blue-300 text-blue-800 font-bold rounded-xl hover:bg-blue-50 transition-all text-[11px]"
                    >
                      Register Free
                    </Link>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {allAssignments.map((asg) => (
                  <div key={asg._id} className="bg-white rounded-3xl border border-blue-200 p-6 shadow-sm space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                          <ClipboardList className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold uppercase text-blue-600 block">
                            {asg.chapterTitle}
                          </span>
                          <h4 className="font-black text-sm text-slate-900">{asg.title}</h4>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0 capitalize">
                        {asg.submissionType?.replace('_', ' ')}
                      </span>
                    </div>

                    {isAuthenticated ? (
                      <>
                        <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 text-xs text-slate-700 space-y-1.5">
                          <span className="font-bold text-blue-950 block">Instructions:</span>
                          <p className="leading-relaxed">{asg.instructions}</p>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                          <span>Submission Window: <strong>{asg.dueDateDays} Days</strong></span>
                          <span className="text-[#0c2217] font-bold">Evaluated by Tutor</span>
                        </div>
                      </>
                    ) : (
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2.5">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto shadow-2xs">
                          <Lock className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-800">
                            Submission Guidelines & Tutor Review Portal
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm mx-auto">
                            Assignment submission prompts and audio upload channels are unlocked for registered students.
                          </p>
                        </div>
                        <div className="flex items-center justify-center gap-2 pt-1">
                          <Link
                            href={`/login?redirect=/courses/${slug}`}
                            className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-[11px] transition-all"
                          >
                            Sign In to Access
                          </Link>
                          <Link
                            href={`/register?redirect=/courses/${slug}`}
                            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-bold text-[11px] transition-all"
                          >
                            Register Free
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </section>

        {/* Tutor Pediatric Teaching Tips */}
        <section className="bg-[#0c2217] text-[#faf8f5] rounded-3xl p-6 sm:p-8 border border-[#d4a359]/40 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-[#d4a359]" />
            <h3 className="font-black text-lg sm:text-xl">
              Faculty Pediatric Teaching Guidelines
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            All teachers assigned to this track adhere to positive psychological and pedagogical practices:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {course.tutorTips?.map((tip, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-white/10 border border-white/10 text-xs font-medium flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#d4a359] shrink-0 mt-0.5" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Available Certified Tutors for This Course */}
        {matchingTutors.length > 0 && (
          <section className="space-y-6 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Users className="w-6 h-6 text-[#b85d34]" />
                  <span>Available Certified Tutors for this Course</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Select a Sanad-certified teacher to start your child&apos;s 3-Day Free Trial
                </p>
              </div>

              <Link
                href="/tutors?category=nazra-quran"
                className="text-xs font-bold text-[#b85d34] hover:underline flex items-center gap-1"
              >
                <span>View all verified teachers</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchingTutors.map((tutor) => (
                <TutorCard key={tutor._id} tutor={tutor} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
    </>
  );
}

