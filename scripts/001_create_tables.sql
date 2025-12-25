-- Create reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  city TEXT NOT NULL,
  vote_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create votes table to track who voted for what
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, report_id)
);

-- Enable Row Level Security
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reports table
-- Anyone can view reports
CREATE POLICY "Anyone can view reports" 
  ON public.reports FOR SELECT 
  USING (true);

-- Authenticated users can insert their own reports
CREATE POLICY "Users can insert their own reports" 
  ON public.reports FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reports
CREATE POLICY "Users can update their own reports" 
  ON public.reports FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own reports
CREATE POLICY "Users can delete their own reports" 
  ON public.reports FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for votes table
-- Anyone can view votes
CREATE POLICY "Anyone can view votes" 
  ON public.votes FOR SELECT 
  USING (true);

-- Authenticated users can insert their own votes
CREATE POLICY "Users can insert their own votes" 
  ON public.votes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own votes
CREATE POLICY "Users can delete their own votes" 
  ON public.votes FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_vote_count ON public.reports(vote_count DESC);
CREATE INDEX IF NOT EXISTS idx_reports_city ON public.reports(city);
CREATE INDEX IF NOT EXISTS idx_votes_report_id ON public.votes(report_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON public.votes(user_id);
