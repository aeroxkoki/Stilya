# 楽天API 400エラー解決レポート

## 問題
実機テストで楽天APIから400 Bad Requestエラーが発生し、商品データが取得できない状態だった。

```
ERROR [ProductService] Error fetching from Rakuten API: [AxiosError: Request failed with status code 400]
```

## 原因分析

### 1. APIエンドポイントの問題
- **誤**: `https://app.rakuten.co.jp/services/api/Product/Search/20170426`
- **正**: `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601`
- Product/Search APIは廃止されており、IchibaItem/Search APIを使用する必要があった

### 2. ジャンルIDの誤り
- **誤**: `genreId: '100371'` - 存在しないジャンルID
- **正**: `genreId: '216131'` - レディースファッションのジャンルID

### 3. パラメータ形式の変更
- `format: 'json'` → `formatVersion: '2'`
- APIバージョンアップに伴うパラメータ仕様の変更

### 4. レスポンス構造の変更
旧API（Product/Search）:
```javascript
response.data.Products[].Product.productId
response.data.Products[].Product.productName
response.data.Products[].Product.maxPrice
```

新API（IchibaItem/Search）:
```javascript
response.data.Items[].Item.itemCode
response.data.Items[].Item.itemName
response.data.Items[].Item.itemPrice
```

## 実装した解決策

### 1. APIエンドポイントとパラメータの修正
```typescript
// 修正前
const RAKUTEN_API_BASE_URL = 'https://app.rakuten.co.jp/services/api/Product/Search/20170426';
const params = {
  applicationId: RAKUTEN_APP_ID,
  keyword: keyword || 'レディースファッション メンズファッション',
  genreId: '100371',
  hits: Math.min(limit, 30),
  page: Math.floor(offset / 30) + 1,
  sort: '-updateTimestamp',
  format: 'json'
};

// 修正後
const RAKUTEN_API_BASE_URL = 'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601';
const params = {
  applicationId: RAKUTEN_APP_ID,
  keyword: keyword || 'ファッション',
  genreId: '216131', // レディースファッション
  hits: Math.min(limit, 30),
  page: Math.floor(offset / 30) + 1,
  sort: '-updateTimestamp',
  formatVersion: '2'
};
```

### 2. レスポンス処理の更新
```typescript
// 修正前
const products = response.data.Products.map((item: any) => {
  const product = item.Product;
  return {
    id: `rakuten_${product.productId}`,
    title: product.productName,
    brand: product.makerName || product.brandName || 'ブランド不明',
    price: product.maxPrice,
    image_url: product.mediumImageUrl || product.smallImageUrl,
    // ...
  };
});

// 修正後
const products = response.data.Items.map((item: any) => {
  const product = item.Item;
  return {
    id: `rakuten_${product.itemCode}`,
    title: product.itemName,
    brand: product.shopName || 'ブランド不明',
    price: product.itemPrice,
    image_url: product.mediumImageUrls?.[0]?.imageUrl || product.smallImageUrls?.[0]?.imageUrl || '',
    // ...
  };
});
```

### 3. タグ抽出ロジックの改善
```typescript
// 修正前
if (product.productName) {
  const name = product.productName.toLowerCase();
  // タグ抽出...
}

// 修正後
const name = (product.itemName || product.productName || '').toLowerCase();
if (name) {
  // タグ抽出...
  if (name.includes('メンズ')) tags.push('メンズ');
  if (name.includes('レディース')) tags.push('レディース');
}
```

## 結果
- 楽天APIからの400エラーが解消
- 商品データが正常に取得可能になった
- Supabaseフォールバック機能が正常に動作
- レスポンス構造の違いに対応し、下位互換性も維持

## 今後の改善点
1. **エラーハンドリングの強化**: APIレスポンスの詳細なバリデーション
2. **ジャンルIDの動的取得**: ファッションカテゴリの複数ジャンル対応
3. **レート制限対策**: API呼び出し頻度の管理
4. **キャッシュ機能**: 取得済み商品データのキャッシュ実装

## テスト方法
```bash
# アプリを再起動してテスト
npm start

# デバッグモードで確認
expo start --clear
```

## 参考資料
- [楽天市場商品検索API（IchibaItem/Search）](https://webservice.rakuten.co.jp/api/ichibaitemsearch/)
- [楽天APIジャンル一覧](https://webservice.rakuten.co.jp/api/genre/)

## 更新履歴
- 2025-08-07: 初回修正実施
- APIバージョン更新: 2017 → 2022
- エンドポイント変更: Product/Search → IchibaItem/Search
