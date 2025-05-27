# iOS開発者向けクイックガイド

## 📱 即座に開発を始める

### 1. 初回セットアップ（5分）
```bash
# リポジトリのクローン
git clone https://github.com/aeroxkoki/Stilya.git
cd Stilya

# 依存関係のインストール
npm install

# iOSの依存関係をインストール
cd ios && pod install && cd ..
```

### 2. アプリの起動

#### 方法A: シンプルな起動（推奨）
```bash
# 作成済みのスクリプトを使用
./start-app.sh
```

#### 方法B: 手動で起動
```bash
# Metroバンドラーを起動
npx expo start --clear

# 別のターミナルで、またはExpoコンソールで'i'を押してiOSシミュレーターを起動
```

### 3. 接続エラーが発生した場合
```bash
# エラー修正スクリプトを実行
./enhanced-metro-fix.sh
```

## ⚠️ 重要な注意事項

### グローバルexpo-cliについて
グローバルのexpo-cliは非推奨になりました。すべてのコマンドで`npx expo`を使用してください：

```bash
# ❌ 古い方法（使わないでください）
expo start

# ✅ 新しい方法（これを使用）
npx expo start
```

グローバルexpo-cliを削除するには：
```bash
npm uninstall -g expo-cli
```

## 🔧 トラブルシューティング

### 問題: Metro bundlerに接続できない
```
Could not connect to development server.
```

**解決方法:**
1. `./enhanced-metro-fix.sh`を実行
2. シミュレーターからアプリを削除して再インストール
3. それでも解決しない場合は、`npx expo run:ios`を実行

### 問題: 依存関係の不一致警告
```
Some dependencies are incompatible with the installed expo package version
```

**解決方法:**
```bash
npx expo doctor --fix-dependencies
```

## 📂 プロジェクト構成

```
Stilya/
├── src/               # ソースコード
│   ├── components/    # UIコンポーネント
│   ├── screens/       # 画面コンポーネント
│   ├── services/      # APIサービス
│   └── hooks/         # カスタムフック
├── ios/              # iOSネイティブコード
├── android/          # Androidネイティブコード
└── assets/           # 画像、フォントなど
```

## 🚀 利用可能なコマンド

```bash
# 開発サーバーの起動
npm start

# iOSシミュレーターで起動
npm run start:ios

# テストの実行
npm test

# Lintの実行
npm run lint

# 型チェック
npm run type-check

# キャッシュのクリア
npm run clean
```

## 📝 開発のヒント

1. **Fast Refresh**: コードを保存すると自動的にアプリがリロードされます
2. **デバッグ**: Cmd+D（iOS）でデバッグメニューを開けます
3. **ログ**: `console.log`の出力はターミナルに表示されます

## 🤝 コントリビューション

1. 機能ブランチを作成: `git checkout -b feature/amazing-feature`
2. 変更をコミット: `git commit -m 'feat: Add amazing feature'`
3. プッシュ: `git push origin feature/amazing-feature`
4. プルリクエストを作成

## 📞 サポート

問題が発生した場合は、GitHubのIssuesで報告してください。
