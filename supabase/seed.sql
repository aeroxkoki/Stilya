-- Seed data for development and testing
-- This file will be run when you execute: supabase db reset

-- Insert test products (fashion items)
INSERT INTO external_products (external_id, source, name, brand, description, price, image_url, product_url, affiliate_url, category, subcategory, tags, gender) VALUES
  -- Men's items
  ('TEST_001', 'manual', 'クラシックデニムジャケット', 'URBAN STYLE', 'タイムレスなデザインのデニムジャケット', 12800, 'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef', 'https://example.com/product1', 'https://affiliate.example.com/1', 'アウター', 'ジャケット', ARRAY['デニム', 'カジュアル', 'アメカジ'], 'male'),
  ('TEST_002', 'manual', 'ミニマルTシャツ', 'SIMPLE LIFE', '着心地の良いオーガニックコットンTシャツ', 3900, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab', 'https://example.com/product2', 'https://affiliate.example.com/2', 'トップス', 'Tシャツ', ARRAY['ベーシック', 'ミニマル', 'コットン'], 'male'),
  ('TEST_003', 'manual', 'スリムチノパンツ', 'REFINED', 'どんなスタイルにも合わせやすいチノパン', 7900, 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a', 'https://example.com/product3', 'https://affiliate.example.com/3', 'ボトムス', 'パンツ', ARRAY['チノ', 'スマートカジュアル', 'ベーシック'], 'male'),
  
  -- Women's items
  ('TEST_004', 'manual', 'フローラルワンピース', 'BLOOM', '春にぴったりな花柄ワンピース', 9800, 'https://images.unsplash.com/photo-1496747611176-843222e1e57c', 'https://example.com/product4', 'https://affiliate.example.com/4', 'ワンピース', 'カジュアル', ARRAY['花柄', 'フェミニン', '春物'], 'female'),
  ('TEST_005', 'manual', 'オーバーサイズブレザー', 'MODERN EDGE', 'トレンドのオーバーサイズシルエット', 15800, 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea', 'https://example.com/product5', 'https://affiliate.example.com/5', 'アウター', 'ジャケット', ARRAY['オーバーサイズ', 'モード', 'オフィス'], 'female'),
  ('TEST_006', 'manual', 'ハイウエストデニム', 'CURVE', 'スタイルアップ効果のあるハイウエストデニム', 8900, 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246', 'https://example.com/product6', 'https://affiliate.example.com/6', 'ボトムス', 'デニム', ARRAY['ハイウエスト', 'デニム', 'スキニー'], 'female'),
  
  -- Unisex items
  ('TEST_007', 'manual', 'キャンバススニーカー', 'STREET CLASSIC', 'どんなスタイルにも合うクラシックスニーカー', 6900, 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77', 'https://example.com/product7', 'https://affiliate.example.com/7', 'シューズ', 'スニーカー', ARRAY['カジュアル', 'ストリート', 'ベーシック'], 'unisex'),
  ('TEST_008', 'manual', 'レザーバックパック', 'NOMAD', '機能性とデザイン性を兼ね備えたバックパック', 19800, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa', 'https://example.com/product8', 'https://affiliate.example.com/8', 'バッグ', 'バックパック', ARRAY['レザー', 'ビジネス', 'カジュアル'], 'unisex'),
  ('TEST_009', 'manual', 'ウールビーニー', 'COZY', '暖かくておしゃれなニット帽', 4500, 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9', 'https://example.com/product9', 'https://affiliate.example.com/9', 'アクセサリー', '帽子', ARRAY['ニット', '冬物', 'カジュアル'], 'unisex'),
  ('TEST_010', 'manual', 'サングラス', 'SHADE', 'UVカット機能付きクラシックサングラス', 12000, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083', 'https://example.com/product10', 'https://affiliate.example.com/10', 'アクセサリー', 'アイウェア', ARRAY['サングラス', 'UV', 'クラシック'], 'unisex');

-- Note: In production, user data will be created through the authentication flow
-- Test users should be created via Supabase Auth dashboard or through the app's signup flow