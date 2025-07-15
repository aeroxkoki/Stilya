# 整合性チェックレポート

## 🔴 発見された問題

### 1. 存在しないテーブルへの参照
**ファイル**: `src/services/recommendationService.ts`
```typescript
// Line 1009
.from('user_style_preferences')  // このテーブルは存在しない
```
**影響**: スタイル診断結果の保存が失敗する可能性

### 2. ProfileScreenでの表示問題
**ファイル**: `src/screens/profile/ProfileScreen.tsx`
```typescript
// Line 159
{user?.stylePreference?.join(', ') || '未設定'}
// 出力例: "casual, mode" （英語IDがそのまま表示）
```
**影響**: ユーザーに英語のIDが表示されて分かりにくい

### 3. 商品タグとの不整合
**現状の商品タグ例**:
- tags: ['都会的', 'セレクト', 'カジュアル', 'トレンド']
- tags: ['メンズ', 'モード', 'シンプル']

**問題**: 
- 「都会的」「セレクト」など未定義のタグが混在
- 性別タグとスタイルタグが混在

## 🟡 潜在的な問題

### 1. style_tagsとtagsの重複
```typescript
// external_productsテーブル
tags: ['カジュアル', 'トレンド'],      // 一般的なタグ
style_tags: [],                        // 空の場合が多い
```
どちらを使うべきか不明確

### 2. フィルタリングロジックの不一致
- `productService.ts`: tagsフィールドで検索
- `smartFilterService.ts`: tagsフィールドで集計
- しかし商品のtagsは標準化されていない

## 🟢 修正案

### 1. 存在しないテーブル参照の修正
```typescript
// recommendationService.ts
// user_style_preferences → users テーブルを使用
const { error } = await supabase
  .from('users')
  .update({
    style_preferences: [...],  // 既存のフィールドを使用
  })
  .eq('id', userId);
```

### 2. ProfileScreen表示の日本語化
```typescript
// ProfileScreen.tsx
import { STYLE_ID_TO_JP_TAG } from '@/constants/constants';

// 表示部分
{user?.stylePreference
  ?.map(style => STYLE_ID_TO_JP_TAG[style] || style)
  .join(', ') || '未設定'}
```

### 3. 商品タグの標準化スクリプト
```typescript
// scripts/standardize-tags.js
const VALID_STYLE_TAGS = ['カジュアル', 'きれいめ', 'ナチュラル', 'モード', 'ストリート', 'フェミニン'];
const TAG_MAPPING = {
  '都会的': 'モード',
  'セレクト': 'きれいめ',
  'シンプル': 'ナチュラル',
  // ...
};
```

## 優先度

1. **高**: user_style_preferencesテーブル参照の修正（エラーが発生する）
2. **中**: ProfileScreenの表示改善（UX向上）
3. **低**: 商品タグの標準化（段階的に実施可能）

## 結論
現在のコードは動作しますが、いくつかの整合性問題があります。特に存在しないテーブルへの参照は早急に修正が必要です。