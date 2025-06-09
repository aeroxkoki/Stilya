-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  nickname TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', NULL)),
  age_range TEXT,
  style_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table (external_products for consistency)
CREATE TABLE IF NOT EXISTS external_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id TEXT UNIQUE NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('linkshare', 'a8net', 'rakuten', 'manual')),
  name TEXT NOT NULL,
  brand TEXT,
  description TEXT,
  price DECIMAL(10, 2),
  currency TEXT DEFAULT 'JPY',
  image_url TEXT NOT NULL,
  product_url TEXT NOT NULL,
  affiliate_url TEXT,
  category TEXT,
  subcategory TEXT,
  tags TEXT[] DEFAULT '{}',
  gender TEXT CHECK (gender IN ('male', 'female', 'unisex', NULL)),
  color TEXT,
  size_info JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create swipes table
CREATE TABLE IF NOT EXISTS swipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES external_products(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('yes', 'no', 'skip')),
  session_id UUID,
  swiped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES external_products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Create click_logs table (for analytics)
CREATE TABLE IF NOT EXISTS click_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  product_id UUID REFERENCES external_products(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('view', 'click', 'purchase')),
  session_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_products_category ON external_products(category);
CREATE INDEX idx_products_gender ON external_products(gender);
CREATE INDEX idx_products_tags ON external_products USING gin(tags);
CREATE INDEX idx_products_active ON external_products(is_active);
CREATE INDEX idx_swipes_user_id ON swipes(user_id);
CREATE INDEX idx_swipes_product_id ON swipes(product_id);
CREATE INDEX idx_swipes_direction ON swipes(direction);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_click_logs_user_id ON click_logs(user_id);
CREATE INDEX idx_click_logs_product_id ON click_logs(product_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON external_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE click_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Products policies (public read)
CREATE POLICY "Products are viewable by everyone" ON external_products
  FOR SELECT USING (is_active = true);

-- Swipes policies
CREATE POLICY "Users can view own swipes" ON swipes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own swipes" ON swipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Favorites policies
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own favorites" ON favorites
  FOR ALL USING (auth.uid() = user_id);

-- Click logs policies
CREATE POLICY "Users can create click logs" ON click_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);