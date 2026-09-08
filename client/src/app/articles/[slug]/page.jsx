import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Newspaper,
  Calendar,
  Clock,
  User,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Share2,
  ChevronRight,
  Sparkles,
  Heart,
  GraduationCap
} from 'lucide-react';
import { api } from '../../../services/api';
import {
  getEditorialArticles,
  getEditorialArticleBySlug,
  getRelatedEditorialArticles
} from '../../../data/editorialArticles';
import ArticleContentRenderer from '../../../components/articles/ArticleContentRenderer';

export const revalidate = 60; // ISR cache for 60 seconds

// Prerender foundational editorial articles at build time so they never 404
export function generateStaticParams() {
  return getEditorialArticles().map((article) => ({
    slug: article.slug,
  }));
}

// Dynamic SEO metadata generator with resilient fallback
export async function generateMetadata({ params }) {
  let article = null;

  try {
    const res = await api.getArticleBySlug(params.slug);
    if (res && res.success && res.article) {
      article = res.article;
    }
  } catch (e) {
    // Backend warming up or deploying
  }

  // Resilient fallback to built-in editorial catalog
  if (!article) {
    article = getEditorialArticleBySlug(params.slug);
  }

  if (article) {
    return {
      title: `${article.metaTitle || article.title} | IlmiDunya Pakistan`,
      description: article.metaDescription || article.excerpt || 'Educational article on IlmiDunya Pakistan.',
      alternates: {
        canonical: `https://ilmidunya.com/articles/${article.slug || params.slug}`,
      },
      openGraph: {
        title: `${article.title} | IlmiDunya`,
        description: article.excerpt || 'Read this article on IlmiDunya Pakistan.',
        url: `https://ilmidunya.com/articles/${article.slug || params.slug}`,
        type: 'article',
        publishedTime: article.publishedAt,
        authors: [article.author],
        images: article.coverImage ? [article.coverImage] : ['https://ilmidunya.com/icon.png'],
        siteName: 'IlmiDunya'
      },
      twitter: {
        card: 'summary_large_image',
        title: article.title,
        description: article.excerpt,
        images: article.coverImage ? [article.coverImage] : []
      }
    };
  }

  return {
    title: 'Article | IlmiDunya Pakistan',
    description: 'Educational articles and guides on Quran learning and academics in Pakistan.',
    alternates: {
      canonical: `https://ilmidunya.com/articles/${params.slug}`,
    }
  };
}

