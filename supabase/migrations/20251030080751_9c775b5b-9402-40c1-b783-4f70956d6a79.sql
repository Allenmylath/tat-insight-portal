-- Increase analysis_type column length to 500 characters
ALTER TABLE analysis_results 
ALTER COLUMN analysis_type TYPE varchar(500);