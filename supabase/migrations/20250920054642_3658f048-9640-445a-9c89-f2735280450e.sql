ALTER TABLE analysis_results 
ADD COLUMN murray_needs JSONB,
ADD COLUMN murray_presses JSONB, 
ADD COLUMN inner_states JSONB,
ADD COLUMN analysis_type VARCHAR(50) DEFAULT 'murray_tat';