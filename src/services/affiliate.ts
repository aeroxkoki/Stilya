import { apiGet } from '@/utils/api';
import { LINKSHARE_API_TOKEN, RAKUTEN_APP_ID, RAKUTEN_AFFILIATE_ID } from '@/utils/env';
import { Product } from '@/types';
import { supabase } from './supabase';

// LinkShare APIのエンドポイント
const LINKSHARE_ENDPOINT = 'https://api.linksynergy.com/search/product';

// 楽天アフィリエイトAPIのエンドポイント
const RAKUTEN_ENDPOINT = 'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601';

// LinkShare API商品検索の型定義
interface LinkShareProduct {
  productId: string;
  productName: string;
  merchantId: string;
  merchantName: string;
  productUrl: string;
  imageUrl: string;
  price: string;
  description?: string;
  category?: string;
  keywords?: string;
}

// LinkShare API レスポンスの型定義
interface LinkShareResponse {
  products: LinkShareProduct[];
  totalMatches: number;
  totalPages: number;
}

// 楽天API商品の型定義
interface RakutenProduct {
  itemCode: string;
  itemName: string;
  itemPrice: number;
  itemUrl: string;
  shopName: string;
  mediumImageUrls: { imageUrl: string }[];
  categoryId?: string;
  itemCaption?: string;
  tagIds?: string[];
}

// 楽天API レスポンスの型定義
interface RakutenResponse {
  Items: { Item: RakutenProduct }[];
  count: number;
  page: number;
  pageCount: number;
  hits: number;
}

// LinkShareからアパレル商品検索（MVP段階では未実装）
export const searchLinkShareProducts = async (
  keyword: string = '',
  category: string = 'apparel',
  limit: number = 20,
  page: number = 1
): Promise<Product[]> => {
  try {
    // MVPではLinkShareは未実装、モックデータを返す
    console.warn('LinkShare API is not implemented yet in MVP phase, returning mock data');
    return getMockLinkShareProducts(limit);
  } catch (error) {
    console.error('Error in LinkShare products:', error);
    return getMockLinkShareProducts(limit);
  }
};

// 楽天アフィリエイトAPI商品検索
export const searchRakutenProducts = async (
  keyword: string = '',
  category: string = '',
  limit: number = 20,
  page: number = 1
): Promise<Product[]> => {
  try {
    // サンプルとテスト用にモック応答を返す（開発時のみ）
    if (__DEV__ && !RAKUTEN_APP_ID) {
      console.warn('Using mock Rakuten response due to missing API ID');
      return getMockRakutenProducts(limit);
    }

    // 実際のAPI呼び出し
    const params = {
      applicationId: RAKUTEN_APP_ID,
      affiliateId: RAKUTEN_AFFILIATE_ID,
      keyword,
      genreId: category,
      hits: limit,
      page,
      format: 'json',
    };

    // URLパラメータを生成
    const queryParams = Object.entries(params)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');

    const response = await apiGet<RakutenResponse>(`${RAKUTEN_ENDPOINT}?${queryParams}`);

    // 楽天商品データをアプリの商品型に変換
    return response.Items.map((item): Product => {
      const product = item.Item;
      return {
        id: product.itemCode,
        title: product.itemName,
        imageUrl: product.mediumImageUrls[0]?.imageUrl || '',
        brand: product.shopName,
        price: product.itemPrice,
        category: product.categoryId,
        tags: product.tagIds || [],
        affiliateUrl: product.itemUrl,
        source: 'Rakuten',
        createdAt: new Date().toISOString(),
      };
    });
  } catch (error) {
    console.error('Error searching Rakuten products:', error);
    
    // 開発時はモックデータを返す
    if (__DEV__) {
      console.warn('Using mock Rakuten data due to API error');
      return getMockRakutenProducts(limit);
    }
    
    throw error;
  }
};

