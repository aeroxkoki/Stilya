-- Supabase Database Setup for Stilya MVP
-- Run this script in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  nickname TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', NULL)),
  age_group TEXT CHECK (age_group IN ('teens', '20s', '30s', '40s', '50s+', NULL)),
  style_preferences TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  brand TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT NOT NULL,
  affiliate_url TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  gender TEXT CHECK (gender IN ('male', 'female', 'unisex')),
  source TEXT NOT NULL, -- 'linkshare', 'rakuten', etc.
  external_id TEXT, -- ID from the affiliate source
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source, external_id)
);

-- Create swipes table
CREATE TABLE IF NOT EXISTS public.swipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  result TEXT NOT NULL CHECK (result IN ('yes', 'no')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Create click_logs table
CREATE TABLE IF NOT EXISTS public.click_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('view', 'click', 'purchase')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_gender ON public.products(gender);
CREATE INDEX IF NOT EXISTS idx_products_tags ON public.products USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_swipes_user_id ON public.swipes(user_id);
CREATE INDEX IF NOT EXISTS idx_swipes_product_id ON public.swipes(product_id);
CREATE INDEX IF NOT EXISTS idx_swipes_result ON public.swipes(result);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_click_logs_user_id ON public.click_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_click_logs_product_id ON public.click_logs(product_id);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.click_logs ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Products table policies (public read access)
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (is_active = true);

-- Swipes table policies
CREATE POLICY "Users can view own swipes" ON public.swipes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own swipes" ON public.swipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Favorites table policies
CREATE POLICY "Users can view own favorites" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own favorites" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON public.favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Click logs policies
CREATE POLICY "Users can create click logs" ON public.click_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Create functions for triggers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample products for testing (optional)
INSERT INTO public.products (title, brand, price, image_url, affiliate_url, category, tags, gender, source, external_id)
VALUES 
  ('ベーシック Tシャツ', 'UNIQLO', 1990, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab', 'https://example.com/affiliate/1', 'tops', ARRAY['casual', 'basic', 'cotton'], 'unisex', 'linkshare', 'test-001'),
  ('デニムジャケット', 'ZARA', 5990, 'https://images.unsplash.com/photo-1543076447-215ad9ba6923', 'https://example.com/affiliate/2', 'outerwear', ARRAY['denim', 'casual', 'classic'], 'unisex', 'linkshare', 'test-002'),
  ('フローラルワンピース', 'H&M', 3990, 'https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5', 'https://example.com/affiliate/3', 'dress', ARRAY['floral', 'feminine', 'summer'], 'female', 'rakuten', 'test-003'),
  ('レザースニーカー', 'Nike', 12000, 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2', 'https://example.com/affiliate/4', 'shoes', ARRAY['sneakers', 'leather', 'sport'], 'male', 'linkshare', 'test-004'),
  ('ニットセーター', 'GU', 2990, 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105', 'https://example.com/affiliate/5', 'tops', ARRAY['knit', 'warm', 'winter'], 'female', 'rakuten', 'test-005')
ON CONFLICT (source, external_id) DO NOTHING;

-- Useful queries for monitoring
-- Count swipes by result: SELECT result, COUNT(*) FROM swipes GROUP BY result;
-- Most popular products: SELECT p.title, COUNT(s.id) as swipe_count FROM products p JOIN swipes s ON p.id = s.product_id WHERE s.result = 'yes' GROUP BY p.id ORDER BY swipe_count DESC;
-- User preferences: SELECT u.id, u.email, array_agg(DISTINCT t.tag) as liked_tags FROM users u JOIN swipes s ON u.id = s.user_id JOIN products p ON s.product_id = p.id CROSS JOIN unnest(p.tags) as t(tag) WHERE s.result = 'yes' GROUP BY u.id;