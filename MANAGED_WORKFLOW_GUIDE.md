# Expo Managed Workflow 開発ガイドライン

## 重要な原則

本プロジェクトは **Expo Managed Workflow** を使用しています。以下の原則を必ず守ってください：

### ✅ やるべきこと

1. **Expo SDKの機能範囲内で開発**
   - Expo SDKが提供するAPIとライブラリのみを使用
   - Expo Goアプリでテスト可能な実装を維持

2. **EAS Buildの使用**
   - 本番ビルドはEAS Build（クラウド）を使用
   - ローカルビルドは行わない

3. **設定ファイルの管理**
   - app.json（またはapp.config.js）で設定を管理
   - metro.config.jsは最小限の設定のみ（NativeWindなど）

### ❌ やってはいけないこと

1. **`expo prebuild`の実行禁止**
   - ios/とandroid/フォルダを生成しない
   - これらのフォルダは.gitignoreで除外済み

2. **ネイティブコードの直接編集禁止**
   - Objective-C、Swift、Java、Kotlinコードの編集不可
   - ネイティブモジュールの追加不可（Expo未対応のもの）

3. **Bare Workflowへの移行禁止**
   - ejectコマンドの使用禁止
   - カスタムネイティブモジュールの追加禁止

## 開発フロー

```bash
# 開発開始
npm install
npm start

# ビルド（EAS）
eas build --platform android --profile preview
eas build --platform ios --profile preview

# 本番リリース
eas build --platform all --profile production
eas submit
```

## トラブルシューティング

### Metro bundlerエラーの場合
```bash
# キャッシュクリア
npm run clean
npx expo start --clear
```

### 依存関係の問題
```bash
# 完全リセット
npm run reset
```

## 注意事項

- Web向けビルドは対象外（iOS/Androidのみ）
- GitHub Actionsでの自動ビルドを設定済み
- パスエイリアス（@/で始まるimport）は開発効率のため使用可

## 参考リンク

- [Expo Managed Workflow](https://docs.expo.dev/introduction/managed-vs-bare/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [Expo SDK](https://docs.expo.dev/versions/latest/)
