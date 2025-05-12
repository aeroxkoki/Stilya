# Stilya - パーソナライズファッション提案アプリ

スワイプUIで好みを学習し、最適なファッションアイテムを提案するモバイルアプリ

## 概要

Stilyaは、ユーザーのファッションの好みをスワイプUIを通じて学習し、パーソナライズされた商品推薦を提供するモバイルアプリです。「スワイプで、あなたの"好き"が見つかる。」をコンセプトに、直感的な操作で簡単にファッションとの出会いを提供します。

## 技術スタック

- **フロントエンド**: React Native (Expo), TypeScript, NativeWind
- **バックエンド**: Supabase (Auth, Database, Storage)
- **状態管理**: Zustand
- **ナビゲーション**: React Navigation
- **API連携**: LinkShare, 楽天アフィリエイト (予定)

## 機能

- Yes/Noスワイプによる好みの学習
- タグベースの商品推薦アルゴリズム
- オンボーディングフロー（性別、スタイル傾向、年代）
- アフィリエイトリンク経由の購入フロー
- 好みの傾向可視化

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
└── utils/           # ユーティリティ関数
```

## 今後の展開

- CLIPベースの画像特徴量による推薦強化
- ユーザーコミュニティ機能
- スタイリスト連携機能
- サステナブルファッションの推進

## ライセンス

プライベートプロジェクト - 無断での使用・複製・配布を禁止します。
