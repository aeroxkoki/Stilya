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
- iOS Simulator (Mac) または Android Emulator

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

```bash
# 開発サーバーの起動
npm start

# iOSシミュレーターで起動
npm run ios

# Androidエミュレーターで起動
npm run android
```

## 🧪 ローカルテスト

### MVP機能テストの実行方法

#### 方法1: CLIから基本チェック
```bash
npm test
```
基本的な環境変数の設定確認を行います。

#### 方法2: アプリ内でテスト実行（推奨）
1. `npm start` でアプリを起動
2. デバッグモードが有効な場合、画面右下に🛠️ボタンが表示されます
   ```env
   # .envファイルに追加
   EXPO_PUBLIC_DEBUG_MODE=true
   ```
3. ボタンをタップして開発メニューを開く
4. 「🧪 MVPテストを実行」をタップ

### テスト項目
- ✅ 環境変数チェック
- ✅ Supabase接続テスト（デモモードではスキップ）
- ✅ 認証機能テスト（デモモードではスキップ）
- ✅ 商品データ取得テスト
- ✅ スワイプ機能テスト
- ✅ 推薦ロジックテスト
- ✅ UIコンポーネント確認
- ✅ 外部リンク遷移テスト
- ✅ パフォーマンステスト

### デモモードでのテスト
デモモード（`EXPO_PUBLIC_DEMO_MODE=true`）では、Supabase関連のテストは自動的にスキップされ、ローカルデータを使用したテストが実行されます。

## 📁 プロジェクト構造

```
Stilya/
├── src/
│   ├── components/      # 再利用可能なUIコンポーネント
│   ├── screens/         # 画面コンポーネント
│   ├── navigation/      # ナビゲーション設定
│   ├── services/        # API・ビジネスロジック
│   ├── contexts/        # React Context
│   ├── hooks/           # カスタムフック
│   ├── types/           # TypeScript型定義
│   ├── utils/           # ユーティリティ関数
│   └── tests/           # テストコード
├── assets/              # 画像・フォントなどのリソース
├── scripts/             # ビルド・デプロイスクリプト
└── App.tsx              # エントリーポイント
```


## 🛠️ 技術スタック

- **フロントエンド**: React Native + Expo (SDK 53)
- **言語**: TypeScript
- **バックエンド**: Supabase
- **状態管理**: React Context + Hooks
- **ナビゲーション**: React Navigation
- **ビルド**: EAS Build

## 🔐 環境変数

```env
# Supabase設定
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# アプリ設定
EXPO_PUBLIC_DEBUG_MODE=true  # 開発メニューの表示
EXPO_PUBLIC_DEMO_MODE=true   # デモモード（ローカルデータ使用）

# アフィリエイトAPI（将来実装）
LINKSHARE_API_TOKEN=your_token
RAKUTEN_APP_ID=your_app_id
```

## 📱 デモモード

`EXPO_PUBLIC_DEMO_MODE=true` に設定すると、Supabaseを使用せずにローカルのダミーデータで動作します。初期開発やテスト時に便利です。

## 🎯 MVP機能

### 実装済み
- ✅ ユーザー認証（メール/パスワード）
- ✅ スワイプUI（Yes/No）
- ✅ 商品表示・詳細画面
- ✅ タグベース推薦ロジック
- ✅ お気に入り機能
- ✅ スワイプ履歴
- ✅ プロフィール設定
- ✅ オフライン対応

### 今後の実装予定
- 🔄 CLIPベース画像推薦
- 🔄 スタイル診断機能
- 🔄 ソーシャル機能
- 🔄 プッシュ通知

## 🚀 デプロイ

### EAS Buildを使用したビルド

```bash
# プレビュー版ビルド
npm run eas-build-preview

# 本番版ビルド
npm run eas-build-production
```

## 🤝 貢献方法

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'feat: Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

### コミットメッセージ規約
- `feat:` 新機能
- `fix:` バグ修正
- `docs:` ドキュメント変更
- `style:` コードスタイル変更
- `refactor:` リファクタリング
- `test:` テスト関連
- `chore:` ビルド・ツール関連

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 📞 お問い合わせ

- GitHub Issues: バグ報告・機能要望
- Email: support@stilya.com（仮）

---

© 2025 Stilya Project
