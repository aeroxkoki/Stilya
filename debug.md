# Stilya デバッグログ手順

## console.logデバッグを追加したファイル

以下のファイルにデバッグログを追加しました：

1. **App.tsx**
   - [App.tsx] 1-21: アプリ起動からレンダリングまでの全プロセス

2. **src/lib/polyfills.ts**
   - [polyfills.ts] 1-6: ポリフィル読み込みプロセス

3. **src/services/supabase.ts**
   - [supabase.ts] 1-5: Supabase初期化プロセス

4. **src/navigation/AppNavigator.tsx**
   - [AppNavigator.tsx] 1-10: ナビゲーション構築プロセス

5. **src/contexts/AuthContext.tsx**
   - [AuthContext.tsx] 1-5: 認証コンテキスト初期化プロセス

## デバッグ手順

1. **キャッシュをクリアして起動**
   ```bash
   npx expo start -c
   ```

2. **Expo Goでアプリを開く**

3. **ターミナルのログを監視**
   - 番号順にログが出力されるはずです
   - どこで止まるかを確認してください

## 期待されるログ順序

正常に動作する場合、以下の順序でログが出力されるはずです：

```
[App.tsx] 1. ファイル読み込み開始
[polyfills.ts] 1. ポリフィル読み込み開始
[polyfills.ts] 2. インポート完了
[polyfills.ts] 6. React Native polyfills loaded
[App.tsx] 2. Polyfills インポート開始
[App.tsx] 3. Polyfills インポート完了
[App.tsx] 4. 基本インポート完了
[App.tsx] 5. コンポーネントインポート開始
[supabase.ts] 1. ファイル読み込み開始
[supabase.ts] 2. インポート完了
[supabase.ts] 3. 環境変数確認
[supabase.ts] 4. Supabaseクライアント作成開始
[supabase.ts] 5. Supabaseクライアント作成完了
[AuthContext.tsx] 1. ファイル読み込み開始
[AuthContext.tsx] 2. インポート完了
[AuthContext.tsx] 3. AuthContext作成完了
[AppNavigator.tsx] 1. ファイル読み込み開始
[AppNavigator.tsx] 2. 基本インポート完了
[AppNavigator.tsx] 3. スクリーンインポート開始
[AppNavigator.tsx] 4. スクリーンインポート完了
[App.tsx] 6. コンポーネントインポート完了
[App.tsx] 7. 開発モード - エラーハンドラー設定開始
[App.tsx] 8. エラーハンドラー設定完了
[App.tsx] 9. App関数開始
[App.tsx] 10. useEffect実行開始
🚀 Stilya MVP App initialized
[App.tsx] 11. useEffect実行完了
[App.tsx] 12. レンダリング開始
[App.tsx] 13. GestureHandlerRootView レンダリング
... (以降、各コンポーネントのレンダリング)
```

## エラー特定方法

1. **ログが止まった場所の直後にエラーが発生している可能性が高い**
2. **グローバルエラーハンドラーのログを確認**
   - `==================== グローバルエラー発生 ====================`
   - `==================== Promise Rejection ====================`

3. **環境変数の確認**
   - `[supabase.ts] 3. 環境変数確認` のログで「未設定」と表示される場合は.envファイルを確認

## トラブルシューティング

### ログが全く出力されない場合
- Expo Goアプリを完全に終了して再起動
- `npx expo start -c` でMetroキャッシュをクリア

### 特定のログで止まる場合
- そのログの直後の処理に問題がある
- エラーメッセージを確認して原因を特定

### エラーハンドラーがキャッチしない場合
- C++レベルのエラーの可能性
- より詳細なネイティブログが必要

## 結果報告時に含めてほしい情報

1. 最後に表示されたログ番号とメッセージ
2. エラーハンドラーがキャッチしたエラーの詳細
3. 環境変数の設定状況（特にSupabase関連）
4. その他のエラーメッセージ
