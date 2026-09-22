-- UnlearnX Database Schema: Analysis History with Row-Level Security (RLS)

-- 1. Create the analysis_history table
CREATE TABLE IF NOT EXISTS public.analysis_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    career_goal TEXT NOT NULL,
    target_industry TEXT NOT NULL,
    experience_level TEXT,
    priority TEXT,
    current_skills TEXT,
    career_score INTEGER,
    career_risk INTEGER,
    summary TEXT,
    result_data JSONB NOT NULL
);

-- 2. Create index on user_id and created_at for fast history querying
CREATE INDEX IF NOT EXISTS idx_analysis_history_user_created 
ON public.analysis_history (user_id, created_at DESC);

-- 3. Enable Row-Level Security (RLS)
ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
-- Users can only select their own analysis history
CREATE POLICY "Users can view own analyses"
ON public.analysis_history
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can only insert their own analysis records
CREATE POLICY "Users can insert own analyses"
ON public.analysis_history
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own analysis records
CREATE POLICY "Users can update own analyses"
ON public.analysis_history
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own analysis records
CREATE POLICY "Users can delete own analyses"
ON public.analysis_history
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
