const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
const FAQ = require('../models/FAQ');
const SupportSession = require('../models/SupportSession');

let supabaseInstance = null;

const getSupabaseClient = () => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  try {
    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      },
      realtime: {
        transport: WebSocket
      }
    });
    console.log('✅ Supabase PostgreSQL Client initialized successfully');
    return supabaseInstance;
  } catch (error) {
    console.warn('⚠️ Supabase initialization note:', error.message);
    return null;
  }
};

/**
 * Fetch active FAQs from Supabase with graceful fallback to MongoDB
 */
async function getKnowledgeBaseFAQs(category = null) {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      let query = supabase.from('support_faqs').select('*').eq('is_active', true).order('display_order', { ascending: true });
      if (category) {
        query = query.eq('category', category);
      }
      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (err) {
      // Graceful fallback to MongoDB
    }
  }

  // MongoDB fallback
  try {
    const mongoQuery = { isActive: true };
    if (category) mongoQuery.category = category;
    const mongoFaqs = await FAQ.find(mongoQuery).sort({ displayOrder: 1 }).lean();
    return mongoFaqs.map(f => ({
      id: f._id.toString(),
      question: f.question,
      answer: f.answer,
      category: f.category,
      tags: f.tags || [],
      is_active: f.isActive,
      display_order: f.displayOrder
    }));
  } catch (err) {
    return [];
  }
}

/**
 * Perform semantic search using Supabase pgvector with keyword fallback
 */
async function searchKnowledgeBase({ queryText, embedding = null, limit = 5, category = null }) {
  const supabase = getSupabaseClient();
  
  // 1. Try Supabase pgvector RPC
  if (supabase && Array.isArray(embedding) && embedding.length > 0) {
    try {
      const { data, error } = await supabase.rpc('match_support_faqs', {
        query_embedding: embedding,
        match_threshold: 0.35,
        match_count: limit,
        filter_category: category || null
      });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (rpcErr) {
      // RPC not installed yet or vector size mismatch; fall through to lexical search
    }
  }

  // 2. Lexical / Keyword fallback search across FAQs
  const allFaqs = await getKnowledgeBaseFAQs(category);
  if (!allFaqs || allFaqs.length === 0) return [];

  const tokens = (queryText || '').toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const scored = allFaqs.map(faq => {
    let score = 0;
    const qLower = (faq.question || '').toLowerCase();
    const aLower = (faq.answer || '').toLowerCase();
    const tagsLower = (faq.tags || []).join(' ').toLowerCase();

    tokens.forEach(tok => {
      if (qLower.includes(tok)) score += 3;
      if (tagsLower.includes(tok)) score += 2;
      if (aLower.includes(tok)) score += 1;
    });

    return { ...faq, similarity: score > 0 ? Math.min(score / 10, 0.99) : 0 };
  });

  return scored.filter(f => f.similarity > 0).sort((a, b) => b.similarity - a.similarity).slice(0, limit);
}

/**
 * Create or update FAQ across Supabase and MongoDB
 */
async function saveSupportFAQ(faqData) {
  let savedId = null;
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data, error } = await supabase.from('support_faqs').insert([{
        question: faqData.question,
        answer: faqData.answer,
        category: faqData.category || 'general',
        tags: faqData.tags || [],
        is_active: faqData.isActive !== false,
        display_order: faqData.displayOrder || 0,
        embedding: faqData.embedding || null
      }]).select().single();

      if (!error && data) {
        savedId = data.id;
      }
    } catch (e) {}
  }

  // Save in MongoDB as well for dual-sync reliability
  const mongoDoc = await FAQ.create({
    question: faqData.question,
    answer: faqData.answer,
    category: faqData.category || 'general',
    tags: faqData.tags || [],
    isActive: faqData.isActive !== false,
    displayOrder: faqData.displayOrder || 0,
    embedding: faqData.embedding || []
  });

  return savedId || mongoDoc._id.toString();
}

/**
 * Record a message in Supabase and MongoDB SupportSession
 */
async function recordSupportTurn({ sessionId, user, guestInfo, userMessage, botReply, thoughts = '', source = '', metadata = {} }) {
  const supabase = getSupabaseClient();

  // 1. Persist in Supabase if available
  if (supabase) {
    try {
      await supabase.from('support_sessions').upsert({
        session_id: sessionId,
        user_id: user?._id ? user._id.toString() : null,
        user_name: user?.name || guestInfo?.name || 'Guest Visitor',
        user_email: user?.email || guestInfo?.email || '',
        user_role: user?.role || guestInfo?.role || 'visitor',
        city: user?.city || guestInfo?.city || '',
        status: 'ai_active',
        topic: metadata.topic || 'General Support',
        updated_at: new Date().toISOString()
      }, { onConflict: 'session_id' });

      await supabase.from('support_messages').insert([
        {
          session_id: sessionId,
          sender: 'user',
          sender_name: user?.name || guestInfo?.name || 'User',
          text: userMessage,
          metadata: {}
        },
        {
          session_id: sessionId,
          sender: 'bot',
          sender_name: 'IlmiDunya Counselor',
          text: botReply,
          metadata: { thoughts, source, ...metadata }
        }
      ]);
    } catch (e) {
      // Supabase tables not ready yet
    }
  }

  // 2. Persist in MongoDB SupportSession
  try {
    let session = await SupportSession.findOne({ sessionId });
    if (!session) {
      session = new SupportSession({
        sessionId,
        user: user?._id || null,
        guestInfo: guestInfo || { name: user?.name || 'Guest Visitor', email: user?.email || '', role: user?.role || 'visitor' },
        status: 'ai_active',
        messages: []
      });
    }

    session.messages.push(
      {
        sender: 'user',
        senderName: user?.name || guestInfo?.name || 'User',
        text: userMessage,
        createdAt: new Date()
      },
      {
        sender: 'bot',
        senderName: 'IlmiDunya Counselor',
        text: botReply,
        thoughts,
        source,
        createdAt: new Date()
      }
    );

    session.lastMessage = botReply;
    session.lastSender = 'bot';
    await session.save();
    return session;
  } catch (err) {
    console.error('Error persisting SupportSession in MongoDB:', err.message);
    return null;
  }
}

module.exports = {
  getSupabaseClient,
  getKnowledgeBaseFAQs,
  searchKnowledgeBase,
  saveSupportFAQ,
  recordSupportTurn
};
