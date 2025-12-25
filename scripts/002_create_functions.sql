-- Function to increment vote count
CREATE OR REPLACE FUNCTION increment_vote_count(report_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.reports
  SET vote_count = vote_count + 1
  WHERE id = report_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement vote count
CREATE OR REPLACE FUNCTION decrement_vote_count(report_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.reports
  SET vote_count = GREATEST(vote_count - 1, 0)
  WHERE id = report_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