// アフィリエイト商品をSupabaseに保存
export const saveProductsToSupabase = async (products: Product[]): Promise<void> => {
  try {
    // 商品データをSupabaseの形式に変換（画像URLの検証を追加）
    const supabaseProducts = products
      .filter(product => {
        // 画像URLの検証
        const imageUrl = product.imageUrl;
        if (!imageUrl || imageUrl.trim() === '' || 
            imageUrl.includes('undefined') ||
            imageUrl.includes('placehold') ||
            imageUrl.includes('placeholder') ||
            imageUrl.includes('noimage') ||
            imageUrl.includes('_ex=64x64') ||
            imageUrl.includes('_ex=128x128') ||
            imageUrl === 'null' ||
            imageUrl === 'undefined') {
          console.warn(`[AffiliateService] Skipping product with invalid image URL: ${product.title}`);
          return false;
        }
        return true;
      })
      .map(product => ({
        id: product.id,
        title: product.title,
        image_url: product.imageUrl,
        brand: product.brand,
        price: product.price,
        tags: product.tags || [],
        category: product.category || '',
        affiliate_url: product.affiliateUrl,
        source: product.source,
        created_at: new Date().toISOString(),
      }));

    // upsert (insert or update)
    const { error } = await supabase
      .from('external_products')
      .upsert(supabaseProducts, { onConflict: 'id' });

    if (error) throw error;
  } catch (error) {
    console.error('Error saving products to Supabase:', error);
    throw error;
  }
};

// LinkShareモックデータの生成 (開発とテスト用)
const getMockLinkShareProducts = (count: number): Product[] => {
  const brands = ['ZARA', 'H&M', 'UNIQLO', 'GAP', 'MUJI', 'adidas', 'NIKE'];
  const categories = ['トップス', 'ボトムス', 'アウター', 'シューズ', 'バッグ'];
  const products: Product[] = [];

  for (let i = 0; i < count; i++) {
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const price = Math.floor(Math.random() * 10000) + 1000;

    products.push({
      id: `ls-${i}-${Date.now()}`,
      title: `${brand} サンプル${category} ${i}`,
      imageUrl: `https://picsum.photos/400/600?random=${i}`,
      brand,
      price,
      category,
      tags: [category, brand, 'サンプル'],
      affiliateUrl: `https://example.com/affiliate/${i}`,
      source: 'LinkShare (Mock)',
      createdAt: new Date().toISOString(),
    });
  }

  return products;
};

// 楽天モックデータの生成 (開発とテスト用)
const getMockRakutenProducts = (count: number): Product[] => {
  const brands = ['ユニクロ', 'GU', 'ビームス', 'ユナイテッドアローズ', 'ナノユニバース'];
  const categories = ['シャツ', 'パンツ', 'ジャケット', 'スニーカー', 'アクセサリー'];
  const products: Product[] = [];

  for (let i = 0; i < count; i++) {
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const price = Math.floor(Math.random() * 10000) + 1000;

    products.push({
      id: `rk-${i}-${Date.now()}`,
      title: `${brand} サンプル${category} ${i}`,
      imageUrl: `https://picsum.photos/400/600?random=${i + 100}`,
      brand,
      price,
      category,
      tags: [category, brand, 'サンプル'],
      affiliateUrl: `https://example.com/rakuten/${i}`,
      source: 'Rakuten (Mock)',
      createdAt: new Date().toISOString(),
    });
  }

  return products;
};

// すべてのソースから商品を取得して結合（開発時に使用）
export const fetchAllAffiliateProducts = async (
  keyword: string = '',
  limit: number = 20
): Promise<Product[]> => {
  try {
    // LinkShareと楽天から商品を並行して取得
    const [linkShareProducts, rakutenProducts] = await Promise.all([
      searchLinkShareProducts(keyword, 'apparel', limit / 2),
      searchRakutenProducts(keyword, '', limit / 2),
    ]);

    // 結果を結合
    return [...linkShareProducts, ...rakutenProducts];
  } catch (error) {
    console.error('Error fetching all affiliate products:', error);
    
    // 開発時はモックデータを返す
    if (__DEV__) {
      const mockProducts = [
        ...getMockLinkShareProducts(limit / 2),
        ...getMockRakutenProducts(limit / 2),
      ];
      return mockProducts;
    }
    
    throw error;
  }
};
