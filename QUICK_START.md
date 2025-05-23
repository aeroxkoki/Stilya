# Stilya - ローカル開発クイックスタート 🚀

## デモモードで即座に起動

Supabaseの設定なしでアプリをすぐに試すことができます！

### 1. セットアップ（初回のみ）

```bash
# リポジトリに移動
cd /Users/koki_air/Documents/GitHub/Stilya

# 開発環境をセットアップ
./setup-dev.sh
```

### 2. アプリを起動

```bash
# Expo開発サーバーを起動
npm start
```

### 3. アプリを実行

起動後、以下のオプションから選択：

- **`i`** - iOS シミュレーター（macOSのみ）
- **`a`** - Android エミュレーター
- **`w`** - Webブラウザ（非推奨）

または、QRコードをスキャンして実機で試すことも可能です（Expo Goアプリが必要）。

## デモモードについて 🎭

現在の設定では、アプリは**デモモード**で動作します：

- ✅ Supabaseの設定不要
- ✅ モックデータで全機能をテスト可能
- ✅ スワイプ、お気に入り、レコメンド機能が動作
- ✅ データはローカルストレージに保存

デモモードでは以下のアカウントが自動的に使用されます：
- メール: `demo@stilya.app`
- パスワード: 任意（何でもOK）

## 本番モードへの切り替え 🔄

Supabaseを使用した本番モードに切り替えるには：

1. [Supabase](https://supabase.com/)でプロジェクトを作成
2. `supabase/setup.sql`をSQL Editorで実行
3. `.env`ファイルを更新：

```env
EXPO_PUBLIC_SUPABASE_URL=your_actual_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_actual_key_here
```

4. アプリを再起動

## トラブルシューティング 🔧

### ポートが使用中の場合

```bash
# 既存のExpoプロセスを終了
lsof -ti:8081 | xargs kill -9

# 再度起動
npm start
```

### キャッシュエラーの場合

```bash
# キャッシュをクリア
npm run clean

# 完全リセット
npm run reset
```

### iOS/Androidビルドエラー

```bash
# iOS (macOSのみ)
cd ios && pod install && cd ..

# Android
cd android && ./gradlew clean && cd ..
```

## 開発のヒント 💡

1. **ホットリロード**: コードを保存すると自動的にアプリが更新されます
2. **デバッグ**: React Native Debuggerを使用可能
3. **TypeScript**: 型エラーは `npm run type-check` で確認

## 次のステップ 📋

- [MVP開発状況](./MVP_STATUS.md) - 実装済み機能と今後の計画
- [Supabaseセットアップ](./supabase/README.md) - 本番データベースの設定
- [開発ドキュメント](./docs/README.md) - 詳細な開発ガイド

---

**Happy Coding! 🎉**

何か問題がある場合は、GitHubのIssueでお知らせください。