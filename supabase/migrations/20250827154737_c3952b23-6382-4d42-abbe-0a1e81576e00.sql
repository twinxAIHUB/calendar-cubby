-- Allow multiple posts per day by removing unique constraint and adding share functionality

-- Create share_links table for instant access without authentication
CREATE TABLE public.share_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  access_type TEXT NOT NULL CHECK (access_type IN ('view', 'edit')),
  created_by UUID NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create post_comments table for feedback on posts
CREATE TABLE public.post_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by TEXT, -- Can be null for anonymous share users
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create post_reviews table for approval workflow
CREATE TABLE public.post_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by TEXT, -- Can be null for share users
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies for share_links (only organization owners can manage)
CREATE POLICY "Organization owners can manage share links"
ON public.share_links
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.organizations 
  WHERE organizations.id = share_links.organization_id 
  AND organizations.user_id = auth.uid()
));

-- RLS policies for post_comments (organization owners can view all, others can add)
CREATE POLICY "Organization owners can view all comments"
ON public.post_comments
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.posts p
  JOIN public.organizations o ON p.organization_id = o.id
  WHERE p.id = post_comments.post_id 
  AND o.user_id = auth.uid()
));

CREATE POLICY "Anyone can add comments"
ON public.post_comments
FOR INSERT
WITH CHECK (true);

-- RLS policies for post_reviews (organization owners can view all, others can add)
CREATE POLICY "Organization owners can view all reviews"
ON public.post_reviews
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.posts p
  JOIN public.organizations o ON p.organization_id = o.id
  WHERE p.id = post_reviews.post_id 
  AND o.user_id = auth.uid()
));

CREATE POLICY "Anyone can add reviews"
ON public.post_reviews
FOR INSERT
WITH CHECK (true);

-- Add triggers for updated_at
CREATE TRIGGER update_share_links_updated_at
BEFORE UPDATE ON public.share_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_post_reviews_updated_at
BEFORE UPDATE ON public.post_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for share_links token lookup
CREATE INDEX idx_share_links_token ON public.share_links(token) WHERE is_active = true;