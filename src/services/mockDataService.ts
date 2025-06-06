// モックデータジェネレーター（開発・テスト用）
import { Product } from '@/types';

export const generateMockProducts = (
  category: string,
  count: number = 10
): Product[] => {
  const mockProducts: Product[] = [];
  
  const categoryPrefixes: Record<string, string[]> = {
    'tops': ['Tシャツ', 'ブラウス', 'シャツ', 'ニット', 'カットソー'],
    'bottoms': ['ジーンズ', 'スカート', 'パンツ', 'ショートパンツ', 'レギンス'],
    'outerwear': ['ジャケット', 'コート', 'カーディガン', 'パーカー', 'ブルゾン'],
    'accessories': ['バッグ', 'ネックレス', 'イヤリング', 'スカーフ', 'ベルト'],
  };
  
  const brands = ['UNIQLO', 'ZARA', 'GU', 'H&M', 'GAP'];
  const colors = ['ブラック', 'ホワイト', 'ネイビー', 'グレー', 'ベージュ'];
  const sizes = ['S', 'M', 'L', 'XL', 'FREE'];
  
  const prefixes = categoryPrefixes[category] || categoryPrefixes['tops'];
  
  for (let i = 0; i < count; i++) {
    const prefix = prefixes[i % prefixes.length];
    const color = colors[i % colors.length];
    const brand = brands[i % brands.length];
    const price = Math.floor(Math.random() * 5000) + 1000;
    
    mockProducts.push({
      id: `mock-${category}-${i}`,
      title: `${color}の${prefix} - ${brand}`,
      price: price,
      brand: brand,
      imageUrl: `https://via.placeholder.com/400x600/cccccc/666666?text=${encodeURIComponent(prefix)}`,
      description: `おしゃれな${color}の${prefix}です。${sizes.join('/')}サイズ展開。`,
      tags: [category, prefix, color, brand],
      category: category,
      affiliateUrl: '#',
      source: 'mock',
      createdAt: new Date().toISOString(),
    });
  }
  
  return mockProducts;
};

// モックデータを使用するかどうかのフラグ
export const USE_MOCK_DATA = process.env.NODE_ENV === 'development' && !process.env.EXPO_PUBLIC_USE_REAL_API;
