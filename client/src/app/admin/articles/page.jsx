'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { api } from '../../../services/api';
import ArticleContentRenderer from '../../../components/articles/ArticleContentRenderer';
import {
  Newspaper,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Tag,
  Image as ImageIcon,
  BookOpen,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
  X,
  FileText,
  Save,
  Check,
  ShieldCheck,
  Heart,
  Upload,
  UploadCloud,
  Link2
} from 'lucide-react';

const AUTHOR_OPTIONS = [
  {
    id: 'Abdul Khaliq',
    name: 'Abdul Khaliq',
    role: 'Co-Founder & Platform Director',
    description: 'Foundational perspectives on authentic Tajweed, tutor accountability, and technology in education.',
    badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
  },
  {
    id: 'Mrs. Abdul Khaliq',
    name: 'Mrs. Abdul Khaliq',
    role: 'Co-Founder & Female Safety Dean',
    description: 'Specializing in female student privacy, mother-child learning comfort, and certified Alimah guidance.',
    badgeClass: 'bg-amber-950/80 text-[#f5d996] border-[#d4a359]/60'
  },
  {
    id: 'Guest Author',
    name: 'Guest Author',
    role: 'Contributing Scholar / Guest Educator',
    description: 'Distinguished visiting Qaris, university lecturers, and Board examination academic specialists.',
    badgeClass: 'bg-purple-950/80 text-purple-300 border-purple-700/60'
  }
];

const PRESET_COVERS = [
  {
    name: 'Quran Study & Tajweed',
    url: 'https://images.unsplash.com/photo-1584281722572-8873404c0003?w=1200&auto=format&fit=crop&q=80'
  },
  {
    name: 'Islamic Academic Library',
    url: 'https://images.unsplash.com/photo-1532012164546-f432f2e37262?w=1200&auto=format&fit=crop&q=80'
  },
  {
    name: 'Family & Online Study',
    url: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1200&auto=format&fit=crop&q=80'
  },
  {
    name: 'Exam Mathematics & Science',
    url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&auto=format&fit=crop&q=80'
  }
];

