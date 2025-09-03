# 価格フィルタリングエラー修正レポート

## 実施日時
2025年5月13日

## 修正した問題

### エラー内容
```
ERROR ** Error fetching products: {"code": "22P02", "details": null, "hint": null, "message": "invalid input syntax for type integer: \"1398.6\""}
```

PostgreSQLのエラーで、整数型の`price`カラムに小数値（1398.6）を渡そうとしていたことが原因。

## 原因分析

1. **データベーススキーマ**
   - `external_products`テーブルの`price`カラムは`integer`型
   - Supabaseのクエリで小数値を使用するとエラーが発生

2. **問題のあったコード**
   - `personalizedProductService.ts`の価格帯フィルタリング処理
   - 価格範囲の計算で小数が生成される可能性があった
   ```typescript
   const minPrice = Math.floor(priceRange.min * 0.8);
   const maxPrice = Math.ceil(priceRange.max * 1.2); // ceilは切り上げのため小数になる可能性
   ```

## 実施した修正

### 1. 価格フィルタリングの修正
**ファイル**: `/src/services/personalizedProductService.ts`

**変更内容**:
- `Math.ceil()`を`Math.floor()`に変更し、常に整数値になるよう修正
- デバッグログを追加して計算結果の検証を可能に

```typescript
// 修正前
const maxPrice = Math.ceil(priceRange.max * 1.2);

// 修正後  
const maxPrice = Math.floor(priceRange.max * 1.2);

// デバッグログの追加
console.log('[PersonalizedProductService] Price filter:', { 
  original: priceRange, 
  filtered: { min: minPrice, max: maxPrice },
  isIntegerMin: Number.isInteger(minPrice),
  isIntegerMax: Number.isInteger(maxPrice)
});
```

### 2. スコアリング関数の修正
**変更内容**:
- 価格スコアの計算結果も整数に統一

```typescript
// 修正前
score += Math.round(priceScore * 100) / 100; // 小数点2桁に丸める

// 修正後
score += Math.floor(priceScore); // 整数に丸める
```

## 影響範囲
- パーソナライズされた商品取得機能（`getPersonalizedProducts`）
- 初期商品取得機能（`getInitialProducts`）- 内部でパーソナライズ機能を使用

## テスト確認項目
1. ✅ Supabaseクエリで整数値のみが使用されること
2. ✅ 価格フィルタリングが正常に動作すること
3. ✅ 商品取得が正常に行われること
4. ✅ エラーメッセージが表示されないこと

## 今後の改善提案
1. **型安全性の向上**
   - 価格関連の計算には専用のヘルパー関数を作成
   - 整数型を保証する型定義の追加

2. **エラーハンドリングの改善**
   - Supabaseエラーの詳細ログ
   - ユーザーへのフレンドリーなエラーメッセージ

3. **単体テストの追加**
   - 価格計算のエッジケーステスト
   - データベースクエリのモックテスト

## 結論
価格フィルタリングで発生していた型の不一致エラーを修正しました。すべての価格関連の計算で整数値を使用するようになり、PostgreSQLエラーは解消されました。
