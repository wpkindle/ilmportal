const dns = require('dns');
if (dns.setDefaultResultOrder) dns.setDefaultResultOrder('ipv4first');

const { GoogleGenAI } = require('@google/genai');
const { buildRagContext } = require('./supportRagService');
const { recordSupportTurn } = require('../config/supabaseClient');

let genAi = null;
function getGeminiClient() {
  if (!genAi) {
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (key) {
      genAi = new GoogleGenAI({ apiKey: key });
    }
  }
  return genAi;
}

/**
 * Detect user language: 'urdu', 'roman_urdu', or 'english'
 */
function detectLanguage(text = '') {
  // Check for Arabic/Urdu Unicode script
  const urduScriptRegex = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
  if (urduScriptRegex.test(text)) {
    return 'urdu';
  }

  // Common Roman Urdu patterns
  const romanUrduWords = [
    'kese', 'kaise', 'kya', 'hai', 'hain', 'mein', 'mujhe', 'chahiye',
    'batao', 'bataen', 'kitna', 'kitni', 'parhna', 'parhana', 'shukriya',
    'ap', 'aap', 'mera', 'meri', 'walay', 'wali', 'karna', 'kren'
  ];
  const words = text.toLowerCase().split(/\s+/);
  const matchCount = words.filter(w => romanUrduWords.includes(w)).length;
  if (matchCount >= 2) {
    return 'roman_urdu';
  }

  return 'english';
}

/**
 * Check if the message or context warrants human support escalation
 */
function checkEscalationTriggers(message = '', history = []) {
  const qLower = (message || '').toLowerCase();

  // 1. Explicit human request
  const explicitHumanKeywords = [
    'talk to human', 'human support', 'speak to human', 'human agent',
    'real person', 'call me', 'talk to person', 'representative', 'customer care',
    'admin se baat', 'insan se baat', 'agent chahiye'
  ];
  if (explicitHumanKeywords.some(k => qLower.includes(k))) {
    return { shouldEscalate: true, reason: 'User explicitly requested human support' };
  }

  // 2. Dispute, Fraud, Complaint or Refund triggers
  const disputeKeywords = [
    'scam', 'fraud', 'stolen', 'cheated', 'complaint', 'harassment',
    'report tutor', 'bad behavior', 'dispute', 'refund my money', 'chargeback'
  ];
  if (disputeKeywords.some(k => qLower.includes(k))) {
    return { shouldEscalate: true, reason: 'Safety, dispute, or complaint issue reported' };
  }

  // 3. Detected user frustration across turns
  const frustrationKeywords = [
    'not helping', 'useless', 'stupid bot', 'not what i asked', 'wrong answer',
    'answer my question', 'bekar', 'galat jawab', 'samajh nahi aya'
  ];
  if (frustrationKeywords.some(k => qLower.includes(k))) {
    return { shouldEscalate: true, reason: 'User frustration detected' };
  }

  return { shouldEscalate: false, reason: null };
}

/**
 * Generate AI Support Chat Response using Dual-Source RAG + Gemini
 */
