# Supabase推薦システムv2 マイグレーション実行ガイド

## 概要
このガイドでは、推薦システムv2のデータベースマイグレーションを実行する手順を説明します。

## マイグレーションファイル

### 1. `20250708_recommendation_system_v2.sql`
推薦システムv2の主要なテーブルとインデックスを作成します。

**新規テーブル:**
- `product_features` - 商品の画像特徴量を保存
- `user_preference_analysis` - ユーザーの詳細な好み分析
- `user_session_learning` - セッションベースの学習データ
- `recommendation_effectiveness` - 推薦効果測定
- `ab_test_assignments` - A/Bテスト管理
- `swipe_pattern_analysis` - スワイプパターン分析
- `mv_product_popularity` - 人気商品のマテリアライズドビュー

**拡張カラム:**
- `external_products`テーブルに以下を追加:
  - `features_extracted`
  - `style_tags`
  - `color_tags`
  - `season_tags`
  - `quality_score`
  - `popularity_score`

### 2. `20250709_performance_indexes.sql`
パフォーマンス最適化のためのインデックスを作成します。

**インデックス:**
- `idx_swipes_user_result_created` - スワイプの複合インデックス
- `idx_external_products_active_created` - アクティブ商品のインデックス
- `idx_external_products_tags_active` - タグのGINインデックス
- `idx_user_preference_analysis_updated` - ユーザー分析の更新インデックス
- `idx_recommendation_effectiveness_created` - 効果測定のインデックス

## 実行手順

### 方法1: Supabase CLI（推奨）

```bash
# プロジェクトディレクトリに移動
cd /Users/koki_air/Documents/GitHub/Stilya

# Supabaseプロジェクトを初期化（まだの場合）
supabase init

# プロジェクトをリンク
supabase link --project-ref ddypgpljprljqrblpuli

# マイグレーションの状態を確認
supabase migration list

# マイグレーションを実行
supabase db push

# RLSポリシーをチェック
supabase db lint
```

### 方法2: Supabaseダッシュボード

1. [Supabaseダッシュボード](https://supabase.com/dashboard/project/ddypgpljprljqrblpuli)にアクセス

2. SQL Editorに移動

3. 以下の順番でマイグレーションファイルを実行:
   - `supabase/migrations/20250708_recommendation_system_v2.sql`
   - `supabase/migrations/20250709_performance_indexes.sql`

4. 実行結果を確認

### 方法3: プログラムによる実行

```javascript
// scripts/database/run-migrations.js
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // サービスキーが必要
);

async function runMigrations() {
  const migrations = [
    '20250708_recommendation_system_v2.sql',
    '20250709_performance_indexes.sql'
  ];

  for (const migration of migrations) {
    console.log(`実行中: ${migration}`);
    
    try {
      const sql = await fs.readFile(
        path.join(__dirname, '../../supabase/migrations', migration),
        'utf8'
      );
      
      const { error } = await supabase.rpc('exec_sql', { sql });
      
      if (error) {
        console.error(`エラー (${migration}):`, error);
      } else {
        console.log(`成功: ${migration}`);
      }
    } catch (err) {
      console.error(`ファイル読み込みエラー (${migration}):`, err);
    }
  }
}

runMigrations();
```

## マイグレーション後の確認

### 1. テーブルの存在確認

```sql
-- 新規テーブルの確認
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'product_features',
  'user_preference_analysis',
  'user_session_learning',
  'recommendation_effectiveness',
  'ab_test_assignments',
  'swipe_pattern_analysis'
);

-- カラムの追加確認
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'external_products' 
AND column_name IN (
  'features_extracted',
  'style_tags',
  'color_tags',
  'season_tags',
  'quality_score',
  'popularity_score'
);
```

### 2. インデックスの確認

```sql
-- インデックスの存在確認
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public'
AND indexname IN (
  'idx_swipes_user_result_created',
  'idx_external_products_active_created',
  'idx_external_products_tags_active',
  'idx_user_preference_analysis_updated',
  'idx_recommendation_effectiveness_created'
);
```

### 3. RLSポリシーの確認

```sql
-- RLSポリシーの確認
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN (
  'user_preference_analysis',
  'user_session_learning',
  'recommendation_effectiveness',
  'ab_test_assignments',
  'swipe_pattern_analysis'
);
```

## トラブルシューティング

### エラー: テーブルが既に存在する
- `IF NOT EXISTS`句が含まれているため、通常は問題ありません
- 必要に応じて、既存のテーブルをバックアップしてから再実行

### エラー: 権限不足
- サービスロールキーを使用してマイグレーションを実行
- Supabaseダッシュボードから直接実行

### エラー: マテリアライズドビューの作成失敗
- 一時的にマテリアライズドビューの作成をスキップ
- 後で手動で作成

## 注意事項

1. **本番環境での実行前に必ずバックアップを取得**
2. **段階的にマイグレーションを実行し、各ステップで確認**
3. **RLSポリシーが正しく設定されていることを確認**
4. **アプリケーションが新しいテーブル構造に対応していることを確認**

## 実行後のテスト

1. アプリケーションから新機能が正常に動作することを確認
2. 推薦システムが正しくデータを記録していることを確認
3. パフォーマンスが改善されていることを確認

## サポート

問題が発生した場合は、以下を確認してください：
- Supabaseのログ
- アプリケーションのエラーログ
- データベースの状態
