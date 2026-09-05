const { createClient } = require('@supabase/supabase-js');

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
      }
    });
    console.log('✅ Supabase PostgreSQL Client initialized successfully');
    return supabaseInstance;
  } catch (error) {
    console.warn('⚠️ Supabase initialization note:', error.message);
    return null;
  }
};

module.exports = {
  getSupabaseClient
};
