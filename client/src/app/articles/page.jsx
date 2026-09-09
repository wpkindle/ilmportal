import React from "react";
import Link from "next/link";
import {
  Newspaper,
  ArrowRight,
  Sparkles,
  BookOpen,
  ShieldCheck,
  GraduationCap,
  HeartHandshake,
  Clock,
  ChevronRight,
  Mail
} from "lucide-react";

export const metadata = {
  title: "Articles & Educational Guides (Coming Soon) | IlmiDunya Pakistan",
  description:
    "Articles, Tajweed learning tips, family safety insights, and academic guidance from verified scholars and teachers across Pakistan. Articles section is Coming Soon.",
  alternates: {
    canonical: "https://ilmidunya.com/articles"
  },
  openGraph: {
    title: "Articles & Educational Guides (Coming Soon) | IlmiDunya",
    description:
      "Practical guides on Quran recitation, Tajweed, and home tutoring. Articles section is Coming Soon on IlmiDunya.",
    url: "https://ilmidunya.com/articles",
    siteName: "IlmiDunya"
  },
  twitter: {
    card: "summary_large_image",
    title: "Articles & Educational Guides (Coming Soon) | IlmiDunya",
    description:
      "Practical guides on Quran recitation, Tajweed, and home tutoring. Articles section is Coming Soon on IlmiDunya."
  }
};

const UPCOMING_TOPICS = [
  {
    icon: BookOpen,
    title: "Tajweed & Makharij Mastery",
    desc: "Practical corrections for common articulation pitfalls in Pakistani Urdu & English-speaking households."
  },
  {
    icon: ShieldCheck,
    title: "Child Safety & Modesty",
    desc: "Why camera-off video classes protect family privacy and female student comfort during online tutoring."
  },
  {
    icon: GraduationCap,
    title: "Matric & FSc Exam Prep",
    desc: "Study habits, past paper techniques, and conceptual coaching from verified school and college teachers."
  },
  {
    icon: HeartHandshake,
    title: "Hifz Progression & Daily Adab",
    desc: "Daily revision routines and memory consolidation techniques for young Quran memorization students."
  }
];

export default function ArticlesComingSoonPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Editorial Header Banner */}
      <section className="relative py-16 sm:py-24 bg-gradient-to-b from-[#06140d] via-[#0c2217] to-[#06140d] text-white overflow-hidden border-b border-[#1b3d2c]">
        {/* Architectural grid pattern */}
        <div className="absolute inset-0 architectural-grid opacity-25 pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#d4a359]/35 to-transparent" />

        {/* Ambient glows */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#d4a359]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0c2419] border border-[#d4a359]/50 text-[#f5d996] text-xs font-bold shadow-md animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-[#d4a359]" />
            <span className="uppercase tracking-widest text-[11px]">Coming Soon • In Editorial Review</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white font-serif tracking-tight leading-tight">
            Articles &amp; Educational Guides
          </h1>

          <p className="text-sm sm:text-base text-[#b8d4c7] max-w-2xl mx-auto leading-relaxed">
            We are curating comprehensive, verified educational guides on authentic Quran recitation, Tajweed methodology, female learner privacy, and Pakistani board exam preparation.
          </p>

          <div className="pt-2 text-xs text-[#a3bcaf]">
            An editorial initiative by <strong className="text-white font-bold">Mr. &amp; Mrs. Abdul Khaliq</strong> • Lahore, Pakistan
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-stone-500">
          <Link href="/" className="hover:text-[#0c2217] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="font-bold text-[#0c2217]">Articles</span>
        </nav>

        {/* Central Coming Soon Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 lg:p-14 border-2 border-[#ebe3d3] shadow-xl relative overflow-hidden space-y-8">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#d4a359] via-[#b85d34] to-[#d4a359]" />

          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#f5f0e6] text-[#b85d34] rounded-3xl flex items-center justify-center mx-auto border-2 border-[#d4a359]/40 shadow-inner">
              <Newspaper className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f3ede0] text-[#0c2217] text-xs font-bold border border-[#d4a359]/30">
              <Clock className="w-3.5 h-3.5 text-[#b85d34]" />
              <span>Launching Very Soon</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0c2217] font-serif tracking-tight">
              Educational Articles Coming Soon
            </h2>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Our editorial team is currently collaborating with verified Quran Qaris, female Alimahs, and senior educators across Pakistan. We are putting together high-quality, practical guides to assist students and parents at home.
            </p>
          </div>

          {/* Planned Topics Preview Grid */}
          <div className="space-y-4 pt-4 border-t border-[#ebe3d3]">
            <div className="text-center">
              <span className="text-xs font-bold text-[#b85d34] uppercase tracking-wider bg-[#f5f0e6] px-3 py-1 rounded-full border border-[#d4a359]/30">
                Topics Currently in Preparation
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {UPCOMING_TOPICS.map((topic, idx) => {
                const Icon = topic.icon;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-[#faf8f5] border border-[#ebe3d3] hover:border-[#d4a359]/60 hover:shadow-md transition-all flex items-start gap-4"
                  >
                    <div className="p-2.5 rounded-xl bg-white text-[#b85d34] border border-[#ebe3d3] shrink-0 mt-0.5 shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <h3 className="text-xs sm:text-sm font-bold text-[#0c2217]">
                        {topic.title}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-stone-600 leading-relaxed">
                        {topic.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions & Next Steps */}
          <div className="p-6 bg-[#f5f0e6]/70 rounded-2xl border border-[#d4a359]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-bold text-[#0c2217]">
                Looking for 1-on-1 Tutoring Now?
              </h4>
              <p className="text-xs text-stone-600">
                Connect directly with verified Quran Qaris, female Alimahs, and academic tutors with a 3-day free trial.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link
                href="/tutors"
                className="px-5 py-2.5 bg-[#b85d34] hover:bg-[#9e4e2a] text-white text-xs font-bold rounded-xl shadow-md transition-all hover:scale-[1.02] cursor-pointer flex items-center gap-1.5"
              >
                <span>Find Verified Tutors</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/"
                className="px-4 py-2.5 bg-white hover:bg-stone-50 text-[#0c2217] text-xs font-bold rounded-xl border border-stone-300 transition-colors cursor-pointer"
              >
                Back to Home
              </Link>
            </div>
          </div>

          {/* Guest Author Invitation */}
          <div className="pt-2 text-center text-xs text-stone-500 space-y-1 border-t border-[#ebe3d3]">
            <p className="flex items-center justify-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#b85d34]" />
              <span>Are you an Islamic scholar, Qari, or academic educator?</span>
            </p>
            <p>
              Submit an article pitch to contribute as a guest author at{" "}
              <a
                href="mailto:info@ilmidunya.com"
                className="font-bold text-[#0c2217] underline hover:text-[#b85d34]"
              >
                info@ilmidunya.com
              </a>
              .
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
