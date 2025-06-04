-- Stilya MVP用 初期商品データ投入スクリプト
-- 実行前に必ずSupabaseダッシュボードで本番環境に接続してください

-- 既存データをクリア（開発環境のみ実行）
-- TRUNCATE products CASCADE;

-- 商品データの投入（30商品）
INSERT INTO products (title, image_url, price, brand, tags, affiliate_url, category) VALUES
-- メンズカジュアル
('クルーネックTシャツ', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800', 2990, 'UNIQLO', ARRAY['メンズ', 'カジュアル', 'Tシャツ', 'ベーシック'], 'https://click.linksynergy.com/link?id=xxx&offerid=xxx.xxx&type=2&murl=https%3A%2F%2Fwww.uniqlo.com%2Fjp%2Fja%2Fproducts%2Fxxx', 'tops'),
('スリムフィットジーンズ', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800', 4990, 'GU', ARRAY['メンズ', 'カジュアル', 'デニム', 'スリム'], 'https://click.linksynergy.com/link?id=xxx&offerid=xxx.xxx&type=2&murl=https%3A%2F%2Fwww.gu-global.com%2Fjp%2Fja%2Fproducts%2Fxxx', 'bottoms'),
('オックスフォードシャツ', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800', 3990, 'MUJI', ARRAY['メンズ', 'ビジネスカジュアル', 'シャツ', 'オックスフォード'], 'https://click.linksynergy.com/link?id=xxx&offerid=xxx.xxx&type=2&murl=https%3A%2F%2Fwww.muji.com%2Fjp%2Fja%2Fstore%2Fcmdty%2Fdetail%2Fxxx', 'tops'),
('チノパンツ', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800', 5990, 'GAP', ARRAY['メンズ', 'カジュアル', 'チノパン', 'ベージュ'], 'https://click.linksynergy.com/link?id=xxx&offerid=xxx.xxx&type=2&murl=https%3A%2F%2Fwww.gap.co.jp%2Fbrowse%2Fproduct.do%3Fpid%3Dxxx', 'bottoms'),
('パーカー', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800', 4490, 'H&M', ARRAY['メンズ', 'カジュアル', 'パーカー', 'グレー'], 'https://click.linksynergy.com/link?id=xxx&offerid=xxx.xxx&type=2&murl=https%3A%2F%2Fwww2.hm.com%2Fja_jp%2Fproductpage.xxx.html', 'tops'),

-- レディースカジュアル
('フレンチスリーブブラウス', 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=800', 3990, 'ZARA', ARRAY['レディース', 'カジュアル', 'ブラウス', 'ホワイト'], 'https://click.linksynergy.com/link?id=xxx&offerid=xxx.xxx&type=2&murl=https%3A%2F%2Fwww.zara.com%2Fjp%2Fja%2Fxxx.html', 'tops'),
('プリーツスカート', 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800', 5990, 'UNIQLO', ARRAY['レディース', 'フェミニン', 'スカート', 'プリーツ'], 'https://click.linksynergy.com/link?id=xxx&offerid=xxx.xxx&type=2&murl=https%3A%2F%2Fwww.uniqlo.com%2Fjp%2Fja%2Fproducts%2Fxxx', 'bottoms'),
('ワイドパンツ', 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800', 4990, 'GU', ARRAY['レディース', 'カジュアル', 'パンツ', 'ワイド'], 'https://click.linksynergy.com/link?id=xxx&offerid=xxx.xxx&type=2&murl=https%3A%2F%2Fwww.gu-global.com%2Fjp%2Fja%2Fproducts%2Fxxx', 'bottoms'),
('カーディガン', 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800', 6990, 'MUJI', ARRAY['レディース', 'ベーシック', 'カーディガン', 'ネイビー'], 'https://click.linksynergy.com/link?id=xxx&offerid=xxx.xxx&type=2&murl=https%3A%2F%2Fwww.muji.com%2Fjp%2Fja%2Fstore%2Fcmdty%2Fdetail%2Fxxx', 'tops'),
('サマードレス', 'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=800', 7990, 'MANGO', ARRAY['レディース', 'フェミニン', 'ワンピース', 'フローラル'], 'https://click.linksynergy.com/link?id=xxx&offerid=xxx.xxx&type=2&murl=https%3A%2F%2Fshop.mango.com%2Fjp%2Fxxx', 'onepiece'),

-- メンズビジネス
('スーツジャケット', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', 19900, 'AOKI', ARRAY['メンズ', 'ビジネス', 'スーツ', 'ネイビー'], 'https://click.linksynergy.com/link?id=xxx&offerid=xxx.xxx&type=2&murl=https%3A%2F%2Fwww.aoki-style.com%2Fshop%2Fitem%2Fxxx', 'tops'),
('ドレスシャツ', 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=800', 4990, 'THE SUIT COMPANY', ARRAY['メンズ', 'ビジネス', 'シャツ', 'ホワイト'], 'https://click.linksynergy.com/link?id=xxx&offerid=xxx.xxx&type=2&murl=https%3A%2F%2Fwww.uktsc.com%2Fcont%2Fproduct-detail%2Fxxx', 'tops'),
('ビジネスシューズ', 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800', 12900, 'REGAL', ARRAY['メンズ', 'ビジネス', 'シューズ', 'レザー'], 'https://click.linksynergy.com/link?id=xxx&offerid=xxx.xxx&type=2&murl=https%3A%2F%2Fwww.regal.co.jp%2Fshop%2Fg%2Fxxx', 'shoes'),
('ネクタイ', 'https://images.unsplash.com/photo-1589756823695-278bc923f962?w=800', 3990, 'COMME CA ISM', ARRAY['メンズ', 'ビジネス', 'ネクタイ', 'ストライプ'], 'https://click.linksynergy.com/link?id=xxx&offerid=xxx.xxx&type=2&murl=https%3A%2F%2Fonline.fivefoxes.co.jp%2Fproducts%2Fdetail%2Fxxx', 'accessories'),

-- レディースオフィス
('テーラードジャケット', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800', 8990, 'PLST', ARRAY['レディース', 'オフィス', 'ジャケット', 'グレー'], 'https://click.linksynergy.com/link?id=xxx&offerid=xxx.xxx&type=2&murl=https%3A%2F%2Fwww.plst.com%2Fjp%2Fja%2Fitem%2Fxxx', 'tops'),
('ペンシルスカート', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800', 5990, 'NATURAL BEAUTY BASIC', ARRAY['レディース', 'オフィス', 'スカート', 'タイト'], 'https://click.linksynergy.com/link?id=xxx&offerid=xxx.xxx&type=2&murl=https%3A%2F%2Fwww.naturalbeautybasic.com%2Fs%2Fnbb%2Fitem%2Fdetail%2Fxxx', 'bottoms'),
('パンプス', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800', 6990, 'DIANA', ARRAY['レディース', 'オフィス', 'シューズ', 'ブラック'], 'https://click.linksynergy.com/link?id=xxx&offerid=xxx.xxx&type=2&murl=https%3A%2F%2Fwww.dianashoes.com%2Fshop%2Fg%2Fxxx', 'shoes'),

-- ストリート系
('オーバーサイズTシャツ', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800', 3990, 'WEGO', ARRAY['ユニセックス', 'ストリート', 'Tシャツ', 'オーバーサイズ'], 'https://click.linksynergy.com/link?id=xxx&offerid=xxx.xxx&type=2&murl=https%3A%2F%2Fwww.wego.jp%2Fitem%2Fxxx', 'tops'),
('カーゴパンツ', 'https://images.unsplash.com/photo-1548883354-94bcfe321cbb?w=800', 7990, 'BEAMS', ARRAY['メンズ', 'ストリート', 'パンツ', 'カーゴ'], 'https://click.linksynergy.com/link?id=xxx&offerid=xxx.xxx&type=2&murl=https%3A%2F%2Fwww.beams.co.jp%2Fitem%2Fxxx', 'bottoms'),
('スニーカー', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800', 9900, 'ABC-MART', ARRAY['ユニセックス', 'ストリート', 'シューズ', 'スニーカー'], 'https://click.linksynergy.com/link?id=xxx&offerid=xxx.xxx&type=2&murl=https%3A%2F%2Fwww.abc-mart.net%2Fshop%2Fg%2Fxxx', 'shoes'),

-- アクセサリー
('トートバッグ', 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800', 4990, 'COACH OUTLET', ARRAY['レディース', 'アクセサリー', 'バッグ', 'トート'], 'https://click.linksynergy.com/link?id=xxx&offerid=xxx.xxx&type=2&murl=https%3A%2F%2Fjapan.coach.com%2Fshop%2Fxxx', 'bags'),
('腕時計', 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800', 15900, 'CASIO', ARRAY['ユニセックス', 'アクセサリー', '時計', 'デジタル'], 'https://click.linksynergy.com/link?id=xxx&offerid=xxx.xxx&type=2&murl=https%3A%2F%2Fwww.casio.com%2Fjp%2Fwatches%2Fcasio%2Fproduct.xxx', 'accessories'),
('ネックレス', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800', 2990, 'ZARA', ARRAY['レディース', 'アクセサリー', 'ジュエリー', 'ゴールド'], 'https://click.linksynergy.com/link?id=xxx&offerid=xxx.xxx&type=2&murl=https%3A%2F%2Fwww.zara.com%2Fjp%2Fja%2Fxxx.html', 'accessories'),
('サングラス', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800', 3990, 'JINS', ARRAY['ユニセックス', 'アクセサリー', 'アイウェア', 'サングラス'], 'https://click.linksynergy.com/link?id=xxx&offerid=xxx.xxx&type=2&murl=https%3A%2F%2Fwww.jins.com%2Fjp%2Fitem%2Fxxx', 'accessories'),

-- その他アイテム
('ダウンジャケット', 'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800', 19900, 'THE NORTH FACE', ARRAY['ユニセックス', 'アウター', 'ダウン', 'ブラック'], 'https://click.linksynergy.com/link?id=xxx&offerid=xxx.xxx&type=2&murl=https%3A%2F%2Fwww.goldwin.co.jp%2Ftnf%2Fec%2Fpro%2Fdisp%2F2%2Fxxx', 'outerwear'),
('デニムジャケット', 'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=800', 7990, 'LEVI\'S', ARRAY['ユニセックス', 'カジュアル', 'ジャケット', 'デニム'], 'https://click.linksynergy.com/link?id=xxx&offerid=xxx.xxx&type=2&murl=https%3A%2F%2Fwww.levi.jp%2Fproduct%2Fxxx', 'outerwear'),
('マフラー', 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800', 2990, 'MUJI', ARRAY['ユニセックス', 'アクセサリー', 'マフラー', 'グレー'], 'https://click.linksynergy.com/link?id=xxx&offerid=xxx.xxx&type=2&murl=https%3A%2F%2Fwww.muji.com%2Fjp%2Fja%2Fstore%2Fcmdty%2Fdetail%2Fxxx', 'accessories'),
('帽子', 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800', 3490, 'NEW ERA', ARRAY['ユニセックス', 'アクセサリー', 'キャップ', 'ベースボール'], 'https://click.linksynergy.com/link?id=xxx&offerid=xxx.xxx&type=2&murl=https%3A%2F%2Fwww.neweracap.jp%2Fproducts%2Fxxx', 'accessories'),
('リュック', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800', 8990, 'anello', ARRAY['ユニセックス', 'アクセサリー', 'バッグ', 'バックパック'], 'https://click.linksynergy.com/link?id=xxx&offerid=xxx.xxx&type=2&murl=https%3A%2F%2Fwww.carrot-online.jp%2Fanello%2Fxxx', 'bags'),
('ベルト', 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800', 4990, 'DIESEL', ARRAY['メンズ', 'アクセサリー', 'ベルト', 'レザー'], 'https://click.linksynergy.com/link?id=xxx&offerid=xxx.xxx&type=2&murl=https%3A%2F%2Fwww.diesel.co.jp%2Fproduct%2Fxxx', 'accessories');

-- インデックスの作成（パフォーマンス向上のため）
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);

-- 確認用クエリ
SELECT COUNT(*) as total_products FROM products;
SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY count DESC;
SELECT unnest(tags) as tag, COUNT(*) as count FROM products GROUP BY tag ORDER BY count DESC LIMIT 10;