export default async function ArticleDetailPage({ params }) {
  let article = null;
  let relatedArticles = [];

  try {
    const res = await api.getArticleBySlug(params.slug);
    if (res && res.success && res.article) {
      article = res.article;
      relatedArticles = res.relatedArticles || [];
    }
  } catch (err) {
    // Backend warming up, offline, or deploying
  }

  // Resilient fallback to built-in editorial catalog
  if (!article) {
    article = getEditorialArticleBySlug(params.slug);
    if (article) {
      relatedArticles = getRelatedEditorialArticles(article.slug);
    }
  }

  // If still not found, return 404
  if (!article) {
    notFound();
  }

  // Ensure related articles exist
  if (!relatedArticles || relatedArticles.length === 0) {
    relatedArticles = getRelatedEditorialArticles(article.slug);
  }

  // Schema.org Article Structured Data
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://ilmidunya.com/articles/${article.slug}`
    },
    headline: article.title,
    description: article.excerpt,
    image: article.coverImage || 'https://ilmidunya.com/icon.png',
    datePublished: article.publishedAt || article.createdAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: {
      '@type': 'Person',
      name: article.author,
      jobTitle: article.author === 'Abdul Khaliq'
        ? 'Co-Founder & Platform Director'
        : article.author === 'Mrs. Abdul Khaliq'
        ? 'Co-Founder & Female Safety Dean'
        : 'Contributing Scholar',
      affiliation: {
        '@type': 'Organization',
        name: 'IlmiDunya'
      }
    },
    publisher: {
      '@type': 'Organization',
      name: 'IlmiDunya',
      logo: {
        '@type': 'ImageObject',
        url: 'https://ilmidunya.com/logo.svg'
      }
    }
  };

  const authorRole = article.author === 'Abdul Khaliq'
    ? 'Co-Founder & Platform Director'
    : article.author === 'Mrs. Abdul Khaliq'
    ? 'Co-Founder & Female Safety Dean'
    : 'Contributing Scholar & Academic Specialist';

  const authorBio = article.author === 'Abdul Khaliq'
    ? 'Founder of IlmiDunya, passionate about authentic Tajweed, tutor transparency, and empowering Pakistani families with safe online learning.'
    : article.author === 'Mrs. Abdul Khaliq'
    ? 'Co-Founder of IlmiDunya, championing child-friendly learning environments, female learner modesty, and certified female Alimah education.'
    : 'Educational specialist contributing pedagogical insights for Pakistani students and parents.';

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* Top Breadcrumb Bar */}
      <div className="bg-white border-b border-[#ebe3d3] py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-stone-500">
          <nav className="flex items-center gap-2 truncate">
            <Link href="/" className="hover:text-[#0c2217] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <Link href="/articles" className="hover:text-[#0c2217] transition-colors">Articles</Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="font-bold text-[#0c2217] truncate">{article.category}</span>
          </nav>

          <Link
            href="/articles"
            className="hidden sm:inline-flex items-center gap-1 font-bold text-[#0c2217] hover:text-[#b85d34] transition-colors shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Articles</span>
          </Link>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
        
        {/* Article Header */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#0c2217] text-[#f5d996] border border-[#d4a359]/40 shadow-2xs">
              {article.category || 'General'}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-stone-500 font-medium">
              <Clock className="w-3.5 h-3.5 text-[#d4a359]" />
              {article.readTime || '5 min read'}
            </span>
            <span className="text-stone-300">•</span>
            <span className="inline-flex items-center gap-1 text-xs text-stone-500 font-medium">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Recently'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#0c2217] font-serif leading-tight tracking-tight">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-sm sm:text-base text-stone-600 font-medium leading-relaxed border-l-4 border-[#d4a359] pl-4 py-1 italic bg-[#f7f2e8]/40 rounded-r-xl">
              {article.excerpt}
            </p>
          )}

          {/* Author Strip */}
          <div className="pt-2 flex items-center justify-between border-t border-[#ebe3d3]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#0c2217] text-[#f5d996] flex items-center justify-center font-serif text-lg font-black border border-[#d4a359]/40 shadow-xs">
                {article.author === 'Mrs. Abdul Khaliq' ? 'M' : 'A'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#0c2217]">
                    {article.author === 'Abdul Khaliq' && '👑 '}
                    {article.author === 'Mrs. Abdul Khaliq' && '🌸 '}
                    {article.author === 'Guest Author' && '✍️ '}
                    {article.author}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f0e8dc] text-[#0c2217] font-black">
                    {authorRole}
                  </span>
                </div>
                <p className="text-xs text-stone-500">IlmiDunya Pakistan</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-stone-500 text-xs">
              <span className="font-medium hidden sm:inline">Share this guide:</span>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${article.title} - Read on IlmiDunya: https://ilmidunya.com/articles/${article.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-white border border-[#ebe3d3] hover:border-[#10b981] hover:text-[#10b981] shadow-2xs transition-colors"
                title="Share on WhatsApp"
              >
                <Share2 className="w-4 h-4" />
              </a>
            </div>
          </div>
        </header>

        {/* Cover Hero Image */}
        {article.coverImage && (
          <div className="relative rounded-3xl overflow-hidden shadow-lg border border-[#ebe3d3] h-64 sm:h-96 lg:h-[420px] bg-stone-100">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article Body Content */}
        <div className="bg-white p-6 sm:p-10 lg:p-12 rounded-3xl border border-[#ebe3d3] shadow-sm space-y-6">
          <ArticleContentRenderer content={article.content} variant="light" />

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="pt-6 border-t border-[#f0e8dc] flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Related Topics:</span>
              {article.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-xl text-xs font-medium bg-[#f5efe4] text-[#0c2217] border border-[#e5dcce]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Author Bio Box */}
        <div className="p-6 sm:p-8 bg-gradient-to-br from-[#f8f4ec] to-[#f2ebd9] rounded-3xl border border-[#e2d8c3] shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[#0c2217] text-[#f5d996] flex items-center justify-center font-serif text-2xl font-black shrink-0 shadow-md border border-[#d4a359]/40">
            {article.author === 'Mrs. Abdul Khaliq' ? 'M' : 'A'}
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-[#0c2217]">About the Author: {article.author}</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#0c2217] text-[#f5d996]">
                {authorRole}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {authorBio}
            </p>
          </div>
        </div>

        {/* CTA Callout: Find a Verified Tutor */}
        <div className="p-8 sm:p-10 bg-[#0c2217] rounded-3xl text-white text-center space-y-5 border border-[#1b4530] shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 architectural-grid opacity-20 pointer-events-none" />
          <div className="relative z-10 space-y-3 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#143b28] border border-[#d4a359]/40 text-[#f5d996] text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#d4a359]" />
              <span>Sanad Verified Scholars &amp; Academic Educators</span>
            </div>

            <h2 className="text-xl sm:text-3xl font-black text-white font-serif">
              Ready to Learn with a Verified Teacher?
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Connect with certified Quran Qaris, female Alimahs, and school educators across Pakistan. Enjoy 1-on-1 classes with camera-off privacy and a 3-day risk-free trial.
            </p>

            <div className="pt-2">
              <Link
                href="/tutors"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#d4a359] to-[#c2934c] hover:brightness-105 text-stone-950 text-xs sm:text-sm font-black shadow-lg shadow-[#d4a359]/25 transition-all"
              >
                <span>Browse Verified Tutors</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="space-y-6 pt-6">
            <h2 className="text-xl font-bold text-[#0c2217] font-serif">
              Related Educational Articles
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedArticles.map((rel) => (
                <article
                  key={rel._id || rel.slug}
                  className="group bg-white rounded-2xl overflow-hidden border border-[#ebe3d3] shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <Link href={`/articles/${rel.slug}`} className="block relative h-36 bg-stone-100 overflow-hidden">
                    <img
                      src={rel.coverImage || 'https://images.unsplash.com/photo-1584281722572-8873404c0003?w=1200&auto=format&fit=crop&q=80'}
                      alt={rel.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <span className="text-[10px] font-bold text-[#b85d34] uppercase">{rel.category}</span>
                      <h3 className="text-xs sm:text-sm font-bold text-[#0c2217] font-serif line-clamp-2 mt-1 group-hover:text-[#b85d34] transition-colors">
                        <Link href={`/articles/${rel.slug}`}>
                          {rel.title}
                        </Link>
                      </h3>
                    </div>

                    <div className="pt-2 border-t border-[#f0e8dc] flex items-center justify-between text-[11px] text-stone-400">
                      <span>{rel.readTime || '5 min read'}</span>
                      <Link href={`/articles/${rel.slug}`} className="font-bold text-[#0c2217] flex items-center gap-0.5">
                        <span>Read</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

