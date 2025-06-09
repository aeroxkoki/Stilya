-- Stilya商品データ挿入SQL
-- Supabaseダッシュボードの SQL Editor で実行してください

-- 1. RLSを無効化（必須）
ALTER TABLE external_products DISABLE ROW LEVEL SECURITY;

-- 2. 既存データをクリア（オプション）
-- DELETE FROM external_products;

-- 3. サンプル商品データを挿入
INSERT INTO external_products (title, image_url, price, brand, category, tags, description, affiliate_url, source, is_active)
VALUES (
  'ベーシックTシャツ', 
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 
  2980, 
  'UNIQLO', 
  'メンズファッション', 
  ARRAY['カジュアル', 'ベーシック', 'Tシャツ'], 
  'シンプルで使いやすいベーシックなTシャツ', 
  'https://example.com/product/1', 
  'sample_data', 
  true
);

INSERT INTO external_products (title, image_url, price, brand, category, tags, description, affiliate_url, source, is_active)
VALUES (
  'フローラルワンピース', 
  'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=400', 
  5980, 
  'ZARA', 
  'レディースファッション', 
  ARRAY['フェミニン', 'ワンピース', '花柄'], 
  '華やかな花柄のワンピース', 
  'https://example.com/product/2', 
  'sample_data', 
  true
);

INSERT INTO external_products (title, image_url, price, brand, category, tags, description, affiliate_url, source, is_active)
VALUES (
  'デニムジャケット', 
  'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400', 
  7980, 
  'Levi's', 
  'メンズファッション', 
  ARRAY['カジュアル', 'デニム', 'アウター'], 
  '定番のデニムジャケット', 
  'https://example.com/product/3', 
  'sample_data', 
  true
);

INSERT INTO external_products (title, image_url, price, brand, category, tags, description, affiliate_url, source, is_active)
VALUES (
  'レザーバッグ', 
  'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400', 
  12800, 
  'Coach', 
  'レディースバッグ', 
  ARRAY['レザー', 'バッグ', '高級'], 
  '上質なレザーを使用したバッグ', 
  'https://example.com/product/4', 
  'sample_data', 
  true
);

INSERT INTO external_products (title, image_url, price, brand, category, tags, description, affiliate_url, source, is_active)
VALUES (
  'スニーカー', 
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 
  8900, 
  'Nike', 
  'メンズ靴', 
  ARRAY['スポーツ', 'カジュアル', 'スニーカー'], 
  '快適な履き心地のスニーカー', 
  'https://example.com/product/5', 
  'sample_data', 
  true
);

INSERT INTO external_products (title, image_url, price, brand, category, tags, description, affiliate_url, source, is_active)
VALUES (
  'シルクスカーフ', 
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400', 
  4500, 
  'Hermès', 
  'アクセサリー', 
  ARRAY['シルク', 'スカーフ', '高級'], 
  'エレガントなシルクスカーフ', 
  'https://example.com/product/6', 
  'sample_data', 
  true
);

INSERT INTO external_products (title, image_url, price, brand, category, tags, description, affiliate_url, source, is_active)
VALUES (
  'ストライプシャツ', 
  'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400', 
  3980, 
  'GAP', 
  'メンズファッション', 
  ARRAY['ビジネス', 'シャツ', 'ストライプ'], 
  'ビジネスにも使えるストライプシャツ', 
  'https://example.com/product/7', 
  'sample_data', 
  true
);

INSERT INTO external_products (title, image_url, price, brand, category, tags, description, affiliate_url, source, is_active)
VALUES (
  'ニットセーター', 
  'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=400', 
  6980, 
  'H&M', 
  'レディースファッション', 
  ARRAY['ニット', 'セーター', '暖かい'], 
  '柔らかく暖かいニットセーター', 
  'https://example.com/product/8', 
  'sample_data', 
  true
);

INSERT INTO external_products (title, image_url, price, brand, category, tags, description, affiliate_url, source, is_active)
VALUES (
  'チノパンツ', 
  'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400', 
  4980, 
  'Banana Republic', 
  'メンズファッション', 
  ARRAY['チノ', 'パンツ', 'カジュアル'], 
  'どんなスタイルにも合うチノパンツ', 
  'https://example.com/product/9', 
  'sample_data', 
  true
);

INSERT INTO external_products (title, image_url, price, brand, category, tags, description, affiliate_url, source, is_active)
VALUES (
  'パンプス', 
  'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400', 
  7980, 
  'Jimmy Choo', 
  'レディース靴', 
  ARRAY['パンプス', 'エレガント', 'フォーマル'], 
  'エレガントなパンプス', 
  'https://example.com/product/10', 
  'sample_data', 
  true
);

INSERT INTO external_products (title, image_url, price, brand, category, tags, description, affiliate_url, source, is_active)
VALUES (
  'モノトーンパーカー', 
  'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400', 
  4980, 
  'Supreme', 
  'メンズファッション', 
  ARRAY['ストリート', 'パーカー', 'モノトーン'], 
  'シンプルなモノトーンパーカー', 
  'https://example.com/product/11', 
  'sample_data', 
  true
);

INSERT INTO external_products (title, image_url, price, brand, category, tags, description, affiliate_url, source, is_active)
VALUES (
  'プリーツスカート', 
  'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400', 
  3980, 
  'GU', 
  'レディースファッション', 
  ARRAY['フェミニン', 'スカート', 'プリーツ'], 
  '動きやすいプリーツスカート', 
  'https://example.com/product/12', 
  'sample_data', 
  true
);

INSERT INTO external_products (title, image_url, price, brand, category, tags, description, affiliate_url, source, is_active)
VALUES (
  'レザージャケット', 
  'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400', 
  19800, 
  'Schott', 
  'メンズファッション', 
  ARRAY['レザー', 'ジャケット', 'クール'], 
  '本格的なレザージャケット', 
  'https://example.com/product/13', 
  'sample_data', 
  true
);

INSERT INTO external_products (title, image_url, price, brand, category, tags, description, affiliate_url, source, is_active)
VALUES (
  'トートバッグ', 
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400', 
  6980, 
  'L.L.Bean', 
  'レディースバッグ', 
  ARRAY['トート', 'カジュアル', '大容量'], 
  'たっぷり入るトートバッグ', 
  'https://example.com/product/14', 
  'sample_data', 
  true
);

INSERT INTO external_products (title, image_url, price, brand, category, tags, description, affiliate_url, source, is_active)
VALUES (
  'ローファー', 
  'https://images.unsplash.com/photo-1626379801357-1342833de91f?w=400', 
  12800, 
  'G.H.Bass', 
  'メンズ靴', 
  ARRAY['ローファー', 'クラシック', '革靴'], 
  'クラシックなローファー', 
  'https://example.com/product/15', 
  'sample_data', 
  true
);

-- 4. 挿入結果を確認
SELECT COUNT(*) as total_products FROM external_products;
SELECT * FROM external_products LIMIT 5;

-- 5. 必要に応じてRLSを再度有効化（本番環境では推奨）
-- ALTER TABLE external_products ENABLE ROW LEVEL SECURITY;

/*
注意事項:
1. 上記のSQLをSupabaseダッシュボードのSQL Editorで実行してください
2. 実行前に必ずRLSを無効化してください（ステップ1）
3. 商品データが正しく挿入されたら、アプリを再起動してください
4. 本番環境では適切なRLSポリシーを設定してからRLSを有効化してください
*/
