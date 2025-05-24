# Stilya - ファッション提案アプリ

![Build Status](https://github.com/aeroxkoki/Stilya/actions/workflows/build.yml/badge.svg)

## 概要

StilyaはユーザーのファッションスタイルをスワイプUIで学習し、パーソナライズされたファッション提案を行うモバイルアプリです。Yes/Noスワイプで好みを収集し、タグベースの推薦エンジンと（将来的に）画像特徴量によるベクトル検索を組み合わせた提案を行います。

## 技術スタック

- **フレームワーク**: Expo SDK 53 (Managed Workflow)
- **言語**: TypeScript
- **モバイル**: React Native
- **バックエンド**: Supabase
- **ビルド**: EAS Build (クラウド)
- **CI/CD**: GitHub Actions

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

# 依存関係のインストール
npm install

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

### テスト実行方法

テストを実行するには、以下のコマンドを使用します：

```bash
# Jest テストを実行
npm test

# 特定のテストファイルを実行
npm run test:basic        # 基本テスト
npm run test:authstore    # 認証ストアテスト

# uuid の問題を修正した上でテストを実行
npm run test:fix-uuid     # パッチ適用後にテストを実行
```

Jest テストの実行中に `Identifier 'uuid' has already been declared` エラーが発生した場合は、`test:fix-uuid` コマンドを使用してください。
詳細な解決方法については [TEST_FIX.md](TEST_FIX.md) を参照してください。

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

## EAS GitHub Actions のトラブルシューティング

GitHub Actions で EAS ビルドが失敗する場合は、以下の解決策を試してください：

### 解決策: owner プロパティの設定

エラー `The "owner" manifest property is required when using robot users` が発生した場合：

1. app.json に owner フィールドを追加：
   ```json
   {
     "expo": {
       "owner": "あなたのExpoユーザー名",
       // 他の設定...
     }
   }
   ```

2. 提供されている修正スクリプトを実行：
   ```bash
   # 設定修正スクリプトを実行
   chmod +x ./scripts/fix-eas-github-actions.sh
   ./scripts/fix-eas-github-actions.sh
   
   # 変更をプッシュ
   ./scripts/push-eas-fixes.sh
   ```

### EAS 関連の環境変数

GitHubアクションでEASビルドを正しく実行するには以下の環境変数が必要です：

- `EAS_SKIP_JAVASCRIPT_BUNDLING=1`: JavaScriptのバンドルをスキップ
- `NODE_OPTIONS="--max-old-space-size=4096"`: Node.jsのメモリ制限を増やす

これらの設定は最新の修正で自動的に適用されます。

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

4. **Jestテストの`uuid`エラー**
   - 原因: jest-expoモジュールでのuuid競合
   - 解決: `npm run test:fix-uuid`を実行してパッチを適用
   - 詳細: [TEST_FIX.md](TEST_FIX.md)参照

## ライセンス

[MIT](LICENSE)
# Metro互換性問題修正

## GitHub ActionsでExpo SDK 53ビルド問題の修正方法

Expo SDK 53 + React Native 0.79を使用したプロジェクトでGitHub Actionsを使用する場合、以下の修正を適用しました。

### 主な修正と最適化

1. **Metro依存関係のバージョン統一**
   - `metro-*` パッケージを全て 0.77.0 に統一
   - `@expo/metro-config` を 0.9.0 に固定
   - `@babel/runtime` を 7.27.1 に固定

2. **TerminalReporterモジュールの互換性対応**
   - Metro's TerminalReporterクラスの互換実装を自動生成
   - Expoの内部依存パスへのリンク作成
   - metro-coreモジュールの互換実装追加

3. **EASビルド最適化フラグの追加**
   - `EAS_SKIP_JAVASCRIPT_BUNDLING=1`
   - `METRO_FORCE_NODE_MODULE_RESOLUTION=1`
   - `EXPO_NO_CACHE=1`
   - `EXPO_NO_DOTENV=1`

4. **最適化されたメトロ設定**
   - シリアライザー問題に対応するカスタム設定
   - リゾルバパスの最適化
   - ヒエラルキー検索の無効化でモジュール解決を高速化

### ローカルでのビルド方法

```bash
# 依存関係のクリーンインストール
npm ci

# メトロ互換性スクリプト実行
npm run fix:metro-all

# ローカルビルド実行
npm run build:fixed:final
```

### GitHub Actionsでのビルド成功

最新のGitHub Actionsワークフローでは、先述の修正がすべて適用されています。修正点の詳細は以下の構成ファイルで確認できます：

- `.github/workflows/build.yml` - CI/CDワークフロー
- `scripts/fix-github-actions-metro.sh` - Metro/TerminalReporter修正
- `eas.json` - EASビルド設定

### テスト問題の修正

テスト実行時に発生していた「uuid」関連の問題を修正するスクリプトも追加しました：

```bash
# テスト環境の修正と実行
npm run test:fix-uuid
npm test
```

## 開発者向けの推奨事項

1. **新規インストール時**
   ```bash
   npm ci
   npm run fix:metro-all
   ```

2. **ローカルビルドの実行**
   ```bash
   # 最適化されたローカルビルド
   npm run build:fixed:final
   ```

3. **GitHub Actions確認方法**
   ```bash
   # テスト用ワークフロー実行
   npm run test:github-actions
   
   # 変更をプッシュしてGitHub Actionsを実行
   git add .
   git commit -m "Fix: GitHub Actions compatibility with Expo SDK 53"
   git push
   ```

## トラブルシューティング

問題が解決しない場合は、以下の手順を試してください:

1. **依存関係の再構築**
   ```bash
   rm -rf node_modules
   npm ci
   npm run fix-metro
   npm run create-terminal-reporter
   ```

2. **エミュレータでのテスト**
   ```bash
   # 開発ビルド実行
   npm run android
   ```

3. **バイナリのローカル生成**
   ```bash
   npm run build:fixed:final
   # 出力: ./dist/stilya-release.apk
   ```
