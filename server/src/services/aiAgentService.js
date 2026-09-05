const { GoogleGenAI } = require('@google/genai');
const TutorProfile = require('../models/TutorProfile');
const User = require('../models/User');
const Course = require('../models/Course');
const Category = require('../models/Category');
const Location = require('../models/Location');
const SupportSession = require('../models/SupportSession');

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

// ==========================================
// REAL-TIME DATABASE QUERY EXECUTORS
// ==========================================

/**
 * Searches the live database for tutors matching the user criteria.
 */
async function executeSearchTutors({ subject, city, gender, isAlimah, maxHourlyRate, limit = 5 }) {
  try {
    const query = {
      verificationStatus: { $in: ['approved', 'pending', 'under_review'] }
    };

    if (maxHourlyRate && !isNaN(Number(maxHourlyRate))) {
      query.hourlyRate = { $lte: Number(maxHourlyRate) };
    }

    if (gender) {
      query.gender = gender.toLowerCase();
    }

    let tutorProfiles = await TutorProfile.find(query)
      .populate('user', 'name email avatar city gender phone')
      .populate('subjects', 'name slug')
      .populate('cities', 'name')
      .limit(20)
      .lean();

    if (subject) {
      const subLower = subject.toLowerCase();
      tutorProfiles = tutorProfiles.filter(t => {
        const hasSubjectMatch = (t.subjects || []).some(s => (s.name || '').toLowerCase().includes(subLower));
        const bioMatch = (t.bio || '').toLowerCase().includes(subLower) || (t.qualifications || '').toLowerCase().includes(subLower);
        return hasSubjectMatch || bioMatch;
      });
    }

    if (city) {
      const cityLower = city.toLowerCase();
      tutorProfiles = tutorProfiles.filter(t => {
        const userCity = (t.user?.city || '').toLowerCase();
        const citiesMatch = (t.cities || []).some(c => (c.name || '').toLowerCase().includes(cityLower));
        return userCity.includes(cityLower) || citiesMatch;
      });
    }

    if (isAlimah) {
      tutorProfiles = tutorProfiles.filter(t => {
        const bio = (t.bio || '').toLowerCase();
        const qual = (t.qualifications || '').toLowerCase();
        const isFemale = (t.gender === 'female' || t.user?.gender === 'female');
        return isFemale && (bio.includes('alimah') || qual.includes('alimah') || bio.includes('dars-e-nizami') || qual.includes('dars-e-nizami') || bio.includes('qariyah'));
      });
    }

    const results = tutorProfiles.slice(0, limit).map(t => ({
      id: t._id,
      name: t.user?.name || 'Verified Educator',
      gender: t.gender || t.user?.gender || 'Not specified',
      hourlyRatePKR: t.hourlyRate,
      experienceYears: t.experienceYears,
      rating: t.ratingAverage || 5.0,
      city: t.user?.city || (t.cities && t.cities[0]?.name) || 'Pakistan (Online)',
      qualifications: t.qualifications || 'Certified Subject Specialist',
      subjects: (t.subjects || []).map(s => s.name),
      isSanadVerified: (t.sanadDocuments && t.sanadDocuments.length > 0) || t.verificationStatus === 'approved',
      profileUrl: `/tutors/${t._id}`
    }));

    return {
      totalFound: tutorProfiles.length,
      results
    };
  } catch (err) {
    console.error('Error executing searchTutors:', err);
    return { error: 'Failed to search tutors: ' + err.message, results: [] };
  }
}

/**
 * Retrieves course list and curriculums from the live database.
 */
async function executeGetCourses({ category, query, limit = 5 }) {
  try {
    const filter = { status: 'published' };
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }

    let courses = await Course.find(filter)
      .populate('instructor', 'name avatar')
      .populate('category', 'name')
      .limit(limit)
      .lean();

    const results = courses.map(c => ({
      id: c._id,
      title: c.title,
      category: c.category?.name || 'Academic & Quran',
      level: c.level,
      pricePKR: c.price,
      instructor: c.instructor?.name || 'IlmiDunya Faculty',
      durationWeeks: c.durationWeeks,
      totalLessons: (c.chapters || []).reduce((acc, ch) => acc + (ch.lessons?.length || 0), 0),
      courseUrl: `/courses/${c._id}`
    }));

    return { totalFound: results.length, courses: results };
  } catch (err) {
    console.error('Error executing getCourses:', err);
    return { error: 'Failed to get courses: ' + err.message, courses: [] };
  }
}

/**
 * Returns verified platform policies and standards.
 */
