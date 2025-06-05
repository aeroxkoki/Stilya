-- Stilya データベーススキーマ初期化スクリプト
-- このスクリプトを実行する前に、Supabaseダッシュボードで接続してください

-- ========================================
-- 1. ユーザープロファイルテーブル
-- ========================================
-- auth.usersテーブルを参照する公開プロファイルテーブル
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  username TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', NULL)),
  age_group TEXT CHECK (age_group IN ('teens', 'twenties', 'thirties', 'forties', 'fifties_plus', NULL)),
  style_preferences TEXT[], -- ['casual', 'formal', 'street', etc.]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ========================================
-- 2. 商品テーブル（既存のものを更新）
-- ========================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  brand TEXT NOT NULL,
  tags TEXT[] NOT NULL,
  affiliate_url TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('tops', 'bottoms', 'onepiece', 'outerwear', 'shoes', 'bags', 'accessories')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ========================================
-- 3. スワイプ履歴テーブル
-- ========================================
CREATE TABLE IF NOT EXISTS public.swipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('yes', 'no')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, product_id) -- 同じ商品に対して複数回スワイプできないようにする
);

-- ========================================
-- 4. お気に入りテーブル
-- ========================================
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, product_id) -- 同じ商品を複数回お気に入りにできないようにする
);

-- ========================================
-- 5. クリックログテーブル
-- ========================================
CREATE TABLE IF NOT EXISTS public.click_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('view', 'click', 'purchase')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ========================================
-- 6. インデックスの作成（パフォーマンス最適化）
-- ========================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_swipes_user_id ON swipes(user_id);
CREATE INDEX IF NOT EXISTS idx_swipes_product_id ON swipes(product_id);
CREATE INDEX IF NOT EXISTS idx_swipes_created_at ON swipes(created_at);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_click_logs_user_id ON click_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_click_logs_product_id ON click_logs(product_id);

-- ========================================
-- 7. Row Level Security (RLS) の有効化
-- ========================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.click_logs ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 8. RLS ポリシーの作成
-- ========================================

-- Users table policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Products table policies (全ユーザーが閲覧可能)
CREATE POLICY "Products are viewable by everyone" ON public.products
  FOR SELECT TO authenticated USING (true);

-- Swipes table policies
CREATE POLICY "Users can view own swipes" ON public.swipes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own swipes" ON public.swipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Favorites table policies
CREATE POLICY "Users can view own favorites" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON public.favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Click logs table policies
CREATE POLICY "Users can insert own click logs" ON public.click_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ========================================
-- 9. トリガー関数の作成（updated_atの自動更新）
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_atトリガーの作成
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 10. 新規ユーザー作成時の自動プロファイル作成
-- ========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.usersテーブルへの挿入時にトリガー
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- 確認用クエリ
-- ========================================
-- テーブルが作成されたか確認
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- RLSが有効になっているか確認
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
