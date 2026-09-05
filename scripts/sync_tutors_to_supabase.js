/**
 * Script: sync_tutors_to_supabase.js
 * Reads data/tutors.json, generates vector embeddings, and upserts records into Supabase pgvector.
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'server', '.env') });
const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in server/.env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: WebSocket }
});

function buildTutorEmbeddingText(tutor) {
  return `Tutor Name: ${tutor.name}
Gender: ${tutor.gender}
City: ${tutor.city}, Pakistan
Teaching Modes: ${tutor.teachingModes.join(', ')}
Subjects Taught: ${tutor.subjects.join(', ')}
Qualifications & Sanad: ${tutor.qualifications}
Experience: ${tutor.experienceYears} years
Bio: ${tutor.bio}
Profile URL: ${tutor.profileUrl}`;
}

async function getOpenAIEmbedding(text) {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is missing in server/.env. Please provide your OpenAI key.');
  }

  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text
    })
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`OpenAI API error (${res.status}): ${errBody}`);
  }

  const data = await res.json();
  return data.data[0].embedding;
}

async function syncTutors() {
  const jsonPath = path.join(__dirname, '..', 'data', 'tutors.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ Data file not found: ${jsonPath}. Run scripts/scrape_tutors.js first.`);
    process.exit(1);
  }

  const tutors = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`📦 Loaded ${tutors.length} tutors from ${jsonPath}`);

  for (let i = 0; i < tutors.length; i++) {
    const t = tutors[i];
    const contentText = buildTutorEmbeddingText(t);
    console.log(`\n[${i + 1}/${tutors.length}] Processing: ${t.name} (${t.city}, ${t.gender})...`);

    let embedding = null;
    try {
      console.log(`   Generating OpenAI embedding (text-embedding-3-small)...`);
      embedding = await getOpenAIEmbedding(contentText);
      console.log(`   ✅ Embedding generated (length: ${embedding.length})`);
    } catch (embErr) {
      console.warn(`   ⚠️ Embedding note: ${embErr.message}`);
    }

    const record = {
      id: t.id,
      name: t.name,
      city: t.city,
      gender: t.gender,
      qualifications: t.qualifications,
      bio: t.bio,
      experience_years: t.experienceYears,
      hourly_rate: t.hourlyRate,
      rating_average: t.ratingAverage,
      rating_count: t.ratingCount,
      teaching_modes: t.teachingModes,
      subjects: t.subjects,
      profile_url: t.profileUrl,
      content_text: contentText,
      embedding: embedding,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from('tutors').upsert(record);
    if (error) {
      console.error(`   ❌ Failed to upsert to Supabase:`, error.message);
    } else {
      console.log(`   ✅ Upserted to Supabase table 'tutors' successfully!`);
    }
  }

  console.log(`\n🎉 All tutors synced to Supabase!`);
}

if (require.main === module) {
  syncTutors();
}

module.exports = { syncTutors, buildTutorEmbeddingText, getOpenAIEmbedding };
