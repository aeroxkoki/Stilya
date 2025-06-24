# Stilya コード整合性チェックレポート

## 現在のアーキテクチャ構成

### 1. フック（Hooks）
- **useProducts** (`/hooks/useProducts.ts`)
  - 用途: スワイプ画面専用
  - 機能: 商品ページング、プリフェッチ、フィルタリング、スワイプ処理
  - 使用箇所: SwipeScreen.tsx

- **useSwipeHistory** (`/hooks/useSwipeHistory.ts`)
  - 用途: スワイプ履歴管理
  - 機能: スワイプ履歴の取得、フィルタリング
  - 使用箇所: SwipeHistoryScreen.tsx

- **useFavorites** (`/hooks/useFavorites.ts`)
  - 用途: お気に入り管理
  - 機能: お気に入りの追加/削除、状態管理
  - 使用箇所: SwipeHistoryScreen.tsx, FavoritesScreen.tsx

### 2. コンテキスト（Contexts）
- **ProductContext** (`/contexts/ProductContext.tsx`)
  - エクスポート: `useProductContext`, `useProducts` (エイリアス)
  - 機能: グローバルな商品状態管理、お気に入り、スワイプ履歴
  - 使用箇所: 現在は未使用（移行中）

### 3. ストア（Stores）
- **productStore** (`/store/productStore.ts`)
  - 用途: 商品データの管理
  - 機能: 商品検索、カテゴリ検索、お気に入り管理
  - 使用箇所: ProfileScreen.tsx, FavoritesScreen.tsx, ProductDetailScreen.tsx

## 整合性の状態

### ✅ 整合性が取れている部分
1. **SwipeScreen.tsx**
   - `hooks/useProducts` を正しく使用
   - スワイプ機能が独立して動作

2. **SwipeHistoryScreen.tsx**
   - `hooks/useSwipeHistory` と `hooks/useFavorites` を使用
   - ProductContextから独立

3. **FavoritesScreen.tsx**
   - `store/productStore` を使用
   - お気に入り機能が動作

4. **favoriteService.ts**
   - `toggleFavorite` 関数が存在
   - `useFavorites` フックで正しく使用

### ⚠️ 修正が必要な部分
1. **useFavorites.ts**
   - ✅ 修正済み: `toggleFavorite` を使用するように更新

### 📝 推奨事項
1. **ProductContext**
   - 現在は使用されていないが、エイリアスで互換性を維持
   - 将来的に削除または役割を明確化

2. **お気に入り機能の統一**
   - `productStore` と `useFavorites` の両方でお気に入り管理
   - 将来的に一本化を検討

3. **スワイプ履歴の統一**
   - `ProductContext` と `useSwipeHistory` の両方でスワイプ履歴管理
   - 将来的に一本化を検討

## 結論
現在のコードは基本的に整合性が取れており、各画面が適切なフック/ストアを使用しています。ProductContextのエイリアスにより、互換性も維持されています。
