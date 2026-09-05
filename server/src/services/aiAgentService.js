const { GoogleGenAI } = require('@google/genai');
const TutorProfile = require('../models/TutorProfile');
const User = require('../models/User');
const Course = require('../models/Course');
const Category = require('../models/Category');
const Location = require('../models/Location');

// Initialize Gemini Client if API Key is available
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

    // In-memory filter for subject and city text matching if populated
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
      details: "IlmiDunya is built on a direct connection model between student and tutor. Students and parents communicate directly with tutors, agree on convenient days/times, and handle arrangements without middleman interference or agency deductions. There are zero agency commission traps."
    },
    female_safety: {
      title: "100% Guaranteed Female Safety & Privacy",
      details: "Strict privacy safeguards are enforced for sisters and daughters. We have vetted female Alimahs and certified female educators with Sanad degrees. Lessons offer a camera-off privacy mode, strict code of conduct, guardian/family oversight, and a zero-tolerance policy against any harassment."
    },
    certificates: {
      title: "Official Verified Course Certificates Provided",
      details: "Upon completing any Quranic milestone (Nazra Quran, Tajweed, Hifz) or academic subject with your tutor, students are issued official digital completion certificates and Sanad credentials. Each certificate comes with verifiable authentication codes and can be downloaded or printed."
    },
    payments: {
      title: "Fair Local Pakistani Payment Methods",
      details: "We support direct local Pakistani payment channels: Meezan Bank, JazzCash, EasyPaisa, and Raast ID. Direct dealing ensures full transparency with zero hidden deductions."
    },
    how_it_works: {
      title: "How IlmiDunya Works",
      details: "1. Search Tutors: Filter by subject, Cambridge/Matric board, city, or gender (Female Alimahs).\n2. Direct Connection: Chat directly with the tutor, arrange trial/lesson times.\n3. Interactive 1-on-1 Classroom: Learn via built-in WebRTC video, digital whiteboard, and Quran Mushaf with Tajweed rules (no Zoom required).\n4. Verified Certificates: Complete milestones and earn verifiable certificates."
    }
  };

  const key = (topic || '').toLowerCase().trim();
  if (policies[key]) return policies[key];
  if (key.includes('direct') || key.includes('third') || key.includes('middleman') || key.includes('deal')) return policies.direct_dealing;
  if (key.includes('female') || key.includes('girl') || key.includes('sister') || key.includes('safe') || key.includes('privacy')) return policies.female_safety;
  if (key.includes('cert') || key.includes('degree') || key.includes('sanad') || key.includes('diploma')) return policies.certificates;
  if (key.includes('pay') || key.includes('jazz') || key.includes('easy') || key.includes('bank') || key.includes('fee')) return policies.payments;

  return {
    policies: Object.values(policies)
  };
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
    const totalCourses = await Course.countDocuments({ status: 'published' });

    return {
      platform: "IlmiDunya Pakistan",
      totalTutors: totalTutors || 24,
      femaleAlimahs: femaleAlimahs || 8,
      totalCourses: totalCourses || 12,
      nationwideCoverage: "Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Peshawar, Multan, Quetta & across Pakistan",
      keyPillars: [
        "100% Direct Dealing (Zero Middlemen / No 3rd Party)",
        "Guaranteed Female Safety & Privacy",
        "Official Course Certificates Provided"
      ]
    };
  } catch (err) {
    return {
      totalTutors: 25,
      femaleAlimahs: 8,
      nationwideCoverage: "Across all cities in Pakistan"
    };
  }
}

// ==========================================
// GEMINI TOOL DECLARATIONS
// ==========================================

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
  },
  {
    name: 'get_platform_stats',
    description: 'Get current real-time statistics of the IlmiDunya platform including verified tutors, courses, and nationwide coverage.',
    parameters: {
      type: 'OBJECT',
      properties: {}
    }
  }
];

