# Stilya リリース - 今すぐ実行するコマンド集

## 🚨 最初に実行（5分以内に完了）

### 1. リリース準備スクリプトの実行
```bash
cd /Users/koki_air/Documents/GitHub/Stilya
./quick-release.sh
```

### 2. 環境確認（メニューから「1」を選択）
- .envファイルの存在確認
- node_modulesの確認
- 環境変数の設定状況確認

## 🎯 本日中に実行

### 実機テスト開始
```bash
# quick-release.shメニューから「2」を選択
# または直接実行：
npx expo start --tunnel --clear
```

### EASビルド作成（実機接続エラー回避）
```bash
# quick-release.shメニューから「3」を選択
# または直接実行：
eas build --platform ios --profile preview
eas build --platform android --profile preview
```

## 📱 ビルド完了後の確認

### iOS（TestFlight）
1. EASダッシュボードでビルドステータス確認
2. ビルド完了後、App Store Connectにアップロード
3. TestFlightで内部テスター招待

### Android（内部テスト）
1. EASダッシュボードからAPKダウンロード
2. Google Play Consoleで内部テストトラック作成
3. APKアップロード、テスターに配布

## 🗄️ Supabase商品データ投入

1. [Supabaseダッシュボード](https://app.supabase.com)にログイン
2. プロジェクトを選択
3. SQL Editorを開く
4. 以下のファイルの内容をコピー＆ペースト：
   ```
   /Users/koki_air/Documents/GitHub/Stilya/scripts/initial-products.sql
   ```
5. 「Run」ボタンをクリック
6. Tableビューで30商品が登録されたことを確認

## 🔧 環境変数の本番設定

```bash
# .env.productionファイルを作成
cp .env .env.production

# 編集
nano .env.production
```

必須項目：
```
EXPO_PUBLIC_DEMO_MODE=false
EXPO_PUBLIC_DEBUG_MODE=false
EXPO_PUBLIC_SUPABASE_URL=[本番のSupabase URL]
EXPO_PUBLIC_SUPABASE_ANON_KEY=[本番のAnon Key]
```

## 📊 動作確認チェックリスト

### 基本機能
- [ ] アプリが起動する
- [ ] 認証画面が表示される
- [ ] スワイプUIが動作する
- [ ] 商品が表示される
- [ ] 商品詳細が開く
- [ ] アフィリエイトリンクが動作する

### データ確認
- [ ] Supabaseに商品データが存在する
- [ ] スワイプデータが保存される
- [ ] お気に入りが保存される

## 🚀 GitHub Actions設定確認

```bash
# GitHubにプッシュ
git add -A
git commit -m "feat: リリース準備完了"
git push origin main

# Actions タブで自動ビルドを確認
```

## 📝 ストア申請前の最終確認

### 必須ファイル
- [ ] プライバシーポリシー: `docs/privacy-policy.md`
- [ ] 利用規約: `docs/terms-of-service.md`
- [ ] アプリ説明文: `assets/store_assets/README.md`
- [ ] スクリーンショット: 各5枚

### URL準備
- [ ] プライバシーポリシーをWebに公開
- [ ] 利用規約をWebに公開
- [ ] サポートメールアドレス設定

## 💡 トラブルシューティング

### 実機接続エラーの場合
```bash
# 1. トンネルモードを試す
npx expo start --tunnel

# 2. キャッシュクリア
npx expo start --clear

# 3. それでもダメならEASビルド
eas build --platform all --profile preview
```

### ビルドエラーの場合
```bash
# 依存関係の再インストール
rm -rf node_modules
npm install

# Metro キャッシュクリア
npx expo start --clear
```

---

**サポート**: 問題が発生した場合は、エラーメッセージと共にGitHub Issuesに報告してください。
