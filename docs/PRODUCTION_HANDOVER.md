# Production to Development Handover Document
# 本番環境への引き継ぎドキュメント

## 概要
このドキュメントは、Stilyaアプリの開発環境から本番環境への移行時に必要な手順と注意事項をまとめたものです。

## 1. 現在の開発環境の状況

### 最新の修正内容（2025年6月4日）
1. **環境変数読み込みの統一化**
   - `src/services/supabase.ts`を修正
   - `process.env`の直接使用を廃止し、`src/utils/env.ts`から環境変数をインポート
   - Expo Goでの動作を確保しつつ、本番環境への移行もスムーズに
   - `src/components/dev/NetworkDiagnostics.tsx`も同様に修正

2. **環境変数の管理方法**
   - `.env`ファイル：開発時の環境変数（dotenvで読み込み）
   - `app.config.js`の`extra`フィールド：本番ビルド時の環境変数
   - `src/utils/env.ts`：両方から読み込む統一インターフェース

### 修正前の内容
1. **Supabase接続エラーの対応**
   - `src/services/supabase.ts`を修正
   - 重複したauth設定を削除
   - デバッグログを最小限に削減
   - エラーハンドリングの改善

2. **UIコンポーネントの修正**
   - `src/screens/auth/AuthScreen.tsx`のアイコン表示エラーを修正
   - TextInputのleftIconプロパティにReact要素を渡すように変更

3. **開発ツール**
   - `src/components/dev/NetworkDiagnostics.tsx`を作成（ネットワーク診断用）
   - 開発メニューにネットワーク診断機能を追加

## 2. 本番環境への移行手順

### 2.1 環境変数の設定方法

#### 開発環境（Expo Go）
```bash
# .envファイルを作成
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### 本番環境（EAS Build）
```javascript
// app.config.js
export default {
  expo: {
    // ...
    extra: {
      supabaseUrl: "https://your-project.supabase.co",
      supabaseAnonKey: "your-anon-key",
      // その他の環境変数
    }
  }
};
```

### 2.2 コードの調整

1. **supabase.tsのdebugフラグを確認**
```typescript
// src/services/supabase.ts (33行目)
debug: false, // 本番環境ではfalse
```

必要に応じて以下に変更：
```typescript
debug: __DEV__, // 開発環境でのみデバッグ有効
```

2. **Realtimeの有効化（必要な場合）**
```typescript
// src/services/supabase.ts (36行目)
realtime: {
  enabled: true, // 必要に応じてtrue
},
```

### 2.3 開発専用ファイルの取り扱い

以下のファイルは開発専用です。本番ビルドでは自動的に除外されますが、必要に応じて削除できます：
- `src/components/dev/NetworkDiagnostics.tsx`
- `src/components/dev/DevMenu.tsx`

### 2.4 ビルド前のチェックリスト

- [ ] 環境変数が本番用に設定されている
- [ ] `supabase.ts`のdebugフラグがfalseまたは__DEV__
- [ ] TypeScriptのエラーがない
- [ ] ESLintのエラーがない
- [ ] 不要なconsole.logが削除されている

## 3. ネットワーク接続問題の解決

### 3.1 開発環境での問題
Expo開発環境では、以下の理由でSupabaseへの接続が失敗することがあります：
- Expo GoアプリのネットワークポリシーRestrictions
- Metro Bundlerのプロキシ設定
- HTTPSとHTTPの混在

### 3.2 解決策
1. **Expo CLIの再起動**
```bash
# Metro Bundlerをクリアして再起動
npx expo start -c
```

2. **実機でのテスト**
```bash
# QRコードをスキャンして実機でテスト
npx expo start
```

3. **開発ビルドの使用（推奨）**
```bash
# 開発ビルドを作成
npx expo prebuild
npx expo run:ios  # または run:android
```

## 4. 本番ビルドの作成

### 4.1 EAS Buildの設定確認
```json
// eas.json
{
  "build": {
    "production": {
      "channel": "production",
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### 4.2 ビルドコマンド
```bash
# 本番ビルドの作成
eas build --platform all --profile production
```

## 5. テスト手順

### 5.1 実機テスト項目
- [ ] ユーザー登録・ログイン機能
- [ ] 商品データの取得
- [ ] スワイプ機能
- [ ] 推薦機能
- [ ] アフィリエイトリンクの動作

### 5.2 ネットワーク診断（開発時）
1. 開発メニューを開く
2. 「ネットワーク診断」をタップ
3. すべてのテストが成功することを確認

## 6. トラブルシューティング

### 問題: Network request failed
**原因**: 
- Expo開発環境でのネットワーク制限
- 環境変数の設定ミス

**解決策**: 
1. 環境変数を確認
2. 開発ビルドを使用
3. 実機でのテスト

### 問題: 認証エラー
**原因**: 
- Supabaseの設定ミス
- APIキーの期限切れ

**解決策**: 
1. Supabaseダッシュボードで認証設定を確認
2. URLとAPIキーが正しいか確認
3. Supabaseプロジェクトの設定を確認

## 7. 本番環境の監視

- Supabaseダッシュボードでエラーログを監視
- アプリのクラッシュレポートを確認
- ユーザーフィードバックを収集

---
最終更新日: 2025年1月