async function generateSupportChatResponse({ message, history = [], sessionId, user = null, guestInfo = null }) {
  const gemini = getGeminiClient();
  const lang = detectLanguage(message);
  const escalation = checkEscalationTriggers(message, history);

  // 1. Assemble RAG Context (Supabase FAQs + Live MongoDB Platform/Account Data)
  const { contextText, liveStats, relevantFaqs, matchedTutors, userAccountContext } = await buildRagContext({
    message,
    user
  });

  // 2. Construct Dynamic System Instructions
  const systemInstruction = `You are the official Senior Academic Counselor & Front-Desk Support Guide for "IlmiDunya Pakistan" (علمی دُنیا پاکستان).
You are a warm, highly empathetic, and direct human counselor. You help visitors and students navigate the platform, find tutors, understand trial & fee policies, and check their account status.

LANGUAGE & SCRIPT INSTRUCTIONS:
- Detected User Language: ${lang.toUpperCase()}
- If the user writes in Urdu (Arabic script): Reply in fluent, authentic Urdu (اردو).
- If the user writes in Roman Urdu: Reply in friendly, natural Roman Urdu.
- If the user writes in English: Reply in clear, warm, professional English.
- Always maintain warmth and courtesy (e.g. "Assalam-o-Alaikum!").

CORE PRINCIPLES & BOUNDARIES:
- ALWAYS respond directly to what the user asks!
- If the user asks "how are you", reply warmly as a human would ("Alhamdulillah, I am doing well, thank you for asking!").
- If the user asks for tutor counts, give the real number (${liveStats.totalTutors} verified tutors, including ${liveStats.femaleAlimahs} certified female Alimahs and ${liveStats.maleQaris} specialized male Qaris) without dumping unprompted lists.
- If the user asks for tutors in a specific city/subject, refer to the MATCHING LIVE VERIFIED TUTORS provided in context.
- If the user asks about their own trials or payments, refer strictly to their LOGGED-IN USER ACCOUNT CONTEXT.
- If you do not know an exact detail or if the user asks for a refund/dispute, admit it kindly and encourage them to tap '🙋‍♂️ Talk to Human Support'.
- NEVER make up or hallucinate tutor availability or fee rates not in your context.
- Keep replies concise, helpful, and beautifully formatted with clean bullet points where appropriate.

${contextText}
`;

  // 3. Multi-turn conversation contents
  const contents = [];
  const recentHistory = (history || []).slice(-8);
  for (const h of recentHistory) {
    const role = (h.sender === 'user' || h.role === 'user') ? 'user' : 'model';
    const text = h.text || h.message || '';
    if (text.trim()) {
      contents.push({ role, parts: [{ text }] });
    }
  }
  contents.push({ role: 'user', parts: [{ text: message }] });

  let replyText = '';
  let thoughtsText = '';
  let source = 'gemini-3.5-flash-lite';

  // 4. Model cascade with IPv4-optimized connection
  if (gemini) {
    const modelsToTry = [
      'gemini-3.5-flash-lite',
      'gemini-flash-lite-latest',
      'gemini-3.6-flash',
      'gemini-3.1-flash-lite'
    ];

    for (const modelId of modelsToTry) {
      try {
        const response = await gemini.models.generateContent({
          model: modelId,
          contents,
          config: {
            systemInstruction,
            temperature: 0.65
          }
        });

        const candidate = (response.candidates || [])[0];
        const parts = candidate?.content?.parts || [];

        for (const p of parts) {
          if (p.thought) {
            thoughtsText += (thoughtsText ? '\n\n' : '') + p.text;
          } else if (p.text) {
            replyText += p.text;
          }
        }

        if (!replyText && response.text) {
          replyText = response.text;
        }

        if (replyText) {
          source = `${modelId}-direct`;
          break;
        }
      } catch (err) {
        console.warn(`Support agent model ${modelId} note:`, err.message?.slice(0, 80));
      }
    }
  }

  // 5. Intelligent contextual fallback if all LLMs are unreachable
  if (!replyText) {
    const qLower = (message || '').toLowerCase();
    if (qLower.includes('trial') || qLower.includes('demo')) {
      replyText = `Assalam-o-Alaikum! On IlmiDunya Pakistan, every student gets a **3-day free trial** with their chosen tutor to evaluate teaching style and compatibility. No advance payment is needed during the trial! You can tap **'🙋‍♂️ Talk to Human Support'** if you need assistance booking a trial.`;
    } else if (qLower.includes('how many') || qLower.includes('count')) {
      replyText = `We currently have **${liveStats.totalTutors} verified tutors** on IlmiDunya, including ${liveStats.femaleAlimahs} certified female Alimahs (with Sanad) and ${liveStats.maleQaris} specialized male Qaris. Are you looking for a tutor in a specific subject?`;
    } else if (qLower.includes('how are you') || qLower.includes('kese ho')) {
      replyText = `Assalam-o-Alaikum! I am doing well, Alhamdulillah, thank you for asking! 😊 How are you doing today, and how can I help you find the right tutor or course on IlmiDunya?`;
    } else {
      replyText = `Assalam-o-Alaikum! I am your IlmiDunya Support Counselor. We have **${liveStats.totalTutors} verified tutors** ready for 1-on-1 sessions. How can I assist you with your classes or questions today? You can also tap **'🙋‍♂️ Talk to Human Support'** at any time.`;
    }
    source = 'support-context-fallback';
  }

  // 6. Dual-persist conversation turn (Supabase + MongoDB)
  const activeSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  await recordSupportTurn({
    sessionId: activeSessionId,
    user,
    guestInfo,
    userMessage: message,
    botReply: replyText,
    thoughts: thoughtsText,
    source,
    metadata: {
      language: lang,
      shouldEscalate: escalation.shouldEscalate,
      escalationReason: escalation.reason
    }
  });

  return {
    success: true,
    reply: replyText,
    thoughts: thoughtsText,
    source,
    sessionId: activeSessionId,
    language: lang,
    shouldEscalate: escalation.shouldEscalate,
    escalationReason: escalation.reason,
    liveStats: {
      totalTutors: liveStats.totalTutors,
      femaleAlimahs: liveStats.femaleAlimahs,
      courses: liveStats.totalCourses
    }
  };
}

module.exports = {
  generateSupportChatResponse,
  detectLanguage,
  checkEscalationTriggers
};
