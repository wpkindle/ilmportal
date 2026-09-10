const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
const FAQ = require('../models/FAQ');

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

module.exports = {
  getSupabaseClient,
  getKnowledgeBaseFAQs,
  saveSupportFAQ
};
