import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
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
    <div className="min-h-screen bg-[#f8f9fa] py-5 sm:py-8 text-stone-900">
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4 sm:space-y-5">
        
        {/* Minimal Clean Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-xs text-stone-500 flex items-center gap-1.5 px-1 font-medium">
          <Link href="/articles" className="hover:text-stone-900 transition-colors shrink-0">
            Blog &amp; Articles
          </Link>
          <span className="text-stone-400 select-none">/</span>
          <span className="text-stone-700 truncate font-normal">
            {article.title}
          </span>
        </nav>

        {/* 1. Article Header Card */}
        <header className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs space-y-3.5">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">
            {article.category || 'STUDENTS & PARENTS'}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-stone-900 tracking-tight leading-tight">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
              {article.excerpt}
            </p>
          )}

          {/* Metadata Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] text-stone-600 font-medium">
            <span className="px-3 py-1 rounded-md bg-stone-100/90 text-stone-700">
              {article.readTime || '5 min read'}
            </span>
            <span className="px-3 py-1 rounded-md bg-stone-100/90 text-stone-700">
              Published {formattedPublishedDate}
            </span>
            {formattedUpdatedDate && (
              <span className="px-3 py-1 rounded-md bg-stone-100/90 text-stone-700">
                Updated {formattedUpdatedDate}
              </span>
            )}
            <span className="px-3 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-100 font-semibold">
              Author: {article.author}
            </span>
          </div>
        </header>

        {/* 2. Article Body Content Card */}
        <main className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200/80 p-6 sm:p-10 shadow-xs text-stone-800">
          <ArticleContentRenderer content={article.content} variant="light" />

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="pt-6 mt-8 border-t border-stone-100 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Topics:</span>
              {article.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-stone-100 text-stone-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </main>

        {/* 3. FAQs Card (Collapsible Accordion) */}
        {faqs && faqs.length > 0 && (
          <ArticleFaqAccordion faqs={faqs} />
        )}

        {/* 4. Primary Action Banner */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-emerald-500/25 hover:border-emerald-500/45 p-4 sm:p-5 shadow-xs transition-colors flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="text-xs sm:text-sm font-semibold text-stone-900">
            Post your tuition need to compare relevant verified tutors.
          </div>
          <Link
            href="/tutors"
            className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm shrink-0 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <span>Continue</span>
            <span>→</span>
          </Link>
        </div>

        {/* 5. Practical Next Steps / Support Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200/80 p-4 sm:p-5 shadow-xs text-xs text-stone-600 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>
            Need practical next steps? Read our <Link href="/safety" className="text-emerald-700 font-bold underline hover:text-emerald-800">Female Safety Charter</Link>, learn <Link href="/how-it-works" className="text-emerald-700 font-bold underline hover:text-emerald-800">How Classes Work</Link>, or contact support.
          </p>
          <a
            href="https://wa.me/923171759093?text=Assalamu%20Alaikum%20I%20have%20a%20question%20regarding%20IlmiDunya"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-900 shrink-0"
          >
            <span>WhatsApp help</span>
            <span>↗</span>
          </a>
        </div>

        {/* 6. Related Articles in 2-Column Grid */}
        {relatedArticles.length > 0 && (
          <section aria-labelledby="related-articles-heading" className="space-y-3 pt-2">
            <h2 id="related-articles-heading" className="text-base sm:text-lg font-bold text-stone-900 px-1">
              Related articles
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              {relatedArticles.map((rel) => (
                <article
                  key={rel._id || rel.slug}
                  className="bg-white rounded-2xl border border-stone-200/80 p-5 hover:border-stone-400/80 hover:shadow-xs transition-all space-y-2.5 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                      {rel.category || 'SAFETY & TRUST'}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-stone-900 leading-snug">
                      <Link href={`/articles/${rel.slug}`} className="hover:text-emerald-800 transition-colors">
                        {rel.title}
                      </Link>
                    </h3>
                    {rel.excerpt && (
                      <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed font-normal">
                        {rel.excerpt}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 text-[11px] text-stone-400 font-medium">
                    <span>{rel.readTime || '5 min read'}</span>
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
