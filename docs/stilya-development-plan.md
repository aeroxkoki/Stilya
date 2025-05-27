# Stilya アプリ開発計画書

## プロジェクト概要

**アプリ名**: Stilya  
**タイプ**: モバイルアプリ（iOS / Android）  
**フレームワーク**: React Native（Expo）  
**使用言語**: TypeScript  
**バックエンド**: Supabase（Auth / DB / Storage）  
**目的**: Yes/No スワイプでファッションの好みを学習・最適なアイテムを提案  
**収益化**: アフィリエイトリンク経由の報酬（LinkShare API活用）

## 技術スタック（確定）

### フロントエンド
- **UI/UX**: React Native (Expo SDK 51)
- **言語**: TypeScript 5.3+
- **スタイリング**: NativeWind (Tailwind互換)
- **状態管理**: Zustand
- **ナビゲーション**: React Navigation v6
- **アイコン**: Phosphor Icons / React Native Vector Icons

### バックエンド
- **DB/認証**: Supabase
- **HTTP通信**: Axios
- **画像処理**: Expo Image
- **ストレージ**: Supabase Storage

### 開発環境
- **IDE**: VSCode
- **バージョン管理**: Git (GitHub)
- **パッケージ管理**: yarn
- **ビルド/リリース**: Expo EAS

## 開発スケジュール（6週間）

### フェーズ0: 準備・環境構築（5日間）

#### Day 1: プロジェクト初期化と環境構築
- Expoプロジェクト作成と基本設定
- TypeScript設定
- GitHubリポジトリ設定
- 開発環境の構築（ESLint, Prettier）
- 必要なライブラリのインストール

#### Day 2: UI基盤構築とSupabase連携
- NativeWindの設定
- テーマ定義（カラー、フォント、スペーシング）
- Supabaseプロジェクト作成
- 認証設定

#### Day 3: データベース設計と実装
- Supabaseテーブル設計:
  - users
  - products
  - swipes
  - favorites
- テストデータ投入
- RLS（Row Level Security）設定

#### Day 4: API接続の実装
- Supabase API接続クライアント設定
- LinkShare/楽天アフィリエイトAPI接続テスト
- APIヘルパー関数のセットアップ

#### Day 5: ナビゲーション構造の実装
- React Navigation設定
- 画面遷移図に基づくルーティング実装
- 認証フローの実装（ログイン/未ログイン状態の分岐）

### フェーズ1: 認証・オンボーディング機能（6日間）

#### Day 6: 認証画面UI実装
- ログイン画面UI
- サインアップ画面UI
- パスワードリセット画面UI

#### Day 7: 認証ロジック実装
- メール認証機能
- エラーハンドリング
- トークン管理
- ユーザー状態の保持

#### Day 8: オンボーディング画面（1）
- ウェルカム画面
- アプリ説明スライダー
- 性別選択画面

#### Day 9: オンボーディング画面（2）
- スタイル好み選択画面
- 年代選択画面
- 初期設定完了画面

#### Day 10: オンボーディングロジック実装
- ユーザープロファイル保存
- 初期設定完了フラグ管理
- オンボーディングスキップ機能

#### Day 11: テストとリファクタリング
- 認証フローテスト
- オンボーディングフローテスト
- エッジケース対応
- UIの微調整

### フェーズ2: スワイプ機能・商品表示（8日間）

#### Day 12: スワイプUI基盤実装
- スワイプカードコンポーネント設計
- アニメーション設定
- ジェスチャーハンドリング基本実装

#### Day 13: 商品カードUIの実装
- 商品カードデザイン
- 画像、ブランド、価格表示
- タグ表示コンポーネント

#### Day 14: スワイプロジック実装
- 左右スワイプ検出
- Yes/No判定ロジック
- スワイプ結果保存機能

#### Day 15: 商品データフェッチング
- 商品一覧取得API実装
- 商品データキャッシュ
- ローディング状態管理

#### Day 16: インフィニットスワイプの実装
- 次の商品ロード機能
- スワイプ履歴の管理
- 商品ページネーション

#### Day 17: スワイプ結果の保存と同期
- スワイプ結果のSupabaseへの保存
- オフライン対応
- 同期エラーハンドリング

