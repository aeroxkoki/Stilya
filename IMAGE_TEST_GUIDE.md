# 画像表示問題テスト手順

## 実機テスト手順

### 1. Expoサーバーの起動
```bash
cd /Users/koki_air/Documents/GitHub/Stilya
npm run clear-cache  # キャッシュをクリア
npm start           # Expoサーバーを起動
```

### 2. Expo Goアプリでの確認
1. スマートフォンのExpo Goアプリを起動
2. QRコードをスキャン
3. アプリが起動したら、スワイプ画面に移動

### 3. デバッグコンソールの確認
ターミナルで以下のログを確認：

#### 重要なログポイント
- `[dbProductToProduct] Converting:` - DB→App変換前
- `[dbProductToProduct] Converted:` - DB→App変換後  
- `[SwipeCardImproved] Product Image Debug:` - 画像URL詳細
- `[ImageUtils] Optimized URL:` - 最適化された画像URL

### 4. デバッグスクリプトの実行
```bash
# データベースの画像URL状態を確認
node scripts/debug-swipe-images.js
```

### 5. デバッグ画面での確認
ImageDebugScreenに移動して以下を確認：
- 商品データの取得状態
- 画像URLの変換状態  
- 実際の画像表示状態

## チェックポイント

### ✅ 正常な状態
- 画像が表示される
- `imageUrl`フィールドに値が入っている
- HTTPSのURLになっている

### ❌ 異常な状態
- 画像が表示されない
- `imageUrl`が`null`または`undefined`
- HTTPのURLのまま

## トラブルシューティング

### 画像が表示されない場合

1. **キャッシュクリア**
```bash
npm run clear-cache
npx expo start -c
```

2. **データベース確認**
```bash
node scripts/debug-swipe-images.js
```

3. **強制リフレッシュ**
- アプリを完全に終了
- Expo Goアプリのキャッシュをクリア
- 再度QRコードをスキャン

### ログ出力がない場合
1. `__DEV__`環境変数の確認
2. console.logが正しく動作しているか確認
3. Expoサーバーの再起動

## 期待される動作

1. スワイプ画面を開く
2. 商品カードに画像が表示される
3. スワイプ操作が可能
4. 画像が高画質（800x800）で表示される

## 問題が継続する場合

以下の情報を収集：
1. デバッグコンソールのログ全体
2. `debug-swipe-images.js`の実行結果
3. ImageDebugScreenのスクリーンショット
4. ネットワークエラーの有無

この情報を元に、さらなる調査を実施します。
