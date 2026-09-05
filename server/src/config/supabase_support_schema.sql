-- ==============================================================================
-- ILMIDUNYA PAKISTAN - SUPABASE AI SUPPORT & KNOWLEDGE BASE SCHEMA
-- Includes pgvector for Semantic Search, Support Sessions, Messages & FAQs
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Support FAQs Table (Admin-Managed Knowledge Base)
CREATE TABLE IF NOT EXISTS support_faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'general', -- 'tutors', 'courses', 'pricing_trials', 'female_safety', 'account', 'general'
    tags TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    embedding vector(3072), -- Dimension for Gemini gemini-embedding-2-preview
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_faqs_category ON support_faqs(category);
CREATE INDEX IF NOT EXISTS idx_support_faqs_active ON support_faqs(is_active);

-- 3. Vector Similarity Search Function
CREATE OR REPLACE FUNCTION match_support_faqs (
    query_embedding vector(3072),
    match_threshold float DEFAULT 0.4,
    match_count int DEFAULT 5,
    filter_category varchar DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    question text,
    answer text,
    category varchar(100),
    tags text[],
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        support_faqs.id,
        support_faqs.question,
        support_faqs.answer,
        support_faqs.category,
        support_faqs.tags,
        1 - (support_faqs.embedding <=> query_embedding) AS similarity
    FROM support_faqs
    WHERE support_faqs.is_active = true
      AND (filter_category IS NULL OR support_faqs.category = filter_category)
      AND (1 - (support_faqs.embedding <=> query_embedding)) > match_threshold
    ORDER BY support_faqs.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- 4. Support Sessions Table (Conversations)
CREATE TABLE IF NOT EXISTS support_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(100) UNIQUE NOT NULL,
    user_id VARCHAR(100) DEFAULT NULL,
    user_name VARCHAR(255) DEFAULT 'Guest Visitor',
    user_email VARCHAR(255) DEFAULT '',
    user_role VARCHAR(50) DEFAULT 'visitor',
    city VARCHAR(100) DEFAULT '',
    status VARCHAR(50) DEFAULT 'ai_active', -- 'ai_active', 'human_requested', 'admin_joined', 'resolved', 'closed'
    assigned_admin_id VARCHAR(100) DEFAULT NULL,
    assigned_admin_name VARCHAR(255) DEFAULT NULL,
    topic VARCHAR(100) DEFAULT 'General Support',
    escalation_reason TEXT DEFAULT '',
    feedback_rating INTEGER DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_sessions_id ON support_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_support_sessions_status ON support_sessions(status);
CREATE INDEX IF NOT EXISTS idx_support_sessions_user ON support_sessions(user_id);

-- 5. Support Messages Table
CREATE TABLE IF NOT EXISTS support_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(100) NOT NULL,
    sender VARCHAR(20) NOT NULL, -- 'user', 'bot', 'admin', 'system'
    sender_name VARCHAR(255) DEFAULT 'User',
    sender_avatar TEXT DEFAULT '',
    text TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_messages_session ON support_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_created ON support_messages(created_at);

-- 6. Initial Seed FAQs (Official IlmiDunya Policies & Guidance)
INSERT INTO support_faqs (question, answer, category, tags, display_order)
VALUES
(
    'How does the 3-day trial period work?',
    'Every student can take a 3-day free trial with their chosen tutor. During this trial, you test teaching methodology, verify comfort, and evaluate compatibility. After 3 days, you can either confirm the deal and pay or discontinue with zero obligation.',
    'pricing_trials',
    ARRAY['trial', 'free trial', '3 days', 'policy', 'demo'],
    1
),
(
    'What is the 100% Direct Dealing policy?',
    'IlmiDunya Pakistan operates with zero middlemen. Students connect directly with verified tutors across Pakistan. You negotiate class days, schedules, and pay tutors directly. No middleman agency takes 30-50% commission cuts from your fee.',
    'pricing_trials',
    ARRAY['direct dealing', 'middleman', 'commission', 'fees', 'direct'],
    2
),
(
    'What are the accepted payment methods in Pakistan?',
    'We support local Pakistani banking and mobile wallet solutions with zero hidden deductions: Meezan Bank (Islamic Banking), JazzCash, EasyPaisa, and Raast ID (State Bank instant payment).',
    'pricing_trials',
    ARRAY['payment', 'meezan', 'jazzcash', 'easypaisa', 'raast', 'bank transfer'],
    3
),
(
    'What are the Female Safety & Privacy safeguards?',
    'We enforce strict safety protocols for sisters and daughters. Certified female Alimahs teach 100% online via encrypted WebRTC with camera-off option by default. In-person home tuition is strictly reserved for male tutors visiting male students. Zero home visits for female tutors.',
    'female_safety',
    ARRAY['female safety', 'privacy', 'alimah', 'sister', 'camera off', 'webrtc'],
    4
),
(
    'How does tutor verification and Sanad authentication work?',
    'Every tutor undergoes rigorous manual verification before their profile is published. Quran and Islamic scholars must submit authentic Sanad credentials (from Wifaq-ul-Madaris or recognized Jamias), while academic mentors submit university degrees (KEMU, NUST, etc.). Profiles display verifiable Sanad badges.',
    'tutors',
    ARRAY['tutor verification', 'sanad', 'certificate', 'wifaq', 'degree', 'background check'],
    5
),
(
    'How do I register as a student or tutor?',
    'Registration on IlmiDunya is 100% free for both students and tutors. Simply click "Register", choose Student or Tutor, and verify your email address. Tutors will be prompted to submit their qualifications, bio, and subjects.',
    'account',
    ARRAY['register', 'signup', 'create account', 'admission', 'apply'],
    6
),
(
    'Do you provide verifiable course completion certificates?',
    'Yes! Upon completing any Quranic milestone (Nazra Quran, Tajweed al-Quran, Hifz al-Quran) or academic grade with your tutor, official digital completion certificates and Sanad documents with unique authentication QR codes are issued to students.',
    'courses',
    ARRAY['certificate', 'sanad', 'diploma', 'verification', 'exam', 'completion'],
    7
),
(
    'What Quran and Academic subjects are offered?',
    'We offer complete Quranic disciplines (Noorani Qaida for beginners, Nazra Quran, Tajweed al-Quran with articulation points, Hifz al-Quran, and Dars-e-Nizami Islamic studies) alongside Cambridge O/A-Levels, Matric (SSC), FSc Pre-Medical & Pre-Engineering, and MDCAT entry test preparation.',
    'courses',
    ARRAY['subjects', 'courses', 'tajweed', 'hifz', 'nazra', 'cambridge', 'fsc', 'matric'],
    8
)
ON CONFLICT DO NOTHING;
