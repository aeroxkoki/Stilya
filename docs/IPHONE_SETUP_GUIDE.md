# 📱 iPhone実機テスト準備ガイド

## 🍎 Apple Developer設定（無料アカウントでOK）

### 1. Apple IDの準備
- 既存のApple IDを使用するか、新規作成
- [Apple Developer](https://developer.apple.com/)にアクセス
- 無料のDeveloperアカウントでサインイン

### 2. デバイスの登録（自動）
EAS Buildを使用する場合、デバイス登録は自動で行われます。

## 📲 iPhone側の準備

### 必須設定
1. **iOSバージョン**: 13.0以上
2. **ストレージ空き容量**: 200MB以上
3. **Wi-Fi接続**: 開発PCと同じネットワーク

### iOS 16以降の追加設定
```
設定 → プライバシーとセキュリティ → デベロッパモード → ON
→ iPhoneを再起動
```

## 🔨 開発ビルドの作成

### 方法1: EAS Build（推奨）

```bash
# iOS開発ビルドを作成
cd /Users/koki_air/Documents/GitHub/Stilya
eas build --platform ios --profile development
```

ビルド時の選択肢：
- **Apple ID**: お使いのApple IDでログイン
- **Bundle Identifier**: `com.stilya.app`（自動設定済み）
- **Distribution Certificate**: EASが自動生成

### 方法2: ローカルビルド（Mac必須）

```bash
# Xcodeが必要
npm run ios
```

## 📥 アプリのインストール方法

### 方法1: QRコード（最も簡単）
1. EAS Buildが完了すると、QRコードが表示される
2. iPhoneの**カメラアプリ**でQRコードをスキャン
3. 「"Expo"で開く」をタップ
4. プロファイルのインストールを許可

### 方法2: Safari経由
1. EAS Build完了後のURLをコピー
2. iPhoneのSafariでURLを開く
3. 「インストール」をタップ
4. 設定アプリが開く

### 方法3: TestFlight（本格的なテスト用）
1. App Store Connectでアプリを登録
2. TestFlightビルドをアップロード
3. テスターを招待

## 🔐 プロファイルの信頼設定

初回インストール時のみ必要：

```
設定 → 一般 → VPNとデバイス管理 
→ デベロッパAPP → [あなたのApple ID]
→ 「[Apple ID]を信頼」をタップ
→ 「信頼」をタップ
```

## 🚀 アプリの起動と接続

### 1. 開発サーバーを起動（Mac側）
```bash
cd /Users/koki_air/Documents/GitHub/Stilya
npm start
# または
npx expo start --dev-client --clear
```

### 2. アプリを起動（iPhone側）
1. インストールした「Stilya」アプリをタップ
2. 開発サーバーのURLが自動検出される
   - されない場合は手動で入力: `exp://192.168.x.x:8081`

### 3. 接続確認
- 「Connect」をタップ
- アプリが読み込まれるのを待つ
- ホーム画面が表示されれば成功！

## ⚡ よくある問題と解決方法

### アプリがインストールできない
- **原因**: プロファイルが信頼されていない
- **解決**: 上記の「プロファイルの信頼設定」を実行

### 「信頼されていないデベロッパ」エラー
- **解決**: 設定 → 一般 → VPNとデバイス管理から信頼

### 開発サーバーに接続できない
- **確認事項**:
  - iPhoneとMacが同じWi-Fiに接続されているか
  - ファイアウォールがポート8081をブロックしていないか
  - 開発サーバーのIPアドレスが正しいか

### アプリがクラッシュする
- **対処法**:
  ```bash
  # キャッシュをクリアして再起動
  npm run clear-cache
  ```

## 📝 デバッグツール

### Safari Web Inspector（Mac必須）
1. iPhone: 設定 → Safari → 詳細 → Webインスペクタ → ON
2. Mac: Safari → 開発メニューを表示
3. USBケーブルで接続
4. Safari → 開発 → [あなたのiPhone] → JSContextを選択

### React Native Debugger
- Shake gesture（デバイスを振る）でデバッグメニューを表示
- 「Debug JS Remotely」を選択

## 🎯 テストのポイント

1. **パフォーマンス**: スワイプの滑らかさ
2. **メモリ使用量**: 長時間使用でのメモリリーク
3. **ネットワーク**: オフライン時の挙動
4. **UI/UX**: タップ領域の大きさ、レスポンス速度

## 📱 推奨テストデバイス

- iPhone SE（第2世代）: 最小画面サイズ
- iPhone 13/14: 標準的なサイズ
- iPhone 14 Pro Max: 最大画面サイズ

---

最終更新: 2025年6月12日
