# 楽天API実データ取得問題の解決方法

## 問題の概要
スワイプ画面で5つの商品をスワイプすると、その後商品が表示されなくなる問題。モックデータではなく楽天APIからの実データを使用したい。

## 根本原因
1. **環境変数の読み込み問題**
   - app.config.jsで楽天API環境変数の読み込みがEXPO_PUBLIC_プレフィックスに対応していなかった
   - Expo開発ビルドでは環境変数の再読み込みが必要

2. **商品取得ロジックの問題**
   - Supabaseを優先していたため、空のテーブルから商品を取得できなかった
   - 商品取得数が少なすぎた（pageSize: 10）

3. **ジャンルIDの固定**
   - レディースファッション（100371）のみを取得していた

## 実施した修正

### 1. 環境変数の読み込み修正
```javascript
// app.config.js
rakutenAppId: process.env.EXPO_PUBLIC_RAKUTEN_APP_ID || process.env.RAKUTEN_APP_ID || "",
rakutenAffiliateId: process.env.EXPO_PUBLIC_RAKUTEN_AFFILIATE_ID || process.env.RAKUTEN_AFFILIATE_ID || "",
```

### 2. 商品取得ロジックの改善
- 楽天APIを優先的に使用
- 商品取得数を増やす（pageSize: 20、楽天APIからは40件取得）
- genreIdをランダムに選択（男女両方の商品を取得）

### 3. デバッグ機能の追加
- 環境変数の確認ログ
- 楽天APIの呼び出しログ
- テストスクリプトの追加

## 開発ビルドでの確認手順

### 1. 環境変数の確認
```bash
# 楽天API環境変数の確認
cd /Users/koki_air/Documents/GitHub/Stilya
./scripts/check-rakuten-env.sh

# 楽天APIの動作確認
node scripts/test-rakuten-api-direct.js
```

### 2. 開発ビルドの再起動
```bash
# Expoサーバーの停止（Ctrl+C）
# キャッシュのクリア
npx expo start -c

# 開発ビルドの再起動
npm run start:dev
```

### 3. アプリでの確認
1. アプリを完全に終了（バックグラウンドからも削除）
2. アプリを再起動
3. コンソールログで以下を確認：
   - `[ENV] RAKUTEN_APP_ID: Set`
   - `[ENV] RAKUTEN_AFFILIATE_ID: Set`
   - `[RakutenService] API keys are set, proceeding with real API call`
   - `[ProductService] Fetched XX products from Rakuten`

## トラブルシューティング

### 環境変数が読み込まれない場合
1. `.env`ファイルの確認
   ```bash
   grep RAKUTEN .env
   ```

2. 開発ビルドの再構築
   ```bash
   npx expo run:ios --clear
   # または
   npx expo run:android --clear
   ```

### まだモックデータが表示される場合
1. アプリのデータをクリア（設定→アプリ→Stilya→データを削除）
2. AsyncStorageのキャッシュをクリア
3. Supabaseのswipesテーブルをクリア（必要に応じて）

## 確認済みの動作
- 楽天APIキーは正しく設定されている
- 楽天APIは正常に商品データを返している（テスト済み）
- 1回のAPI呼び出しで40件の商品を取得
- 男女両方のファッションアイテムを取得

## 注意事項
- 開発ビルドでは環境変数の変更後、必ず再起動が必要
- 楽天APIのレート制限に注意（1秒に1回のリクエスト制限あり）
- キャッシュは1時間有効

## 関連ファイル
- `/app.config.js` - 環境変数の読み込み設定
- `/src/services/productService.ts` - 商品取得ロジック
- `/src/services/rakutenService.ts` - 楽天API呼び出し
- `/src/hooks/useProducts.ts` - 商品管理フック
- `/scripts/test-rakuten-api-direct.js` - 楽天APIテストスクリプト
