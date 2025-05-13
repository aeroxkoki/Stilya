# Stilya - パーソナライズファッション提案アプリ

スワイプUIで好みを学習し、最適なファッションアイテムを提案するモバイルアプリ

## 概要

Stilyaは、ユーザーのファッションの好みをスワイプUIを通じて学習し、パーソナライズされた商品推薦を提供するモバイルアプリです。「スワイプで、あなたの"好き"が見つかる。」をコンセプトに、直感的な操作で簡単にファッションとの出会いを提供します。

## 技術スタック

- **フロントエンド**: React Native (Expo), TypeScript, NativeWind
- **バックエンド**: Supabase (Auth, Database, Storage)
- **状態管理**: Zustand
- **ナビゲーション**: React Navigation
- **API連携**: LinkShare, 楽天アフィリエイト
- **ビルド・デプロイ**: Expo EAS

## 機能

- Yes/Noスワイプによる好みの学習
- タグベースの商品推薦アルゴリズム
- オンボーディングフロー（性別、スタイル傾向、年代）
- アフィリエイトリンク経由の購入フロー
- 好みの傾向可視化
- お気に入り管理機能
- ダークモード対応
- 多言語対応（日本語、英語）

## 開発環境のセットアップ

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/Stilya.git
cd Stilya

# 依存関係のインストール
npm install

# Expoの起動
npx expo start
```

## 環境変数の設定

`.env` ファイルを作成し、以下の環境変数を設定してください：

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
LINKSHARE_API_TOKEN=your_linkshare_token
LINKSHARE_MERCHANT_ID=your_merchant_id
RAKUTEN_APP_ID=your_rakuten_app_id
RAKUTEN_AFFILIATE_ID=your_rakuten_affiliate_id
SENTRY_AUTH_TOKEN=your_sentry_auth_token
```

## プロジェクト構造

```
src/
├── assets/          # 画像、フォント、アイコン
├── components/      # 再利用可能なコンポーネント
├── hooks/           # カスタムフック
├── navigation/      # ナビゲーション設定
├── screens/         # 画面コンポーネント
├── services/        # APIサービス
├── store/           # Zustand状態管理
├── types/           # TypeScript型定義
├── utils/           # ユーティリティ関数
└── locales/         # 多言語対応ファイル
```

## ビルドとデプロイ

```bash
# 開発ビルド
eas build --profile development --platform ios
eas build --profile development --platform android

# プレビュービルド
eas build --profile preview --platform ios
eas build --profile preview --platform android

# プロダクションビルド
eas build --profile production --platform ios
eas build --profile production --platform android

# ストア提出
eas submit --platform ios
eas submit --platform android
```

## ドキュメント

詳細なドキュメントは `docs/` ディレクトリに保存されています：

- [API ドキュメント](./docs/API_DOCUMENTATION.md)
- [コードドキュメントガイド](./docs/CODE_DOCUMENTATION_GUIDE.md)
- [ユーザーマニュアル (英語)](./docs/USER_MANUAL_EN.md)
- [ユーザーマニュアル (日本語)](./docs/USER_MANUAL_JA.md)
- [プライバシーポリシー](./docs/PRIVACY_POLICY.md)
- [利用規約](./docs/TERMS_OF_SERVICE.md)
- [リリースチェックリスト](./docs/RELEASE_CHECKLIST.md)

## 今後の展開

- CLIPベースの画像特徴量による推薦強化
- ユーザーコミュニティ機能
- スタイリスト連携機能
- サステナブルファッションの推進
- アプリ内購入機能

## ライセンス

プライベートプロジェクト - 無断での使用・複製・配布を禁止します。

## 問い合わせ

- メール: contact@stilya-app.com
- Webサイト: https://stilya-app.com
