# データベース整合性レポート

## 概要
2025年6月30日、Supabase CLIを使用してデータベースの整合性確認を実施し、深刻な重複問題を発見・修正しました。

## 発見された問題

### 1. スワイプデータの重複
- **症状**: 同じ商品に対して最大75回ものスワイプが記録されていた
- **原因**: フロントエンドでの二重実行とデータベース側のユニーク制約の欠如
- **影響**: 386件のスワイプ中、38商品で重複が発生

### 2. RLSポリシーの重複
```sql
-- 同じINSERTポリシーが2つ存在
"Users can insert own swipes"
"Users can insert their own swipes"
```

### 3. 未使用テーブル
- `products_deprecated` - 旧商品テーブル
- `view_logs` - 使用されていない閲覧履歴テーブル

## 実施した修正

### データベース側
```sql
-- 1. 重複するRLSポリシーを削除
DROP POLICY IF EXISTS "Users can insert their own swipes" ON public.swipes;

-- 2. 重複データのクリーンアップ
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY user_id, product_id 
           ORDER BY created_at DESC
         ) as rn
  FROM swipes
)
DELETE FROM swipes
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- 3. ユニーク制約を追加
CREATE UNIQUE INDEX idx_swipes_user_product 
ON public.swipes(user_id, product_id);
```

### アプリケーション側

1. **UPSERT処理の実装**
```typescript
// INSERTからUPSERTに変更
const { error } = await supabase
  .from('swipes')
  .upsert(
    {
      user_id: userId,
      product_id: productId,
      result,
    },
    { 
      onConflict: 'user_id,product_id',
      ignoreDuplicates: false 
    }
  );
```

2. **二重実行防止**
```typescript
// useSwipeフックに処理中フラグを追加
const isProcessing = useRef(false);

if (isProcessing.current) {
  return; // 既に処理中なら無視
}
isProcessing.current = true;
// ... 処理実行
setTimeout(() => {
  isProcessing.current = false;
}, 300); // 300msのクールダウン
```

## 修正結果

### Before
- 総スワイプ数: **386件**
- ユニーク商品数: **39件**
- 重複ペア: **38件**
- 最悪のケース: 1商品に**75回**のスワイプ

### After
- 総スワイプ数: **39件**
- ユニーク商品数: **39件**
- 重複ペア: **0件**
- 整合性: **✅ 完璧**

## 今後の対策

1. **定期的な整合性チェック**
   - 月次でデータベースの重複チェックを実施
   - 異常検知時の自動アラート設定

2. **開発プラクティス**
   - データベース変更時は必ず制約を考慮
   - フロントエンドでの二重実行防止を標準化

3. **モニタリング**
   - Supabaseのダッシュボードで異常なクエリパターンを監視
   - パフォーマンスメトリクスの追跡

## 関連ファイル
- `/src/services/swipeService.ts` - UPSERT処理の実装
- `/src/hooks/useSwipe.ts` - 二重実行防止の実装
- `/supabase/migrations/fix_duplicate_swipes_and_policies.sql` - データベース修正

## まとめ
この修正により、データベースの整合性が完全に回復し、今後の重複も防げるようになりました。MVPとしての品質基準を満たし、ユーザー体験の向上にも貢献しています。
