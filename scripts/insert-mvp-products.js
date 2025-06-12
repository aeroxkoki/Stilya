#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// 環境変数の読み込み
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// UUIDを生成する関数
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// MVPテスト用のUNIQLOとGU商品データ
const mvpProducts = [
  // UNIQLO商品 - 定番アイテム
  {
    title: 'エアリズムメッシュTシャツ',
    brand: 'uniqlo',
    price: 1990,
    image_url: 'https://placehold.co/400x600/f0f0f0/333333?text=UNIQLO+Airism',
    category: 'トップス',
    tags: ['メンズ', 'Tシャツ', 'エアリズム', '通気性', 'ベーシック', '夏'],
    description: '通気性に優れたメッシュ素材のTシャツ。暑い季節も快適に過ごせます。',
    affiliate_url: 'https://example.com/uniqlo/airism-tee',
    source: 'manual',
    priority: 1,
    is_active: true
  },
  {
    title: 'ウルトラストレッチジーンズ',
    brand: 'uniqlo',
    price: 3990,
    image_url: 'https://placehold.co/400x600/4169e1/ffffff?text=UNIQLO+Jeans',
    category: 'ボトムス',
    tags: ['メンズ', 'ジーンズ', 'ストレッチ', 'デニム', 'ベーシック'],
    description: '驚くほど伸びるストレッチジーンズ。動きやすく快適な履き心地。',
    affiliate_url: 'https://example.com/uniqlo/stretch-jeans',
    source: 'manual',
    priority: 1,
    is_active: true
  },
  {
    title: 'ヒートテックインナー',
    brand: 'uniqlo',
    price: 1500,
    image_url: 'https://placehold.co/400x600/dc143c/ffffff?text=UNIQLO+Heattech',
    category: 'インナー',
    tags: ['ユニセックス', 'インナー', 'ヒートテック', '保温', '冬'],
    description: '薄くて暖かいヒートテック。寒い季節の必需品。',
    affiliate_url: 'https://example.com/uniqlo/heattech',
    source: 'manual',
    priority: 1,
    is_active: true
  },
  {
    title: 'フリースジャケット',
    brand: 'uniqlo',
    price: 2990,
    image_url: 'https://placehold.co/400x600/228b22/ffffff?text=UNIQLO+Fleece',
    category: 'アウター',
    tags: ['ユニセックス', 'フリース', 'ジャケット', '防寒', 'カジュアル'],
    description: '軽くて暖かいフリースジャケット。',
    affiliate_url: 'https://example.com/uniqlo/fleece',
    source: 'manual',
    priority: 1,
    is_active: true
  },
  {
    title: 'スマートアンクルパンツ',
    brand: 'uniqlo',
    price: 3990,
    image_url: 'https://placehold.co/400x600/696969/ffffff?text=UNIQLO+Smart',
    category: 'ボトムス',
    tags: ['メンズ', 'パンツ', 'ビジネス', 'スマートカジュアル', 'ストレッチ'],
    description: 'ビジネスにもカジュアルにも使えるスマートパンツ。',
    affiliate_url: 'https://example.com/uniqlo/smart-pants',
    source: 'manual',
    priority: 1,
    is_active: true
  },
  {
    title: 'オーバーサイズTシャツ',
    brand: 'uniqlo',
    price: 1500,
    image_url: 'https://placehold.co/400x600/ffffff/333333?text=UNIQLO+Oversized',
    category: 'トップス',
    tags: ['レディース', 'Tシャツ', 'オーバーサイズ', 'トレンド', 'カジュアル'],
    description: 'トレンドのオーバーサイズシルエット。',
    affiliate_url: 'https://example.com/uniqlo/oversized-tee',
    source: 'manual',
    priority: 1,
    is_active: true
  },
  {
    title: 'リブハイネックT',
    brand: 'uniqlo',
    price: 1990,
    image_url: 'https://placehold.co/400x600/ffd700/333333?text=UNIQLO+HighNeck',
    category: 'トップス',
    tags: ['レディース', 'ハイネック', 'リブ', 'ベーシック', '秋冬'],
    description: 'シンプルで使いやすいリブハイネック。',
    affiliate_url: 'https://example.com/uniqlo/highneck',
    source: 'manual',
    priority: 1,
    is_active: true
  },

  // GU商品 - トレンドアイテム
  {
    title: 'ヘビーウェイトビッグT',
    brand: 'gu',
    price: 990,
    image_url: 'https://placehold.co/400x600/000000/ffffff?text=GU+BigT',
    category: 'トップス',
    tags: ['ユニセックス', 'Tシャツ', 'ビッグシルエット', 'ヘビーウェイト', 'トレンド'],
    description: 'しっかりとした生地感のビッグTシャツ。',
    affiliate_url: 'https://example.com/gu/big-tee',
    source: 'manual',
    priority: 1,
    is_active: true
  },
  {
    title: 'ワイドカーゴパンツ',
    brand: 'gu',
    price: 2490,
    image_url: 'https://placehold.co/400x600/8b4513/ffffff?text=GU+Cargo',
    category: 'ボトムス',
    tags: ['メンズ', 'カーゴパンツ', 'ワイド', 'ストリート', 'トレンド'],
    description: 'トレンドのワイドシルエットカーゴパンツ。',
    affiliate_url: 'https://example.com/gu/cargo-pants',
    source: 'manual',
    priority: 1,
    is_active: true
  },
  {
    title: 'スウェットパーカー',
    brand: 'gu',
    price: 1990,
    image_url: 'https://placehold.co/400x600/808080/ffffff?text=GU+Hoodie',
    category: 'トップス',
    tags: ['ユニセックス', 'パーカー', 'スウェット', 'カジュアル', 'ベーシック'],
    description: '着回ししやすいベーシックなパーカー。',
    affiliate_url: 'https://example.com/gu/hoodie',
    source: 'manual',
    priority: 1,
    is_active: true
  },
  {
    title: 'デニムジャケット',
    brand: 'gu',
    price: 2990,
    image_url: 'https://placehold.co/400x600/4682b4/ffffff?text=GU+Denim',
    category: 'アウター',
    tags: ['レディース', 'デニムジャケット', 'ジージャン', 'カジュアル', '春秋'],
    description: 'コーデのアクセントになるデニムジャケット。',
    affiliate_url: 'https://example.com/gu/denim-jacket',
    source: 'manual',
    priority: 1,
    is_active: true
  },
  {
    title: 'プリーツスカート',
    brand: 'gu',
    price: 1990,
    image_url: 'https://placehold.co/400x600/ffc0cb/333333?text=GU+Skirt',
    category: 'ボトムス',
    tags: ['レディース', 'スカート', 'プリーツ', 'フェミニン', 'きれいめ'],
    description: '上品なプリーツスカート。',
    affiliate_url: 'https://example.com/gu/pleats-skirt',
    source: 'manual',
    priority: 1,
    is_active: true
  },
  {
    title: 'シェフパンツ',
    brand: 'gu',
    price: 1990,
    image_url: 'https://placehold.co/400x600/2f4f4f/ffffff?text=GU+Chef',
    category: 'ボトムス',
    tags: ['メンズ', 'シェフパンツ', 'イージーパンツ', 'リラックス', 'トレンド'],
    description: '楽な履き心地のシェフパンツ。',
    affiliate_url: 'https://example.com/gu/chef-pants',
    source: 'manual',
    priority: 1,
    is_active: true
  },
  {
    title: 'マウンテンパーカー',
    brand: 'gu',
    price: 3990,
    image_url: 'https://placehold.co/400x600/556b2f/ffffff?text=GU+Mountain',
    category: 'アウター',
    tags: ['ユニセックス', 'マウンテンパーカー', 'アウトドア', '防風', '機能性'],
    description: '機能的でスタイリッシュなマウンテンパーカー。',
    affiliate_url: 'https://example.com/gu/mountain-parka',
    source: 'manual',
    priority: 1,
    is_active: true
  },
  {
    title: 'ニットベスト',
    brand: 'gu',
    price: 1490,
    image_url: 'https://placehold.co/400x600/d2691e/ffffff?text=GU+Vest',
    category: 'トップス',
    tags: ['レディース', 'ニット', 'ベスト', 'レイヤード', '秋冬'],
    description: 'レイヤードスタイルに最適なニットベスト。',
    affiliate_url: 'https://example.com/gu/knit-vest',
    source: 'manual',
    priority: 1,
    is_active: true
  }
];

