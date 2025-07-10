# バリューコマースAPI実装ガイド

## 概要
このドキュメントは、StilyaプロジェクトにバリューコマースAPIを統合するための実装ガイドです。現在は実装準備のみ完了しており、実際の使用は無効化されています。

## 実装状況

### ✅ 完了済み
1. **環境変数の準備** (.env)
   - `VALUECOMMERCE_TOKEN`: APIトークン（未設定）
   - `VALUECOMMERCE_ENABLED`: 有効/無効フラグ（false）

2. **商品同期スクリプト**
   - `/scripts/sync/sync-valuecommerce-products.js`
   - `/scripts/sync/enhanced-tag-extractor.js`

3. **TypeScript型定義**
   - `Product`型にadTagとmetadataプロパティを追加

4. **ProductServiceの対応**
   - `normalizeProduct`関数でバリューコマース商品のメタデータを処理

5. **ProductCardコンポーネント**
   - adTag処理の準備（コメントアウト状態）

6. **統合バッチスクリプト**
   - `/scripts/sync/sync-all-products.js`

### 🔧 今後必要な作業

1. **Supabaseテーブルの更新**
   ```sql
   -- external_productsテーブルにmetadataカラムを追加
   ALTER TABLE external_products 
   ADD COLUMN metadata JSONB DEFAULT '{}';
   ```

2. **環境変数の設定**
   ```bash
   # .envファイルを更新
   VALUECOMMERCE_TOKEN=your_actual_token_here
   VALUECOMMERCE_ENABLED=true
   ```

3. **React Native向けadTag実装**
   - WebViewコンポーネントを使用
   - またはHTTP requestでトラッキング実装

## 使用方法

### 1. 環境変数を設定
```bash
# .envファイル
VALUECOMMERCE_TOKEN=your_token_here
VALUECOMMERCE_ENABLED=true
```

### 2. 商品データを同期
```bash
# 全商品同期（楽天 + バリューコマース）
node scripts/sync/sync-all-products.js

# バリューコマースのみ
node scripts/sync/sync-valuecommerce-products.js
```

### 3. アプリでの表示
現在の実装では、バリューコマース商品も楽天商品と同様に表示されます。adTagの実行は準備のみで、実際には動作しません。

## バリューコマースAPIの特徴

### 必須要件
- **adタグの表示**: 商品表示時に必ずadタグ（pvImg）を実行する必要があります
- **トークン管理**: APIトークンは広告スペースごとに異なります

### データ構造
```javascript
{
  id: "vc_商品ID",
  title: "商品名",
  brand: "ショップ名",
  price: 価格,
  imageUrl: "画像URL",
  affiliateUrl: "アフィリエイトリンク",
  source: "valuecommerce",
  metadata: {
    ad_tag: "adタグのHTML",
    merchant_id: "マーチャントID",
    original_id: "元の商品ID"
  }
}
```

## セキュリティ上の注意
- APIトークンは必ず環境変数で管理してください
- トークンをソースコードにハードコーディングしないでください
- プロダクション環境では適切なアクセス制限を設定してください

## トラブルシューティング

### Q: 商品が同期されない
A: 以下を確認してください：
1. `VALUECOMMERCE_ENABLED=true`が設定されているか
2. `VALUECOMMERCE_TOKEN`が正しく設定されているか
3. APIの利用制限に達していないか

### Q: adタグが実行されない
A: 現在の実装では、adタグの実行は準備のみです。実際の実行にはWebViewまたはHTTP requestの実装が必要です。

## 今後の拡張計画
1. React Native向けadTag実行機能の実装
2. 商品カテゴリマッピングの改善
3. リアルタイム在庫連携
4. 詳細な分析レポート機能

## 関連ドキュメント
- [バリューコマース公式APIドキュメント](https://pub-docs.valuecommerce.ne.jp/)
- [Stilya開発ドキュメント](../README.md)
