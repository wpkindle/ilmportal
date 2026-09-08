import React from 'react';
import Link from 'next/link';
import { Newspaper, ArrowRight, Clock, User, Calendar, BookOpen, Search, Sparkles, Filter, ChevronRight } from 'lucide-react';
import { api } from '../../services/api';

export const metadata = {
  title: 'Articles & Educational Guides | IlmiDunya Pakistan',
  description: 'Articles, Tajweed learning tips, family safety insights, and academic guidance from Mr. & Mrs. Abdul Khaliq and verified scholars across Pakistan.',
  alternates: {
    canonical: 'https://ilmidunya.com/articles',
  },
  openGraph: {
    title: 'Articles & Educational Guides | IlmiDunya',
    description: 'Practical guides on Quran recitation, Tajweed, and home tutoring from founders Mr. & Mrs. Abdul Khaliq.',
    url: 'https://ilmidunya.com/articles',
    siteName: 'IlmiDunya',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Articles & Educational Guides | IlmiDunya',
    description: 'Practical guides on Quran recitation, Tajweed, and home tutoring from founders Mr. & Mrs. Abdul Khaliq.',
  }
};

const DEFAULT_DEMO = {
  _id: 'demo-1',
  title: 'Building Strong Foundations: Why Camera-Off Learning & Sanad Verification Matter for Pakistani Families',
  slug: 'why-camera-off-learning-and-sanad-verification-matter-pakistan',
  author: 'Abdul Khaliq',
  category: 'Quran & Family Safety',
  excerpt: 'In Pakistani households, educational excellence and Islamic modesty go hand-in-hand. Learn how camera-off default classes and rigorous Sanad verification create the safest learning environment for our children.',
  coverImage: 'https://images.unsplash.com/photo-1584281722572-8873404c0003?w=1200&auto=format&fit=crop&q=80',
  readTime: '6 min read',
  publishedAt: new Date()
};

async function getPublishedArticles() {
  try {
    const res = await api.getArticles({ limit: 12 });
    if (res && res.success && res.articles && res.articles.length > 0) {
      return res.articles;
    }
  } catch (err) {
    console.error('SSR fetch error for articles:', err);
  }
  return [DEFAULT_DEMO];
}

export default async function ArticlesDirectoryPage() {
  const articles = await getPublishedArticles();
  const featured = articles[0] || DEFAULT_DEMO;
  const remaining = articles.slice(1);

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      
      {/* Editorial Header Banner */}
      <section className="relative py-16 sm:py-20 bg-gradient-to-b from-[#06140d] via-[#0c2217] to-[#06140d] text-white overflow-hidden border-b border-[#1b3d2c]">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 architectural-grid opacity-25 pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#d4a359]/30 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0c2419] border border-[#d4a359]/40 text-[#f5d996] text-xs font-bold shadow-xs">
            <Newspaper className="w-3.5 h-3.5 text-[#d4a359]" />
            <span className="uppercase tracking-wider text-[11px]">IlmiDunya Editorial &amp; Insights</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white font-serif tracking-tight">
            Articles &amp; Academic Advice
          </h1>

          <p className="text-xs sm:text-sm text-[#b8d4c7] max-w-2xl mx-auto leading-relaxed">
            Practical perspectives on authentic Quran recitation, Tajweed guidelines, female learner privacy, and Pakistani board examination preparation.
          </p>

          <div className="pt-2 text-[11px] text-[#a3bcaf]">
            An initiative by <strong className="text-white">Mr. &amp; Mrs. Abdul Khaliq</strong> from Lahore, Pakistan.
          </div>
        </div>
      </section>

      {/* Main Articles Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-stone-500">
          <Link href="/" className="hover:text-[#0c2217] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="font-bold text-[#0c2217]">Articles</span>
        </nav>

        {/* Featured Article Hero Card */}
        {featured && (
          <div className="bg-white rounded-3xl overflow-hidden border border-[#ebe3d3] shadow-md hover:shadow-xl transition-all grid grid-cols-1 lg:grid-cols-12 gap-0 group">
            <div className="lg:col-span-7 relative h-64 sm:h-80 lg:h-full min-h-[280px] bg-stone-100 overflow-hidden">
              <img
                src={featured.coverImage || 'https://images.unsplash.com/photo-1584281722572-8873404c0003?w=1200&auto=format&fit=crop&q=80'}
                alt={featured.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute top-4 left-4 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#0c2217]/95 text-[#f5d996] border border-[#d4a359]/50 shadow-md">
                Featured Editorial
              </span>
            </div>

            <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#f5f0e6] text-[#0c2217] border border-[#ebe3d3]">
                    {featured.category || 'General'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-[#0c2217] text-[#f5d996]">
                    {featured.author === 'Abdul Khaliq' && '👑 '}
                    {featured.author === 'Mrs. Abdul Khaliq' && '🌸 '}
                    {featured.author === 'Guest Author' && '✍️ '}
                    By {featured.author}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0c2217] font-serif leading-tight group-hover:text-[#b85d34] transition-colors">
                  <Link href={`/articles/${featured.slug}`}>
                    {featured.title}
                  </Link>
                </h2>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {featured.excerpt || 'Discover practical guidance and foundational advice on Quran and academic tutoring.'}
                </p>
              </div>

              <div className="pt-4 border-t border-[#f0e8dc] flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-stone-500 text-[11px]">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#d4a359]" />
                    {featured.readTime || '5 min read'}
                  </span>
                  <span>•</span>
                  <span>{featured.publishedAt ? new Date(featured.publishedAt).toLocaleDateString() : 'Recent'}</span>
                </div>

                <Link
                  href={`/articles/${featured.slug}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0c2217] text-[#f5d996] font-bold text-xs hover:bg-[#1b4d36] transition-colors"
                >
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Subsequent Articles Grid */}
        {remaining.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-[#0c2217] font-serif">
              More Insights &amp; Guides
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {remaining.map((article) => (
                <article
                  key={article._id || article.slug}
                  className="group bg-white rounded-3xl overflow-hidden border border-[#ebe3d3] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1"
                >
                  <Link href={`/articles/${article.slug}`} className="relative h-48 w-full overflow-hidden bg-stone-100 block">
                    <img
                      src={article.coverImage || 'https://images.unsplash.com/photo-1584281722572-8873404c0003?w=1200&auto=format&fit=crop&q=80'}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#0c2217]/90 text-[#f5d996] border border-[#d4a359]/40">
                      {article.category}
                    </span>
                  </Link>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-[11px] text-[#0c2217]">
                          By {article.author}
                        </span>
                        <span className="text-stone-400 text-[11px]">• {article.readTime || '5 min read'}</span>
                      </div>

                      <h4 className="text-base font-bold text-[#0c2217] font-serif leading-snug line-clamp-2 group-hover:text-[#b85d34] transition-colors">
                        <Link href={`/articles/${article.slug}`}>
                          {article.title}
                        </Link>
                      </h4>

                      <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                        {article.excerpt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#f0e8dc] flex items-center justify-between text-xs">
                      <span className="text-[11px] text-stone-400 font-medium">
                        {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Recent'}
                      </span>
                      <Link
                        href={`/articles/${article.slug}`}
                        className="inline-flex items-center gap-1 font-bold text-[#0c2217] group-hover:text-[#b85d34] transition-colors"
                      >
                        <span>Read Article</span>
                        <ArrowRight className="w-3.5 h-3.5" />
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

