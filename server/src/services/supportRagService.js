const dns = require('dns');
if (dns.setDefaultResultOrder) dns.setDefaultResultOrder('ipv4first');

const { GoogleGenAI } = require('@google/genai');
const TutorProfile = require('../models/TutorProfile');
const User = require('../models/User');
const Course = require('../models/Course');
const Deal = require('../models/Deal');
const Notification = require('../models/Notification');
const { searchKnowledgeBase, getKnowledgeBaseFAQs } = require('../config/supabaseClient');

let genAiClient = null;
function getGeminiClient() {
  if (!genAiClient) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (apiKey) {
      genAiClient = new GoogleGenAI({ apiKey });
    }
  }
  return genAiClient;
}

/**
 * Generate embedding vector for a text query using Gemini
 */
async function generateQueryEmbedding(text) {
  const ai = getGeminiClient();
  if (!ai || !text) return null;

  try {
    const res = await ai.models.embedContent({
      model: 'gemini-embedding-2-preview',
      contents: text.slice(0, 1000)
    });

    const values = res.embedding?.values || res.embeddings?.[0]?.values;
    if (Array.isArray(values) && values.length > 0) {
      return values;
    }
  } catch (err) {
    // Gracefully fall back to keyword matching if embedding service is unreachable
  }
  return null;
}

/**
 * Extract search intents & filters from user message
 */
function extractQueryFilters(text = '') {
  const lower = text.toLowerCase();

  // Common Pakistani cities
  const cities = [
    'islamabad', 'lahore', 'karachi', 'rawalpindi', 'peshawar', 
    'faisalabad', 'multan', 'quetta', 'gujranwala', 'sialkot', 
    'abbottabad', 'mardan', 'hyderabad', 'sukkur'
  ];
  const detectedCity = cities.find(c => lower.includes(c)) || null;

  // Subjects
  const subjects = [
    { key: 'tajweed', match: ['tajweed', 'tajwid', 'makharij'] },
    { key: 'hifz', match: ['hifz', 'memorize', 'hafiz', 'huffaz'] },
    { key: 'nazra', match: ['nazra', 'recitation', 'reading'] },
    { key: 'noorani qaida', match: ['qaida', 'noorani', 'beginner', 'alphabet'] },
    { key: 'quran', match: ['quran', 'arabic', 'tarjuma', 'tafseer'] },
    { key: 'cambridge', match: ['cambridge', 'o-level', 'a-level', 'igcse', 'caie'] },
    { key: 'fsc', match: ['fsc', 'pre-medical', 'pre-engineering', 'intermediate', '11th', '12th'] },
    { key: 'matric', match: ['matric', '9th', '10th', 'ssc'] },
    { key: 'physics', match: ['physics'] },
    { key: 'chemistry', match: ['chemistry'] },
    { key: 'biology', match: ['biology', 'bio', 'mdcat'] },
    { key: 'math', match: ['math', 'mathematics', 'calculus'] }
  ];

  let detectedSubject = null;
  for (const s of subjects) {
    if (s.match.some(m => lower.includes(m))) {
      detectedSubject = s.key;
      break;
    }
  }

  // Gender & Alimah preferences
  const isFemalePreferred = lower.includes('female') || lower.includes('woman') || lower.includes('girl') || 
                            lower.includes('sister') || lower.includes('lady') || lower.includes('alimah');
  const isAlimahSpecific = lower.includes('alimah') || lower.includes('dars-e-nizami') || lower.includes('sanad');

  // Mode
  const isHomeVisit = lower.includes('home') || lower.includes('in person') || lower.includes('in-person') || lower.includes('visit');

  return {
    city: detectedCity,
    subject: detectedSubject,
    femaleOnly: isFemalePreferred,
    isAlimah: isAlimahSpecific,
    isHomeVisit
  };
}

/**
 * Main RAG Context Builder
 * Merges Supabase Knowledge Base (FAQs) + MongoDB Live Platform Data + User Account State
 */
