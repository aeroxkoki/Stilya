-- テスト商品データの追加
INSERT INTO products (title, brand, price, image_url, description, tags, category, affiliate_url, source)
VALUES 
('シンプル白Tシャツ', 'UNIQLO', 1990, 'https://img.ltwebstatic.com/images3_pi/2022/06/21/1655772308e78aed723c5f2a321c2886a39e9e2461_thumbnail_900x.webp', 'シンプルで着回しやすい白Tシャツ', ARRAY['カジュアル', '白', 'ベーシック'], 'トップス', 'https://www.uniqlo.com/jp/ja/products/E422992-000/00?colorDisplayCode=00&sizeDisplayCode=003', 'test'),

('ブラックデニム', 'ZARA', 5990, 'https://static.zara.net/photos///2023/I/0/2/p/5575/330/800/2/w/563/5575330800_2_1_1.jpg?ts=1693313491228', 'スリムフィットのブラックデニム', ARRAY['カジュアル', '黒', 'ボトムス'], 'パンツ', 'https://www.zara.com/jp/ja/スキニーデニムパンツ-p05575330.html', 'test'),

('ネイビーブレザー', 'H&M', 7990, 'https://image.hm.com/assets/hm/65/03/6503c71f8df2222a594ec1d84e59d60ae5bebc99.jpg', 'シンプルで合わせやすいネイビーブレザー', ARRAY['フォーマル', '紺', 'アウター'], 'ジャケット', 'https://www2.hm.com/ja_jp/productpage.0713996003.html', 'test'),

('チェックシャツ', 'GU', 2990, 'https://www.gu-global.com/jp/ja/product-detail/MA158-152-1208-000000/00/product-card-5.jpg', 'ベーシックなチェック柄の長袖シャツ', ARRAY['カジュアル', 'チェック', 'シャツ'], 'トップス', 'https://www.gu-global.com/jp/ja/men/tops/shirts/ma158-152-1208-000000.html', 'test'),

('スウェットパーカー', 'GAP', 4990, 'https://www.gap.co.jp/webcontent/0029/778/668/cn29778668.jpg', '肌触りの良いコットン混のフーディー', ARRAY['カジュアル', 'パーカー', 'グレー'], 'トップス', 'https://www.gap.co.jp/browse/product.do?pid=773652', 'test'),

('クラシックレザーシューズ', 'Dr. Martens', 18700, 'https://image.rakuten.co.jp/lowtex/cabinet/martens/dm-14345001_1.jpg', '定番の3ホールレザーシューズ', ARRAY['シューズ', 'レザー', 'ブラック'], 'シューズ', 'https://jp.drmartens.com/collections/mens/products/1461-mens-smooth-leather-oxford-shoes', 'test'),

('スリムフィットチノパン', 'BEAMS', 9900, 'https://www.beams.co.jp/img/item/11231022136_m3.jpg', 'キレイめカジュアルに最適な細身チノパン', ARRAY['ボトムス', 'ベージュ', 'チノパン'], 'パンツ', 'https://www.beams.co.jp/item/beams/pants/11231022136/', 'test'),

('リブニットカーディガン', 'UNITED ARROWS', 12100, 'https://uacdn.united-arrows.co.jp/img/item/77327899006_m1.jpg', '上質な素材感のリブ編みカーディガン', ARRAY['トップス', 'ニット', 'アイボリー'], 'トップス', 'https://store.united-arrows.co.jp/shop/ua/goods.html?gid=77327899006', 'test'),

('デニムジャケット', 'Levi\'s', 15400, 'https://lsco.scene7.com/is/image/lsco/723340146-front-pdp?fmt=jpeg&qlt=70&resMode=bisharp&fit=crop,0&op_usm=1.25,0.6,8,0&wid=1080&hei=1349', 'クラシックなデニムトラッカージャケット', ARRAY['アウター', 'デニム', 'ブルー'], 'アウター', 'https://www.levi.jp/LP/TRUCKER_JACKET/', 'test'),

('ボーダーロングTシャツ', 'MUJI', 2990, 'https://www.muji.com/jp/ja/common/img/400x400/S0B2D750.jpg', 'オーガニックコットン100%のボーダーカットソー', ARRAY['トップス', 'ボーダー', 'カットソー'], 'トップス', 'https://www.muji.com/jp/ja/store/goods/S0B2D750', 'test');
