#!/bin/bash
# 画像表示問題の根本解決スクリプト

echo "🔧 Stilya画像表示問題の根本解決を開始..."
cd /Users/koki_air/Documents/GitHub/Stilya

# 1. 全ての楽天画像URLを最適化
echo "📸 Step 1: 楽天画像URLの最適化..."
node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function fixAllImageUrls() {
  console.log('🔍 Fetching all products...');
  const { data: products, error } = await supabase
    .from('external_products')
    .select('id, image_url')
    .not('image_url', 'is', null);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(\`Found \${products.length} products with image URLs\`);
  
  let updated = 0;
  const updates = [];

  for (const product of products) {
    const url = product.image_url;
    let needsUpdate = false;
    let newUrl = url;

    // HTTPをHTTPSに変換
    if (url.startsWith('http://')) {
      newUrl = url.replace('http://', 'https://');
      needsUpdate = true;
    }

    // 楽天URLの最適化
    if (newUrl.includes('rakuten.co.jp')) {
      // thumbnail.image.rakuten.co.jpの場合
      if (newUrl.includes('thumbnail.image.rakuten.co.jp')) {
        // _exパラメータがない場合は追加
        if (!newUrl.includes('_ex=')) {
          if (newUrl.includes('?')) {
            newUrl = newUrl + '&_ex=800x800';
          } else {
            newUrl = newUrl + '?_ex=800x800';
          }
          needsUpdate = true;
        } else {
          // 既存の_exパラメータを800x800に統一
          const optimized = newUrl.replace(/_ex=\d+x\d+/, '_ex=800x800');
          if (optimized !== newUrl) {
            newUrl = optimized;
            needsUpdate = true;
          }
        }
      }
    }

    if (needsUpdate) {
      updates.push({
        id: product.id,
        image_url: newUrl
      });
      updated++;
    }
  }

  if (updates.length > 0) {
    console.log(\`\n📝 Updating \${updates.length} products...\`);
    
    // バッチ更新（100件ずつ）
    for (let i = 0; i < updates.length; i += 100) {
      const batch = updates.slice(i, i + 100);
      
      for (const update of batch) {
        await supabase
          .from('external_products')
          .update({ image_url: update.image_url })
          .eq('id', update.id);
      }
      
      console.log(\`Updated \${Math.min(i + 100, updates.length)}/\${updates.length}\`);
    }
  }

  console.log(\`\n✅ Optimization complete! Updated \${updated} products.\`);
}

fixAllImageUrls();
" &

# プロセスIDを保存
URL_FIX_PID=$!

# 2. キャッシュクリア
echo "🗑️ Step 2: キャッシュをクリア..."
npx expo start --clear > /dev/null 2>&1 &
EXPO_PID=$!
sleep 5
kill $EXPO_PID 2>/dev/null || true

# 3. Metro bundlerのキャッシュクリア
echo "🔄 Step 3: Metro bundlerキャッシュをクリア..."
rm -rf $TMPDIR/metro-* 2>/dev/null || true
rm -rf $TMPDIR/haste-map-* 2>/dev/null || true

# 4. React Native Image キャッシュのクリア
echo "🖼️ Step 4: React Native画像キャッシュをクリア..."
rm -rf ~/Library/Developer/CoreSimulator/Caches/dyld 2>/dev/null || true

# URL修正プロセスの完了を待つ
wait $URL_FIX_PID

echo "
✅ 画像表示問題の根本解決が完了しました！

次のステップ:
1. Expo Goアプリを完全に終了して再起動してください
2. npx expo start --clear でプロジェクトを起動してください
3. スワイプ画面で画像が正しく表示されることを確認してください

修正内容:
- 全ての楽天画像URLをHTTPSに変換
- サイズパラメータ(_ex=800x800)を統一
- キャッシュを完全にクリア
"
