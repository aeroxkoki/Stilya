require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diagnoseImageIssues() {
  console.log('🔍 画像表示問題の徹底的な診断開始...\n');

  try {
    // 1. 全商品数の確認
    const { count: totalCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📊 データベース内の全商品数: ${totalCount}`);

    // 2. アクティブな商品数
    const { count: activeCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    console.log(`✅ アクティブな商品数: ${activeCount}`);

    // 3. 画像URLが存在しない商品の確認
    const { count: nullImageCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .is('image_url', null)
      .eq('is_active', true);
    
    console.log(`❌ 画像URLがNULLの商品数: ${nullImageCount}`);

    // 4. 画像URLが空文字の商品
    const { count: emptyImageCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('image_url', '')
      .eq('is_active', true);
    
    console.log(`❌ 画像URLが空文字の商品数: ${emptyImageCount}`);

    // 5. 実際にフェッチされる商品（fetchMixedProductsのクエリをシミュレート）
    const { data: fetchedProducts, error } = await supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true)
      .not('image_url', 'is', null)
      .not('image_url', 'eq', '')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('❌ フェッチエラー:', error);
    } else {
      console.log(`\n🔍 実際にフェッチされた商品数: ${fetchedProducts.length}`);
      
      // 最初の5件の詳細を表示
      console.log('\n📋 最初の5件の商品詳細:');
      fetchedProducts.slice(0, 5).forEach((product, index) => {
        console.log(`\n${index + 1}. ${product.title}`);
        console.log(`   ID: ${product.id}`);
        console.log(`   画像URL: ${product.image_url || 'なし'}`);
        console.log(`   画像URLの長さ: ${product.image_url ? product.image_url.length : 0}`);
        console.log(`   ソース: ${product.source || 'NULL'}`);
        console.log(`   ブランド: ${product.brand || 'なし'}`);
        console.log(`   価格: ¥${product.price}`);
        console.log(`   中古品: ${product.is_used ? 'はい' : 'いいえ'}`);
      });
    }

    // 6. 画像URLのパターン分析
    const { data: allImageUrls } = await supabase
      .from('external_products')
      .select('image_url')
      .eq('is_active', true)
      .not('image_url', 'is', null)
      .not('image_url', 'eq', '')
      .limit(100);

    const urlPatterns = {};
    const protocolCount = { http: 0, https: 0, other: 0 };
    const domainCount = {};
    const pathPatterns = {};

    allImageUrls?.forEach(({ image_url }) => {
      if (!image_url) return;

      // プロトコルの確認
      if (image_url.startsWith('http://')) {
        protocolCount.http++;
      } else if (image_url.startsWith('https://')) {
        protocolCount.https++;
      } else {
        protocolCount.other++;
      }

      // ドメインの抽出
      try {
        const url = new URL(image_url);
        const domain = url.hostname;
        domainCount[domain] = (domainCount[domain] || 0) + 1;

        // パスのパターン確認（楽天の場合）
        if (domain.includes('rakuten')) {
          const path = url.pathname;
          if (path.includes('128x128')) pathPatterns['128x128'] = (pathPatterns['128x128'] || 0) + 1;
          if (path.includes('64x64')) pathPatterns['64x64'] = (pathPatterns['64x64'] || 0) + 1;
          if (path.includes('thumbnail')) pathPatterns['thumbnail'] = (pathPatterns['thumbnail'] || 0) + 1;
        }
      } catch (e) {
        // 無効なURL
      }
    });

    console.log('\n📊 プロトコル分布:');
    console.log(`   HTTP: ${protocolCount.http}`);
    console.log(`   HTTPS: ${protocolCount.https}`);
    console.log(`   その他: ${protocolCount.other}`);

    console.log('\n📊 ドメイン分布:');
    Object.entries(domainCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([domain, count]) => {
        console.log(`   ${domain}: ${count}`);
      });

    console.log('\n📊 楽天画像のパスパターン:');
    Object.entries(pathPatterns).forEach(([pattern, count]) => {
      console.log(`   ${pattern}: ${count}`);
    });

    // 7. 特定の問題のある画像URLパターンを検出
    console.log('\n⚠️ 問題のある画像URLパターン:');
    
    // HTTPの画像
    const { count: httpCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .like('image_url', 'http://%');
    
    if (httpCount > 0) {
      console.log(`   ❌ HTTPプロトコルを使用: ${httpCount}件`);
    }

    // サムネイルURLの画像
    const { count: thumbnailCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .like('image_url', '%thumbnail%');
    
    if (thumbnailCount > 0) {
      console.log(`   ⚠️ サムネイルURL: ${thumbnailCount}件`);
    }

    // 小さいサイズの画像
    const { count: smallImageCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .or('image_url.like.%128x128%,image_url.like.%64x64%');
    
    if (smallImageCount > 0) {
      console.log(`   ⚠️ 小さいサイズ指定の画像: ${smallImageCount}件`);
    }

    // 8. サンプル商品で画像URLの変換をテスト
    console.log('\n🔧 画像URL最適化のテスト:');
    const { data: sampleProducts } = await supabase
      .from('external_products')
      .select('title, image_url')
      .eq('is_active', true)
      .not('image_url', 'is', null)
      .limit(3);

    sampleProducts?.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.title}`);
      console.log(`   元のURL: ${product.image_url}`);
      
      // optimizeImageUrl関数のロジックをシミュレート
      let optimizedUrl = product.image_url;
      
      // HTTPをHTTPSに変換
      if (optimizedUrl.startsWith('http://')) {
        optimizedUrl = optimizedUrl.replace('http://', 'https://');
      }
      
      // 楽天の画像URL最適化
      if (optimizedUrl.includes('rakuten.co.jp')) {
        // サムネイルドメインを通常の画像ドメインに変更
        if (optimizedUrl.includes('thumbnail.image.rakuten.co.jp')) {
          optimizedUrl = optimizedUrl.replace('thumbnail.image.rakuten.co.jp', 'image.rakuten.co.jp');
        }
        
        // パス内のサイズ指定を削除
        optimizedUrl = optimizedUrl
          .replace(/\\/128x128\\//g, '/')
          .replace(/\\/64x64\\//g, '/')
          .replace(/\\/pc\\//g, '/')
          .replace(/\\/thumbnail\\//g, '/')
          .replace(/\\/cabinet\\/128x128\\//g, '/cabinet/')
          .replace(/\\/cabinet\\/64x64\\//g, '/cabinet/');
        
        // クエリパラメータのサイズ指定を削除
        if (optimizedUrl.includes('_ex=')) {
          optimizedUrl = optimizedUrl
            .replace(/_ex=128x128/g, '')
            .replace(/_ex=64x64/g, '')
            .replace(/\\?$/g, '')
            .replace(/&$/g, '');
        }
      }
      
      console.log(`   最適化後: ${optimizedUrl}`);
      console.log(`   変更あり: ${optimizedUrl !== product.image_url ? 'はい' : 'いいえ'}`);
    });

    // 9. 推奨事項
    console.log('\n💡 推奨される対処法:');
    
    if (nullImageCount > 0 || emptyImageCount > 0) {
      console.log('1. image_urlがNULLまたは空の商品を無効化または削除する');
    }
    
    if (httpCount > 0) {
      console.log('2. HTTPプロトコルの画像URLをHTTPSに変換する');
    }
    
    if (thumbnailCount > 0 || smallImageCount > 0) {
      console.log('3. サムネイルや小さいサイズの画像URLを高画質版に変換する');
    }
    
    console.log('4. 定期的に画像URLの有効性をチェックするバッチ処理を実装する');
    console.log('5. 商品登録時に画像URLの検証を行う');

  } catch (error) {
    console.error('❌ 診断中にエラーが発生しました:', error);
  }
}

// 実行
diagnoseImageIssues();
