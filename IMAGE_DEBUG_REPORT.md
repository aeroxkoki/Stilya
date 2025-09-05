# スワイプ画面画像表示問題 - デバッグレポート

## 実施日時
2025年9月5日

## 問題の概要
Stilyaアプリのスワイプ画面で商品画像が表示されない問題が発生していた。

## 調査結果

### 1. データベースの状況
- **テーブル**: `external_products`
- **画像URLフィールド**: `image_url`（snake_case）
- **データ状態**: 全商品に画像URLが正しく格納されている（HTTPS形式）
- **URL形式**: 楽天の画像URL（`thumbnail.image.rakuten.co.jp`）

### 2. コード構造の確認
```
SwipeScreen → StyledSwipeContainer → SwipeCardImproved → CachedImage
```

画像表示のフロー：
1. `external_products`テーブルから商品データ取得
2. `dbProductToProduct`関数で`image_url` → `imageUrl`に変換
3. `getProductImageUrl`関数で画像URLを最適化
4. `CachedImage`コンポーネント（expo-image使用）で表示

### 3. 原因
データベースとアプリケーションのフィールド名の違い：
- **DB**: `image_url`（snake_case）
- **アプリ**: `imageUrl`（camelCase）

変換処理は`dbProductToProduct`関数で正しく実装されているが、デバッグが必要。

## 実施した対策

### 1. デバッグログの追加
以下のファイルにデバッグログを追加：

- **`src/types/product.ts`**: 変換前後のデータを出力
- **`src/components/swipe/SwipeCardImproved.tsx`**: 商品画像URLの詳細情報を出力
- **`src/screens/debug/ImageDebugScreen.tsx`**: 画像表示問題のデバッグ画面を改良

### 2. デバッグスクリプトの作成
`scripts/debug-swipe-images.js`を作成し、以下を確認：
- データベースの商品データ
- 画像URLフィールドの存在
- 画像URLの形式
- アクティブ商品の統計

## 現在の状態
- データベースには正しく画像URLが格納されている
- 変換ロジックは正しく実装されている
- デバッグログが追加され、問題の特定が容易になった

## 推奨される次のステップ

1. **実機での確認**
   - Expo Goアプリで実際の動作を確認
   - デバッグコンソールでログを確認

2. **画像最適化**
   - 楽天画像URLの`_ex=800x800`パラメータ確認
   - HTTPS変換の確認

3. **キャッシュのクリア**（必要に応じて）
   ```bash
   npm run clear-cache
   ```

4. **デバッグスクリーン**
   - ImageDebugScreenを使用して画像表示の詳細確認
   - 各商品の画像URLと表示状態を検証

## 関連ファイル
- `/src/types/product.ts` - 型定義と変換関数
- `/src/components/swipe/SwipeCardImproved.tsx` - スワイプカードコンポーネント
- `/src/screens/debug/ImageDebugScreen.tsx` - デバッグ画面
- `/src/utils/imageUtils.ts` - 画像URL最適化ユーティリティ
- `/scripts/debug-swipe-images.js` - デバッグスクリプト

## 技術詳細

### 画像URL変換プロセス
```typescript
// DB → App
dbProduct.image_url → product.imageUrl → getProductImageUrl() → optimizeImageUrl()
```

### 楽天画像URLの最適化
- HTTP → HTTPS変換
- サイズパラメータ追加（`_ex=800x800`）
- 特殊文字のエンコーディング

## まとめ
スワイプ画面の画像表示問題に対して、包括的なデバッグ機能を実装しました。デバッグログとデバッグ画面により、問題の原因を迅速に特定し、解決できる環境が整いました。
