# Stilya iOS開発ガイド

## 📁 ディレクトリ構成

```
ios/
├── Stilya/                    # メインアプリケーション
│   ├── Info.plist            # アプリ設定
│   ├── AppDelegate.swift     # アプリエントリーポイント
│   ├── NetworkConfig.plist   # API設定
│   └── Images.xcassets/      # アイコン・画像アセット
├── Stilya.xcodeproj/         # Xcodeプロジェクト
├── Stilya.xcworkspace/       # CocoaPodsワークスペース（pod install後）
├── Podfile                   # CocoaPods依存関係
├── BUILD_CONFIG.md           # ビルド設定詳細
├── BUILD_CHECKLIST.md        # ビルド前チェックリスト
├── build-ios.sh              # ビルドヘルパースクリプト
└── fix-pods.sh               # CocoaPods修正スクリプト
```

## 🚀 クイックスタート

### 1. 環境設定
```bash
# UTF-8設定（CocoaPodsエラー対策）
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
```

### 2. 依存関係インストール
```bash
cd /Users/koki_air/Documents/GitHub/Stilya/ios
./fix-pods.sh
```

### 3. ビルド実行
```bash
# 対話式ビルドスクリプト
./build-ios.sh

# または直接コマンド
cd /Users/koki_air/Documents/GitHub/Stilya
npm run ios
```

## 🔧 設定済み項目

### アプリ権限
- ✅ フォトライブラリ（読み取り/書き込み）
- ✅ カメラアクセス
- ✅ ユーザートラッキング（IDFA）

### API設定
- ✅ Supabase接続
- ✅ LinkShare API
- ✅ Rakuten API

### ビルド設定
- Bundle ID: `com.stilya.app`
- Deployment Target: iOS 15.1
- Swift Version: 5.0
- Objective-C Bridging Header: 設定済み

## 📱 ビルドオプション

### シミュレーター
```bash
npm run ios
# または
npx expo run:ios --simulator "iPhone 15 Pro"
```

### 実機（デバッグ）
```bash
npx expo run:ios --device
```

### 実機（リリース）
```bash
npx expo run:ios --configuration Release --device
```

### EAS Build（クラウド）
```bash
eas build --platform ios --profile preview
```

## ⚠️ トラブルシューティング

### CocoaPodsエラー
```bash
# UTF-8エラーの場合
./fix-pods.sh

# 手動修正
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
cd ios && pod install
```

### ビルドエラー
```bash
# Xcodeキャッシュクリア
cd ios
xcodebuild clean
rm -rf ~/Library/Developer/Xcode/DerivedData

# Metro バンドラーリセット
npx expo start --clear
```

### 証明書エラー
1. Xcodeで`Stilya.xcworkspace`を開く
2. Signing & Capabilities → Team選択
3. Bundle Identifierを一意に変更（必要な場合）

## 📝 開発フロー

1. **機能開発**: React Native/TypeScriptで実装
2. **iOS固有機能**: Swift/Objective-Cで拡張（必要時）
3. **テスト**: シミュレーター → 実機
4. **配布**: TestFlight（有料版）またはEAS Build

## 🔗 関連ドキュメント

- [Apple Developer Account取得ガイド](../APPLE_DEVELOPER_ACCOUNT_GUIDE.md)
- [ビルド設定詳細](./BUILD_CONFIG.md)
- [ビルドチェックリスト](./BUILD_CHECKLIST.md)
- [iOS ローカルビルドガイド](../IOS_LOCAL_BUILD_GUIDE.md)

## 💡 Tips

- **開発中**: `.xcodeproj`でも動作可能（CocoaPods不要）
- **本番ビルド**: 必ず`.xcworkspace`を使用
- **パフォーマンス**: Hermesエンジン有効化済み
- **デバッグ**: Xcodeのコンソールで詳細ログ確認可能

---

問題が発生した場合は、まず`./build-ios.sh`の環境チェックを実行してください。
