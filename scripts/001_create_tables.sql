-- Categories table (must be created first due to FK)
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Links table
CREATE TABLE IF NOT EXISTS public.links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  clicks INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Click logs for analytics
CREATE TABLE IF NOT EXISTS public.click_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES public.links(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Site settings (singleton)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  logo TEXT,
  name TEXT NOT NULL DEFAULT 'My Links',
  description TEXT,
  twitter TEXT,
  instagram TEXT,
  youtube TEXT,
  medium TEXT,
  threads TEXT,
  pinterest TEXT,
  facebook TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Admin sessions for password-based auth
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Insert default site settings
INSERT INTO public.site_settings (id, name, description)
VALUES ('global', 'My Links', 'Your personal link hub')
ON CONFLICT (id) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_links_category ON public.links(category_id);
CREATE INDEX IF NOT EXISTS idx_links_order ON public.links(sort_order);
CREATE INDEX IF NOT EXISTS idx_categories_order ON public.categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_click_logs_link ON public.click_logs(link_id);
CREATE INDEX IF NOT EXISTS idx_click_logs_created ON public.click_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON public.admin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON public.admin_sessions(expires_at);