#### Day 18: 商品詳細画面の実装
- 詳細画面UI
- 商品情報の表示
- 「購入する」ボタンと外部リンク遷移

#### Day 19: テストとパフォーマンス最適化
- スワイプUI動作テスト
- データロード最適化
- 画像キャッシュ設定
- エッジケース対応

### フェーズ3: レコメンデーション機能（7日間）

#### Day 20: 好み学習基盤の設計
- タグベース推薦アルゴリズム設計
- ユーザースワイプ履歴分析ロジック
- 嗜好スコア計算ロジック

#### Day 21: レコメンドAPI実装
- おすすめ商品取得API
- タグマッチングロジック
- スコアリングシステム実装

#### Day 22: レコメンド画面UI実装
- おすすめ商品一覧画面
- おすすめカテゴリ表示
- フィルタリングUI

#### Day 23: レコメンド詳細実装
- 「あなたへのおすすめ理由」表示
- 類似商品検索機能
- スタイルタイプ表示

#### Day 24: スタイル診断結果画面
- スタイル分析結果UI
- 嗜好傾向グラフ表示
- おすすめスタイルTips表示

#### Day 25: パーソナライズ機能強化
- ユーザー行動に基づく重み付け調整
- 閲覧履歴反映機能
- おすすめフィードの多様化

#### Day 26: テストとチューニング
- レコメンド精度テスト
- パフォーマンステスト
- エッジケース対応

### フェーズ4: マイページと履歴機能（4日間）

#### Day 27: マイページUI実装
- プロファイル表示
- 設定画面
- お気に入り一覧

#### Day 28: スワイプ履歴画面実装
- スワイプ履歴表示UI
- フィルタリング機能
- ページネーション

#### Day 29: お気に入り機能実装
- お気に入り追加/削除機能
- お気に入り商品表示
- お気に入り管理

#### Day 30: 設定・プロファイル管理機能
- ユーザー設定更新
- 通知設定
- プライバシー設定
- ログアウト機能

### フェーズ5: アフィリエイト連携とアナリティクス（3日間）

#### Day 31: アフィリエイト遷移実装
- 外部ECサイト遷移機能
- クリックログ記録
- ディープリンク対応

#### Day 32: アナリティクス実装
- ユーザー行動トラッキング
- イベント記録
- コンバージョントラッキング

#### Day 33: レポート機能実装
- 使用状況ダッシュボード
- クリック率/コンバージョン率表示
- トレンド分析

### フェーズ6: 最終調整・テスト・リリース準備（7日間）

#### Day 34: UI/UXの最終調整
- 全画面のデザイン調整
- アニメーション最適化
- ダークモード対応

#### Day 35: パフォーマンスチューニング
- メモリ使用量最適化
- バンドルサイズ最適化
- 起動時間の改善

#### Day 36: エラーハンドリング強化
- グローバルエラーハンドリング
- オフライン対応の強化
- エラーメッセージの改善

#### Day 37: 機能テスト
- ユーザーフロー全体テスト
- エッジケースの確認
- デバイス互換性テスト

#### Day 38: バグ修正
- 発見された問題の修正
- クラッシュ対応
- UIバグ修正

#### Day 39: ドキュメント作成
- APIドキュメント更新
- コード文書化
- 操作マニュアル作成

#### Day 40: ストアリリース準備
- App Store / Google Play設定
- アプリアイコン・スクリーンショット準備
- プライバシーポリシー・利用規約作成
- Expo EASビルド設定

## 実装詳細

### データベース設計

```sql
-- users テーブル
create table users (
  id uuid references auth.users primary key,
  email text unique not null,
  created_at timestamp with time zone default now(),
  gender text,
  style_preference text[],
  age_group text
);

-- products テーブル
create table products (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  image_url text not null,
  brand text,
  price numeric not null,
  tags text[],
  category text,
  affiliate_url text not null,
  source text,
  created_at timestamp with time zone default now()
);

-- swipes テーブル
create table swipes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) not null,
  product_id uuid references products(id) not null,
  result text check (result in ('yes', 'no')) not null,
  created_at timestamp with time zone default now()
);

-- favorites テーブル
create table favorites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) not null,
  product_id uuid references products(id) not null,
  created_at timestamp with time zone default now(),
  unique(user_id, product_id)
);

-- click_logs テーブル
create table click_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) not null,
  product_id uuid references products(id) not null,
  created_at timestamp with time zone default now()
);
```

