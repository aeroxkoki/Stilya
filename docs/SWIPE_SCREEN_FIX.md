# スワイプ画面の商品表示問題の解決方法

## 問題の根本原因

1. **カウント取得の問題**: Supabaseのクエリチェーンで`count`を取得する際、既存のqueryオブジェクトに対して実行すると`null`を返すことがある
2. **商品の重複**: ランダム商品とパーソナライズ商品で同じ商品が返されることがあり、重複除去後に商品数が不足する

## 実施した修正

### 1. fetchRandomizedProducts（productService.ts）
- カウント取得用に別のクエリインスタンスを作成
- フィルター条件を正しく適用してから総数を取得

### 2. fetchMixedProducts（productService.ts）
- 重複を考慮して50%多めに商品を取得（bufferMultiplier = 1.5）
- 商品が不足している場合、追加で商品を取得するロジックを実装
- 交互に商品を追加して多様性を確保

## 動作確認方法

### 方法1: 開発ビルドで確認
```bash
# 開発ビルドを起動
npm run ios

# または
npm run android
```

コンソールログで以下を確認：
- `[fetchMixedProducts] Final count: 20 products` のように20件取得されているか
- `[SwipeScreen] Debug Info:` で商品数が表示されているか

### 方法2: デバッグコンポーネントを使用
SwipeScreen.tsxには開発環境でのデバッグ情報が表示されます：
```
商品数: 20 | 現在: 1 | もっと: Yes
```

### 方法3: ログ出力を確認
アプリ実行時のMetro Bundlerのコンソールで以下のようなログが表示されます：

```
[ProductService] Fetching randomized products...
[ProductService] Total products with filters: 6148
[fetchMixedProducts] After deduplication: 20 unique products
[fetchMixedProducts] Final count: 20 products
```

## 追加の改善案

もし問題が続く場合は、以下も試してください：

1. **キャッシュをクリア**
```bash
npm run clear-cache
```

2. **データベースの再確認**
```bash
node scripts/check-product-count.js
```

3. **フィルターのリセット**
SwipeScreen右上のフィルターボタンから、すべてのフィルターをクリアしてみてください。

## 注意事項

- 修正後は必ずGitHubにプッシュして本番環境に反映させる必要があります
- 開発環境とGitHub Actions環境の両方で動作確認を行ってください
