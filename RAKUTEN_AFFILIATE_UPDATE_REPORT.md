# 楽天アフィリエイトURL更新レポート

## 📊 現在の状況

### 確認結果
- **楽天商品数**: 21,848件
- **アフィリエイトID付き商品**: 21,843件
- **現在のアフィリエイトID**: `wsc_i_is_1070253780037975195`（APIデフォルト）
- **正しいアフィリエイトID**: `3ad7bc23.8866b306.3ad7bc24.393c3977`（あなたの楽天アカウントに紐付き）

## 🔧 実施した対策

### 1. 同期スクリプトの修正 ✅
`scripts/sync/sync-rakuten-products.js` を修正し、環境変数から正しいアフィリエイトIDを読み込むようにしました。

```javascript
// 修正前
const rakutenAppId = process.env.RAKUTEN_APP_ID;
const rakutenAffiliateId = process.env.RAKUTEN_AFFILIATE_ID;

// 修正後
const rakutenAppId = process.env.EXPO_PUBLIC_RAKUTEN_APP_ID || process.env.RAKUTEN_APP_ID;
const rakutenAffiliateId = process.env.EXPO_PUBLIC_RAKUTEN_AFFILIATE_ID || process.env.RAKUTEN_AFFILIATE_ID;
```

### 2. 既存商品のアフィリエイトURL更新スクリプト作成 ✅
`scripts/fix-rakuten-affiliate-urls.js` を作成しましたが、RLSポリシーにより更新が制限されています。

## ⚠️ 既存商品の更新について

### 問題
- `external_products`テーブルはRLS（Row Level Security）により保護されています
- 更新には`service_role`キーが必要です
- 通常の`anon`キーでは更新できません

### 解決策

#### オプション1: Supabase管理画面から更新
1. [Supabase Dashboard](https://app.supabase.com) にログイン
2. SQL Editorを開く
3. 以下のSQLを実行：

```sql
-- 楽天商品のアフィリエイトURLを更新
UPDATE external_products
SET affiliate_url = 
  CASE 
    WHEN affiliate_url LIKE '%rafcid=%' THEN
      regexp_replace(affiliate_url, 'rafcid=[^&]*', 'rafcid=3ad7bc23.8866b306.3ad7bc24.393c3977')
    ELSE
      affiliate_url || '&rafcid=3ad7bc23.8866b306.3ad7bc24.393c3977'
  END
WHERE source = 'rakuten' 
  AND affiliate_url IS NOT NULL
  AND affiliate_url != '';
```

#### オプション2: Service Roleキーを使用
環境変数に`SUPABASE_SERVICE_KEY`を設定して、作成済みのスクリプトを実行：

```bash
# .envファイルに追加
SUPABASE_SERVICE_KEY=your_service_key_here

# スクリプトを修正して実行
node scripts/fix-rakuten-affiliate-urls.js
```

## ✅ 今後の商品同期について

今後新しく同期される商品には、自動的に正しいアフィリエイトID（`3ad7bc23.8866b306.3ad7bc24.393c3977`）が設定されます。

## 📝 確認方法

以下のSQLで、アフィリエイトIDが正しく設定されているか確認できます：

```sql
-- アフィリエイトIDの確認
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN affiliate_url LIKE '%3ad7bc23.8866b306.3ad7bc24.393c3977%' THEN 1 END) as correct_id_count
FROM external_products
WHERE source = 'rakuten';
```

## 🎯 アクションアイテム

1. **既存商品の更新**
   - Supabase管理画面からSQLを実行するか
   - Service Roleキーを使用してスクリプトを実行

2. **新規商品の同期**
   - 修正済みのスクリプトで自動的に正しいIDが設定されます

3. **収益の確認**
   - 楽天アフィリエイト管理画面で収益が正しく計上されるか確認

## 📌 重要事項

- アフィリエイトIDは楽天アフィリエイトの収益に直接影響します
- 正しいIDが設定されていないと、クリックしても収益が発生しません
- 定期的にアフィリエイトIDの設定を確認することをお勧めします