async function insertMVPProducts() {
  console.log('\n🚀 MVP用UNIQLO/GU商品データの追加を開始します...\n');

  try {
    let insertedCount = 0;
    let updatedCount = 0;

    for (const product of mvpProducts) {
      // 既存の商品チェック
      const { data: existing } = await supabase
        .from('external_products')
        .select('id')
        .eq('title', product.title)
        .eq('brand', product.brand)
        .single();

      if (existing) {
        // 既存商品を更新
        const { error } = await supabase
          .from('external_products')
          .update({
            ...product,
            last_synced: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (!error) {
          updatedCount++;
          console.log(`✅ 更新: ${product.title}`);
        } else {
          console.error(`❌ 更新エラー: ${product.title}`, error.message);
        }
      } else {
        // 新規商品を追加
        const { error } = await supabase
          .from('external_products')
          .insert({
            id: generateUUID(),
            ...product,
            last_synced: new Date().toISOString()
          });

        if (!error) {
          insertedCount++;
          console.log(`✅ 追加: ${product.title}`);
        } else {
          console.error(`❌ 追加エラー: ${product.title}`, error.message);
        }
      }
    }

    console.log('\n📊 処理結果:');
    console.log(`  新規追加: ${insertedCount}件`);
    console.log(`  更新: ${updatedCount}件`);

    // 最新の状況を確認
    const { data: brandCounts } = await supabase
      .from('external_products')
      .select('brand')
      .eq('is_active', true);

    if (brandCounts) {
      const counts = brandCounts.reduce((acc, item) => {
        acc[item.brand] = (acc[item.brand] || 0) + 1;
        return acc;
      }, {});

      console.log('\n📈 ブランド別商品数（更新後）:');
      ['uniqlo', 'gu', 'coca', 'pierrot', 'urban_research'].forEach(brand => {
        console.log(`  ${brand}: ${counts[brand] || 0}件`);
      });
    }

    console.log('\n✨ 処理完了！');

  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

insertMVPProducts();
