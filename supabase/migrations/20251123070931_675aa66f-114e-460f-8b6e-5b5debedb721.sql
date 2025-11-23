-- Add analysis page tour tracking
ALTER TABLE users 
ADD COLUMN has_completed_analysis_tour BOOLEAN DEFAULT FALSE,
ADD COLUMN analysis_tour_completed_at TIMESTAMP WITH TIME ZONE;

-- Add report tour tracking
ALTER TABLE users 
ADD COLUMN has_completed_report_tour BOOLEAN DEFAULT FALSE,
ADD COLUMN report_tour_completed_at TIMESTAMP WITH TIME ZONE;

-- Add helpful comments
COMMENT ON COLUMN users.has_completed_analysis_tour IS 'Tracks if user has seen the attempted tests page tutorial';
COMMENT ON COLUMN users.has_completed_report_tour IS 'Tracks if user has seen the analysis report dialog tutorial';