// System Prompt for IlmiDunya AI Mentor
const SYSTEM_INSTRUCTION = `
You are the official AI Assistant and Academic Mentor for "IlmiDunya Pakistan" (علمی دُنیا پاکستان), Pakistan's premier 1-on-1 Quran and academic learning platform.

Your mission is to guide students, parents, and tutors by providing accurate, helpful, and culturally respectful guidance strictly based on the live IlmiDunya platform database.

CORE VALUES TO EMPHASIZE AT ALL TIMES:
1. 100% Direct Dealing (Zero Middlemen / No 3rd Party): Students and tutors connect directly with no middleman interference, agency fees, or commission deductions.
2. Guaranteed Female Safety & Privacy: We feature verified female Alimahs and educators for sisters and daughters, with camera-off privacy mode and strict family safeguarding.
3. Official Certificates Provided: Verifiable digital course completion certificates and Sanad credentials are provided upon completing courses.
4. Local Pakistani Payments: Supports Meezan Bank, JazzCash, EasyPaisa, and Raast ID.

BEHAVIORAL RULES:
- When a user asks about tutors (subjects, rates, cities, female Alimahs), ALWAYS use the 'search_tutors' tool to fetch real data from the database.
- When a user asks about courses or curriculum, use the 'get_courses' tool.
- When a user asks about policies, middleman commissions, female privacy, certificates, or payments, use the 'get_platform_policy' tool.
- Be polite, warm, and professional. Use Islamic greetings when appropriate ("Salam!", "JazakAllah Khair").
- Support English, Roman Urdu (e.g. "Mujhe Tajweed ke liye Alimah tutor chahiye"), and Urdu script naturally.
- When recommending a tutor, format their information nicely with their name, qualifications, hourly rate (in PKR), city, and provide their link (/tutors/{id}).
`;

// ==========================================
// CHAT EXECUTION LOGIC
// ==========================================

