-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  author_name TEXT,
  author_id UUID REFERENCES public.users(id),
  featured_image_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  views_count INTEGER NOT NULL DEFAULT 0,
  tags TEXT[],
  meta_title TEXT,
  meta_description TEXT
);

-- Enable Row Level Security
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view published blog posts
CREATE POLICY "Anyone can view published blog posts"
ON public.blog_posts
FOR SELECT
USING (is_published = true);

-- Allow authenticated users to view all blog posts (including drafts)
CREATE POLICY "Authenticated users can view all blog posts"
ON public.blog_posts
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to create blog posts
CREATE POLICY "Authenticated users can create blog posts"
ON public.blog_posts
FOR INSERT
WITH CHECK (
  author_id IN (
    SELECT id FROM users 
    WHERE clerk_id = (current_setting('request.jwt.claims', true)::json ->> 'clerk_user_id')
  )
);

-- Allow authors to update their own blog posts
CREATE POLICY "Authors can update their own blog posts"
ON public.blog_posts
FOR UPDATE
USING (
  author_id IN (
    SELECT id FROM users 
    WHERE clerk_id = (current_setting('request.jwt.claims', true)::json ->> 'clerk_user_id')
  )
);

-- Allow authors to delete their own blog posts
CREATE POLICY "Authors can delete their own blog posts"
ON public.blog_posts
FOR DELETE
USING (
  author_id IN (
    SELECT id FROM users 
    WHERE clerk_id = (current_setting('request.jwt.claims', true)::json ->> 'clerk_user_id')
  )
);

-- Create index for slug lookups
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);

-- Create index for published posts
CREATE INDEX idx_blog_posts_published ON public.blog_posts(is_published, published_at DESC);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to increment view count
CREATE OR REPLACE FUNCTION public.increment_blog_post_views(p_post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE blog_posts
  SET views_count = views_count + 1
  WHERE id = p_post_id;
END;
$$;