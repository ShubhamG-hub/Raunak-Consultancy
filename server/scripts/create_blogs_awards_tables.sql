-- Create Blogs Table
CREATE TABLE IF NOT EXISTS public.blogs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT,
    image_url TEXT,
    author TEXT DEFAULT 'Sudhir Gupta',
    category TEXT DEFAULT 'Planning',
    published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Awards Table
CREATE TABLE IF NOT EXISTS public.awards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    year TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;

-- Create Policies (Public Read)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read blogs' AND tablename = 'blogs') THEN
        CREATE POLICY "Public read blogs" ON public.blogs FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read awards' AND tablename = 'awards') THEN
        CREATE POLICY "Public read awards" ON public.awards FOR SELECT USING (true);
    END IF;

    -- Admin full access (assuming service role or similar)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin full access blogs' AND tablename = 'blogs') THEN
        CREATE POLICY "Admin full access blogs" ON public.blogs FOR ALL USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin full access awards' AND tablename = 'awards') THEN
        CREATE POLICY "Admin full access awards" ON public.awards FOR ALL USING (true);
    END IF;
END $$;
