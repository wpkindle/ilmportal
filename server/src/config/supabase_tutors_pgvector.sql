-- ==============================================================================
-- ILMIDUNYA PAKISTAN - SUPABASE PGVECTOR TUTORS SCHEMA & MATCH FUNCTION
-- ==============================================================================

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create public.tutors table
CREATE TABLE IF NOT EXISTS public.tutors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    gender TEXT NOT NULL,
    qualifications TEXT,
    bio TEXT,
    experience_years INTEGER DEFAULT 1,
    hourly_rate NUMERIC DEFAULT 1500,
    rating_average NUMERIC DEFAULT 5.0,
    rating_count INTEGER DEFAULT 0,
    teaching_modes TEXT[] NOT NULL DEFAULT '{}',
    subjects TEXT[] NOT NULL DEFAULT '{}',
    profile_url TEXT NOT NULL,
    content_text TEXT,
    embedding vector(1536),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create index for fast vector cosine similarity search
CREATE INDEX IF NOT EXISTS tutors_embedding_idx 
ON public.tutors 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 10);

-- 4. Create hybrid similarity search function
CREATE OR REPLACE FUNCTION match_tutors(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.2,
    match_count int DEFAULT 5,
    filter_city text DEFAULT NULL,
    filter_gender text DEFAULT NULL,
    filter_mode text DEFAULT NULL,
    filter_subject text DEFAULT NULL
)
RETURNS TABLE (
    id TEXT,
    name TEXT,
    city TEXT,
    gender TEXT,
    qualifications TEXT,
    bio TEXT,
    experience_years INTEGER,
    hourly_rate NUMERIC,
    rating_average NUMERIC,
    rating_count INTEGER,
    teaching_modes TEXT[],
    subjects TEXT[],
    profile_url TEXT,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.id,
        t.name,
        t.city,
        t.gender,
        t.qualifications,
        t.bio,
        t.experience_years,
        t.hourly_rate,
        t.rating_average,
        t.rating_count,
        t.teaching_modes,
        t.subjects,
        t.profile_url,
        1 - (t.embedding <=> query_embedding) AS similarity
    FROM public.tutors t
    WHERE 
        (filter_city IS NULL OR filter_city = '' OR LOWER(t.city) = LOWER(filter_city))
        AND (filter_gender IS NULL OR filter_gender = '' OR LOWER(t.gender) = LOWER(filter_gender))
        AND (filter_mode IS NULL OR filter_mode = '' OR filter_mode = ANY(t.teaching_modes))
        AND (filter_subject IS NULL OR filter_subject = '' OR EXISTS (
            SELECT 1 FROM unnest(t.subjects) s WHERE s ILIKE '%' || filter_subject || '%'
        ))
        AND (t.embedding IS NOT NULL)
        AND (1 - (t.embedding <=> query_embedding) > match_threshold)
    ORDER BY similarity DESC
    LIMIT match_count;
END;
$$;
