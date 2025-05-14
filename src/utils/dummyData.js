"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dummyProducts = exports.generateDummyProducts = void 0;
var index_1 = require("./index");
// ダミー商品データ生成関数
var generateDummyProducts = function (count) {
    if (count === void 0) { count = 10; }
    var dummyProducts = [];
    // ブランド候補
    var brands = [
        'UNIQLO', 'GU', 'ZARA', 'H&M', 'GAP', 'MUJI', 'BEAMS', 'adidas', 'NIKE',
        'URBAN RESEARCH', 'nano・universe', 'SHIPS', 'JOURNAL STANDARD', 'UNITED ARROWS',
        'green label relaxing', 'A.P.C.', 'Champion', 'POLO RALPH LAUREN', 'CONVERSE'
    ];
    // カテゴリ候補
    var categories = [
        'トップス', 'ボトムス', 'アウター', 'シューズ', 'バッグ', 'アクセサリー',
        'ワンピース', 'スーツ', 'パジャマ', 'スポーツウェア', 'インナー'
    ];
    // 商品名候補
    var productNames = [
        'エアリズム', 'ヒートテック', 'カットソー', 'デニムパンツ', 'スウェット', 'パーカー',
        'スニーカー', 'サンダル', 'トートバッグ', 'リュックサック', 'ベルト', 'ニット帽',
        'ジャケット', 'コート', 'カーディガン', 'ワンピース', 'スカート', 'シャツ', 'ネクタイ',
        'ポロシャツ', 'チノパン', 'レギンス', 'ソックス', 'タイツ', 'パンプス', 'ブーツ'
    ];
    // 形容詞候補
    var adjectives = [
        'オーバーサイズ', 'スリムフィット', 'クラシック', 'モダン', 'ベーシック', 'エレガント',
        'カジュアル', 'シンプル', 'ヴィンテージ', 'プレミアム', 'ストレッチ', 'デラックス',
        'リラックスフィット', 'コンフォート', 'ウルトラライト', 'スポーティ', 'リラックス',
        '防水', '速乾', '防風', '撥水', 'オーガニックコットン', 'シルク', 'カシミア'
    ];
    // 色候補
    var colors = [
        'ブラック', 'ホワイト', 'グレー', 'ネイビー', 'ベージュ', 'カーキ', 'オリーブ',
        'レッド', 'ブルー', 'グリーン', 'イエロー', 'パープル', 'ピンク', 'オレンジ',
        'ブラウン', 'チャコール', 'バーガンディ', 'サックス', 'ミント', 'ラベンダー'
    ];
    // ダミー画像URL（プレースホルダーサービス）
    var getImageUrl = function (index) {
        // 実際の画像サービスのURLに置き換えることができます
        // ここではプレースホルダー画像を使用
        var imageServices = [
            "https://picsum.photos/400/600?random=".concat(index),
            "https://source.unsplash.com/400x600/?fashion,".concat(index),
            "https://loremflickr.com/400/600/fashion?lock=".concat(index)
        ];
        return imageServices[index % imageServices.length];
    };
    // ダミー商品を生成
    for (var i = 0; i < count; i++) {
        var brand = brands[Math.floor(Math.random() * brands.length)];
        var category = categories[Math.floor(Math.random() * categories.length)];
        var productName = productNames[Math.floor(Math.random() * productNames.length)];
        var adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        var color = colors[Math.floor(Math.random() * colors.length)];
        // 価格範囲（1000円〜20000円、100円単位）
        var price = Math.floor(Math.random() * 190 + 10) * 100;
        // 商品タイトル生成
        var title = "".concat(brand, " ").concat(adjective, " ").concat(color, " ").concat(productName);
        // タグ生成
        var tags = (0, index_1.getRandomTags)(brand, category, color);
        dummyProducts.push({
            id: "dummy-".concat(i),
            title: title,
            imageUrl: getImageUrl(i),
            brand: brand,
            price: price,
            tags: tags,
            category: category,
            affiliateUrl: 'https://example.com/product/' + i,
            source: 'サンプルデータ',
            createdAt: new Date().toISOString()
        });
    }
    return dummyProducts;
};
exports.generateDummyProducts = generateDummyProducts;
// ダミー商品データのエクスポート（サンプル用）
exports.dummyProducts = (0, exports.generateDummyProducts)(50);
