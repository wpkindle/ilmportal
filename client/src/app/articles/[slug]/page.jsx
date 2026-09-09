import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BookOpen, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { api } from '../../../services/api';
import {
  getEditorialArticles,
  getEditorialArticleBySlug,
  getRelatedEditorialArticles,
  getArticleFaqs
} from '../../../data/editorialArticles';
import ArticleContentRenderer from '../../../components/articles/ArticleContentRenderer';
import ArticleFaqAccordion from '../../../components/articles/ArticleFaqAccordion';

export const revalidate = 60; // ISR cache for 60 seconds

// Prerender empty set; real articles render dynamically on demand
export function generateStaticParams() {
  return [];
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

  const faqs = getArticleFaqs(article);

  const formattedPublishedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Recent';

  const formattedUpdatedDate = article.updatedAt
    ? new Date(article.updatedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : null;

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

  return (
    <div className="min-h-screen bg-[#faf8f5] py-6 sm:py-10 text-stone-900 relative overflow-hidden">
      {/* Precision architectural grid overlay */}
      <div className="absolute inset-0 architectural-grid opacity-25 pointer-events-none" />

      {/* Subtle top accent gold line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#d4a359]/35 to-transparent pointer-events-none" />

      {/* Ambient floating glows */}
      <div className="absolute top-1/4 -left-28 w-[450px] h-[450px] bg-[#d4a359]/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-2/3 -right-28 w-[450px] h-[450px] bg-[#10b981]/6 rounded-full blur-[140px] pointer-events-none" />

      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-5 sm:space-y-6 relative z-10">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="text-xs text-stone-500 flex items-center gap-1.5 px-1 font-medium">
          <Link href="/" className="hover:text-[#0c2217] transition-colors shrink-0">
            Home
          </Link>
          <span className="text-stone-300 select-none">/</span>
          <Link href="/articles" className="hover:text-[#0c2217] transition-colors shrink-0">
            Blog &amp; Articles
          </Link>
          <span className="text-stone-300 select-none">/</span>
          <span className="text-stone-700 truncate font-normal">
            {article.title}
          </span>
        </nav>

        {/* 1. Article Header Card */}
        <header className="bg-white rounded-3xl border border-[#ebe3d3] p-6 sm:p-10 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-[#0c2217] text-[#f5d996] border border-[#d4a359]/30">
              <Sparkles className="w-3 h-3 text-[#d4a359]" />
              {article.category || 'STUDENTS & PARENTS'}
            </span>
            <span className="text-[11px] font-semibold text-stone-400">
              {article.readTime || '5 min read'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-[38px] font-black text-[#0c2217] font-serif leading-[1.28] sm:leading-[1.22] tracking-tight">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-sm sm:text-base text-stone-600 leading-[1.75] font-normal pt-1">
              {article.excerpt}
            </p>
          )}

          {/* Metadata Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#f0e8dc] text-xs">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#0c2217] text-[#f5d996] border border-[#d4a359]/40 font-bold text-xs shadow-2xs">
              {article.author === 'Abdul Khaliq' && '👑 '}
              {article.author === 'Mrs. Abdul Khaliq' && '🌸 '}
              {article.author === 'Guest Author' && '✍️ '}
              {article.author}
            </span>
            <span className="px-3 py-1 rounded-full bg-[#f6f2e9] text-stone-700 border border-[#ebe3d3] font-medium">
              Published {formattedPublishedDate}
            </span>
            {formattedUpdatedDate && (
              <span className="px-3 py-1 rounded-full bg-[#f6f2e9] text-stone-700 border border-[#ebe3d3] font-medium hidden sm:inline-block">
                Updated {formattedUpdatedDate}
              </span>
            )}
          </div>
        </header>

        {/* 2. Featured Image Card */}
        {article.coverImage && (
          <div className="rounded-3xl overflow-hidden border border-[#ebe3d3] shadow-sm bg-[#f5efe4] relative group">
            <div className="relative h-64 sm:h-80 md:h-[420px] w-full overflow-hidden">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-70" />
              <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between text-white/95 text-xs font-semibold">
                <span className="backdrop-blur-md bg-black/40 px-3.5 py-1 rounded-full border border-white/20 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#f5d996]" />
                  <span>IlmiDunya Editorial</span>
                </span>
                <span className="backdrop-blur-md bg-black/40 px-3.5 py-1 rounded-full border border-white/20 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified Safe Learning</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 3. Article Body Content Card */}
        <main className="bg-white rounded-3xl border border-[#ebe3d3] p-6 sm:p-10 lg:p-12 shadow-xs text-stone-800">
          <ArticleContentRenderer content={article.content} variant="light" />

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="pt-8 mt-10 border-t border-[#ebe3d3] flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-extrabold text-stone-400 uppercase tracking-wider">
                Topics:
              </span>
              {article.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-[#f6f2e9] hover:bg-[#ede5d5] text-[#0c2217] border border-[#ebe3d3] transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </main>

        {/* 4. FAQs Card (Collapsible Accordion) */}
        {faqs && faqs.length > 0 && (
          <ArticleFaqAccordion faqs={faqs} />
        )}

        {/* 5. Related Articles in 2-Column Grid */}
        {relatedArticles.length > 0 && (
          <section aria-labelledby="related-articles-heading" className="space-y-4 pt-2">
            <div className="flex items-center justify-between px-1">
              <h2 id="related-articles-heading" className="text-xl sm:text-2xl font-black font-serif text-[#0c2217]">
                Related Educational Articles
              </h2>
              <Link href="/articles" className="text-xs font-bold text-[#0c2217] hover:text-[#b85d34] flex items-center gap-1">
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {relatedArticles.map((rel) => (
                <article
                  key={rel._id || rel.slug}
                  className="bg-white rounded-3xl border border-[#ebe3d3] overflow-hidden hover:border-[#d4a359]/60 hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
                >
                  {rel.coverImage && (
                    <Link href={`/articles/${rel.slug}`} className="h-36 sm:h-40 w-full overflow-hidden bg-stone-100 block relative">
                      <img
                        src={rel.coverImage}
                        alt={rel.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#0c2217]/90 text-[#f5d996] border border-[#d4a359]/30 backdrop-blur-xs">
                        {rel.category || 'ACADEMICS'}
                      </div>
                    </Link>
                  )}

                  <div className="p-5 sm:p-6 space-y-2 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      {!rel.coverImage && (
                        <span className="inline-block text-[10px] font-black uppercase tracking-wider text-[#0c2217] bg-[#f5efe4] px-2.5 py-0.5 rounded-full border border-[#e5dcce]">
                          {rel.category || 'ACADEMICS'}
                        </span>
                      )}
                      <h3 className="text-sm sm:text-base font-bold font-serif text-[#0c2217] group-hover:text-[#b85d34] transition-colors leading-snug line-clamp-2">
                        <Link href={`/articles/${rel.slug}`}>
                          {rel.title}
                        </Link>
                      </h3>
                      {rel.excerpt && (
                        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed font-normal">
                          {rel.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#f0e8dc] flex items-center justify-between text-[11px] text-stone-400 font-medium">
                      <span className="font-semibold text-stone-600">{rel.author}</span>
                      <span>{rel.readTime || '5 min read'}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
