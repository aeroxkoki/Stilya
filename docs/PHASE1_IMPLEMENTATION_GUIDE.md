# Phase 1 改良 - 安全な実装ガイド

## 概要
このガイドは、既存のStilyaプロジェクトにPhase 1の改良（セール情報表示、保存機能、レビュー評価）を安全に実装するための手順書です。

## 実装済み内容

### 1. 型定義の拡張
- `src/types/product.ts` に新しいフィールドを追加（後方互換性を保つためすべてオプショナル）
  - `originalPrice`: 元の価格（セール前）
  - `discountPercentage`: 割引率
  - `isSale`: セール中フラグ
  - `rating`: レビュー評価
  - `reviewCount`: レビュー数

### 2. 新規作成ファイル
- `src/services/savedItemsService.ts`: 保存機能のサービス
- `src/components/swipe/SwipeCardEnhanced.tsx`: 改良版SwipeCard
- `scripts/phase1-database-update.sql`: データベース更新スクリプト
- `scripts/update-phase1-database.sh`: DB更新実行スクリプト

## 安全な移行手順

### Step 1: データベースの更新
```bash
# データベースのバックアップ（推奨）
supabase db dump > backup-$(date +%Y%m%d-%H%M%S).sql

# Phase 1用のデータベース更新を実行
cd /Users/koki_air/Documents/GitHub/Stilya
./scripts/update-phase1-database.sh
```

### Step 2: 段階的なコンポーネント移行

#### 2.1 最初のテスト（新旧コンポーネントの共存）
SwipeContainerで条件付きで新しいコンポーネントを使用:

```typescript
// src/components/swipe/SwipeContainer.tsx の先頭に追加
import SwipeCardEnhanced from './SwipeCardEnhanced';

// DEV_MODEフラグで切り替え
const CardComponent = __DEV__ ? SwipeCardEnhanced : SwipeCard;
```

#### 2.2 開発環境でのテスト
```bash
# 開発ビルドでテスト
npm run ios
# または
npm run android
```

#### 2.3 問題がなければ本番移行
SwipeContainerを更新して、SwipeCardEnhancedを完全に使用:

```typescript
// SwipeContainerでSwipeCardをSwipeCardEnhancedに置き換え
import SwipeCardEnhanced from './SwipeCardEnhanced';

// SwipeCardの代わりにSwipeCardEnhancedを使用
<SwipeCardEnhanced
  product={currentProduct}
  onPress={handleCardPress}
  onLongPress={handleCardLongPress}
  onSwipeLeft={handleNoButtonPress}
  onSwipeRight={handleYesButtonPress}
  onSave={handleSaveAction} // 新しいプロップ
/>
```

### Step 3: 楽天APIのセール情報取得（オプション）

楽天APIからセール情報を取得するには、商品同期スクリプトを更新:

```javascript
// scripts/sync-rakuten-products.js に追加
const processedProducts = products.map(item => ({
  // 既存のフィールド...
  
  // セール情報の追加（楽天の場合）
  originalPrice: item.itemPrice, // 通常価格
  price: item.pointRate > 1 ? 
    Math.floor(item.itemPrice * 0.9) : // ポイント還元がある場合は仮の割引価格
    item.itemPrice,
  isSale: item.pointRate > 1,
  discountPercentage: item.pointRate > 1 ? 10 : 0,
  
  // レビュー情報（楽天APIで利用可能な場合）
  rating: item.reviewAverage || null,
  reviewCount: item.reviewCount || 0,
}));
```

### Step 4: テストとデバッグ

#### 4.1 機能テスト
- [ ] スワイプ機能が正常に動作する
- [ ] 保存ボタンが表示される
- [ ] 保存/保存解除が正しく動作する
- [ ] セールバッジが正しく表示される
- [ ] レビュー評価が表示される（データがある場合）

#### 4.2 エラーチェック
```bash
# コンソールでエラーを確認
npm run ios
# Metro bundlerのログを確認
```

### Step 5: 段階的なロールバック手順

問題が発生した場合:

1. **SwipeCardに戻す**
   ```typescript
   // SwipeContainer.tsxで
   import SwipeCard from './SwipeCard'; // 元に戻す
   ```

2. **データベースの変更は残す**
   - 新しいテーブルとカラムは既存機能に影響しない
   - 削除する必要はない

## トラブルシューティング

### よくある問題と解決方法

1. **保存ボタンが動作しない**
   - ユーザーがログインしているか確認
   - saved_itemsテーブルが作成されているか確認
   - RLSポリシーが正しく設定されているか確認

2. **セール情報が表示されない**
   - 商品データにoriginalPriceが設定されているか確認
   - トリガーが正しく動作しているか確認

3. **TypeScriptエラー**
   - 型定義が正しく更新されているか確認
   - `npm run types:check` でエラーを確認

## 成功指標

- エラーなしでアプリが起動する
- 既存のスワイプ機能が維持される
- 新しい保存機能が動作する
- パフォーマンスの劣化がない

## 次のステップ

Phase 1が成功したら:
1. ホーム画面の改善（セール通知）
2. 保存リスト画面の実装
3. より高度なレコメンデーション機能

## サポート

問題が発生した場合:
1. このガイドのトラブルシューティングを確認
2. `archive/`ディレクトリのバックアップを確認
3. 必要に応じてロールバック
