# 環境変数更新ガイド

## 重要な変更（2025年1月15日）

実機での「Network request failed」エラーを解決するため、Supabase URLを正しいプロジェクトIDに更新しました。

### 正しい環境変数

**.envファイル**に以下の設定を使用してください：

```env
# 正しい値（必須）
EXPO_PUBLIC_SUPABASE_URL=https://ddypgpljprljqrblpuli.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkeXBncGxqcHJsanFyYmxwdWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMDMwOTcsImV4cCI6MjA2MjY3OTA5N30.u4310NL9FYdxcMSrGxEzEXP0M5y5pDuG3_mz7IRAhMU
```

### 削除された設定

以下の設定は不要になりました：

```env
# 削除（使用しない）
EXPO_PUBLIC_USE_LOCAL_SUPABASE=true
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### 更新手順

1. `.env`ファイルを開く
2. 上記の新しい値に更新
3. アプリを再起動：
   ```bash
   npm run clear-cache
   ```

### 確認方法

環境変数が正しく設定されているか確認：

```bash
npm run check-env
```

アプリ内でネットワーク診断を実行：
1. デバッグモードを有効化（`EXPO_PUBLIC_DEBUG_MODE=true`）
2. 開発メニュー → ネットワークデバッグ
3. 「テスト実行」をタップ

### 注意事項

- `.env`ファイルはGitにコミットしないでください
- チームメンバーには個別に新しい値を共有してください
- 実機テストではローカルSupabaseは使用できません
