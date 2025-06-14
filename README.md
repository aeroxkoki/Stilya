# 🎯 Stilya - パーソナライズ型ファッション提案アプリ（MVP）

![Build Status](https://github.com/aeroxkoki/Stilya/actions/workflows/build.yml/badge.svg)

"スワイプで、あなたの「好き」が見つかる。"

## 📋 概要

Stilya（スティルヤ）は、Yes/Noのスワイプ操作でユーザーのファッションの好みを学習し、パーソナライズされたアイテムを提案するモバイルアプリです。

### 主な特徴
- 🎴 **直感的なスワイプUI** - Tinder風のUIで商品を評価
- 🤖 **AI推薦機能** - 好みを学習して最適な商品を提案
- 🛍️ **アフィリエイト連携** - 気に入った商品は外部ECサイトで購入可能
- 📱 **モバイルファースト** - iOS/Android対応のネイティブアプリ

## 🚀 開発環境セットアップ

### 必要な環境
- Node.js (v18以上)
- npm または yarn
- Expo CLI
- Xcode (iOS開発用)
- Android Studio (Android開発用)

### インストール手順

```bash
# リポジトリのクローン
git clone https://github.com/aeroxkoki/Stilya.git
cd Stilya

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
# .envファイルを編集してSupabase情報を設定
```

### 起動方法

#### iOS実機テスト（無料Apple IDを使用）

```bash
# 1. iOSプロジェクトの生成
npx expo prebuild --platform ios --clean

# 2. CocoaPodsの依存関係をインストール
cd ios && pod install && cd ..

# 3. Xcodeでプロジェクトを開く（必ず.xcworkspaceを使用）
open ios/Stilya.xcworkspace

# 4. Xcodeで以下を設定：
# - Signing & Capabilities → Team: Personal Team
# - Bundle Identifier: com.yourname.stilya.dev (ユニークな値に変更)
# - デバイスを接続してRun
```

**注意**: 必ず`Stilya.xcworkspace`を開いてください。`Stilya.xcodeproj`を直接開くとCocoaPodsの依存関係が読み込まれません。

#### 開発サーバーの起動

```bash
# 開発サーバーを起動
npm run dev

# または
npx expo start --dev-client --lan
```

## 📁 プロジェクト構成

```
Stilya/
├── src/                    # ソースコード
│   ├── components/         # UIコンポーネント
│   ├── screens/           # 画面コンポーネント
│   ├── services/          # APIサービス
│   ├── hooks/             # カスタムフック
│   ├── navigation/        # ナビゲーション設定
│   └── types/             # TypeScript型定義
├── assets/                # 画像・アイコン
├── scripts/               # ビルド・デプロイスクリプト
├── docs/                  # ドキュメント
│   ├── guides/           # 開発ガイド
│   └── testing/          # テスト関連
└── ios/                   # iOSネイティブコード
```

## 🔧 主要な技術スタック

- **フロントエンド**: React Native + Expo (SDK 53)
- **言語**: TypeScript
- **UI**: NativeWind (Tailwind CSS)
- **ナビゲーション**: React Navigation
- **状態管理**: React Hooks
- **バックエンド**: Supabase
- **アフィリエイト**: 楽天API

## 📊 Supabase無料枠対応

本プロジェクトはSupabaseの無料枠内で動作するよう最適化されています：

### 無料枠制限
- **ストレージ**: 1GB
- **データベース**: 500MB
- **API呼び出し**: 月2M
- **同時接続**: 50

### 最適化機能
- **最大商品数**: 45,000件（安全マージン考慮）
- **高画質画像**: 楽天APIから最高品質の画像を自動取得
- **自動容量管理**: GitHub Actionsで日次モニタリング
- **商品ローテーション**: 古い商品を自動的に削除

### モニタリング
```bash
# Supabase使用状況の確認
node scripts/monitoring/supabase-free-tier-monitor.js
```

## 📱 主要機能

### 1. スワイプUI
- 商品を左右にスワイプしてYes/No評価
- アニメーション付きのカード型UI

### 2. パーソナライズ推薦
- ユーザーの好みを学習
- タグベースの推薦アルゴリズム

### 3. 商品詳細・購入
- 商品詳細情報の表示
- アフィリエイトリンク経由での購入

## 🧪 テスト

```bash
# 単体テストの実行
npm test

# E2Eテストの実行
npm run test:e2e
```

## 📝 ドキュメント

- [開発ガイド](docs/guides/DEVELOPMENT_GUIDELINES.md)
- [データベース設計](docs/DATABASE_INITIALIZATION_GUIDE.md)
- [テストガイド](docs/testing/TESTING_GUIDE.md)
- [リリースチェックリスト](docs/MVP_RELEASE_CHECKLIST.md)
- [Supabase無料枠最適化](docs/SUPABASE_FREE_TIER_OPTIMIZATION.md)
- [商品削除管理](docs/DELETION_MANAGEMENT_GUIDE.md)

## 🚢 デプロイ

### EAS Buildを使用したビルド

```bash
# プロダクションビルド（iOS）
eas build --platform ios --profile production

# プロダクションビルド（Android）
eas build --platform android --profile production
```

## 📄 ライセンス

このプロジェクトは[MITライセンス](LICENSE)の下で公開されています。

## 👥 コントリビューション

プルリクエストや機能提案は歓迎します。大きな変更を行う場合は、まずissueを作成して議論してください。

## 📞 お問い合わせ

- GitHub Issues: [https://github.com/aeroxkoki/Stilya/issues](https://github.com/aeroxkoki/Stilya/issues)

---

**Stilya** - あなたのスタイルを、もっと自由に。