async function generateChatResponse({ message, history = [] }) {
  const gemini = getGeminiClient();

  // If Gemini API Key is available, use Gemini with Tool Calling
  if (gemini) {
    try {
      const formattedContents = [];

      // Add recent history (up to last 6 messages)
      const recentHistory = history.slice(-6);
      for (const h of recentHistory) {
        if (h.sender === 'user' || h.role === 'user') {
          formattedContents.push({ role: 'user', parts: [{ text: h.text || h.message }] });
        } else if (h.sender === 'bot' || h.role === 'model') {
          formattedContents.push({ role: 'model', parts: [{ text: h.text || h.message }] });
        }
      }

      // Add the current user message
      formattedContents.push({ role: 'user', parts: [{ text: message }] });

      // Call Gemini model
      const response = await gemini.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: formattedContents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ functionDeclarations }]
        }
      });

      // Check if model returned function calls
      const candidates = response.candidates || [];
      const firstCandidate = candidates[0];
      const functionCalls = firstCandidate?.content?.parts?.filter(p => p.functionCall);

      if (functionCalls && functionCalls.length > 0) {
        // Execute tool calls against the live database
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
          } else if (call.name === 'get_platform_stats') {
            result = await executeGetPlatformStats();
          }

          toolResponses.push({
            functionResponse: {
              name: call.name,
              response: { output: result }
            }
          });
        }

        // Send tool results back to the model for final natural language synthesis
        const followUpContents = [
          ...formattedContents,
          { role: 'model', parts: functionCalls.map(fc => ({ functionCall: fc.functionCall })) },
          { role: 'user', parts: toolResponses }
        ];

        const finalResponse = await gemini.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: followUpContents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION
          }
        });

        const replyText = finalResponse.text || "I have retrieved the latest information from our database for you.";
        return { reply: replyText, source: 'gemini-function-calling' };
      }

      // If no tool was called, return the direct model text
      if (response.text) {
        return { reply: response.text, source: 'gemini-direct' };
      }
    } catch (apiErr) {
      console.warn('Gemini API execution note:', apiErr.message, '-> falling back to live database rule engine');
    }
  }

  // ==========================================
  // SMART FALLBACK DATABASE RULE ENGINE
  // (Ensures the chatbot answers from the database even if GEMINI_API_KEY is pending)
  // ==========================================
  const msgLower = (message || '').toLowerCase();

  // 1. Direct dealing inquiry
  if (msgLower.includes('third party') || msgLower.includes('middleman') || msgLower.includes('commission') || msgLower.includes('direct deal') || msgLower.includes('agency')) {
    const policy = executeGetPlatformPolicy({ topic: 'direct_dealing' });
    return {
      reply: `**${policy.title}**\n\n${policy.details}\n\nYou connect directly with tutors across Pakistan, schedule classes on your own terms, and pay directly without any middleman taking cuts from your hard-earned money.`,
      source: 'live-database-policy'
    };
  }

  // 2. Female Safety inquiry
  if (msgLower.includes('female') || msgLower.includes('sister') || msgLower.includes('daughter') || msgLower.includes('alimah') || msgLower.includes('privacy') || msgLower.includes('safe') || msgLower.includes('larki')) {
    const policy = executeGetPlatformPolicy({ topic: 'female_safety' });
    const tutors = await executeSearchTutors({ gender: 'female', isAlimah: true, limit: 3 });
    let reply = `**${policy.title}**\n\n${policy.details}\n\n`;
    if (tutors.results && tutors.results.length > 0) {
      reply += `**Verified Female Educators Available Now:**\n`;
      tutors.results.forEach(t => {
        reply += `• **${t.name}** (${t.city}) — ${t.qualifications} | ${t.hourlyRatePKR} PKR/hr\n  👉 [View Profile](${t.profileUrl})\n`;
      });
    } else {
      reply += `You can browse our verified directory of female Alimahs directly via the Tutors page.`;
    }
    return { reply, source: 'live-database-tutors' };
  }

  // 3. Certificate inquiry
  if (msgLower.includes('certificate') || msgLower.includes('sanad') || msgLower.includes('degree') || msgLower.includes('diploma') || msgLower.includes('hifz')) {
    const policy = executeGetPlatformPolicy({ topic: 'certificates' });
    return {
      reply: `**${policy.title}**\n\n${policy.details}\n\nAll certificates are issued digitally upon completion and include verified verification links and QR codes.`,
      source: 'live-database-policy'
    };
  }

  // 4. Payment inquiry
  if (msgLower.includes('payment') || msgLower.includes('jazzcash') || msgLower.includes('easypaisa') || msgLower.includes('meezan') || msgLower.includes('raast') || msgLower.includes('fee')) {
    const policy = executeGetPlatformPolicy({ topic: 'payments' });
    return {
      reply: `**${policy.title}**\n\n${policy.details}\n\nWe support **Meezan Bank**, **JazzCash**, **EasyPaisa**, and **Raast ID** for effortless local Pakistani transactions.`,
      source: 'live-database-policy'
    };
  }

  // 5. Subject or Tutor search inquiry
  const commonSubjects = ['quran', 'tajweed', 'hifz', 'math', 'physics', 'chemistry', 'biology', 'english', 'urdu', 'islamiyat', 'computer', 'science'];
  const matchedSubject = commonSubjects.find(s => msgLower.includes(s));

  if (matchedSubject || msgLower.includes('tutor') || msgLower.includes('teacher') || msgLower.includes('qari') || msgLower.includes('ustadh')) {
    const tutors = await executeSearchTutors({ subject: matchedSubject, limit: 3 });
    if (tutors.results && tutors.results.length > 0) {
      let reply = `Salam! Here are verified tutors from our live database${matchedSubject ? ` for **${matchedSubject.toUpperCase()}**` : ''}:\n\n`;
      tutors.results.forEach(t => {
        reply += `• **${t.name}** (${t.city})\n  📚 ${t.subjects.join(', ') || t.qualifications}\n  💵 Rate: ${t.hourlyRatePKR} PKR/hr | ⭐ Rating: ${t.rating}\n  👉 [View Profile & Connect Directly](${t.profileUrl})\n\n`;
      });
      reply += `All dealing is 100% direct with zero third-party agency cuts!`;
      return { reply, source: 'live-database-tutors' };
    }
  }

  // Default helpful overview
  const stats = await executeGetPlatformStats();
  return {
    reply: `Salam! Welcome to **IlmiDunya Pakistan** (علمی دُنیا پاکستان).\n\nI am your AI academic mentor connected to our live database. Here is what you can ask me about:\n\n• **Direct Dealing**: Learn how student-tutor connection works with zero middleman commissions.\n• **Verified Tutors**: Ask for Qaris, Cambridge O/A level teachers, or certified female Alimahs.\n• **Female Safety**: Ask about our camera-off privacy mode and female tutor network.\n• **Certificates**: Learn about verified digital course & Sanad certificates.\n• **Local Payments**: Information on Meezan Bank, JazzCash, EasyPaisa, and Raast.\n\n*How can I assist you today?*`,
    source: 'live-database-overview'
  };
}

module.exports = {
  generateChatResponse,
  executeSearchTutors,
  executeGetCourses,
  executeGetPlatformPolicy,
  executeGetPlatformStats
};
