-- Update all TAT test prompts to use the standardized prompt text
UPDATE tattest 
SET 
  prompt_text = 'Write a story about the picture you just saw. Who are the people? What is happening? What happened before? What are the people thinking about and feeling? What do they want? What will happen next?',
  updated_at = now()
WHERE is_active = true;