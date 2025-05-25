# Managed WorkflowでのiOSビルドガイド

## 概要

Managed Workflowを維持したまま、iOSアプリをビルドする方法を説明します。

## 方法1: Expo Go（開発時推奨）

最も簡単な方法です。ネイティブ機能の制限がありますが、ほとんどの開発作業には十分です。

```bash
# 開発サーバーを起動
npm start

# 表示されるQRコードをiOS実機のExpo Goアプリでスキャン
# またはiOSシミュレータでExpo Goを起動
```

### メリット
- ✅ セットアップ不要
- ✅ ホットリロード対応
- ✅ 高速な開発サイクル

### デメリット
- ❌ 一部のネイティブ機能が使えない
- ❌ カスタムネイティブモジュールは使えない

## 方法2: EAS Buildでクラウドビルド（本番推奨）

```bash
# iOSシミュレータ用ビルド
eas build --platform ios --profile development

# iOS実機用ビルド（内部配布）
eas build --platform ios --profile preview

# App Store配布用ビルド
eas build --platform ios --profile production
```

### 必要な準備
1. Apple Developer Program への登録（年間$99）
2. EASアカウントの作成
3. 証明書とプロビジョニングプロファイルの設定（EASが自動管理可能）

## 方法3: EAS Buildのローカルビルド（上級者向け）

EAS Buildをローカルで実行することも可能ですが、要件が厳しいです。

### 要件
- macOS（必須）
- Xcode（最新版）
- Cocoapods
- fastlane

### 手順
```bash
# EAS CLIのローカルビルドモードを使用
eas build --platform ios --local

# ただし、この方法はManaged Workflowの利点を損なう可能性があります
```

### 注意事項
- ⚠️ ローカルビルドは複雑で、環境依存の問題が発生しやすい
- ⚠️ Managed Workflowの簡潔さが失われる
- ⚠️ 基本的にはクラウドビルドを推奨

## 方法4: カスタム開発ビルド（特殊な場合）

特定のネイティブ機能が必要な場合：

```bash
# カスタム開発ビルドを作成
eas build --platform ios --profile development --clear-cache

# ビルドが完了したら、QRコードまたはリンクからインストール
```

## 推奨フロー

### 開発段階
1. **Expo Go**を使用して開発
2. 定期的に**EAS Build（プレビュー）**でテスト

### リリース準備
1. **EAS Build（本番）**でビルド
2. TestFlightでベータテスト
3. App Storeにサブミット

## よくある質問

### Q: Apple Developer Programは必要？
A: 実機でのテストやApp Store配布には必要です。Expo Goでの開発には不要です。

### Q: ローカルでXcodeを使いたい
A: Managed Workflowでは不可能です。どうしても必要な場合は、bare workflowへの移行を検討してください。

### Q: ビルド時間を短縮したい
A: EAS Buildの優先度プラン（有料）を使用するか、キャッシュを活用してください。

## まとめ

Managed Workflowでは：
- 開発時は**Expo Go**
- テスト・配布時は**EAS Build**

これが最も効率的で推奨される方法です。ローカルビルドにこだわらず、クラウドビルドの利便性を活用しましょう。
