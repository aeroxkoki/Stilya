# Expo Go の制限事項と対処法

## 🚫 Expo Goでできないこと

### 1. ネイティブモジュール関連

#### ❌ カスタムネイティブコード
- 独自のネイティブモジュール（Swift/Kotlin/Java/Objective-C）
- サードパーティのネイティブライブラリ（一部）
- カスタムビルド設定

#### ❌ 一部のハードウェア機能
- **Apple Pay / Google Pay** - 決済システム
- **指紋認証/顔認証** - ローカル認証（一部制限）
- **Bluetooth** - BLE通信
- **NFC** - 近距離無線通信
- **バックグラウンドタスク** - アプリが閉じている時の処理

### 2. プッシュ通知の制限

#### ⚠️ 部分的に制限
```javascript
// Expo Goでは制限あり
import * as Notifications from 'expo-notifications';

// プッシュ通知のトークン取得
// Expo Goでは Expo のプッシュトークンのみ
// 本番アプリでは FCM/APNs の独自トークンが必要
```

**Expo Goでの制限:**
- Expoのプッシュ通知サービス経由のみ
- カスタムサウンド不可
- リッチプッシュ通知（画像付き等）に制限
- バッジ数の管理に制限

### 3. アプリ内課金

#### ❌ 完全に不可
```javascript
// これらは Expo Go では動作しない
- App Store / Google Play の課金システム
- サブスクリプション管理
- 購入履歴の復元
```

### 4. ディープリンキングの制限

#### ⚠️ 部分的に制限
```javascript
// Expo Goでは expo:// スキームのみ
// 本番では stilya:// などカスタムスキームが使える

// app.config.js
{
  scheme: "stilya" // Expo Goでは使えない
}
```

### 5. パフォーマンス関連

#### ⚠️ 最適化の制限
- **Hermes エンジン** - JSエンジンの最適化が制限
- **ProGuard/R8** - Androidのコード最適化不可
- **App Thinning** - iOSのアプリサイズ最適化不可

## ✅ Stilyaアプリへの影響と対処法

### 現在の機能と Expo Go での状況

| 機能 | Expo Go | 対処法 |
|------|---------|--------|
| **ログイン/認証** | ✅ 動作可能 | Supabase Auth は問題なし |
| **スワイプUI** | ✅ 動作可能 | React Native Gesture Handler対応 |
| **画像表示** | ✅ 動作可能 | expo-image 使用可能 |
| **商品データ取得** | ✅ 動作可能 | REST API は問題なし |
| **アフィリエイトリンク** | ✅ 動作可能 | Linking API で外部URL開ける |
| **ハプティクス（振動）** | ✅ 動作可能 | expo-haptics 対応 |
| **プッシュ通知** | ⚠️ 制限あり | 基本的な通知は可能 |
| **決済機能** | ❌ 不可 | EAS Build が必要 |
| **カスタムフォント** | ✅ 動作可能 | expo-font 対応 |
| **アニメーション** | ✅ 動作可能 | Reanimated 対応 |

### 将来追加したい機能と制限

```javascript
// 🔴 Expo Go では不可能な機能例

// 1. アプリ内課金（将来的にプレミアム機能）
import { InAppPurchases } from 'react-native-iap'; // ❌

// 2. カスタムプッシュ通知
import PushNotificationIOS from '@react-native-community/push-notification-ios'; // ❌

// 3. バックグラウンド処理
import BackgroundFetch from 'react-native-background-fetch'; // ❌

// 4. 高度なカメラ機能
import { Camera } from 'react-native-vision-camera'; // ❌
```

## 🎯 開発フェーズ別の推奨アプローチ

### Phase 1: MVP開発（現在） 
**→ Expo Go で十分**
```bash
npm start
```
- ✅ 基本的なUI/UX開発
- ✅ API連携のテスト
- ✅ ユーザーフローの確認

### Phase 2: 機能拡張
**→ EAS Development Build**
```bash
eas build --platform ios --profile development
```
- プッシュ通知の本格実装
- パフォーマンス最適化
- カスタムフォントや詳細なスタイリング

### Phase 3: リリース準備
**→ EAS Production Build**
```bash
eas build --platform ios --profile production
```
- アプリ内課金の実装
- 本番環境のプッシュ通知
- App Store / Google Play 提出用

## 📊 判断基準：いつ EAS Build に移行すべきか？

### Expo Go のままで良い場合
- 基本的なCRUD操作のみ
- Web APIとの通信のみ
- 標準的なUIコンポーネントのみ
- プロトタイプ/MVP段階

### EAS Build が必要な場合
- プッシュ通知をカスタマイズしたい
- アプリ内課金を実装したい
- 特定のネイティブライブラリが必要
- パフォーマンスを最適化したい
- App Store/Google Playに提出したい

## 🛠 具体的な移行タイミング（Stilyaの場合）

### 今すぐ EAS Build に移行すべき機能
現在のStilyaには該当なし ✅

### 将来的に EAS Build が必要になる機能
1. **プレミアムプラン** - アプリ内課金
2. **お気に入り通知** - カスタムプッシュ通知
3. **AR試着機能** - カメラのカスタム実装
4. **オフライン機能** - バックグラウンド同期

## 💡 実用的なTips

### Expo Go で開発を続ける工夫

```javascript
// 環境変数で機能を切り替え
const isDevelopment = __DEV__;
const isExpoGo = Constants.appOwnership === 'expo';

// Expo Go では機能を無効化
if (!isExpoGo) {
  // プッシュ通知の詳細設定
  setupAdvancedNotifications();
}

// 代替機能を提供
if (isExpoGo) {
  console.log('Running in Expo Go - some features limited');
}
```

### 段階的な移行戦略

```bash
# Step 1: Expo Go で基本機能開発（現在）
npm start

# Step 2: プレビュービルドでテスト
eas build --profile preview

# Step 3: 本番ビルド
eas build --profile production
```

## ✅ 結論：Stilya MVP には Expo Go で十分！

**現在の Stilya の機能は全て Expo Go で動作します:**
- ✅ Supabase 認証
- ✅ スワイプUI
- ✅ 商品表示
- ✅ アフィリエイトリンク
- ✅ 基本的なプッシュ通知

**将来的に EAS Build が必要になるタイミング:**
- アプリストアへの提出時
- プレミアム機能の追加時
- 高度なカスタマイズが必要時

## 📚 参考資料
- [Expo Go vs EAS Build 比較](https://docs.expo.dev/workflow/overview/)
- [Expo SDK 対応ライブラリ一覧](https://docs.expo.dev/versions/latest/)
- [EAS Build 移行ガイド](https://docs.expo.dev/build/introduction/)
