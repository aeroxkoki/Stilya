# EAS Build 制限への対処方法

このドキュメントは、EAS Freeプランのビルド制限に達した場合の対処方法を説明します。

## 問題の状況

EAS Freeプランでは、月間のビルド回数に制限があります。制限に達すると以下のエラーが表示されます：

```
This account has used its builds from the Free plan this month, which will reset in X days
```

## 対処方法

### 1. ローカルビルドの使用（推奨）

ローカルマシンでビルドを実行することで、EASのビルド制限を回避できます。

#### 準備

1. **Java Development Kit (JDK) 17以上のインストール**
   ```bash
   # macOSの場合
   brew install openjdk@17
   
   # 環境変数の設定
   export JAVA_HOME=$(/usr/libexec/java_home -v 17)
   ```

2. **Android SDKのセットアップ**
   - Android Studioをインストール（推奨）
   - または、コマンドラインツールのみをインストール

#### ビルドの実行

```bash
# 用意されたスクリプトを使用
./build-android-local.sh

# または直接実行
npx eas build --platform android --profile preview --local
```

### 2. GitHub Actions経由でのビルド

リポジトリにプッシュすることで、GitHub Actions経由でビルドを実行できます。

```bash
# developブランチにプッシュ（Preview版）
git push origin develop

# mainブランチにプッシュ（本番版）
git push origin main
```

### 3. Expo Goアプリでの開発

開発中はExpo Goアプリを使用してテストすることで、ビルドの必要性を減らせます。

```bash
# 開発サーバーの起動
npm start

# QRコードをスキャンしてExpo Goアプリで確認
```

## ローカルビルドのトラブルシューティング

### メモリ不足エラー

```bash
# Node.jsのメモリ制限を増やす
export NODE_OPTIONS="--max-old-space-size=8192"
```

### ビルドキャッシュの問題

```bash
# キャッシュをクリア
rm -rf .expo/cache .metro-cache node_modules/.cache
npm run clean
```

### Java環境の問題

```bash
# Javaバージョンの確認
java -version

# 正しいJavaバージョンを使用
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
```

## ビルド成果物

ローカルビルドの成果物は以下の場所に生成されます：

- **APKファイル**: プロジェクトルート直下
- **ファイル名**: `build-[タイムスタンプ].apk`

## 推奨事項

1. **開発中**: Expo Goアプリを使用
2. **内部テスト**: ローカルビルドを使用
3. **本番リリース**: GitHub Actions経由でビルド
4. **頻繁なビルドが必要な場合**: EASの有料プランを検討

## EAS有料プランの利点

- 無制限のビルド
- 優先的なビルドキュー
- より長いビルドタイムアウト
- 並行ビルドのサポート

詳細: https://expo.dev/pricing

## 関連ドキュメント

- [KEYSTORE_SETUP.md](./KEYSTORE_SETUP.md) - キーストアの設定方法
- [GitHub Actions ワークフロー](./.github/workflows/build.yml) - CI/CD設定
- [Expo公式ドキュメント](https://docs.expo.dev/build/introduction/)