### サービス構成図

```
[モバイルアプリ (React Native + Expo)]
        ↓ ↑
        HTTP/HTTPS
        ↓ ↑
[Supabase]
  ├── Auth Service (認証)
  ├── Database (PostgreSQL)
  ├── Storage (画像保存)
  └── Edge Functions (API連携)
        ↓ ↑
        HTTP/HTTPS
        ↓ ↑
[外部API]
  ├── LinkShare API (商品データ)
  ├── 楽天アフィリエイトAPI
  └── その他ECサイトAPI
```

### アプリケーション構造

```
src/
├── assets/          # 画像、フォント、アイコン
├── components/      # 再利用可能なコンポーネント
│   ├── common/      # ボタン、カード、ローディングなど
│   ├── auth/        # 認証関連コンポーネント
│   ├── swipe/       # スワイプUI関連
│   └── recommend/   # レコメンド表示関連
├── hooks/           # カスタムフック
├── navigation/      # ナビゲーション設定
├── screens/         # 画面コンポーネント
│   ├── auth/        # 認証画面
│   ├── onboarding/  # 初期設定画面
│   ├── swipe/       # スワイプメイン画面
│   ├── recommend/   # レコメンド画面
│   ├── detail/      # 商品詳細画面
│   └── profile/     # マイページ関連画面
├── services/        # APIサービス
│   ├── supabase.ts  # Supabase接続
│   ├── product.ts   # 商品関連API
│   ├── user.ts      # ユーザー関連API
│   └── affiliate.ts # アフィリエイト関連API
├── store/           # Zustand状態管理
├── types/           # TypeScript型定義
├── utils/           # ユーティリティ関数
└── App.tsx          # アプリケーションルート
```

## 注意点と追加情報

### 開発環境設定

1. **初期設定**:
   ```bash
   # Expoプロジェクト作成
   npx create-expo-app -t expo-template-blank-typescript stilya
   cd stilya
   
   # 必要なライブラリのインストール
   yarn add @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
   yarn add zustand @supabase/supabase-js
   yarn add nativewind
   yarn add -D tailwindcss
   
   # NativeWindの設定
   npx tailwindcss init
   ```

2. **Tailwind設定ファイル**:
   ```js
   // tailwind.config.js
   module.exports = {
     content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
     theme: {
       extend: {
         colors: {
           primary: '#3B82F6',
           // その他のカスタムカラー
         },
       },
     },
     plugins: [],
   }
   ```

3. **babel.config.js**:
   ```js
   module.exports = function(api) {
     api.cache(true);
     return {
       presets: ['babel-preset-expo'],
       plugins: ["nativewind/babel"],
     };
   };
   ```

### 将来的な拡張性

1. **CLIP画像特徴ベース推薦**:
   - MVPではタグベースの推薦から開始
   - 将来的にTensorFlow.js + CLIPモデルの軽量版を導入可能なように設計

2. **バッチ処理のための準備**:
   - 商品データ取得は将来的にCronジョブ化を視野
   - Supabase Edge Functions利用を前提とした実装

3. **ソーシャル機能**:
   - 将来的なシェア機能を見据えたデータ構造
   - 友達の好みを参照する機能の追加可能性

### セキュリティ考慮事項

1. **認証セキュリティ**:
   - JWTトークンの安全な管理
   - Expo SecureStoreの使用

2. **データ保護**:
   - Supabase RLSを活用したアクセス制御
   - センシティブ情報の最小限の収集

3. **APIセキュリティ**:
   - アフィリエイトAPIキーのサーバサイド管理
   - レート制限の実装

### テスト計画

1. **ユニットテスト**:
   - 主要ロジック（特に推薦アルゴリズム）のテスト

2. **UI/UXテスト**:
   - スワイプ動作のスムーズさ確認
   - ユーザーフローの一貫性

3. **パフォーマンステスト**:
   - 画像ロード最適化
   - メモリ使用量モニタリング

4. **ユーザビリティテスト**:
   - 初期ユーザー10名でのクローズドテスト
   - フィードバック収集と迅速な改善サイクル
