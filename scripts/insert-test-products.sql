-- ====================================
-- Stilya 初期商品データ投入スクリプト
-- ====================================

-- 1. 既存のテストデータをクリア（オプション）
-- DELETE FROM external_products WHERE source = 'test_data';

-- 2. テスト用商品データの投入
INSERT INTO external_products (
  id, title, price, brand, image_url, 
  description, tags, category, genre_id,
  affiliate_url, source, is_active
) VALUES 
-- レディースファッション
('test_001', 'オーバーサイズTシャツ', 2980, 'UNIQLO', 
 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 
 'ゆったりとしたシルエットのTシャツ', 
 ARRAY['カジュアル', 'オーバーサイズ', 'Tシャツ', 'レディース'], 
 'レディースファッション', 100371,
 'https://example.com/affiliate/test_001', 'test_data', true),

('test_002', 'プリーツスカート', 4980, 'ZARA', 
 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400', 
 'エレガントなプリーツスカート', 
 ARRAY['エレガント', 'スカート', 'プリーツ', 'レディース'], 
 'レディースファッション', 100371,
 'https://example.com/affiliate/test_002', 'test_data', true),

('test_003', 'デニムジャケット', 6980, 'GAP', 
 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400', 
 'クラシックなデニムジャケット', 
 ARRAY['カジュアル', 'デニム', 'アウター', 'レディース'], 
 'レディースファッション', 100371,
 'https://example.com/affiliate/test_003', 'test_data', true),

-- メンズファッション
('test_004', 'スリムフィットチノパン', 5980, 'BANANA REPUBLIC', 
 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400', 
 'スマートなシルエットのチノパン', 
 ARRAY['ビジネスカジュアル', 'チノパン', 'メンズ'], 
 'メンズファッション', 551177,
 'https://example.com/affiliate/test_004', 'test_data', true),

('test_005', 'ボタンダウンシャツ', 4480, 'Brooks Brothers', 
 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400', 
 'クラシックなボタンダウンシャツ', 
 ARRAY['ビジネス', 'シャツ', 'フォーマル', 'メンズ'], 
 'メンズファッション', 551177,
 'https://example.com/affiliate/test_005', 'test_data', true),

('test_006', 'レザースニーカー', 8980, 'COLE HAAN', 
 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400', 
 '上質なレザースニーカー', 
 ARRAY['カジュアル', 'スニーカー', 'レザー', 'メンズ'], 
 'メンズファッション', 551177,
 'https://example.com/affiliate/test_006', 'test_data', true),

-- アクセサリー
('test_007', 'レザートートバッグ', 12980, 'COACH', 
 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400', 
 '実用的なレザートートバッグ', 
 ARRAY['バッグ', 'トート', 'レザー', 'アクセサリー'], 
 'アクセサリー', 216131,
 'https://example.com/affiliate/test_007', 'test_data', true),

('test_008', 'シルバーネックレス', 3980, 'TIFFANY & CO.', 
 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400', 
 'シンプルなシルバーネックレス', 
 ARRAY['ジュエリー', 'ネックレス', 'シルバー', 'アクセサリー'], 
 'アクセサリー', 216131,
 'https://example.com/affiliate/test_008', 'test_data', true),

-- 追加商品
('test_009', 'ニットセーター', 5980, 'H&M', 
 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400', 
 '暖かいニットセーター', 
 ARRAY['ニット', 'セーター', '秋冬', 'レディース'], 
 'レディースファッション', 100371,
 'https://example.com/affiliate/test_009', 'test_data', true),

('test_010', 'スキニージーンズ', 7980, 'LEVI\'S', 
 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=400', 
 'フィット感の良いスキニージーンズ', 
 ARRAY['デニム', 'スキニー', 'ボトムス', 'メンズ'], 
 'メンズファッション', 551177,
 'https://example.com/affiliate/test_010', 'test_data', true);

-- 3. 投入結果の確認
SELECT 
  COUNT(*) as total_inserted,
  COUNT(CASE WHEN source = 'test_data' THEN 1 END) as test_data_count
FROM external_products;