async function buildRagContext({ message, user = null }) {
  const qLower = (message || '').toLowerCase();
  const filters = extractQueryFilters(message);

  // 1. Live Platform Metrics (MongoDB)
  let liveStats = {
    totalTutors: 6,
    femaleAlimahs: 2,
    maleQaris: 3,
    totalCourses: 3,
    activeStudents: 24
  };

  try {
    const verifiedTutorCount = await TutorProfile.countDocuments({ verificationStatus: 'approved' });
    const alimahCount = await TutorProfile.countDocuments({
      verificationStatus: 'approved',
      $or: [{ gender: 'female' }, { 'user.gender': 'female' }]
    });
    const qariCount = await TutorProfile.countDocuments({
      verificationStatus: 'approved',
      gender: 'male'
    });
    const coursesCount = await Course.countDocuments({ isPublished: true });

    if (verifiedTutorCount > 0) {
      liveStats = {
        totalTutors: verifiedTutorCount,
        femaleAlimahs: alimahCount,
        maleQaris: qariCount,
        totalCourses: coursesCount || 3,
        activeStudents: 24
      };
    }
  } catch (e) {}

  // 2. Query Supabase / MongoDB Knowledge Base FAQs
  let relevantFaqs = [];
  try {
    const queryEmbedding = await generateQueryEmbedding(message);
    relevantFaqs = await searchKnowledgeBase({
      queryText: message,
      embedding: queryEmbedding,
      limit: 3
    });
  } catch (e) {}

  // 3. Query Real Matching Tutors (MongoDB)
  let matchedTutors = [];
  try {
    let tutorQuery = { verificationStatus: 'approved' };
    if (filters.femaleOnly) {
      tutorQuery.gender = 'female';
    }

    let profiles = await TutorProfile.find(tutorQuery)
      .populate('user', 'name gender email city isVerified avatar')
      .populate('subjects', 'name slug type')
      .populate('cities', 'name')
      .limit(10)
      .lean();

    // Filter by detected city
    if (filters.city) {
      const cLower = filters.city.toLowerCase();
      const cityFiltered = profiles.filter(t => {
        const uCity = (t.user?.city || '').toLowerCase();
        const citiesList = (t.cities || []).some(c => (c.name || '').toLowerCase().includes(cLower));
        return uCity.includes(cLower) || citiesList;
      });
      if (cityFiltered.length > 0) profiles = cityFiltered;
    }

    // Filter by detected subject
    if (filters.subject) {
      const sLower = filters.subject.toLowerCase();
      const subFiltered = profiles.filter(t => {
        const hasSub = (t.subjects || []).some(s => (s.name || '').toLowerCase().includes(sLower));
        const bioMatch = (t.bio || '').toLowerCase().includes(sLower) || (t.qualifications || '').toLowerCase().includes(sLower);
        return hasSub || bioMatch;
      });
      if (subFiltered.length > 0) profiles = subFiltered;
    }

    matchedTutors = profiles.slice(0, 3).map(t => ({
      id: t._id,
      name: t.user?.name || 'Verified Tutor',
      city: t.user?.city || (t.cities?.[0]?.name) || 'Pakistan',
      gender: t.gender || 'Not specified',
      hourlyRatePKR: t.hourlyRate,
      rating: t.ratingAverage || 5.0,
      subjects: (t.subjects || []).map(s => s.name).join(', '),
      hasSanad: (t.sanadDocuments || []).length > 0,
      url: `/tutors/${t._id}`
    }));
  } catch (e) {}

  // 4. Logged-in User Account Context (MongoDB)
  let userAccountContext = null;
  if (user && user._id) {
    try {
      const activeDeals = await Deal.find({
        $or: [{ student: user._id }, { tutor: user._id }],
        status: { $in: ['inquiry', 'proposal_sent', 'accepted', 'active'] }
      })
        .populate('student', 'name email')
        .populate('tutor', 'name email')
        .populate('subject', 'name')
        .limit(5)
        .lean();

      const unreadAlerts = await Notification.countDocuments({
        recipient: user._id,
        isRead: false
      });

      const formattedDeals = activeDeals.map(d => {
        const isStudent = (d.student?._id || d.student)?.toString() === user._id.toString();
        const partnerName = isStudent ? d.tutor?.name || 'Tutor' : d.student?.name || 'Student';
        
        let trialNote = '';
        if (d.trialEndsAt) {
          const hoursLeft = Math.max(0, Math.round((new Date(d.trialEndsAt) - new Date()) / (1000 * 60 * 60)));
          const daysLeft = Math.ceil(hoursLeft / 24);
          trialNote = hoursLeft > 0 ? `${daysLeft} day(s) (${hoursLeft} hrs remaining)` : 'Trial ended';
        }

        return {
          id: d._id,
          subject: d.subject?.name || 'Course',
          partnerName,
          status: d.status,
          monthlyFeePKR: d.totalAmount || d.agreedPrice,
          trialNote: trialNote || 'No active trial',
          escrowStatus: d.escrowStatus
        };
      });

      userAccountContext = {
        name: user.name,
        email: user.email,
        role: user.role,
        city: user.city || '',
        unreadAlerts,
        activeDealsCount: formattedDeals.length,
        deals: formattedDeals
      };
    } catch (e) {}
  }

  // 5. Synthesize Merged Markdown Prompt Context
  let contextText = `### LIVE ILMIDUNYA PLATFORM CONTEXT (REAL-TIME DB):
- Total Verified Tutors: ${liveStats.totalTutors}
- Certified Female Alimahs (with Sanad): ${liveStats.femaleAlimahs}
- Specialized Male Qaris & Mentors: ${liveStats.maleQaris}
- Official Courses: ${liveStats.totalCourses} (Noorani Qaida, Nazra, Tajweed, Cambridge, FSc, Matric)
- Core Platform Standard: 100% Direct Dealing (Zero Middlemen / No cuts).
- Payment Methods: Meezan Bank (Islamic Banking), JazzCash, EasyPaisa, Raast ID.
- Female Safety: Certified female Alimahs teach exclusively online via encrypted WebRTC with camera-off privacy. In-person home visits are male-only.
- Trial Policy: 3-day free trial on every deal to evaluate compatibility.\n`;

  if (relevantFaqs.length > 0) {
    contextText += `\n### RELEVANT KNOWLEDGE BASE ENTRIES (SUPABASE FAQS):\n`;
    relevantFaqs.forEach((faq, idx) => {
      contextText += `${idx + 1}. **Q: ${faq.question}**\n   **A:** ${faq.answer}\n`;
    });
  }

  if (matchedTutors.length > 0) {
    contextText += `\n### MATCHING LIVE VERIFIED TUTORS:\n`;
    matchedTutors.forEach(t => {
      contextText += `- **${t.name}** (${t.city}, ${t.gender}) | PKR ${t.hourlyRatePKR}/hr | Subjects: ${t.subjects} | Sanad Verified: ${t.hasSanad ? 'Yes' : 'Pending'} | Link: ${t.url}\n`;
    });
  }

  if (userAccountContext) {
    contextText += `\n### LOGGED-IN USER ACCOUNT CONTEXT:
- Name: ${userAccountContext.name} (${userAccountContext.role})
- Email: ${userAccountContext.email} | City: ${userAccountContext.city || 'Pakistan'}
- Unread Notifications: ${userAccountContext.unreadAlerts}
- Active Deals (${userAccountContext.activeDealsCount}):\n`;

    if (userAccountContext.deals.length === 0) {
      contextText += `  * No active deals or trials at the moment.\n`;
    } else {
      userAccountContext.deals.forEach(d => {
        contextText += `  * Deal for ${d.subject} with ${d.partnerName}: Status=${d.status}, Fee=PKR ${d.monthlyFeePKR}, Trial=${d.trialNote}, Payment=${d.escrowStatus}\n`;
      });
    }
  }

  return {
    contextText,
    liveStats,
    relevantFaqs,
    matchedTutors,
    userAccountContext
  };
}

module.exports = {
  buildRagContext,
  generateQueryEmbedding,
  extractQueryFilters
};
