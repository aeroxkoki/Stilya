# Stilya MVP 開発状況とテストガイド

## 現在の実装状況 ✅

### 基本構造
- ✅ React Native (Expo SDK 53) + TypeScript のプロジェクト構成
- ✅ Supabase統合（認証・データベース・ストレージ）
- ✅ 基本的なナビゲーション構造（React Navigation）
- ✅ 状態管理（Zustand）
- ✅ **Managed Workflow**（Expo推奨の構成）

### 実装済みの画面
1. **認証画面** (`src/screens/auth/`)
   - ログイン画面
   - 新規登録画面
   - パスワードリセット画面

2. **オンボーディング画面** (`src/screens/onboarding/`)
   - ウェルカム画面
   - 性別選択画面
   - 年齢層選択画面
   - スタイル選択画面

3. **メイン画面**
   - **スワイプ画面** (`src/screens/swipe/SwipeScreen.tsx`)
     - Tinder風のカードUI
     - Yes/Noボタン
     - 商品詳細へのナビゲーション
   
   - **商品詳細画面** (`src/screens/detail/ProductDetailScreen.tsx`)
     - 商品情報表示
     - アフィリエイトリンクへの遷移
     - お気に入り追加機能

   - **レコメンド画面** (`src/screens/recommend/`)
     - パーソナライズされた商品推薦
     - フィルター機能

   - **プロフィール画面** (`src/screens/profile/`)
     - ユーザー情報表示
     - スワイプ履歴
     - お気に入り一覧

### サービス層
- ✅ 認証サービス (`authService.ts`)
- ✅ 商品サービス (`productService.ts`)
- ✅ スワイプサービス (`swipeService.ts`)
- ✅ レコメンドサービス (`recommendationService.ts`)
- ✅ アフィリエイトサービス (`affiliate.ts`)

## セットアップ手順 🚀

### 1. 環境準備
```bash
# リポジトリのクローン（既に完了済み）
cd /Users/koki_air/Documents/GitHub/Stilya

# 依存関係のインストール
npm install
```

### 2. Supabaseの設定
1. [Supabase](https://supabase.com/)でプロジェクトを作成
2. `supabase/setup.sql`をSQL Editorで実行
3. `.env`ファイルを更新：
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_actual_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_actual_key
   ```

### 3. 開発サーバーの起動

#### Expo Go アプリで開発（推奨）
```bash
# Expo開発サーバーを起動
npm start

# 表示されるQRコードをExpo Goアプリでスキャン
```

#### Web ブラウザで確認
```bash
# Expo開発サーバーを起動
npm start

# ブラウザで開く（キーボードで 'w' を押す）
```

## テスト手順 🧪

### 1. ユーザー登録フロー
1. アプリ起動 → 新規登録画面へ
2. メールアドレスとパスワードで登録
3. オンボーディング画面を完了
   - 性別選択
   - 年齢層選択
   - スタイル選択（複数選択可）

### 2. スワイプ機能のテスト
1. ホーム画面（スワイプ画面）へ遷移
2. 商品カードが表示されることを確認
3. 左スワイプ（No）と右スワイプ（Yes）をテスト
4. アクションボタン（×と♥）でもスワイプできることを確認

### 3. 商品詳細とアフィリエイトリンク
1. 商品カードをタップして詳細画面へ
2. 商品情報が正しく表示されることを確認
3. 「購入する」ボタンでアフィリエイトリンクへ遷移

### 4. レコメンド機能
1. 数回スワイプ後、レコメンド画面へ
2. スワイプ結果に基づく推薦商品が表示されることを確認

### 5. プロフィール機能
1. プロフィール画面でユーザー情報を確認
2. スワイプ履歴が表示されることを確認
3. お気に入り商品が表示されることを確認

## 現在の開発環境 ⚡

- **ワークフロー**: Managed Workflow（Expo推奨）
- **開発方法**: Expo Go アプリ
- **利点**:
  - ネイティブコードの管理不要
  - OTA（Over-The-Air）更新が可能
  - 高速な開発サイクル
  - QRコードで即座にテスト可能

## 既知の問題と対応 ⚠️

### 1. Node.jsバージョン
- 現在：v23.10.0（新しすぎる可能性）
- 推奨：v20.x.x

### 2. 環境変数
- `.env`ファイルの変数には`EXPO_PUBLIC_`プレフィックスが必要

### 3. テストデータ
- `supabase/setup.sql`にサンプル商品データが含まれています
- 本番環境では実際のアフィリエイトAPIからデータを取得

## 次のステップ 📋

### MVP完成に向けて
1. ✅ 基本的なスワイプ機能
2. ✅ 商品詳細表示
3. ✅ アフィリエイトリンク遷移
4. ✅ 基本的なレコメンド機能
5. ⬜ LinkShare APIとの実際の連携
6. ⬜ 楽天APIとの実際の連携
7. ⬜ プッシュ通知の実装
8. ⬜ アナリティクスの実装

### 本番リリースに向けて
1. ⬜ EAS Buildでのビルド設定
2. ⬜ GitHub Actionsの設定
3. ⬜ App Store / Google Play への申請準備

## デバッグ用コマンド 🛠

```bash
# ログの確認
npm start

# TypeScriptエラーチェック
npm run type-check

# Lintチェック
npm run lint

# テスト実行
npm test

# キャッシュクリア
npm run clean

# 完全リセット
npm run reset
```

## お問い合わせ

開発に関する質問や問題がある場合は、GitHubのIssueを作成してください。