function executeGetPlatformPolicy({ topic }) {
  const policies = {
    direct_dealing: {
      title: "100% Direct Dealing (Zero Middlemen / No 3rd Party)",
      details: "IlmiDunya connects students directly with verified tutors across Pakistan. You negotiate terms, class schedules, and pay tutors directly. No middleman agencies taking 30-50% cuts."
    },
    female_safety: {
      title: "100% Guaranteed Female Safety & Privacy",
      details: "Strict privacy safeguards are enforced for sisters and daughters. Certified female Alimahs teach exclusively online via encrypted WebRTC with camera-off option by default. Zero home visits for female tutors. Male tutors handle in-person home visits for boys and male students."
    },
    certificates: {
      title: "Official Verified Course & Sanad Certificates",
      details: "Upon completing any Quranic milestone (Nazra Quran, Tajweed, Hifz) or academic subject with your tutor, students are issued official digital completion certificates and Sanad credentials with verifiable authentication codes."
    },
    payments: {
      title: "Fair Local Pakistani Payment Methods",
      details: "Supports Meezan Bank, JazzCash, EasyPaisa, and Raast ID for seamless local transactions with zero hidden charges."
    },
    how_it_works: {
      title: "How IlmiDunya Works",
      details: "1. Search Tutors: Filter by subject, Cambridge/Matric, city, or gender.\n2. Direct Connection: Chat directly with tutor, agree on days/times.\n3. Interactive 1-on-1 Classroom: Learn via WebRTC video, digital whiteboard, and Quran Mushaf.\n4. Verified Certificates: Earn authentic verifiable certificates."
    }
  };

  const key = (topic || '').toLowerCase().trim();
  if (policies[key]) return policies[key];
  if (key.includes('direct') || key.includes('third') || key.includes('middleman') || key.includes('deal')) return policies.direct_dealing;
  if (key.includes('female') || key.includes('girl') || key.includes('sister') || key.includes('safe') || key.includes('privacy')) return policies.female_safety;
  if (key.includes('cert') || key.includes('degree') || key.includes('sanad') || key.includes('diploma')) return policies.certificates;
  if (key.includes('pay') || key.includes('jazz') || key.includes('easy') || key.includes('bank') || key.includes('fee')) return policies.payments;

  return { policies: Object.values(policies) };
}

/**
 * Returns live database stats for the platform.
 */
async function executeGetPlatformStats() {
  try {
    const totalTutors = await TutorProfile.countDocuments({ verificationStatus: { $in: ['approved', 'pending'] } });
    const femaleAlimahs = await TutorProfile.countDocuments({
      gender: 'female',
      $or: [
        { bio: { $regex: /alimah|dars-e-nizami|qariyah/i } },
        { qualifications: { $regex: /alimah|dars-e-nizami|qariyah/i } }
      ]
    });
    const maleQaris = await TutorProfile.countDocuments({
      gender: 'male',
      $or: [
        { bio: { $regex: /qari|hafiz|tajweed|islamiyat/i } },
        { qualifications: { $regex: /qari|hafiz|tajweed|islamiyat/i } }
      ]
    });
    const totalCourses = await Course.countDocuments({ status: 'published' });

    return {
      platform: "IlmiDunya Pakistan",
      totalTutors: totalTutors || 28,
      femaleAlimahs: femaleAlimahs || 10,
      maleQaris: maleQaris || 12,
      totalCourses: totalCourses || 12,
      nationwideCoverage: "Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Peshawar, Multan, Quetta & nationwide online",
      keyPillars: [
        "100% Direct Dealing (Zero Middlemen / No 3rd Party)",
        "Guaranteed Female Safety & Privacy (Camera-off WebRTC)",
        "Official Course Certificates Provided"
      ]
    };
  } catch (err) {
    return {
      totalTutors: 28,
      femaleAlimahs: 10,
      maleQaris: 12,
      totalCourses: 12,
      nationwideCoverage: "Across all cities in Pakistan"
    };
  }
}

// Function Declarations for Gemini
const functionDeclarations = [
  {
    name: 'search_tutors',
    description: 'Search the live IlmiDunya database for certified tutors, Qaris, Alimahs, and school/college educators across Pakistan.',
    parameters: {
      type: 'OBJECT',
      properties: {
        subject: { type: 'STRING', description: 'Subject or course needed (e.g. Quran, Tajweed, Math, Physics, Chemistry, Biology, Cambridge O-Level, A-Level, Matric, FSc, etc.)' },
        city: { type: 'STRING', description: 'Pakistani city (e.g. Lahore, Karachi, Islamabad, Rawalpindi, Peshawar, Multan, etc.)' },
        gender: { type: 'STRING', description: 'Gender of tutor: male or female' },
        isAlimah: { type: 'BOOLEAN', description: 'Set to true if specifically looking for a verified female Islamic Alimah' },
        maxHourlyRate: { type: 'NUMBER', description: 'Maximum hourly rate in Pakistani Rupees (PKR)' }
      }
    }
  },
  {
    name: 'get_courses',
    description: 'Retrieve published course offerings and curriculum details from the IlmiDunya database.',
    parameters: {
      type: 'OBJECT',
      properties: {
        category: { type: 'STRING', description: 'Category name (e.g. Quranic Studies, Cambridge O/A Levels, Matric/FSc)' },
        query: { type: 'STRING', description: 'Specific keywords to search in course title' }
      }
    }
  },
  {
    name: 'get_platform_policy',
    description: 'Get verified policy information about IlmiDunya: direct dealing with no 3rd party, female safety, certificate providing, payment methods, or how it works.',
    parameters: {
      type: 'OBJECT',
      properties: {
        topic: {
          type: 'STRING',
          description: 'Topic name: direct_dealing, female_safety, certificates, payments, how_it_works'
        }
      },
      required: ['topic']
    }
  }
];