const CATEGORY_PRESETS = [
  'Quran & Islamic Education',
  'Family & Child Privacy',
  'Academic & Board Preparation',
  'Tajweed & Makharij',
  'Parenting Advice',
  'Platform Announcements'
];

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAuthorFilter, setSelectedAuthorFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Form Fields
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    author: 'Abdul Khaliq',
    category: 'Quran & Islamic Education',
    coverImage: PRESET_COVERS[0].url,
    excerpt: '',
    content: '',
    readTime: '',
    tags: '',
    isPublished: true,
    metaTitle: '',
    metaDescription: ''
  });

  const [previewMode, setPreviewMode] = useState(false);

  // Image Upload State
  const fileInputRef = useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');
  const [imageTab, setImageTab] = useState('upload'); // 'upload' | 'url'
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Fetch articles
  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 15,
        search: searchQuery,
        status: selectedStatusFilter,
        author: selectedAuthorFilter
      };
      const res = await api.adminGetArticles(params);
      if (res && res.success) {
        setArticles(res.articles || []);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.total || 0);
      } else {
        setArticles([]);
        setTotalPages(1);
        setTotalCount(0);
      }
    } catch (err) {
      console.error('Error fetching articles in admin:', err);
      setArticles([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [page, selectedAuthorFilter, selectedStatusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchArticles();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle image file upload (file picker or drag-and-drop)
  const handleImageFileUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageUploadError('Please select a valid image file (JPG, PNG, WEBP, GIF).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setImageUploadError('Image size exceeds 10MB limit. Please choose a smaller image.');
      return;
    }

    try {
      setUploadingImage(true);
      setImageUploadError('');

      // Create instant optimistic preview with FileReader
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, coverImage: event.target.result }));
      };
      reader.readAsDataURL(file);

      // Upload to backend API
      const uploadData = new FormData();
      uploadData.append('image', file);

      const res = await api.adminUploadArticleImage(uploadData);
      if (res && res.success && res.imageUrl) {
        setFormData(prev => ({ ...prev, coverImage: res.imageUrl }));
      }
    } catch (err) {
      console.error('Feature image upload error:', err);
      // Keep optimistic preview but log error
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, coverImage: '' }));
    setImageUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle open editor for new article
  const handleOpenNew = () => {
    setEditingArticleId(null);
    setFormData({
      title: '',
      slug: '',
      author: 'Abdul Khaliq',
      category: 'Quran & Islamic Education',
      coverImage: PRESET_COVERS[0].url,
      excerpt: '',
      content: '',
      readTime: '',
      tags: '',
      isPublished: true,
      metaTitle: '',
      metaDescription: ''
    });
    setFeedback({ type: '', message: '' });
    setPreviewMode(false);
    setImageUploadError('');
    setImageTab('upload');
    setIsDraggingOver(false);
    setIsEditorOpen(true);
  };

  // Handle open editor for editing existing
  const handleOpenEdit = (article) => {
    setEditingArticleId(article._id);
    setFormData({
      title: article.title || '',
      slug: article.slug || '',
      author: article.author || 'Abdul Khaliq',
      category: article.category || 'Quran & Islamic Education',
      coverImage: article.coverImage || '',
      excerpt: article.excerpt || '',
      content: article.content || '',
      readTime: article.readTime || '',
      tags: Array.isArray(article.tags) ? article.tags.join(', ') : (article.tags || ''),
      isPublished: article.isPublished !== false,
      metaTitle: article.metaTitle || '',
      metaDescription: article.metaDescription || ''
    });
    setFeedback({ type: '', message: '' });
    setPreviewMode(false);
    setImageUploadError('');
    setImageTab('upload');
    setIsDraggingOver(false);
    setIsEditorOpen(true);
  };

  // Auto-generate slug and estimate read time on title/content change
  const handleTitleChange = (e) => {
    const title = e.target.value;
    const generatedSlug = title
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug && editingArticleId ? prev.slug : generatedSlug
    }));
  };

  const handleContentChange = (e) => {
    const content = e.target.value;
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    const estTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

    setFormData(prev => ({
      ...prev,
      content,
      readTime: prev.readTime ? prev.readTime : estTime
    }));
  };

  // Formatting helpers to insert markdown snippets
  const insertFormatting = (prefix, suffix = '') => {
    const textarea = document.getElementById('article-content-input');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selection = text.substring(start, end);
    const replacement = `${prefix}${selection || 'text'}${suffix}`;

    const updated = text.substring(0, start) + replacement + text.substring(end);
    setFormData(prev => ({ ...prev, content: updated }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selection.length || 4));
    }, 10);
  };

  // Submit Save/Update
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!formData.title.trim()) {
      setFeedback({ type: 'error', message: 'Please provide an article title.' });
      return;
    }
    if (!formData.content.trim()) {
      setFeedback({ type: 'error', message: 'Article content cannot be empty.' });
      return;
    }

    try {
      setSaving(true);
      setFeedback({ type: '', message: '' });

      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      };

      let res;
      if (editingArticleId) {
        res = await api.adminUpdateArticle(editingArticleId, payload);
      } else {
        res = await api.adminCreateArticle(payload);
      }

      if (res && res.success) {
        setFeedback({ type: 'success', message: res.message || 'Article saved successfully!' });
        setTimeout(() => {
          setIsEditorOpen(false);
          fetchArticles();
        }, 800);
      } else {
        setFeedback({ type: 'error', message: res?.message || 'Failed to save article.' });
      }
    } catch (err) {
      console.error('Save error:', err);
      setFeedback({ type: 'error', message: err.message || 'Error occurred while saving article.' });
    } finally {
      setSaving(false);
    }
  };

  // Delete article
  const handleDelete = async (id, title, slug) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      return;
    }

    try {
      const res = await api.adminDeleteArticle(id);
      if (res && res.success) {
        setArticles(prev => prev.filter(a => a._id !== id && (!slug || a.slug !== slug)));
        fetchArticles();
      } else {
        alert(res?.message || 'Failed to delete article');
      }
    } catch (err) {
      alert(err.message || 'Error deleting article');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#d4a359]/20 text-[#d4a359] rounded-xl border border-[#d4a359]/30">
                  <Newspaper className="w-5 h-5" />
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white">Articles &amp; Editorial CMS</h1>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Publish authentic educational essays, Tajweed guides, family privacy insights, and platform announcements.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/articles"
                target="_blank"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition-all"
              >
                <span>Live Blog</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={handleOpenNew}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4a359] to-[#c2934c] hover:brightness-105 text-stone-950 text-xs font-black shadow-lg shadow-[#d4a359]/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Write Article</span>
              </button>
            </div>
          </div>

          {/* Metrics Quick Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Articles</span>
              <p className="text-2xl font-black text-white mt-1">{totalCount}</p>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Published</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">
                {articles.filter(a => a.isPublished).length}
              </p>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Drafts</span>
              <p className="text-2xl font-black text-amber-400 mt-1">
                {articles.filter(a => !a.isPublished).length}
              </p>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[11px] font-bold text-[#d4a359] uppercase tracking-wider">Total Views</span>
              <p className="text-2xl font-black text-[#d4a359] mt-1">
                {articles.reduce((acc, a) => acc + (a.views || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center gap-3 justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search articles by title or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#d4a359]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Status Filter */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => { setSelectedStatusFilter(e.target.value); setPage(1); }}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-[#d4a359]"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
              </select>

              {/* Author Filter */}
              <select
                value={selectedAuthorFilter}
                onChange={(e) => { setSelectedAuthorFilter(e.target.value); setPage(1); }}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-[#d4a359]"
              >
                <option value="all">All Authors</option>
                <option value="Abdul Khaliq">Abdul Khaliq</option>
                <option value="Mrs. Abdul Khaliq">Mrs. Abdul Khaliq</option>
                <option value="Guest Author">Guest Author</option>
              </select>
            </div>
          </div>

          {/* Articles List / Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            {loading ? (
              <div className="p-12 text-center">
                <LoadingSpinner />
                <p className="text-xs text-slate-400 mt-2">Loading editorial articles...</p>
              </div>
            ) : articles.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">No articles found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {searchQuery || selectedAuthorFilter !== 'all' || selectedStatusFilter !== 'all'
                    ? 'Try clearing the search query or author filter.'
                    : 'Get started by publishing your first article for IlmiDunya parents and students.'}
                </p>
                <button
                  onClick={handleOpenNew}
                  className="px-4 py-2 bg-[#d4a359] text-stone-950 font-bold text-xs rounded-xl hover:brightness-105"
                >
                  Write First Article
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {articles.map((article) => {
                  const authorInfo = AUTHOR_OPTIONS.find(a => a.id === article.author) || AUTHOR_OPTIONS[0];

                  return (
                    <div
                      key={article._id || article.slug}
                      className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Left: Thumbnail + Titles */}
                      <div className="flex items-start gap-4 flex-1">
                        {article.coverImage ? (
                          <img
                            src={article.coverImage}
                            alt={article.title}
                            className="w-20 h-16 sm:w-28 sm:h-20 rounded-xl object-cover border border-slate-700 shrink-0 bg-slate-800"
                          />
                        ) : (
                          <div className="w-20 h-16 sm:w-28 sm:h-20 rounded-xl border border-slate-700 shrink-0 bg-slate-800 flex items-center justify-center text-slate-600">
                            <Newspaper className="w-6 h-6" />
                          </div>
                        )}

                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                              {article.category || 'General'}
                            </span>

                            {/* Author Pill */}
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${authorInfo.badgeClass}`}>
                              {article.author === 'Abdul Khaliq' && '👑 '}
                              {article.author === 'Mrs. Abdul Khaliq' && '🌸 '}
                              {article.author}
                            </span>

                            {/* Status */}
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              article.isPublished
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}>
                              {article.isPublished ? 'Published' : 'Draft'}
                            </span>
                          </div>

                          <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-2xl">
                            {article.title}
                          </h3>

                          <p className="text-xs text-slate-400 line-clamp-1 max-w-xl">
                            {article.excerpt || 'No summary provided.'}
                          </p>

                          <div className="flex items-center gap-4 text-[11px] text-slate-500">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {article.readTime || '5 min read'}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {(article.views || 0).toLocaleString()} views
                            </span>
                            <span>
                              {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Unpublished'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        {article.isPublished && (
                          <Link
                            href={`/articles/${article.slug}`}
                            target="_blank"
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors"
                            title="View Public Article"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        )}

                        <button
                          onClick={() => handleOpenEdit(article)}
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5 text-[#d4a359]" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDelete(article._id, article.title, article.slug)}
                          className="p-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 rounded-xl border border-rose-900/50 transition-colors cursor-pointer"
                          title="Delete Article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Full-Featured Article Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex justify-center p-3 sm:p-6 lg:p-10">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#d4a359]/20 text-[#d4a359] rounded-xl border border-[#d4a359]/30">
                  <Edit className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white">
                    {editingArticleId ? 'Edit Article' : 'Write New Article'}
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Author, content formatting, and publication settings
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Feedback alert */}
              {feedback.message && (
                <div className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 border ${
                  feedback.type === 'error'
                    ? 'bg-rose-950/50 border-rose-800 text-rose-300'
                    : 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                }`}>
                  {feedback.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                  <span>{feedback.message}</span>
                </div>
              )}

              {/* 1. Author Picker: The 3 Choices Requested by User */}
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-[#d4a359]">
                  Select Author (Bylines) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {AUTHOR_OPTIONS.map((auth) => {
                    const isSelected = formData.author === auth.id;
                    return (
                      <div
                        key={auth.id}
                        onClick={() => setFormData(prev => ({ ...prev, author: auth.id }))}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                          isSelected
                            ? 'bg-slate-800 border-[#d4a359] shadow-lg shadow-[#d4a359]/10 ring-1 ring-[#d4a359]'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-black text-xs text-white flex items-center gap-1.5">
                              {auth.id === 'Abdul Khaliq' && '👑'}
                              {auth.id === 'Mrs. Abdul Khaliq' && '🌸'}
                              {auth.id === 'Guest Author' && '✍️'}
                              {auth.name}
                            </span>
                            {isSelected && (
                              <div className="w-4 h-4 rounded-full bg-[#d4a359] text-stone-950 flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </div>
                            )}
                          </div>
                          <p className="text-[10px] text-[#d4a359] font-medium leading-tight mb-2">
                            {auth.role}
                          </p>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {auth.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Article Title & Slug */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Article Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Why Camera-Off Learning Builds Confidence for Pakistani Children"
                    value={formData.title}
                    onChange={handleTitleChange}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#d4a359]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">URL Slug / Permalink</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="auto-generated-slug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono focus:outline-none focus:border-[#d4a359]"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Category & Read Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Category</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      list="category-presets"
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#d4a359]"
                    />
                    <datalist id="category-presets">
                      {CATEGORY_PRESETS.map(c => <option key={c} value={c} />)}
                    </datalist>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Read Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 5 min read"
                    value={formData.readTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, readTime: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#d4a359]"
                  />
                </div>
              </div>

              {/* 4. Featured Cover Image (Upload from Computer or URL/Presets) */}
              <div className="space-y-3 bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-amber-400">
                      Featured Cover Image
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Recommended: 1200 × 630 px (16:9 ratio). Upload from your device or use an external URL.
                    </p>
                  </div>

                  {/* Mode switcher tabs */}
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setImageTab('upload')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        imageTab === 'upload'
                          ? 'bg-[#d4a359] text-stone-950 shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload from Device</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageTab('url')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        imageTab === 'url'
                          ? 'bg-[#d4a359] text-stone-950 shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      <span>URL &amp; Presets</span>
                    </button>
                  </div>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageFileUpload(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                {imageTab === 'upload' ? (
                  <div>
                    {formData.coverImage ? (
                      /* Preview with Actions */
                      <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-900/90 group">
                        <div className="relative h-48 sm:h-60 w-full overflow-hidden">
                          <img
                            src={formData.coverImage}
                            alt="Featured preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                          {/* Uploading overlay */}
                          {uploadingImage && (
                            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white">
                              <LoadingSpinner />
                              <span className="text-xs font-bold">Uploading featured image...</span>
                            </div>
                          )}

                          {/* Top pill */}
                          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-600/70 text-emerald-300 text-[11px] font-bold backdrop-blur-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Featured Image Active</span>
                          </div>

                          {/* Bottom controls */}
                          <div className="absolute bottom-3 inset-x-3 flex items-center justify-between gap-2">
                            <span className="text-[11px] text-slate-300 font-mono truncate max-w-xs bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                              {formData.coverImage.startsWith('data:') ? 'Uploaded Image' : formData.coverImage}
                            </span>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingImage}
                                className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-bold border border-slate-600 backdrop-blur-xs flex items-center gap-1.5 transition-all cursor-pointer"
                              >
                                <Upload className="w-3.5 h-3.5 text-[#d4a359]" />
                                <span>Change Image</span>
                              </button>

                              <button
                                type="button"
                                onClick={handleRemoveImage}
                                disabled={uploadingImage}
                                className="p-1.5 rounded-xl bg-rose-950/90 hover:bg-rose-900 text-rose-300 border border-rose-700 backdrop-blur-xs transition-all cursor-pointer"
                                title="Remove Image"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Drag & Drop Upload Zone */
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-3 ${
                          isDraggingOver
                            ? 'border-[#d4a359] bg-[#d4a359]/10 scale-[1.01]'
                            : 'border-slate-700/80 hover:border-[#d4a359]/70 bg-slate-900/50 hover:bg-slate-900/80'
                        }`}
                      >
                        {uploadingImage ? (
                          <div className="space-y-2 py-4">
                            <LoadingSpinner />
                            <p className="text-xs font-bold text-slate-300">Uploading featured image...</p>
                          </div>
                        ) : (
                          <>
                            <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-[#d4a359] transition-transform">
                              <UploadCloud className="w-7 h-7" />
                            </div>

                            <div className="space-y-1">
                              <p className="text-xs sm:text-sm font-bold text-white">
                                <span className="text-[#d4a359] underline decoration-[#d4a359]/60 underline-offset-2">Click to browse</span> or drag and drop image here
                              </p>
                              <p className="text-[11px] text-slate-400">
                                Supports PNG, JPG, WEBP, or GIF (max 10MB)
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                fileInputRef.current?.click();
                              }}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all cursor-pointer"
                            >
                              <ImageIcon className="w-3.5 h-3.5 text-[#d4a359]" />
                              <span>Select Image from Computer / Phone</span>
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {imageUploadError && (
                      <p className="text-xs font-semibold text-rose-400 mt-2 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{imageUploadError}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  /* URL & Presets Mode */
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="Paste image URL (https://images.unsplash.com/...)"
                        value={formData.coverImage}
                        onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#d4a359]"
                      />
                      {formData.coverImage && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-700"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Presets */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Curated Cover Presets:</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {PRESET_COVERS.map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, coverImage: preset.url }));
                              setImageUploadError('');
                            }}
                            className={`p-2 rounded-xl border text-left flex flex-col gap-1.5 transition-all cursor-pointer group ${
                              formData.coverImage === preset.url
                                ? 'border-[#d4a359] bg-[#d4a359]/10'
                                : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700'
                            }`}
                          >
                            <img
                              src={preset.url}
                              alt={preset.name}
                              className="w-full h-14 rounded-lg object-cover border border-slate-800"
                            />
                            <span className="text-[10px] font-bold text-slate-300 line-clamp-1 group-hover:text-white">
                              {preset.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Live Preview if URL entered */}
                    {formData.coverImage && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-slate-800 h-36 w-full relative">
                        <img
                          src={formData.coverImage}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-black/70 text-white backdrop-blur-xs">
                          Preview
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 5. Excerpt / Summary */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-300">Short Summary / Excerpt</label>
                  <span className="text-[10px] text-slate-400">Displayed on article cards and search results</span>
                </div>
                <textarea
                  rows={2}
                  placeholder="A concise 2-sentence summary highlighting what parents and students will learn from this article."
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#d4a359]"
                />
              </div>

              {/* 6. Content Editor (With Format Bar & Live Preview Toggle) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black uppercase tracking-wider text-[#d4a359]">
                    Article Content (Markdown / Text) *
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewMode(false)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        !previewMode
                          ? 'bg-slate-800 text-white border border-slate-700'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode(true)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        previewMode
                          ? 'bg-[#d4a359] text-stone-950 font-black'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Live Preview
                    </button>
                  </div>
                </div>

                {/* Toolbar */}
                {!previewMode && (
                  <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-950 border border-slate-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => insertFormatting('## ')}
                      className="px-2.5 py-1 bg-amber-500/20 text-[#f5d996] hover:bg-amber-500/30 border border-amber-500/40 text-xs font-black rounded-md"
                      title="H2 - Major Section Heading (Recommended for SEO)"
                    >
                      H2 (Section)
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('### ')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-md"
                      title="H3 - Subsection Heading"
                    >
                      H3 (Sub)
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('#### ')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-md"
                      title="H4 - Topic / Minor Heading"
                    >
                      H4 (Topic)
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('**', '**')}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-md"
                      title="Bold"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('*', '*')}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs italic rounded-md"
                      title="Italic"
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('* ')}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-md"
                      title="Bullet point"
                    >
                      • Bullet
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('> ')}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-md"
                      title="Blockquote"
                    >
                      Quote
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('\n---\n')}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-md"
                      title="Horizontal Divider"
                    >
                      Divider
                    </button>
                  </div>
                )}

                {!previewMode ? (
                  <textarea
                    id="article-content-input"
                    rows={14}
                    required
                    placeholder="Write your article here using markdown formatting..."
                    value={formData.content}
                    onChange={handleContentChange}
                    className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-100 font-mono leading-relaxed focus:outline-none focus:border-[#d4a359]"
                  />
                ) : (
                  <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl min-h-[300px] max-h-[500px] overflow-y-auto">
                    <div className="pb-4 border-b border-slate-800 mb-6">
                      <span className="text-xs text-[#d4a359] font-bold uppercase">{formData.category}</span>
                      <h1 className="text-xl sm:text-2xl font-black text-white mt-1 font-serif">{formData.title || 'Untitled Article'}</h1>
                      <p className="text-xs text-slate-400 mt-1">By {formData.author} • {formData.readTime || '5 min read'}</p>
                    </div>
                    {formData.content ? (
                      <ArticleContentRenderer content={formData.content} variant="dark" />
                    ) : (
                      <em className="text-slate-500 text-xs">No content entered yet.</em>
                    )}
                  </div>
                )}
              </div>

              {/* 7. Tags & SEO Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Tags (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="Quran, Tajweed, Family Privacy, Pakistan"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#d4a359]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Publication Status</label>
                  <div className="flex items-center gap-4 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="isPublished"
                        checked={formData.isPublished === true}
                        onChange={() => setFormData(prev => ({ ...prev, isPublished: true }))}
                        className="text-[#d4a359] focus:ring-[#d4a359]"
                      />
                      <span className="text-xs font-bold text-emerald-400">Published (Visible to all)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="isPublished"
                        checked={formData.isPublished === false}
                        onChange={() => setFormData(prev => ({ ...prev, isPublished: false }))}
                        className="text-[#d4a359] focus:ring-[#d4a359]"
                      />
                      <span className="text-xs font-bold text-amber-400">Draft (Private)</span>
                    </label>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
              <div className="text-[11px] text-slate-400">
                Author: <strong className="text-white">{formData.author}</strong>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSave}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#d4a359] to-[#c2934c] hover:brightness-105 text-stone-950 text-xs font-black rounded-xl shadow-lg shadow-[#d4a359]/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{editingArticleId ? 'Update Article' : 'Publish Article'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

