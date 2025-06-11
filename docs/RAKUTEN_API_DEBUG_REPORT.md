# 楽天API実機テスト確認レポート

## 実施した修正内容

### 1. **useProductsフックの修正**
- ✅ `fetchProducts`の呼び出し方法を修正（オブジェクトではなく引数として渡す）
- ✅ エラーハンドリングを強化
- ✅ デバッグログを追加

### 2. **楽天APIサービスの改善**
- ✅ 詳細なデバッグログの追加
- ✅ API呼び出しの全プロセスをログ出力
- ✅ エラーレスポンスの詳細表示

### 3. **環境変数の修正**
- ✅ EXPO_PUBLIC_プレフィックス付きの環境変数を追加
- ✅ env.tsでのフォールバック処理を追加
- ✅ 楽天API設定状況のログ出力

### 4. **デバッグ画面の作成**
- ✅ RakutenDebugScreenを新規作成
- ✅ プロファイル画面から開発者メニューでアクセス可能
- ✅ 以下のテスト機能を実装：
  - 環境変数の確認
  - 楽天API直接テスト
  - ProductService経由テスト
  - Supabase接続テスト

## 実機テストでの確認手順

### 1. **アプリの再起動**
```bash
# 実行中のプロセスを停止（Ctrl+C）
# 再度起動
npm run start
```

### 2. **実機でのテスト手順**

1. **コンソールログの確認**
   - アプリ起動時に以下のログが表示されることを確認：
   ```
   [ENV] Rakuten API Configuration:
   - RAKUTEN_APP_ID: Set
   - RAKUTEN_AFFILIATE_ID: Set
   - RAKUTEN_APP_SECRET: Set
   ```

2. **スワイプ画面での動作確認**
   - スワイプ画面を開いた際に以下のログを確認：
   ```
   [useProducts] Loading products with offset: 0 limit: 10
   [ProductService] Fetching products from Supabase...
   [RakutenService] fetchRakutenFashionProducts called with: ...
   ```

3. **デバッグ画面でのテスト**
   - プロファイル画面 → 開発者メニュー → 楽天APIデバッグ
   - 各テストボタンを押して結果を確認

### 3. **想定されるエラーと対処法**

#### A. 環境変数が読み込まれない場合
```bash
# キャッシュをクリア
npx expo start --clear
```

#### B. ネットワークエラーの場合
- 実機がインターネットに接続されているか確認
- VPNを使用している場合は無効化
- プロキシ設定を確認

#### C. 楽天APIエラー (400/401)
- APIキーが正しいか確認
- アフィリエイトIDが正しいか確認
- 楽天デベロッパーコンソールでアプリが有効か確認

#### D. CORS/証明書エラー
- Expo Goアプリを最新版に更新
- 開発ビルドを使用している場合は再ビルド

## デバッグ情報の確認ポイント

### コンソールログで確認すべき項目：

1. **環境変数の読み込み**
   ```
   [ENV] Using Supabase: https://ddypgpljprljqrblpuli.supabase.co
   [ENV] Rakuten API Configuration: ...
   ```

2. **API呼び出しの詳細**
   ```
   [RakutenService] API Request URL: https://app.rakuten.co.jp/...
   [RakutenService] API Parameters: {...}
   [RakutenService] Making API request...
   [RakutenService] Response status: 200
   ```

3. **エラーの詳細**
   ```
   [RakutenService] API Error Response: ...
   [ProductService] Error fetching products: ...
   ```

## トラブルシューティング

### 問題: 商品が表示されない

1. デバッグ画面で「楽天API直接テスト」を実行
2. エラーメッセージを確認
3. 環境変数が正しく設定されているか確認

### 問題: モックデータが表示される

1. 楽天APIキーが設定されているか確認
2. ネットワーク接続を確認
3. APIレート制限に達していないか確認

### 問題: スワイプ画面でローディングが終わらない

1. コンソールでエラーログを確認
2. デバッグ画面でProductService経由テストを実行
3. Supabase接続テストを実行

## まとめ

実機テストで楽天APIが機能しない問題に対して、以下の改善を実施しました：

1. **API呼び出しの修正** - 引数の渡し方を修正
2. **デバッグ機能の強化** - 詳細なログ出力とデバッグ画面
3. **環境変数の対応** - EXPO_PUBLIC_プレフィックスの追加
4. **エラーハンドリング** - より詳細なエラー情報の取得

これらの修正により、問題の原因を特定しやすくなり、実機での動作確認が容易になりました。デバッグ画面を活用して、各コンポーネントの動作を個別に確認できます。