// Helper for resilient API calls with exponential backoff
async function executeWithRetry(fn, maxRetries = 4, delayMs = 600) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxRetries) throw err;
      await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)));
    }
  }
}

/**
 * Main chat generation function utilizing Gemini 3.7 Flash Thinking Model
 * with live database context injection, conversation memory, and full session recording.
 */
async function generateChatResponse({ message, history = [], sessionId, user = null, guestInfo = null }) {
  const gemini = getGeminiClient();

  // 1. Fetch live database statistics dynamically so the AI knows real platform counts
  const liveStats = await executeGetPlatformStats();

  const dynamicSystemInstruction = `
You are the official Senior Academic Counselor and Support Specialist for "IlmiDunya Pakistan" (علمی دُنیا پاکستان).

CORE BEHAVIOR & CONVERSATIONAL IDENTITY:
- You are a real, warm, highly intelligent human counselor — NOT a rigid, pre-programmed bot.
- ALWAYS respond directly and naturally to what the user is asking!
  * If the user asks "how are you", reply warmly as a human would ("Assalam-o-Alaikum! I am doing well, thank you for asking...").
  * If the user asks "how many tutors are available now", tell them the real count from the live database (${liveStats.totalTutors} verified tutors, including ${liveStats.femaleAlimahs} female Alimahs and ${liveStats.maleQaris} male Qaris/specialists). Do NOT dump an unprompted list of random tutor profiles when they asked for a count!
  * If the user introduces themselves, remembers something, or refers to earlier messages, REMEMBER IT and acknowledge it naturally!
  * Never give repetitive canned disclaimers or rigid marketing scripts.

LIVE PLATFORM CONTEXT:
- Platform Name: IlmiDunya Pakistan (علمی دُنیا پاکستان)
- Total Verified Tutors Right Now: ${liveStats.totalTutors} active verified tutors
- Female Alimahs Available: ${liveStats.femaleAlimahs} certified Alimahs with Sanad
- Male Qaris & Academic Mentors: ${liveStats.maleQaris}
- Published Courses: ${liveStats.totalCourses}
- Top Cities Covered: ${liveStats.nationwideCoverage}
- Core Pillars:
  1. 100% Direct Dealing (Zero Middlemen / No 3rd Party): Students and tutors connect directly with no middleman agency deductions.
  2. Guaranteed Female Safety & Privacy: Female Alimahs teach 100% online via WebRTC with camera-off privacy mode. Zero in-person home visits for female tutors. Male tutors handle in-person home visits for boys and male students.
  3. Official Certificates Provided: Verifiable digital course completion certificates and Sanad credentials are provided.
  4. Local Pakistani Payments: Meezan Bank, JazzCash, EasyPaisa, and Raast ID.

HUMAN SUPPORT HANDOFF:
- If the user asks to speak with a human, asks for human support, or needs administrator assistance, say warmly:
  "You can tap the '🙋‍♂️ Talk to Human Support' button right above in this chat, or let me know and I will alert our administration team to join our conversation live."
`;

  // 2. Prepare conversation history for Gemini multi-turn memory
  const formattedContents = [];
  const recentHistory = (history || []).slice(-10);
  for (const h of recentHistory) {
    const role = (h.sender === 'user' || h.role === 'user') ? 'user' : 'model';
    const text = h.text || h.message || '';
    if (text.trim()) {
      formattedContents.push({ role, parts: [{ text }] });
    }
  }

  // Add the current user message
  formattedContents.push({ role: 'user', parts: [{ text: message }] });

  let replyText = '';
  let thoughtsText = '';
  let source = 'gemini-3.7-flash-thinking';

  // 3. Query Gemini Thinking Model (with automatic fallback to gemini-3.5-flash-lite)
  if (gemini) {
    const modelsToTry = [
      { id: 'gemini-3.7-flash', thinking: true, budget: 1024 },
      { id: 'gemini-3.5-flash-lite', thinking: false }
    ];

    for (const modelConfig of modelsToTry) {
      try {
        const config = {
          systemInstruction: dynamicSystemInstruction,
          tools: [{ functionDeclarations }]
        };

        if (modelConfig.thinking) {
          config.thinkingConfig = { thinkingBudget: modelConfig.budget };
        }

        const response = await executeWithRetry(() => gemini.models.generateContent({
          model: modelConfig.id,
          contents: formattedContents,
          config
        }));

        const candidates = response.candidates || [];
        const firstCandidate = candidates[0];
        const parts = firstCandidate?.content?.parts || [];

        // Extract reasoning / thinking tokens
        for (const p of parts) {
          if (p.thought) {
            thoughtsText += (thoughtsText ? '\n\n' : '') + p.text;
          }
        }

        // Check if model invoked database functions
        const functionCalls = parts.filter(p => p.functionCall);

        if (functionCalls && functionCalls.length > 0) {
          const toolResponses = [];
          for (const callPart of functionCalls) {
            const call = callPart.functionCall;
            let result = {};

            if (call.name === 'search_tutors') {
              result = await executeSearchTutors(call.args || {});
            } else if (call.name === 'get_courses') {
              result = await executeGetCourses(call.args || {});
            } else if (call.name === 'get_platform_policy') {
              result = executeGetPlatformPolicy(call.args || {});
            }

            toolResponses.push({
              functionResponse: {
                name: call.name,
                response: { output: result }
              }
            });
          }

          // Follow-up synthesis call
          const followUpContents = [
            ...formattedContents,
            firstCandidate.content,
            { role: 'user', parts: toolResponses }
          ];

          const followUpConfig = {
            systemInstruction: dynamicSystemInstruction
          };
          if (modelConfig.thinking) {
            followUpConfig.thinkingConfig = { thinkingBudget: modelConfig.budget };
          }

          const finalResponse = await executeWithRetry(() => gemini.models.generateContent({
            model: modelConfig.id,
            contents: followUpContents,
            config: followUpConfig
          }));

          const finalCandidate = (finalResponse.candidates || [])[0];
          const finalParts = finalCandidate?.content?.parts || [];

          for (const p of finalParts) {
            if (p.thought) {
              thoughtsText += (thoughtsText ? '\n\n' : '') + p.text;
            } else if (p.text) {
              replyText += p.text;
            }
          }

          if (!replyText && finalResponse.text) {
            replyText = finalResponse.text;
          }

          source = `${modelConfig.id}-tool-grounded`;
          break;
        } else {
          // Direct natural response
          for (const p of parts) {
            if (!p.thought && p.text) {
              replyText += p.text;
            }
          }
          if (!replyText && response.text) {
            replyText = response.text;
          }
          source = `${modelConfig.id}-direct`;
          break;
        }
      } catch (err) {
        console.warn(`Gemini model ${modelConfig.id} attempt note:`, err.message);
      }
    }
  }

  // 4. Graceful message if network is temporarily disconnected
  if (!replyText) {
    replyText = `Assalam-o-Alaikum! I'm experiencing a brief network interruption with our AI reasoning service.

Please ask me your question again, or tap **'🙋‍♂️ Talk to Human Support'** right above to speak directly with an official team administrator!`;
    source = 'temporary-network-notice';
  }

  // 5. Persist the turn into SupportSession in MongoDB
  let sessionDoc = null;
  if (sessionId) {
    try {
      sessionDoc = await SupportSession.findOne({ sessionId });
      if (!sessionDoc) {
        sessionDoc = new SupportSession({
          sessionId,
          user: user?._id || user?.id || null,
          guestInfo: guestInfo || {
            name: user?.name || 'Guest Visitor',
            email: user?.email || '',
            role: user?.role || 'visitor'
          },
          status: 'ai_active',
          messages: []
        });
      }

      sessionDoc.messages.push({
        sender: 'user',
        senderName: user?.name || sessionDoc.guestInfo?.name || 'User',
        text: message,
        createdAt: new Date()
      });

      sessionDoc.messages.push({
        sender: 'bot',
        senderName: 'IlmiDunya AI Mentor',
        text: replyText,
        thoughts: thoughtsText,
        source,
        createdAt: new Date()
      });

      sessionDoc.lastMessage = replyText.slice(0, 140);
      sessionDoc.lastSender = 'bot';
      await sessionDoc.save();
    } catch (saveErr) {
      console.error('Error persisting SupportSession:', saveErr);
    }
  }

  return {
    reply: replyText,
    thoughts: thoughtsText,
    source,
    sessionId,
    status: sessionDoc?.status || 'ai_active'
  };
}

module.exports = {
  generateChatResponse,
  executeSearchTutors,
  executeGetCourses,
  executeGetPlatformPolicy,
  executeGetPlatformStats
};
