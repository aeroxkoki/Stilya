# 年代フォーマット統一と整合性改善レポート

## 実施日時
2025年1月16日

## 課題
1. **年代フォーマットの不統一**
   - UI層: `'10-19'`, `'20-29'` 形式
   - 内部処理: `'teens'`, `'twenties'` 形式
   - データベース: 両方の形式が混在

2. **型安全性の欠如**
   - `ageGroup`が単なる`string`型で定義
   - フォーマット変換時のエラーリスク

3. **価格フィルタリングの型不一致**
   - PostgreSQLの`price`フィールド（integer型）と小数値の比較

## 実施した根本的な解決策

### 1. 統一された型定義の作成 (`src/types/ageGroup.ts`)
```typescript
export type AgeGroupDisplay = '10-19' | '20-29' | '30-39' | '40-49' | '50+';
export type AgeGroupInternal = 'teens' | 'twenties' | 'thirties' | 'forties' | 'fifties_plus';
```

- UI表示用と内部処理用の型を明確に分離
- 双方向の変換マッピングを定義
- 型安全な変換ヘルパー関数を実装

### 2. アプリケーション全体での一貫した使用
- **UI層** (`QuickProfileScreen.tsx`): `AgeGroupDisplay`型を使用
- **サービス層** (`personalizedProductService.ts`): 内部では`AgeGroupInternal`型に変換
- **型定義** (`types/index.ts`): 両方の形式を許容（移行期間中）

### 3. データベースの統一
```sql
-- すべての年代データを内部形式に統一
UPDATE users SET age_group = 
  CASE 
    WHEN age_group = '20-29' THEN 'twenties'
    WHEN age_group = '30-39' THEN 'thirties'
    -- ...
  END
```

### 4. 価格フィルタリングの改善
```typescript
const minPrice = Math.floor(priceRange.min * 0.8); // 整数に丸める
const maxPrice = Math.ceil(priceRange.max * 1.2);  // 整数に丸める
```

## アーキテクチャの改善点

### レイヤー分離
```
UI層（表示形式）
  ↓ AgeGroupDisplay: '20-29'
変換層（ヘルパー関数）
  ↓ convertToInternalAgeGroup()
サービス層（内部形式）
  ↓ AgeGroupInternal: 'twenties'
データベース層（統一形式）
  → age_group: 'twenties'
```

### 型安全性の向上
- コンパイル時のエラー検出
- IDE の自動補完サポート
- 不正な値の混入防止

## 影響範囲と互換性
- **後方互換性**: 移行期間中は両方の形式を受け入れ
- **段階的移行**: 既存コードは引き続き動作
- **データ整合性**: データベースは統一形式に移行済み

## テスト項目
1. ✅ オンボーディングで年代選択（'20-29'）
2. ✅ 内部処理で正しく'twenties'に変換
3. ✅ 価格フィルタリングが整数型で実行
4. ✅ データベースクエリが正常動作

## 今後の推奨事項
1. **完全な型移行**: 移行期間終了後、`string`型を完全に排除
2. **バリデーション強化**: API境界でのフォーマット検証
3. **ドキュメント化**: 型定義の使用ガイドライン作成
4. **自動テスト**: フォーマット変換のユニットテスト追加

## コミット情報
- ハッシュ: `81a8727`
- メッセージ: `refactor: 年代フォーマットの統一と型安全性の向上`

## 結論
年代フォーマットの不統一と型安全性の問題を根本的に解決しました。明確な型定義と変換層により、将来的なバグを防ぎ、保守性を向上させました。
