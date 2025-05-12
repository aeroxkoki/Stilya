import { Product } from '@/types';
import { getRandomTags } from './index';

// ダミー商品データ生成関数
export const generateDummyProducts = (count: number): Product[] => {
  const dummyProducts: Product[] = [];
  
  // ブランド候補
  const brands = [
    'UNIQLO', 'GU', 'ZARA', 'H&M', 'GAP', 'MUJI', 'BEAMS', 'adidas', 'NIKE', 
    'URBAN RESEARCH', 'nano・universe', 'SHIPS', 'JOURNAL STANDARD', 'UNITED ARROWS',
    'green label relaxing', 'A.P.C.', 'Champion', 'POLO RALPH LAUREN', 'CONVERSE'
  ];
  
  // カテゴリ候補
  const categories = [
    'トップス', 'ボトムス', 'アウター', 'シューズ', 'バッグ', 'アクセサリー',
    'ワンピース', 'スーツ', 'パジャマ', 'スポーツウェア', 'インナー'
  ];
  
  // 商品名候補
  const productNames = [
    'エアリズム', 'ヒートテック', 'カットソー', 'デニムパンツ', 'スウェット', 'パーカー',
    'スニーカー', 'サンダル', 'トートバッグ', 'リュックサック', 'ベルト', 'ニット帽',
    'ジャケット', 'コート', 'カーディガン', 'ワンピース', 'スカート', 'シャツ', 'ネクタイ',
    'ポロシャツ', 'チノパン', 'レギンス', 'ソックス', 'タイツ', 'パンプス', 'ブーツ'
  ];
  
  // 形容詞候補
  const adjectives = [
    'オーバーサイズ', 'スリムフィット', 'クラシック', 'モダン', 'ベーシック', 'エレガント',
    'カジュアル', 'シンプル', 'ヴィンテージ', 'プレミアム', 'ストレッチ', 'デラックス',
    'リラックスフィット', 'コンフォート', 'ウルトラライト', 'スポーティ', 'リラックス',
    '防水', '速乾', '防風', '撥水', 'オーガニックコットン', 'シルク', 'カシミア'
  ];
  
  // 色候補
  const colors = [
    'ブラック', 'ホワイト', 'グレー', 'ネイビー', 'ベージュ', 'カーキ', 'オリーブ',
    'レッド', 'ブルー', 'グリーン', 'イエロー', 'パープル', 'ピンク', 'オレンジ',
    'ブラウン', 'チャコール', 'バーガンディ', 'サックス', 'ミント', 'ラベンダー'
  ];
  
  // ダミー画像URL（プレースホルダーサービス）
  const getImageUrl = (index: number): string => {
    // 実際の画像サービスのURLに置き換えることができます
    // ここではプレースホルダー画像を使用
    const imageServices = [
      `https://picsum.photos/400/600?random=${index}`,
      `https://source.unsplash.com/400x600/?fashion,${index}`,
      `https://loremflickr.com/400/600/fashion?lock=${index}`
    ];
    
    return imageServices[index % imageServices.length];
  };
  
  // ダミー商品を生成
  for (let i = 0; i < count; i++) {
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const productName = productNames[Math.floor(Math.random() * productNames.length)];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    // 価格範囲（1000円〜20000円、100円単位）
    const price = Math.floor(Math.random() * 190 + 10) * 100;
    
    // 商品タイトル生成
    const title = `${brand} ${adjective} ${color} ${productName}`;
    
    // タグ生成
    const tags = getRandomTags();
    if (!tags.includes(category)) {
      tags.push(category);
    }
    if (!tags.includes(color)) {
      tags.push(color);
    }
    
    dummyProducts.push({
      id: `dummy-${i}`,
      title,
      imageUrl: getImageUrl(i),
      brand,
      price,
      tags,
      category,
      affiliateUrl: 'https://example.com/product/' + i,
      source: 'サンプルデータ',
      createdAt: new Date().toISOString()
    });
  }
  
  return dummyProducts;
};

// ダミー商品データのエクスポート（サンプル用）
export const dummyProducts = generateDummyProducts(50);