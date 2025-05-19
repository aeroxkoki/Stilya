# Stilya - ファッション提案アプリ

![Build Status](https://github.com/aeroxkoki/Stilya/actions/workflows/build.yml/badge.svg)

## 概要

StiliyaはユーザーのファッションスタイルをスワイプUIで学習し、パーソナライズされたファッション提案を行うモバイルアプリです。Yes/Noスワイプで好みを収集し、タグベースの推薦エンジンと（将来的に）画像特徴量によるベクトル検索を組み合わせた提案を行います。

## 機能概要

- スワイプUIによる直感的なファッション嗜好の収集
- タグベースおよび画像特徴を活用した商品推薦
- アフィリエイト連携によるマネタイズ機能
- パーソナライズされたファッション傾向分析

## 開発環境のセットアップ

```bash
# リポジトリのクローン
git clone https://github.com/aeroxkoki/Stilya.git
cd Stilya

# 依存関係のインストールと初期設定
npm run setup

# 開発サーバーの起動
npm start
```

## プロジェクト構成

```
stilya/
├── src/              # ソースコード
│   ├── components/   # UIコンポーネント
│   ├── screens/      # 画面コンポーネント
│   ├── hooks/        # カスタムフック
│   ├── services/     # APIサービス
│   ├── store/        # 状態管理
│   ├── types/        # 型定義
│   └── utils/        # ユーティリティ関数
├── assets/           # 画像・フォントなどのアセット
├── scripts/          # 開発・ビルド補助スクリプト
├── .github/          # GitHub Actions設定
├── app.json          # Expoアプリ設定
├── eas.json          # EASビルド設定
├── metro.config.js   # Metro Bundler設定
└── package.json      # 依存関係とスクリプト
```

## ビルド方法

### EASビルド (推奨)

Expoの公式ビルドサービスを使用します：

```bash
# 開発用ビルド
npm run eas:build:dev

# プレビュービルド
npm run eas:build:preview

# 本番用ビルド
npm run eas:build:prod
```

### ローカルビルド (代替手段)

EASビルドに問題がある場合は、ローカルビルドを使用できます：

```bash
# ローカルでのAndroidビルド
npm run build:local
```

## パフォーマンス最適化

プロジェクトには以下のパフォーマンス最適化が組み込まれています：

### 1. Metro Bundler最適化

- キャッシング強化
- バンドルサイズ縮小
- トランスフォーム処理の効率化

### 2. バベル設定最適化

- 環境に応じた条件付きプラグイン
- 本番環境でのコンソールログ削除
- モジュール解決のエイリアス設定

### 3. パフォーマンスユーティリティ

パフォーマンスを向上させるユーティリティが `src/utils/performance` に用意されています：

```typescript
// メトリクス計測
import { startMeasure, endMeasure, measure, useRenderMeasure } from 'src/utils/performance';

// 効率的なリスト描画
import { optimizedListProps } from 'src/utils/performance';
<FlatList {...optimizedListProps} data={items} />

// メモリ管理
import { checkMemoryWarningLevel, forceCleanupMemory } from 'src/utils/performance';

// 画像最適化
import { getOptimizedImageUrl, clearImageCacheIfNeeded } from 'src/utils/imageUtils';

// メモ化ヘルパー
import { useComputedValue, useMemoizedCallback } from 'src/utils/performance';
```

### 4. ビルド環境に応じた最適化

- CI環境でのバンドル処理スキップ
- 開発・本番環境で異なる最適化設定

## EAS Build設定

ビルドを実行するには、GitHubリポジトリの「Settings > Secrets and Variables > Actions」にEXPO_TOKENを設定する必要があります：

```bash
# トークンの取得
eas login
eas token:create --name github-actions --non-interactive
```

新しくセットアップする場合は、以下のステップに従ってください：

1. `setup-eas.sh` スクリプトを実行してEASプロジェクトを初期化します：
   ```bash
   ./setup-eas.sh
   ```

2. GitHub リポジトリにトークンを登録します：
   - GitHub リポジトリページにアクセス
   - Settings > Secrets and Variables > Actions
   - 「New repository secret」をクリック
   - 名前に「EXPO_TOKEN」を入力
   - 値にEASトークンを入力（`eas token:create` で生成）
   - 「Add secret」をクリック

3. GitHub Actions ワークフローが設定されていることを確認します：
   - `.github/workflows/eas-build.yml` が存在すること
   - プッシュ時またはワークフロー手動実行で自動的にビルドが実行されます

この設定により、GitHub Actions を使って自動的に CI ビルドが実行されます。

## EASビルドの問題解決策

EASビルドで「Serializer did not return expected format」エラーが発生する場合は、以下の解決策を試してください：

### 解決策1: 環境変数の設定

```bash
# EAS_NO_METROフラグを使用してMetroを回避する
EAS_NO_METRO=true EXPO_NO_CACHE=true EAS_SKIP_JAVASCRIPT_BUNDLING=1 npx eas-cli build --platform android --profile ci
```

### 解決策2: ローカルビルドの使用

```bash
# ローカルビルドスクリプトを使用する（Metro不要）
npm run build:local
```

### 解決策3: Metro設定の最適化

```bash
# Metroキャッシュをクリアする
npm run clean

# Metro依存関係を修復する
npm run fix-metro
```

## トラブルシューティング

### よくあるエラー

1. **Metro Bundlerのシリアライズエラー**
   - 原因: EASビルドサーバーでのMetro Bundler処理
   - 解決: `EAS_NO_METRO=true`環境変数を設定、またはローカルビルドを使用

2. **依存関係の問題**
   - 原因: Metroのバージョン不整合
   - 解決: `npm run fix-metro`を実行

3. **ビルドエラー**
   - 原因: JavaScriptバンドル生成の問題
   - 解決: `EAS_SKIP_JAVASCRIPT_BUNDLING=1`を設定

## ライセンス

[MIT](LICENSE)
