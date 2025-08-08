# Stilya Project Architecture

## 📱 アプリケーション概要

**Stilya**は、ユーザーの好みを学習してパーソナライズされたファッションアイテムを提案するモバイルアプリケーションです。

## 🏗 技術スタック

### フロントエンド
- **React Native** (0.79.2) + **Expo SDK 53**
- **TypeScript** (5.3.0)
- **React Navigation** v6
- **Expo Image** - 最適化された画像表示
- **React Native Reanimated** - スムーズなアニメーション

### バックエンド
- **Supabase** 
  - PostgreSQL データベース
  - 認証システム (Auth)
  - リアルタイムサブスクリプション
  - Storage（画像管理）

### 外部API
- **楽天API** - 商品データ取得
- **LinkShare** - アフィリエイト連携

## 📁 ディレクトリ構造

```
Stilya/
├── src/
│   ├── components/      # 再利用可能なUIコンポーネント
│   │   ├── common/      # 汎用コンポーネント
│   │   ├── swipe/       # スワイプ機能関連
│   │   ├── recommend/   # レコメンド関連
│   │   └── onboarding/  # オンボーディング関連
│   ├── screens/         # 画面コンポーネント
│   │   ├── auth/        # 認証画面
│   │   ├── swipe/       # スワイプ画面
│   │   ├── recommend/   # レコメンド画面
│   │   ├── profile/     # プロフィール関連
│   │   └── onboarding/  # オンボーディング画面
│   ├── navigation/      # ナビゲーション設定
│   ├── services/        # APIとビジネスロジック
│   ├── hooks/           # カスタムフック
│   ├── utils/           # ユーティリティ関数
│   ├── types/           # TypeScript型定義
│   ├── contexts/        # React Context
│   └── constants/       # 定数定義
├── assets/              # 画像・フォントなどの静的ファイル
├── scripts/             # ユーティリティスクリプト
└── docs/                # ドキュメント
```

## 🔄 データフロー

```
ユーザー操作
    ↓
React Componentss
    ↓
Custom Hooks / Context
    ↓
Services Layer
    ↓
Supabase / External APIs
    ↓
PostgreSQL Database
```

## 🗄 データベース設計

### 主要テーブル

#### users
- `id` (uuid, PK)
- `email` (text, unique)
- `created_at` (timestamp)

#### products
- `id` (uuid, PK)
- `item_code` (text, unique)
- `name` (text)
- `brand` (text)
- `price` (numeric)
- `image_url` (text)
- `affiliate_url` (text)
- `tags` (text[])
- `category` (text)

#### swipes
- `id` (uuid, PK)
- `user_id` (uuid, FK)
- `product_id` (uuid, FK)
- `result` (text: 'yes'/'no')
- `created_at` (timestamp)

#### favorites
- `id` (uuid, PK)
- `user_id` (uuid, FK)
- `product_id` (uuid, FK)
- `created_at` (timestamp)

#### user_preferences
- `id` (uuid, PK)
- `user_id` (uuid, FK)
- `gender` (text)
- `age_group` (text)
- `style_tags` (text[])

## 🎯 主要機能

### 1. 認証システム
- Supabase Authを使用
- メール/パスワード認証
- セッション管理

### 2. オンボーディング
- 性別・年齢選択
- スタイル診断
- チュートリアル

### 3. スワイプ機能
- Tinder風カードUI
- Yes/No判定
- ハプティックフィードバック
- スワイプ履歴保存

### 4. レコメンデーション
- タグベース推薦（MVP）
- 人気度スコアリング
- パーソナライズ度計算

### 5. 商品管理
- 楽天API連携
- 画像キャッシュ
- アフィリエイトリンク管理

## 🚀 デプロイメント

### 開発環境
```bash
npm install
npm run start:expo-go
```

### ビルド
```bash
# プレビュー版
npm run eas-build-preview

# 本番版
npm run eas-build-production
```

### CI/CD
- GitHub Actions
- EAS Build
- 自動テスト実行

## 🔐 セキュリティ

- 環境変数による秘密情報管理
- Row Level Security (RLS)
- APIキーの適切な管理
- HTTPSによる通信

## 📊 パフォーマンス最適化

### 画像最適化
- Expo Imageによる最適化
- Progressive Loading
- キャッシュ戦略

### データ取得
- ページネーション
- 遅延ローディング
- キャッシュ活用

### メモリ管理
- コンポーネントの適切なアンマウント
- 大量データの仮想化
- メモリリーク防止

## 🔧 開発ツール

- **ESLint** - コード品質
- **Prettier** - コードフォーマット
- **TypeScript** - 型安全性
- **Expo DevTools** - デバッグ

## 📈 モニタリング

- Supabase Dashboard
- EAS Analytics
- カスタムロギング

## 🎯 今後の拡張計画

1. **機械学習レコメンデーション**
   - CLIPモデル導入
   - 画像特徴量ベース推薦

2. **ソーシャル機能**
   - フォロー/フォロワー
   - コーディネート共有

3. **決済機能**
   - アプリ内購入
   - サブスクリプション

4. **AR試着機能**
   - バーチャル試着
   - サイズ推定

## 📝 メンテナンス

- 定期的な依存関係更新
- データベース最適化
- パフォーマンスモニタリング
- ユーザーフィードバック対応
