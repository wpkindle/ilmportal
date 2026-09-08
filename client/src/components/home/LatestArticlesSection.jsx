'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Newspaper, ArrowRight, Clock, User, Calendar, BookOpen, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { EDITORIAL_ARTICLES } from '../../data/editorialArticles';

export default function LatestArticlesSection({ initialArticles = [] }) {
  const [articles, setArticles] = useState(initialArticles.length > 0 ? initialArticles : EDITORIAL_ARTICLES);

  useEffect(() => {
    if (initialArticles && initialArticles.length > 0) return;

    const fetchArticles = async () => {
      try {
        const res = await api.getArticles({ limit: 3 });
        if (res && res.success && res.articles && res.articles.length > 0) {
          setArticles(res.articles);
        } else {
          setArticles(EDITORIAL_ARTICLES);
        }
      } catch (err) {
        setArticles(EDITORIAL_ARTICLES);
      }
    };

    fetchArticles();
  }, [initialArticles]);

  const displayArticles = articles.length > 0 ? articles.slice(0, 3) : EDITORIAL_ARTICLES.slice(0, 3);

  return (
    <section className="py-16 sm:py-24 relative overflow-hidden bg-[#faf8f5] border-b border-[#ebe3d3]">
      {/* Precision architectural grid overlay */}
      <div className="absolute inset-0 architectural-grid opacity-35 pointer-events-none" />

      {/* Subtle top accent line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#d4a359]/35 to-transparent pointer-events-none" />

      {/* Animated floating ambient glows */}
      <div className="absolute top-1/3 -left-20 w-[480px] h-[480px] bg-[#d4a359]/8 rounded-full blur-[140px] pointer-events-none animate-float-slow" />
      <div className="absolute bottom-10 -right-20 w-[500px] h-[500px] bg-[#10b981]/6 rounded-full blur-[140px] pointer-events-none animate-float-reverse" />

      {/* Precision architectural coordinate crosshairs */}
      <div className="hidden sm:block absolute top-6 left-6 text-[#d4a359]/40 font-mono text-[10px] pointer-events-none select-none">+</div>
      <div className="hidden sm:block absolute top-6 right-6 text-[#d4a359]/40 font-mono text-[10px] pointer-events-none select-none">+</div>
      <div className="hidden sm:block absolute bottom-6 left-6 text-[#10b981]/40 font-mono text-[10px] pointer-events-none select-none">+</div>
      <div className="hidden sm:block absolute bottom-6 right-6 text-[#10b981]/40 font-mono text-[10px] pointer-events-none select-none">+</div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
        
        {/* Section Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f3ede0] border border-[#e6ded1] text-[#0c2217] text-xs font-bold shadow-2xs">
              <Newspaper className="w-3.5 h-3.5 text-[#d4a359]" />
              <span className="tracking-wide uppercase text-[11px]">Founders&apos; Editorial &amp; Insights</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-[#0c2217] tracking-tight font-serif">
              Articles &amp; Educational Advice
            </h2>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Guidance on authentic Quran recitation, Tajweed, child modesty, and Pakistani board exam coaching from Mr. &amp; Mrs. Abdul Khaliq and contributing scholars.
            </p>
          </div>

          <Link
            href="/articles"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#0c2217] text-[#0c2217] hover:text-[#f5d996] border border-[#d8cfbe] hover:border-[#0c2217] text-xs font-bold shadow-2xs transition-all shrink-0 group cursor-pointer"
          >
            <span>Browse All Articles</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Articles Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {displayArticles.map((article) => {
            const authorRole = article.author === 'Abdul Khaliq'
              ? 'Co-Founder'
              : article.author === 'Mrs. Abdul Khaliq'
              ? 'Co-Founder'
              : 'Guest Scholar';

            return (
              <article
                key={article._id || article.slug}
                className="group bg-white rounded-3xl overflow-hidden border border-[#ebe3d3] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1"
              >
                {/* Cover Thumbnail */}
                <Link href={`/articles/${article.slug}`} className="relative h-48 sm:h-52 w-full overflow-hidden bg-stone-100 block">
                  <img
                    src={article.coverImage || 'https://images.unsplash.com/photo-1584281722572-8873404c0003?w=1200&auto=format&fit=crop&q=80'}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                  
                  {/* Category Chip */}
                  <span className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#0c2217]/90 text-[#f5d996] border border-[#d4a359]/40 backdrop-blur-xs">
                    {article.category || 'General'}
                  </span>

                  {/* Read Time Chip */}
                  <span className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-md text-[10px] font-bold text-white/90 bg-black/50 backdrop-blur-xs flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#d4a359]" />
                    {article.readTime || '5 min read'}
                  </span>
                </Link>

                {/* Body Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    
                    {/* Author Byline */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-black text-[11px] bg-[#f5efe4] text-[#0c2217] border border-[#e5dcce]">
                        {article.author === 'Abdul Khaliq' && '👑 '}
                        {article.author === 'Mrs. Abdul Khaliq' && '🌸 '}
                        {article.author === 'Guest Author' && '✍️ '}
                        {article.author}
                      </span>
                      <span className="text-stone-400 text-[11px]">• {authorRole}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base sm:text-lg font-bold text-[#0c2217] font-serif leading-snug line-clamp-2 group-hover:text-[#b85d34] transition-colors">
                      <Link href={`/articles/${article.slug}`}>
                        {article.title}
                      </Link>
                    </h3>

                    {/* Excerpt */}
                    <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                      {article.excerpt || 'Read this article to learn more about our approach to Quranic and academic excellence in Pakistan.'}
                    </p>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="pt-4 border-t border-[#f0e8dc] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-stone-400 font-medium">
                      {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently Published'}
                    </span>

                    <Link
                      href={`/articles/${article.slug}`}
                      className="inline-flex items-center gap-1 font-bold text-[#0c2217] group-hover:text-[#b85d34] transition-colors"
                    >
                      <span>Read Article</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>

                </div>
              </article>
            );
          })}
        </div>

      </div>
    </section>
  );
}

