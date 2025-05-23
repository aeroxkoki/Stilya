// supabase/functions/product-sync/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from '../_shared/cors.ts';

interface ProductData {
  title: string;
  brand: string;
  price: number;
  imageUrl: string;
  description?: string;
  tags: string[];
  category?: string;
  affiliateUrl: string;
  source: string;
}

// バッチ処理の設定
const BATCH_CONFIG = {
  productSync: {
    itemsPerBatch: 100,
  },
};

// アフィリエイトプログラムのエンドポイント
const AFFILIATE_PROGRAMS = {
  linkShare: {
    name: 'Rakuten Advertising',
    endpoint: 'https://api.linksynergy.com/v1/products/search',
  },
  rakuten: {
    name: '楽天アフィリエイト',
    endpoint: 'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601',
  },
};

serve(async (req) => {
  // CORS対応
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 環境変数からSupabase認証情報を取得
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    // Supabaseクライアントを初期化
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // リクエストボディから追加パラメータを取得
    const requestData = await req.json().catch(() => ({}));
    const { maxProducts = 200, skipRakuten = false, skipLinkShare = false } = requestData;
    
    // バッチ処理の実行
    console.log('Starting product sync batch');
    
    // 各アフィリエイトプログラムから商品データを取得
    const productsFromLinkShare = skipLinkShare ? [] : await fetchLinkShareProducts(maxProducts / 2);
    const productsFromRakuten = skipRakuten ? [] : await fetchRakutenProducts(maxProducts / 2);
    
    // 商品データをマージ
    const allProducts = [...productsFromLinkShare, ...productsFromRakuten];
    
    // Supabaseに一括登録
    const result = await saveProductsToSupabase(supabase, allProducts);
    
    console.log(`Product sync completed. Synced ${allProducts.length} products.`);
    
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          totalProducts: allProducts.length,
          linkShareProducts: productsFromLinkShare.length,
          rakutenProducts: productsFromRakuten.length,
          insertedCount: result.insertedCount,
          updatedCount: result.updatedCount,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error during product sync batch:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

/**
 * LinkShareから商品データを取得
 */
async function fetchLinkShareProducts(maxProducts: number): Promise<ProductData[]> {
  try {
    console.log('Fetching products from LinkShare');
    
    // 環境変数から認証情報を取得
    const apiToken = Deno.env.get('LINKSHARE_API_TOKEN');
    const merchantId = Deno.env.get('LINKSHARE_MERCHANT_ID');
    
    if (!apiToken || !merchantId) {
      console.warn('LinkShare API credentials are not set');
      return [];
    }
    
    // LinkShare APIのエンドポイント
    const endpoint = AFFILIATE_PROGRAMS.linkShare.endpoint;
    
    // API呼び出し
    const response = await fetch(`${endpoint}?token=${apiToken}&merchantId=${merchantId}&max=${maxProducts}&cat=apparel&sort=popularity`, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`LinkShare API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data || !data.products) {
      console.warn('No products found in LinkShare response');
      return [];
    }
    
    // レスポンスデータをProductData形式に変換
    const products: ProductData[] = data.products.map((item: any) => {
      // タグはカテゴリをスペース区切りで分割
      const categoryTags = item.category ? item.category.split(' ') : [];
      // 価格は数値に変換
      const price = parseFloat(item.price);
      
      return {
        title: item.productName,
        brand: item.merchantName,
        price: isNaN(price) ? 0 : price,
        imageUrl: item.imageUrl,
        description: item.description,
        tags: categoryTags,
        category: item.primaryCategory,
        affiliateUrl: item.linkUrl,
        source: 'linkshare',
      };
    });
    
    console.log(`Found ${products.length} products from LinkShare`);
    return products;
  } catch (error) {
    console.error('Error fetching products from LinkShare:', error);
    return [];
  }
}

/**
 * 楽天アフィリエイトから商品データを取得
 */
async function fetchRakutenProducts(maxProducts: number): Promise<ProductData[]> {
  try {
    console.log('Fetching products from Rakuten');
    
    // 環境変数から認証情報を取得
    const appId = Deno.env.get('RAKUTEN_APP_ID');
    const affiliateId = Deno.env.get('RAKUTEN_AFFILIATE_ID');
    
    if (!appId) {
      console.warn('Rakuten API credentials are not set');
      return [];
    }
    
    // 楽天APIのエンドポイント
    const endpoint = AFFILIATE_PROGRAMS.rakuten.endpoint;
    
    // API呼び出しURLを構築
    const url = new URL(endpoint);
    url.searchParams.append('applicationId', appId);
    if (affiliateId) url.searchParams.append('affiliateId', affiliateId);
    url.searchParams.append('format', 'json');
    url.searchParams.append('hits', maxProducts.toString());
    url.searchParams.append('genreId', '100371'); // ファッション
    url.searchParams.append('sort', '+reviewCount');
    
    // API呼び出し
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Rakuten API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data || !data.Items) {
      console.warn('No products found in Rakuten response');
      return [];
    }
    
    // レスポンスデータをProductData形式に変換
    const products: ProductData[] = data.Items.map((item: any) => {
      const rakutenItem = item.Item;
      
      // タグを生成（ジャンル名とキーワードを組み合わせる）
      const genreTags = rakutenItem.genreName ? rakutenItem.genreName.split('/').slice(1) : [];
      // タグIDsはない場合もあるので条件分岐
      const tagWords = rakutenItem.tagIds 
        ? Array.isArray(rakutenItem.tagIds) 
          ? rakutenItem.tagIds.map((tag: string) => tag.split(':')[1]) 
          : []
        : [];
      
      const tags = [...genreTags, ...tagWords];
      
      return {
        title: rakutenItem.itemName,
        brand: rakutenItem.shopName,
        price: rakutenItem.itemPrice,
        imageUrl: rakutenItem.mediumImageUrls && rakutenItem.mediumImageUrls.length > 0
          ? rakutenItem.mediumImageUrls[0].imageUrl.replace('?_ex=128x128', '')
          : '',
        description: rakutenItem.itemCaption,
        tags,
        category: genreTags[0],
        affiliateUrl: rakutenItem.affiliateUrl || rakutenItem.itemUrl,
        source: 'rakuten',
      };
    });
    
    console.log(`Found ${products.length} products from Rakuten`);
    return products;
  } catch (error) {
    console.error('Error fetching products from Rakuten:', error);
    return [];
  }
}

/**
 * 商品データをSupabaseに一括登録
 */
async function saveProductsToSupabase(supabase: any, products: ProductData[]): Promise<{ insertedCount: number, updatedCount: number }> {
  try {
    console.log(`Saving ${products.length} products to Supabase`);
    
    let insertedCount = 0;
    let updatedCount = 0;
    
    // サイズが大きい場合はバッチに分割して登録
    const batchSize = BATCH_CONFIG.productSync.itemsPerBatch;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      
      // DBの形式に合わせて変換
      const productsToInsert = batch.map(product => ({
        title: product.title,
        brand: product.brand,
        price: product.price,
        image_url: product.imageUrl,
        description: product.description,
        tags: product.tags,
        category: product.category,
        affiliate_url: product.affiliateUrl,
        source: product.source,
      }));
      
      // upsert操作（既存のものは更新、なければ挿入）
      const { data, error, count } = await supabase
        .from('products')
        .upsert(productsToInsert, {
          onConflict: 'affiliate_url',  // アフィリエイトURLが重複する場合は更新
          ignoreDuplicates: false,
          returning: 'minimal',  // レスポンスを最小限に
          count: 'exact',  // 厳密なカウントを取得
        });
      
      if (error) {
        throw new Error(`Failed to save products batch: ${error.message}`);
      }
      
      // 挿入数と更新数をカウント
      insertedCount += count;
      updatedCount += batch.length - count;
      
      console.log(`Saved batch ${Math.floor(i/batchSize) + 1} (${batch.length} products)`);
    }
    
    return { insertedCount, updatedCount };
  } catch (error) {
    console.error('Error saving products to Supabase:', error);
    throw error;
  }
}
