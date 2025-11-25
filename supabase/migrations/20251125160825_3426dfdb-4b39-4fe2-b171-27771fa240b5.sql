-- Fix foreign key constraints for user deletion

-- Step 1: Update subscription_orders constraint to CASCADE
ALTER TABLE subscription_orders 
DROP CONSTRAINT IF EXISTS subscription_orders_user_id_fkey;

ALTER TABLE subscription_orders 
ADD CONSTRAINT subscription_orders_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Step 2: Update blog_posts constraint to SET NULL
ALTER TABLE blog_posts 
DROP CONSTRAINT IF EXISTS blog_posts_author_id_fkey;

ALTER TABLE blog_posts 
ADD CONSTRAINT blog_posts_author_id_fkey 
FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL;

-- Step 3: Update email_campaigns constraint to SET NULL
ALTER TABLE email_campaigns 
DROP CONSTRAINT IF EXISTS email_campaigns_created_by_fkey;

ALTER TABLE email_campaigns 
ADD CONSTRAINT email_campaigns_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;