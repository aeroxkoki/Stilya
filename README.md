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
git clone https://github.com/aeroxkoki/Stilya.git
cd Stilya

# 依存関係のインストール（推奨方法）
yarn

# または、問題が発生した場合は修復スクリプトを使用
yarn fix-deps
# または
npm run fix-deps

# 環境変数ファイルの作成
cp .env.example .env
# .envファイルを編集して実際の値を設定

# Expoの起動
yarn start
# または
npm run start
```

### 依存関係エラーの解決

`yarn install --frozen-lockfile` でエラーが発生した場合は、次の方法で解決できます：

1. 既存の yarn.lock を削除: `rm yarn.lock`
2. 通常の方法でインストール: `yarn install`（--frozen-lockfile フラグなし）
3. または修復スクリプトを使用: `yarn fix-deps`

これにより、依存関係が正しくインストールされ、新しい yarn.lock ファイルが生成されます。


## Supabaseのセットアップ

1. **プロジェクト作成**:
   - [Supabase](https://app.supabase.com/)でアカウント作成
   - 新規プロジェクト「Stilya」作成
   - データベースパスワードを安全に保管

2. **SQL実行**:
   - プロジェクト作成後、ダッシュボードの「SQL Editor」を開く
   - `supabase/migrations/20250512201534_create_product_tables.sql`ファイルの内容を実行
   - `supabase/migrations/create_view_logs.sql`ファイルの内容を実行

3. **認証設定**:
   - 「Authentication」→「Providers」→「Email」プロバイダーが有効か確認
   - 「URL Configuration」で「Site URL」を設定（開発中はExpoのURL: `exp://192.168.X.X:19000`）
   - 「Redirect URLs」に`exp://192.168.X.X:19000/auth/callback`を追加

4. **APIキーの取得**:
   - 「Project Settings」→「API」からプロジェクトURLとanon/publicキーを取得
   - これらの値を`.env`ファイルに設定

5. **テストデータの追加**:
   ```sql
   -- テスト商品データの追加
   INSERT INTO products (title, brand, price, image_url, description, tags, category, affiliate_url, source)
   VALUES 
   ('ベーシックTシャツ', 'Simple', 2500, 'https://source.unsplash.com/random/500x600/?tshirt', 'シンプルなデザインの白Tシャツ', ARRAY['カジュアル', '白', 'ベーシック'], 'トップス', 'https://example.com/product1', 'テストデータ'),
   ('スリムジーンズ', 'Denim Co.', 8500, 'https://source.unsplash.com/random/500x600/?jeans', 'スリムフィットのデニムパンツ', ARRAY['カジュアル', '青', 'デニム'], 'ボトムス', 'https://example.com/product2', 'テストデータ');
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

## ブランチ戦略とGitHub運用

```
# ブランチ構成
- main: 本番リリース用ブランチ
- develop: 開発統合ブランチ
- feature/xxx: 機能開発ブランチ（例: feature/swipe-ui）
- bugfix/xxx: バグ修正ブランチ
- release/x.x.x: リリース準備ブランチ

# コミットメッセージ規則
- feat: 新機能追加
- fix: バグ修正
- docs: ドキュメント更新
- style: コードスタイル変更（ロジック変更なし）
- refactor: リファクタリング
- perf: パフォーマンス改善
- test: テスト追加/修正
- chore: ビルド設定など
```

## 実装ステータス

## 設定済み
- ✅ 環境構築（React Native, Expo, TypeScript, Supabase連携）
- ✅ Supabase接続情報の設定（.envファイル）
- ✅ テスト用データスクリプトの作成
- ✅ GitHub Actions自動ビルド設定

## 実装予定
- 🔲 Supabaseへのマイグレーションの適用（テーブル作成）
- 🔲 テスト商品データの登録
- 🔲 スワイプUIの動作確認
- 🔲 ユーザー認証機能の実装と確認
- 🔲 商品レコメンド機能の実装
- 🔲 オフライン対応の確認
- 🔲 アフィリエイト連携の実装

## 次のステップ
1. Supabaseダッシュボードで以下のSQLを実行：
   - `/supabase/migrations/20250512201534_create_product_tables.sql`
   - `/supabase/migrations/sample_products.sql`
2. アプリを起動して接続テスト：`npm run start`
3. 基本機能の動作確認（認証、スワイプ、レコメンド）

## ビルドとデプロイ

### 手動ビルド

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

### GitHub Actions による自動ビルド

このリポジトリではGitHub Actionsを使用して、コードのプッシュ時に自動的にビルドが実行されます。

- `main`ブランチへのプッシュ: プロダクションビルド（iOS/Android）が自動実行
- `develop`ブランチへのプッシュ: プレビュービルド（Android）が自動実行
- プルリクエスト: ESLintとJestテストが自動実行

詳細な設定方法については、[GitHub Actions セットアップガイド](./docs/GITHUB_ACTIONS_SETUP.md)を参照してください。

## ドキュメント

詳細なドキュメントは `docs/` ディレクトリに保存されています：

- [API ドキュメント](./docs/API_DOCUMENTATION.md)
- [コードドキュメントガイド](./docs/CODE_DOCUMENTATION_GUIDE.md)
- [GitHub Actions セットアップガイド](./docs/GITHUB_ACTIONS_SETUP.md)
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
