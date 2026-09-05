
-- ==============================================================================
-- ILMIDUNYA PAKISTAN - COMPLETE SUPABASE POSTGRESQL PRODUCTION SCHEMA
-- Includes pgvector Extension, Relational Foreign Keys, Indexes & RLS
-- ==============================================================================

-- 1. Enable Required PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. ENUM Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'tutor', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('active', 'warned', 'under_review', 'suspended', 'deactivated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE tutor_verification_status AS ENUM ('incomplete', 'under_review', 'pending', 'approved', 'rejected', 'contact_needed', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE deal_status AS ENUM ('inquiry', 'proposal_sent', 'accepted', 'active', 'completed', 'disputed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE escrow_status AS ENUM ('not_funded', 'funded_held', 'released_to_tutor', 'refunded_to_student');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'student',
    is_verified BOOLEAN DEFAULT false,
    verification_otp VARCHAR(10),
    verification_otp_expires TIMESTAMPTZ,
    avatar TEXT DEFAULT '',
    gender VARCHAR(20) DEFAULT '',
    age INTEGER CHECK (age >= 3 AND age <= 100),
    phone VARCHAR(50) DEFAULT '',
    guardian_phone VARCHAR(50) DEFAULT '',
    city VARCHAR(100) DEFAULT '',
    is_active BOOLEAN DEFAULT true,
    status user_status DEFAULT 'active',
    warning_count INTEGER DEFAULT 0,
    admin_notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_city ON users(city);

-- 4. Categories & Subjects Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT DEFAULT '',
    icon VARCHAR(100) DEFAULT 'BookOpen',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Locations (Pakistani Cities & Districts)
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    province VARCHAR(100) DEFAULT 'Punjab',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tutor Profiles Table
CREATE TABLE IF NOT EXISTS tutor_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT DEFAULT '',
    qualifications TEXT DEFAULT '',
    experience_years INTEGER DEFAULT 1,
    hourly_rate NUMERIC(10, 2) DEFAULT 1500.00,
    gender VARCHAR(20) DEFAULT '',
    verification_status tutor_verification_status DEFAULT 'incomplete',
    rejection_reason TEXT DEFAULT '',
    contact_notes TEXT DEFAULT '',
    rating_average NUMERIC(3, 2) DEFAULT 5.00 CHECK (rating_average >= 1.0 AND rating_average <= 5.0),
    rating_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    teaching_modes TEXT[] DEFAULT ARRAY['online'],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tutor_profiles_user ON tutor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_tutor_profiles_rate ON tutor_profiles(hourly_rate);
CREATE INDEX IF NOT EXISTS idx_tutor_profiles_status ON tutor_profiles(verification_status);

-- Junction Tables for Tutor Subjects and Cities
CREATE TABLE IF NOT EXISTS tutor_subjects (
    tutor_profile_id UUID NOT NULL REFERENCES tutor_profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (tutor_profile_id, category_id)
);

CREATE TABLE IF NOT EXISTS tutor_cities (
    tutor_profile_id UUID NOT NULL REFERENCES tutor_profiles(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    PRIMARY KEY (tutor_profile_id, location_id)
);

-- Tutor Sanad / Degree Documents Table
CREATE TABLE IF NOT EXISTS tutor_sanad_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_profile_id UUID NOT NULL REFERENCES tutor_profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'Sanad / Certificate',
    file_url TEXT NOT NULL,
    file_type VARCHAR(100) DEFAULT 'image/jpeg',
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instructor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    price NUMERIC(10, 2) DEFAULT 0.00,
    duration_weeks INTEGER DEFAULT 4,
    level VARCHAR(50) DEFAULT 'Beginner',
    status VARCHAR(50) DEFAULT 'draft',
    chapters JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);

-- 8. Deals (1-on-1 Student-Tutor Agreements with Zero Middleman Fees)
CREATE TABLE IF NOT EXISTS deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tutor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    agreed_hourly_rate NUMERIC(10, 2) NOT NULL,
    total_sessions INTEGER DEFAULT 8,
    status deal_status DEFAULT 'inquiry',
    escrow_status escrow_status DEFAULT 'not_funded',
    escrow_amount NUMERIC(10, 2) DEFAULT 0.00,
    student_notes TEXT DEFAULT '',
    tutor_notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deals_student ON deals(student_id);
CREATE INDEX IF NOT EXISTS idx_deals_tutor ON deals(tutor_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);

-- 9. Classroom Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tutor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_number INTEGER DEFAULT 1,
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ NOT NULL,
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'scheduled',
    room_id VARCHAR(100) UNIQUE,
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Reviews & Testimonials Table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tutor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT DEFAULT '',
    is_verified_booking BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Official Certificates Table (Verifiable Credentials)
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tutor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    grade VARCHAR(50) DEFAULT 'Passed with Excellence',
    issue_date DATE DEFAULT CURRENT_DATE,
    verification_code VARCHAR(100) UNIQUE NOT NULL,
    qr_code_url TEXT DEFAULT '',
    pdf_url TEXT DEFAULT '',
    is_valid BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certificates_student ON certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_code ON certificates(verification_code);

-- 12. Direct Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    attachment_url TEXT DEFAULT '',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    action_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. System Configuration (Platform Bank Accounts & Settings)
CREATE TABLE IF NOT EXISTS system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 15. AI KNOWLEDGE BASE WITH PGVECTOR (FOR AI CHATBOT AGENT / RAG)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS ai_knowledge_embeddings (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'policy', 'quran_course', 'academic_board', 'female_safety', 'faq'
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    embedding vector(768), -- Dimensions for Gemini text-embedding-004
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vector Index using cosine distance for sub-millisecond retrieval
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_embedding 
ON ai_knowledge_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Vector Similarity Search RPC Function for Supabase
CREATE OR REPLACE FUNCTION match_knowledge_documents (
    query_embedding vector(768),
    match_threshold float,
    match_count int
)
RETURNS TABLE (
    id bigint,
    title varchar(255),
    category varchar(100),
    content text,
    metadata jsonb,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ai_knowledge_embeddings.id,
        ai_knowledge_embeddings.title,
        ai_knowledge_embeddings.category,
        ai_knowledge_embeddings.content,
        ai_knowledge_embeddings.metadata,
        1 - (ai_knowledge_embeddings.embedding <=> query_embedding) AS similarity
    FROM ai_knowledge_embeddings
    WHERE 1 - (ai_knowledge_embeddings.embedding <=> query_embedding) > match_threshold
    ORDER BY ai_knowledge_embeddings.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

