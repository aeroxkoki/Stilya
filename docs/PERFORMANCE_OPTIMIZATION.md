# 開発環境パフォーマンス最適化ガイド

## 問題
アプリ起動時に白い画面が表示される、または起動が遅い問題の解決方法。

## 解決策

### 1. ネットワーク診断の無効化（デフォルト）
開発環境でのネットワーク診断は、デフォルトで無効になっています。
必要な場合のみ、`.env` ファイルで有効化してください：

```bash
# ネットワーク診断を有効にする（通常は不要）
EXPO_PUBLIC_ENABLE_NETWORK_DIAGNOSTICS=true
```

### 2. 初期化処理の最適化
- ネットワーク接続テストに2秒のタイムアウトを設定
- 接続失敗時でもアプリは続行（オフライン対応）
- 不要なプロファイル重複取得を削減

### 3. テーマ設定
- テーマのロード中も白い画面を表示しない
- デフォルトテーマで即座に表示

## デバッグ方法

### コンソールログの確認
```bash
# Metro Bundlerのログを確認
npx expo start

# 別ターミナルでログをフィルタリング
npx expo start | grep "AuthContext\|AppNavigator"
```

### 主要なログポイント
1. `[AuthContext.tsx] 5. initialize関数実行開始`
2. `[AuthContext.tsx] 5.6. セッション取得開始`
3. `[AuthContext.tsx] 5.7. セッション取得結果`
4. `[AppNavigator.tsx] 9. ユーザー認証済み - Main画面表示`

## トラブルシューティング

### 白い画面が続く場合
1. Metro Bundlerを再起動: `Ctrl+C` → `npx expo start -c`
2. キャッシュクリア: `npx expo start --clear`
3. アプリの再インストール

### ネットワークエラーが頻発する場合
1. Supabaseの接続情報を確認
2. インターネット接続を確認
3. VPNやプロキシを無効化

## パフォーマンス向上のヒント
- 開発時は `--no-dev` フラグで起動すると高速化
- 不要なconsole.logを削除またはコメントアウト
- React Developer Toolsを無効化
