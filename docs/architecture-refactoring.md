# Stilya アーキテクチャ整理計画

## 現状の問題点

1. **重複した実装**
   - `useProducts` (hooks/useProducts.ts) - 高機能版（ページング、プリフェッチ、フィルター）
   - `useProductContext` (contexts/ProductContext.tsx) - 基本版（お気に入り、スワイプ履歴管理）

2. **名前の衝突**
   - ProductContextから`useProducts`という名前のエクスポートを探そうとしているコードが存在
   - 実際には`useProductContext`という名前でエクスポートされている

## 解決策

### フェーズ1: 互換性の確保（完了）
- ProductContext.tsxに`useProducts`のエイリアスを追加
- 既存のコードを壊さずに動作を維持

### フェーズ2: 責任の明確化
各モジュールの責任を明確に分離：

1. **hooks/useProducts.ts**
   - 用途: スワイプ画面専用
   - 機能: 
     - 商品のページング取得
     - 画像プリフェッチ
     - スワイプ処理
     - フィルタリング
     - パフォーマンス最適化

2. **contexts/ProductContext.tsx**
   - 用途: グローバルな状態管理
   - 機能:
     - お気に入り管理
     - スワイプ履歴の取得・表示
     - 基本的な商品リスト管理

3. **store/productStore.ts**
   - 用途: 他の画面での商品データ管理
   - 機能:
     - 商品検索
     - カテゴリ・タグ検索
     - お気に入り管理（ProductContextと統合予定）

### フェーズ3: 段階的な移行

1. **ProductContextから`useProducts`エイリアスを使用している箇所を特定**
   ```typescript
   // Before
   import { useProducts } from '@/contexts/ProductContext';
   
   // After
   import { useProductContext } from '@/contexts/ProductContext';
   ```

2. **機能の統合**
   - お気に入り機能をProductContextに集約
   - スワイプ履歴機能をProductContextに集約
   - 商品取得・ページング機能はhooks/useProductsに集約

3. **不要なコードの削除**
   - 重複している機能を削除
   - エイリアスを削除

## 推奨される使用方法

### スワイプ画面 (SwipeScreen.tsx)
```typescript
import { useProducts } from '@/hooks/useProducts';
```

### スワイプ履歴画面 (SwipeHistoryScreen.tsx)
```typescript
import { useSwipeHistory } from '@/hooks/useSwipeHistory';
```

### お気に入り画面 (FavoritesScreen.tsx)
```typescript
import { useFavorites } from '@/hooks/useFavorites';
```

### プロフィール画面 (ProfileScreen.tsx)
```typescript
import { useProductStore } from '@/store/productStore';
```

### 商品詳細画面 (ProductDetailScreen.tsx)
```typescript
import { useProductStore } from '@/store/productStore';
```

## 実装優先順位

1. **高**: エラーの解消（完了）
2. **中**: 各画面が適切なフック/ストアを使用するように更新
3. **低**: 重複コードの削除とアーキテクチャの最適化

## メリット

- コードの責任が明確になる
- パフォーマンスが向上（各画面に最適化されたロジック）
- メンテナンスが容易になる
- 新機能の追加が簡単になる
