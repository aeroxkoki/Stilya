# 開発ビルド実機テスト問題の解決ガイド

## 問題の概要
実機でQRコードを読み取った後、開発ビルドのダウンロードができない問題が発生しています。

## 根本原因と解決策

### 1. EAS設定の更新 ✅
`eas.json`に開発クライアント設定を追加しました：
```json
{
  "development": {
    "developmentClient": true,
    "distribution": "internal",
    "channel": "development"
  }
}
```

### 2. ネットワーク設定の確認 ✅
開発ビルドが開発サーバーに接続できるよう、以下の設定を追加：
- ホスト設定: `0.0.0.0`（外部アクセス許可）
- ポート: `8081`（デフォルト）
- CORS設定の追加

### 3. 開発ビルドの再作成
以下のコマンドで新しい開発ビルドを作成してください：

```bash
# キャッシュをクリア
npm run clear-cache

# 開発ビルドを作成（iOS）
npx eas build --profile development --platform ios

# 開発ビルドを作成（Android）
npx eas build --profile development --platform android
```

### 4. 実機テストの手順

#### A. 準備
1. 実機と開発マシンが同じWi-Fiネットワークに接続されていることを確認
2. ファイアウォールでポート8081がブロックされていないことを確認
3. 開発サーバーを起動：
   ```bash
   # LAN経由（推奨）
   npm run start:lan
   
   # または、トンネル経由
   npm run start:tunnel
   ```

#### B. インストールと接続
1. EAS Buildページから開発ビルドをダウンロード
2. 実機にインストール（TestFlightまたはAPK直接インストール）
3. アプリを起動
4. 開発サーバーのQRコードをスキャン

### 5. トラブルシューティング

#### 問題: "Unable to connect to development server"
**解決策:**
```bash
# Metro Bundlerを再起動
npx expo start --clear --dev-client

# IPアドレスを明示的に指定
REACT_NATIVE_PACKAGER_HOSTNAME=192.168.x.x npm run start
```

#### 問題: "Network request failed"
**解決策:**
1. `app.config.js`のNSAppTransportSecurity設定を確認
2. 開発サーバーのファイアウォール設定を確認
3. プロキシ設定がある場合は無効化

#### 問題: ビルドのダウンロードが失敗
**解決策:**
1. EASアカウントにログインしていることを確認
   ```bash
   npx eas whoami
   npx eas login
   ```
2. 適切な権限があることを確認
3. ビルドプロファイルの`distribution`が`internal`に設定されていることを確認

### 6. 診断ツールの使用

開発ビルド診断コンポーネントを使用して問題を特定：

```typescript
// App.tsxに追加
import { DevBuildDiagnostics } from './src/components/dev/DevBuildDiagnostics';

// 開発モードで診断画面を表示
{__DEV__ && <DevBuildDiagnostics />}
```

### 7. 推奨される開発フロー

1. **初回セットアップ**
   ```bash
   # 環境変数の設定
   cp .env.example .env
   # 必要な値を設定
   
   # 依存関係のインストール
   npm install
   
   # 開発ビルドの作成
   npx eas build --profile development --platform all
   ```

2. **日常の開発**
   ```bash
   # 開発サーバーの起動（LAN経由）
   npm run start:lan
   
   # 実機でアプリを起動し、QRコードをスキャン
   ```

3. **問題発生時**
   ```bash
   # フルリセット
   npm run full-reset
   
   # キャッシュクリア後に再起動
   npm run clear-cache
   npm run start:lan
   ```

### 8. 確認済みの設定

- ✅ `eas.json`に`developmentClient: true`を追加
- ✅ `metro.config.js`に開発ビルド用の設定を追加
- ✅ `dev-client.config.js`でネットワーク設定を最適化
- ✅ 環境変数の`EXPO_PUBLIC_`プレフィックス対応
- ✅ 診断ツールの作成

### 9. 次のステップ

1. 新しい開発ビルドを作成
2. 実機にインストール
3. 診断ツールを使用して接続状態を確認
4. 問題が解決しない場合は、診断結果を共有

## 重要な注意事項

- Expo Goアプリでは開発ビルドは動作しません
- 開発ビルドは専用のアプリとしてインストールされます
- ビルド後は必ず`--dev-client`フラグを使用してサーバーを起動してください