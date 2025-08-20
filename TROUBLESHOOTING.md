# Stilya トラブルシューティングガイド

## よくあるエラーと解決方法

### 1. TypeError: Cannot read property 'S' of undefined

**症状:**
```
TypeError: Cannot read property 'S' of undefined, js engine: hermes
```

**原因:**
- モジュールの不適切な読み込み
- パッケージの依存関係の問題
- New Architectureとの互換性問題

**解決方法:**
1. キャッシュをクリアして再インストール
```bash
rm -rf node_modules .expo
npm install
npx expo start --clear
```

2. app.config.jsにNew Architecture設定を追加
```javascript
newArchEnabled: true,
```

3. 動的インポートを使用して安全に読み込む
```javascript
const module = await import('./module');
```

### 2. React Native's New Architecture警告

**症状:**
```
React Native's New Architecture is always enabled in Expo Go, but it is not explicitly enabled in your project's app config.
```

**解決方法:**
app.config.jsに以下を追加:
```javascript
expo: {
  newArchEnabled: true,
  // ...
}
```

### 3. Supabase接続エラー

**症状:**
- 認証エラー
- データ取得失敗

**解決方法:**
1. 環境変数を確認
```bash
node -e "console.log('SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set')"
```

2. .envファイルに正しい値を設定
```env
EXPO_PUBLIC_SUPABASE_URL=your_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key_here
```

## デバッグコマンド

### 環境診断
```bash
# アプリ診断を実行
npm run start:expo-go
# コンソールで診断結果を確認
```

### キャッシュクリア
```bash
# 完全なリセット
npm run reset

# Expoキャッシュのみクリア
npm run clear-cache
```

### TypeScriptチェック
```bash
npm run types:check
```

## 開発環境のセットアップ

### 必要なツール
- Node.js 18.x
- Expo CLI
- Expo Go (モバイルアプリ)

### 初期セットアップ
```bash
# リポジトリをクローン
git clone https://github.com/aeroxkoki/Stilya.git
cd Stilya

# 依存関係をインストール
npm install

# 環境変数をセットアップ
cp .env.example .env
# .envファイルを編集

# 開発サーバーを起動
npm run start:expo-go
```

## 診断ツールの使用

アプリ起動時に自動的に診断が実行されます。
コンソールで以下の情報が表示されます:

- 📱 環境情報
- 🏗️ New Architecture状態
- 📋 環境変数チェック
- 📦 モジュール検証
- 🔌 Supabase接続テスト
- 📊 テーブルアクセステスト
- 💾 パフォーマンス情報

## よくある質問

### Q: Expo Goでアプリが起動しない
A: 以下を試してください:
1. Expo Goアプリを最新版に更新
2. `npm run reset`でクリーンインストール
3. `npx expo doctor`で依存関係を確認

### Q: 画像が表示されない
A: 画像URLの形式を確認:
- HTTPSプロトコルを使用
- 正しいドメインが許可リストに追加されているか確認

### Q: スワイプが動作しない
A: react-native-gesture-handlerの初期化を確認:
- App.tsxでGestureHandlerRootViewが正しく設定されているか

## サポート

問題が解決しない場合:
1. GitHub Issuesで報告
2. エラーログとスクリーンショットを添付
3. 実行環境の詳細を記載

## 更新履歴

- 2025/1/18: New Architecture対応、診断ツール強化
- 2025/1/17: MVP基本機能実装
