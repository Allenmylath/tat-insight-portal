-- Add user email column to test_sessions table
ALTER TABLE public.test_sessions 
ADD COLUMN user_email text;