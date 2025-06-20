# Supabase無料枠対応ガイド

## 概要

Stilyaプロジェクトは、Supabaseの無料枠内で効率的に動作するよう設計・最適化されています。このドキュメントでは、無料枠の制限事項と、それに対応するための実装方法について説明します。

## 無料枠の制限

### 現在の制限値

| リソース | 制限値 | 対応策 |
|---------|-------|-------|
| ストレージ | 1GB | 画像は外部URL参照のみ（楽天API） |
| データベース | 500MB | 最大45,000商品で運用 |
| API呼び出し | 月2M | バッチ処理とキャッシュで最適化 |
| 同時接続 | 50 | コネクションプーリング |

## 実装済みの最適化機能

### 1. データベース容量管理

#### 商品数の最適化
```javascript
// src/utils/supabaseOptimization.ts
export const DB_OPTIMIZATION = {
  MAX_PRODUCTS: 45000,        // 最大保存商品数
  ROTATION_DAYS: 7,           // 商品ローテーション期間
  OLD_PRODUCT_THRESHOLD: 14,  // 古い商品の削除しきい値
  DAILY_SYNC_LIMIT: 2000,     // 1日あたりの推奨同期商品数
};
```

#### 自動削除機能
- 14日以上更新されていない商品は自動的に非アクティブ化
- 非アクティブ商品は定期的に削除

### 2. 高画質画像の最適化

#### 画像URL最適化関数
```javascript
// 楽天APIから取得した画像URLを高画質版に変換
export const optimizeImageUrl = (url: string): string => {
  return url
    .replace(/\/128x128\//, '/')  // サムネイルを高画質に
    .replace(/\/64x64\//, '/')
    .replace(/\/pc\//, '/');
};
```

#### 画像キャッシュ
```javascript
// src/components/common/CachedImage.tsx
<Image
  source={source}
  cachePolicy="memory-disk"  // メモリとディスクの両方にキャッシュ
  priority="normal"
/>
```

### 3. API呼び出しの最適化

#### バッチ処理
```javascript
export const API_OPTIMIZATION = {
  FETCH_BATCH_SIZE: 50,      // バッチ取得サイズ
  API_CALL_INTERVAL: 100,    // API呼び出し間隔（ミリ秒）
  MONTHLY_CALL_LIMIT: 1800000, // 月間上限の90%
};
```

## モニタリング機能

### 使用状況の確認

```bash
# Supabase無料枠モニタリングスクリプトの実行
node scripts/monitoring/supabase-free-tier-monitor.js
```

#### 出力例
```
🔍 Supabase無料枠モニタリングレポート
==================================================

📦 商品統計:
  総商品数: 35,000件
  アクティブ: 33,000件
  非アクティブ: 2,000件

💾 データベース使用量:
  推定使用量: 342.77 MB
  使用率: 68.6%
  残り容量: 157.23 MB
  追加可能商品数: 約16,099件

💡 最適化提案:
⚡ データベース容量が60%を超えています
   - 古い商品の定期削除を実施
   - 優先度の低いブランドの商品数を制限
   - 1日の同期数を1000件以下に制限
```

### GitHub Actionsでの自動モニタリング

`.github/workflows/unified-product-sync.yml`で日次実行：
- 容量が80%を超えると警告
- 90%を超えるとエラーで停止

## 最適化戦略

### 容量別の推奨戦略

#### 🟢 安全（〜60%）
- 2000商品/日の同期が可能
- 新規ブランドの追加OK
- 全機能を有効化

#### 🟡 警告（60-80%）
- 1000商品/日に制限
- 古い商品の削除を併用
- 優先度の高いブランドのみ

#### 🔴 危険（80%〜）
- 500商品/日に制限
- 即座に古い商品を削除
- 新規同期を一時停止

## トラブルシューティング

### よくある問題と対処法

#### 1. 容量オーバー
```bash
# 古い商品を削除
node scripts/maintenance/cleanup-old-products.js

# 非アクティブ商品を完全削除
node scripts/maintenance/cleanup-non-mvp-products.js
```

#### 2. API制限到達
- バッチサイズを小さくする
- 同期頻度を減らす
- キャッシュ期間を延長

#### 3. 画像読み込みが遅い
- CDNを活用（楽天APIのCDN利用）
- 画像の事前読み込み（プリフェッチ）
- サムネイルと高画質の使い分け

## ベストプラクティス

### 1. 定期的なモニタリング
- 週1回は使用状況を確認
- GitHub Actionsのレポートを確認
- 異常時はSlack通知（設定可能）

### 2. 商品データの管理
- 優先度の高いブランドを重視
- 季節に応じた商品の入れ替え
- ユーザーの興味に基づく最適化

### 3. パフォーマンスの維持
- 不要なAPI呼び出しを避ける
- バッチ処理の活用
- 効率的なクエリの作成

## 将来の拡張計画

### 有料プランへの移行タイミング
- 商品数が40,000を超えた時点
- 月間アクティブユーザーが1,000人を超えた時点
- API呼び出しが月150万回を超えた時点

### 移行時の注意点
- データのバックアップ
- 段階的な移行計画
- ダウンタイムの最小化

## 関連ドキュメント

- [データベース初期化ガイド](./DATABASE_INITIALIZATION_GUIDE.md)
- [商品同期ガイド](./PRODUCT_SYNC_GUIDE.md)
- [パフォーマンス最適化ガイド](./PERFORMANCE_OPTIMIZATION.md)
