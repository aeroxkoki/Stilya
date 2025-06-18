# click_logs アフィリエイトトラッキング実装ガイド

## 概要

Stilyaアプリケーションにおいて、商品の閲覧（view）とクリック（click）アクションを記録し、アフィリエイト収益の最適化を図るためのトラッキングシステムを実装しました。

## データベース構造

### click_logsテーブル
```sql
CREATE TABLE click_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('view', 'click', 'purchase')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### アクションタイプ
- **view**: 商品詳細画面の表示
- **click**: 購入ボタンのクリック（外部ECサイトへの遷移）
- **purchase**: 購入完了（将来実装予定）

## 実装ファイル

### 1. 型定義 (`src/types/index.ts`)
```typescript
export interface ClickLog {
  id?: string;
  userId: string;
  productId: string;
  action: 'view' | 'click' | 'purchase';
  createdAt?: string;
}
```

### 2. サービス層

#### `src/services/clickService.ts`
- **recordAction()**: 汎用的なアクション記録メソッド
- **recordView()**: 商品表示の記録
- **recordClick()**: クリックの記録
- **recordPurchase()**: 購入の記録（将来用）
- **getActionHistory()**: アクション履歴の取得
- **getProductStats()**: 商品統計（CTR計算など）

#### `src/services/viewHistoryService.ts`
- clickServiceのラッパー関数として機能
- 既存のインターフェースとの互換性を維持

### 3. カスタムフック (`src/hooks/useRecordClick.ts`)
- click_logsテーブルへの記録とアナリティクスサービスへの送信を統合
- エラーハンドリングとローディング状態の管理

### 4. 画面実装 (`src/screens/detail/ProductDetailScreen.tsx`)
- 商品詳細画面表示時に`recordView()`を呼び出し
- 購入ボタンクリック時に`recordClick()`を呼び出し
- 重複した記録を避けるための統一的な実装

## 使用方法

### 商品表示時のトラッキング
```typescript
// 商品詳細画面の表示時
if (user && productData.id) {
  recordProductView(user.id, productData.id)
    .catch(err => console.error('Failed to record view:', err));
}
```

### クリック時のトラッキング
```typescript
// 購入ボタンクリック時
const { recordProductClick } = useRecordClick(user?.id);
await recordProductClick(product.id, product);
```

### 統計情報の取得
```typescript
// 商品のクリック統計を取得
const stats = await getProductStats(productId);
console.log(`CTR: ${stats.ctr}%`);
```

## テスト方法

テストスクリプトを実行して実装を確認：
```bash
node scripts/testing/test-click-logs-implementation.js
```

## 分析可能な指標

1. **商品別CTR（Click Through Rate）**
   - 表示回数に対するクリック率

2. **ユーザー行動分析**
   - 閲覧履歴
   - クリック履歴
   - 興味のあるカテゴリ

3. **時間帯別アクティビティ**
   - 閲覧・クリックが多い時間帯

4. **人気商品ランキング**
   - 最も閲覧された商品
   - 最もクリックされた商品

## 今後の拡張予定

1. **purchaseアクションの実装**
   - アフィリエイトAPIからの購入確認

2. **リアルタイムダッシュボード**
   - 管理画面でのCTR表示
   - 売上予測

3. **推薦アルゴリズムへの活用**
   - クリック率の高い商品を優先表示
   - ユーザーのクリック傾向に基づく推薦

## 注意事項

- 開発モード（`__DEV__`）では実際のデータベースへの書き込みは行われません
- RLS（Row Level Security）により、ユーザーは自分のログのみ記録可能
- パフォーマンスを考慮し、非同期でログを記録

## トラブルシューティング

### エラー: "relation \"public.view_history\" does not exist"
view_historyテーブルは存在しません。すべての閲覧・クリックログはclick_logsテーブルに統合されています。

### エラー: "null value in column \"action\" violates not-null constraint"
actionパラメータは必須です。recordView()またはrecordClick()を使用してください。

### データが記録されない
1. ユーザーがログインしているか確認
2. 開発モードではないか確認（`__DEV__`）
3. Supabaseの接続設定を確認
