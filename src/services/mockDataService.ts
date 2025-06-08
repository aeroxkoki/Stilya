// モックデータジェネレーター（開発・テスト用）
import { Product } from '@/types';

// Unsplashの画像URLリスト（ファッション関連）
const fashionImages = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
  'https://images.unsplash.com/photo-1548036328-c9fa89d128fa',
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8',
  'https://images.unsplash.com/photo-1555689502-c4b22d76c56f',
  'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa',
  'https://images.unsplash.com/photo-1556906781-9a412961c28c',
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3',
  'https://images.unsplash.com/photo-1434389677669-e08b4cac3105',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d',
  'https://images.unsplash.com/photo-1562113530-57ba467cea38',
  'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1',
  'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c',
];

export const generateMockProducts = (
  keyword: string = 'general',
  count: number = 30
): Product[] => {
  const mockProducts: Product[] = [];
  
  const productTypes = [
    { name: 'モダンジャケット', tags: ['ジャケット', 'アウター', 'モダン'], category: 'メンズファッション' },
    { name: 'カジュアルワンピース', tags: ['ワンピース', 'カジュアル', '春夏'], category: 'レディースファッション' },
    { name: 'スニーカー', tags: ['シューズ', 'スニーカー', 'スポーティ'], category: 'シューズ' },
    { name: 'レザーバックパック', tags: ['バッグ', 'レザー', 'ビジネス'], category: 'バッグ' },
    { name: 'エレガントドレス', tags: ['ドレス', 'フォーマル', 'エレガント'], category: 'レディースファッション' },
    { name: 'デニムジーンズ', tags: ['デニム', 'ジーンズ', 'カジュアル'], category: 'メンズファッション' },
    { name: 'フローラルスカート', tags: ['スカート', 'フローラル', 'フェミニン'], category: 'レディースファッション' },
    { name: 'スポーツウェア', tags: ['スポーツ', 'アクティブ', 'フィットネス'], category: 'スポーツウェア' },
    { name: 'ヴィンテージTシャツ', tags: ['Tシャツ', 'ヴィンテージ', 'カジュアル'], category: 'トップス' },
    { name: 'ハンドバッグ', tags: ['バッグ', 'ハンドバッグ', 'エレガント'], category: 'レディースバッグ' },
  ];
  
  const brands = ['URBAN STYLE', 'SWEET FASHION', 'STEP FORWARD', 'CRAFT LEATHER', 'LUXE STYLE', 'DENIM WORKS', 'BLOOM GARDEN', 'ACTIVE LIFE', 'RETRO VIBES', 'ELEGANT TOUCH'];
  const colors = ['ブラック', 'ホワイト', 'ネイビー', 'グレー', 'ベージュ', 'ブラウン', 'カーキ', 'レッド', 'ブルー'];
  
  for (let i = 0; i < count; i++) {
    const productType = productTypes[i % productTypes.length];
    const brand = brands[i % brands.length];
    const color = colors[i % colors.length];
    const price = Math.floor(Math.random() * 15000) + 3000;
    const imageUrl = fashionImages[i % fashionImages.length];
    
    mockProducts.push({
      id: `mock-${Date.now()}-${i}`,
      title: `${color} ${productType.name}`,
      price: price,
      brand: brand,
      imageUrl: imageUrl,
      image_url: imageUrl, // 両方の形式に対応
      description: `${brand}の${color}${productType.name}。高品質な素材を使用し、快適な着心地を実現。`,
      tags: [...productType.tags, color, keyword].filter(tag => tag !== 'general'),
      category: productType.category,
      affiliateUrl: `https://example.com/products/${i}`,
      affiliate_url: `https://example.com/products/${i}`, // 両方の形式に対応
      source: 'mock',
      createdAt: new Date().toISOString(),
      created_at: new Date().toISOString(), // 両方の形式に対応
    });
  }
  
  // シャッフル
  return mockProducts.sort(() => Math.random() - 0.5);
};

// モックデータを使用するかどうかのフラグ
export const USE_MOCK_DATA = true; // 開発時は常にモックデータを使用
