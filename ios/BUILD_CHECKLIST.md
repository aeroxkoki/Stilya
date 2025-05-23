# iOS Build Checklist for Stilya

## ビルド前確認事項

### 1. 環境設定
- [ ] Xcode 15以上がインストールされている
- [ ] CocoaPodsがインストールされている
- [ ] Apple IDがXcodeに登録されている
- [ ] UTF-8環境変数が設定されている

### 2. プロジェクト設定
- [ ] Bundle Identifier: `com.stilya.app`
- [ ] Version: 1.0.0
- [ ] Build Number: 1
- [ ] Deployment Target: iOS 15.1

### 3. 権限設定（app.config.js）
- [ ] フォトライブラリ読み取り権限
- [ ] フォトライブラリ書き込み権限
- [ ] カメラ権限
- [ ] ユーザートラッキング権限（IDFA）

### 4. API設定
- [ ] Supabase URL/Keyが.envに設定されている
- [ ] LinkShare API認証情報が設定されている
- [ ] Rakuten API認証情報が設定されている

### 5. アセット確認
- [ ] アプリアイコン (1024x1024)
- [ ] スプラッシュスクリーン画像
- [ ] 各種アイコンサイズが揃っている

### 6. コード署名
- [ ] Development Team設定
- [ ] Automatic Signingが有効
- [ ] Provisioning Profile（自動）

## ビルドコマンド

### シミュレーター
```bash
cd /Users/koki_air/Documents/GitHub/Stilya
npm run ios
```

### 実機デバッグ
```bash
npx expo run:ios --device
```

### 実機リリース
```bash
npx expo run:ios --configuration Release --device
```

### EAS Build
```bash
eas build --platform ios --profile preview
```

## トラブルシューティング

### Pod install エラー
```bash
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
cd ios && pod install
```

### ビルドキャッシュクリア
```bash
cd ios
xcodebuild clean
rm -rf ~/Library/Developer/Xcode/DerivedData
```

### Metro バンドラーリセット
```bash
npx expo start --clear
```
