# Phase 1 実装ガイド - 推薦アルゴリズムと日次処理の改善

## 実装内容

### 1. 推薦アルゴリズムの改善
- ネガティブシグナルの重みを0.5から1.0に強化
- SwipePatternAnalyzerクラスを追加（連続Noパターンの検出とセッション調整）

### 2. 日次メンテナンス処理の拡張
- Wilson Scoreによる品質スコア計算機能を追加
- priorityフィールドを活用した品質スコアの保存

## データベース整合性の確保

実装前に以下のSQLスクリプトを実行してください：

### 1. レビュー関連カラムの追加
```bash
# Supabase SQL Editorで実行
cd /Users/koki_air/Documents/GitHub/Stilya
cat scripts/database/add-review-columns.sql
```

### 2. メンテナンスログテーブルの作成
```bash
# Supabase SQL Editorで実行
cat scripts/database/add-maintenance-logs-table.sql
```

### 3. 重複検出RPC関数の作成
```bash
# Supabase SQL Editorで実行
cat scripts/database/add-find-duplicate-products-rpc.sql
```

## 実装ファイルの確認

### 変更されたファイル
1. `/src/services/recommendationService.ts`
   - ネガティブシグナルの重み変更
   - SwipePatternAnalyzerクラスの追加

2. `/scripts/maintenance/simple-daily-patch.js`
   - calculateProductQualityScore関数の追加
   - updateProductQualityScores関数の追加
   - main関数に品質スコア更新処理を追加

## テスト手順

### 1. データベースの準備
```bash
# Supabase SQL Editorで順番に実行
# 1. add-review-columns.sql
# 2. add-maintenance-logs-table.sql
# 3. add-find-duplicate-products-rpc.sql
```

### 2. ローカルテスト
```bash
# 品質スコア計算のテスト
cd /Users/koki_air/Documents/GitHub/Stilya
node -e "
function calculateProductQualityScore(data) {
  const { reviewCount, reviewAverage } = data;
  if (reviewCount === 0) return { total: 30, confidence: 'low' };
  const z = 1.96;
  const n = reviewCount;
  const p = reviewAverage / 5;
  const score = (p + z*z/(2*n) - z * Math.sqrt(p*(1-p)/n + z*z/(4*n*n))) / (1 + z*z/n);
  return {
    total: Math.round(score * 100),
    confidence: reviewCount > 50 ? 'high' : reviewCount > 10 ? 'medium' : 'low'
  };
}
console.log('Test cases:');
console.log('100 reviews, 4.5 avg:', calculateProductQualityScore({ reviewCount: 100, reviewAverage: 4.5 }));
console.log('10 reviews, 5.0 avg:', calculateProductQualityScore({ reviewCount: 10, reviewAverage: 5.0 }));
console.log('0 reviews:', calculateProductQualityScore({ reviewCount: 0, reviewAverage: 0 }));
"

# 日次パッチのテスト実行
cd scripts/maintenance
node simple-daily-patch.js
```

### 3. アプリケーションテスト
```bash
cd /Users/koki_air/Documents/GitHub/Stilya
npm start

# テスト内容：
# 1. 複数回同じカテゴリ/ブランドの商品を「No」スワイプ
# 2. 次の推薦で同じ特徴の商品が減少することを確認
```

## 本番環境への適用

### 1. GitHubへのプッシュ
```bash
git add -A
git commit -m "feat: Phase 1 - 推薦アルゴリズムの改善と品質スコア更新処理の追加"
git push origin main
```

### 2. データベースマイグレーション
本番環境のSupabase SQL Editorで、上記3つのSQLスクリプトを順番に実行

### 3. 動作確認
- 日次パッチが正常に動作することを確認
- アプリの推薦精度が向上していることを確認

## 注意事項

1. **後方互換性**: すべての変更は既存のシステムと互換性があります
2. **段階的適用**: まず開発環境でテストし、問題がないことを確認してから本番環境へ適用
3. **モニタリング**: 実装後は以下をモニタリング
   - Yes/No率の変化
   - セッション時間の変化
   - エラー率

## トラブルシューティング

### エラー: "column review_count does not exist"
→ `add-review-columns.sql`を実行してください

### エラー: "relation maintenance_logs does not exist"
→ `add-maintenance-logs-table.sql`を実行してください

### エラー: "function find_duplicate_products() does not exist"
→ `add-find-duplicate-products-rpc.sql`を実行してください

## 次のステップ

Phase 1の実装と検証が完了したら、Phase 2（複数ソート戦略の実装）に進みます。
