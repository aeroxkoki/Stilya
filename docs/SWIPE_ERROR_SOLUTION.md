# スワイプエラーの根本的解決策

## エラーの原因

開発ビルドで発生していたスワイプエラーは、以下の原因によるものでした：

1. **モックデータのID形式**
   - モックデータのユーザーID: `guest` または `mock-174943419355-9`（UUID形式ではない）
   - SupabaseのテーブルではUUID型を期待

2. **データベース設計**
   - `swipes`テーブルの`user_id`カラム: UUID型（Supabase認証と連携）
   - `external_products`テーブルのID: TEXT型（楽天のitemCode用）

## 実施した解決策

### 1. モックデータの使用を無効化
```typescript
// src/services/mockDataService.ts
export const USE_MOCK_DATA = false; // 実データを使用
```

### 2. ProductServiceの修正
開発環境でも実データ（楽天API経由）を使用するように修正：
```typescript
// src/services/productService.ts
if (USE_MOCK_DATA) { // IS_DEVの条件を削除
  // モックデータの使用
}
```

### 3. 未認証ユーザーへの対応
```typescript
// src/screens/swipe/SwipeScreen.tsx
userId: user?.id || '', // 'guest'ではなく空文字列を使用

// src/services/swipeService.ts
if (!userId || userId === '') {
  console.warn('Cannot save swipe result without valid user ID');
  return false;
}
```

## テストユーザーの使用

開発ビルドでテストする際は、以下のテストユーザーでログインしてください：

- **メール**: test@stilya.com
- **パスワード**: test123456

```bash
# テストユーザーの作成（既に作成済み）
node scripts/create-test-user.js
```

## データの準備状況

- ✅ Supabaseの`external_products`テーブルに540件の楽天商品データが保存済み
- ✅ 商品データは実際の楽天APIから取得したもの
- ✅ 各商品にはタグ、カテゴリ、価格などの情報が含まれている

## 今後の開発方針

1. **開発環境でも実データを使用**
   - モックデータは使用しない
   - 楽天APIから取得した実データで開発・テスト

2. **認証必須の機能**
   - スワイプ結果の保存は認証済みユーザーのみ
   - 未認証ユーザーは閲覧のみ可能

3. **エラーハンドリング**
   - ユーザーIDが不正な場合は保存をスキップ
   - UIは停止せず継続して動作

## 確認コマンド

```bash
# 商品データの確認
node scripts/check-external-products.js

# 楽天APIから追加データを取得
node scripts/sync-rakuten-products.js

# データベースの状態確認
npm run check:db
```

## 結論

モックデータを使用せず、実際の楽天APIデータとSupabase認証を使用することで、UUID型の不整合エラーを根本的に解決しました。開発ビルドでは必ずテストユーザーでログインしてテストを行ってください。
