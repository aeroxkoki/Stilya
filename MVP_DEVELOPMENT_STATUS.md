# Stilya MVP 開発状況レポート

## 📱 プロジェクト概要

**Stilya** - パーソナライズ型ファッション提案アプリ（MVP）

- スワイプUIで好みを学習
- AIがユーザーの好みに合った商品を推薦
- アフィリエイト連携による収益化

## 🚀 現在の開発状況

### ✅ 完了項目

1. **開発環境構築**
   - Expo SDK 53（Managed Workflow）
   - TypeScript + React Native
   - Supabase統合
   - iOS/Androidビルド環境

2. **プロジェクト構造**
   - コンポーネント分離
   - 画面遷移（React Navigation）
   - 状態管理（Zustand）
   - サービス層の実装

3. **基本機能実装**
   - 認証機能（メール認証）
   - スワイプUI
   - 商品表示
   - 推薦ロジック（タグベース）

### 🔄 進行中

- [ ] Supabase本番環境接続
- [ ] 商品データの本番API連携
- [ ] UIの最終調整
- [ ] パフォーマンス最適化

### 📋 TODO（優先順位順）

1. **Supabase設定**
   - プロジェクト作成
   - データベーススキーマ設定
   - 認証設定

2. **アフィリエイトAPI統合**
   - LinkShare API連携
   - 楽天API連携
   - 商品データ同期

3. **テスト・品質保証**
   - 単体テスト
   - 統合テスト
   - 実機テスト

## 🛠️ 開発方法

### iOS開発環境で起動

```bash
# 環境チェック
./check-ios-mvp.sh

# iOS開発サーバー起動
./start-ios-local.sh
```

### クイックスタート

```bash
# 依存関係インストール
npm install

# 環境変数設定
cp .env.example .env

# 開発サーバー起動
npm start
```

## 📊 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フロントエンド | React Native + TypeScript |
| フレームワーク | Expo SDK 53 |
| バックエンド | Supabase |
| 状態管理 | Zustand |
| UI | NativeWind (Tailwind CSS) |
| ナビゲーション | React Navigation |
| 認証 | Supabase Auth |
| データベース | PostgreSQL (Supabase) |
| API | RESTful + アフィリエイトAPI |

## 📁 ディレクトリ構成

```
Stilya/
├── src/
│   ├── components/    # UIコンポーネント
│   ├── screens/       # 画面
│   ├── navigation/    # ナビゲーション
│   ├── services/      # API・ロジック
│   ├── hooks/         # カスタムフック
│   ├── store/         # 状態管理
│   └── utils/         # ユーティリティ
├── assets/           # 画像・アイコン
├── docs/             # ドキュメント
└── scripts/          # ビルド・デプロイスクリプト
```

## 🎯 MVP目標

- **期限**: 2025年6月末
- **ユーザー数**: 100名（ベータテスト）
- **機能**: 基本的なスワイプ・推薦機能
- **収益**: アフィリエイト連携確立

## 📝 メモ

- Managed Workflowを維持（ネイティブコード不要）
- iOSローカルビルドで開発効率向上
- GitHub Actionsは本番環境用に準備済み

---

最終更新: 2025年5月26日
