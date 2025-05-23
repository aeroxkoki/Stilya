# 実機テストガイド（最速デモ環境）

## iPhoneでのテスト方法（推奨）

### 1. Expo Goアプリをインストール
- App Storeで「Expo Go」を検索してインストール

### 2. プロジェクトを起動
```bash
cd /Users/koki_air/Documents/GitHub/Stilya
npx expo start
```

### 3. 接続方法
- **同じWi-Fiネットワーク**に接続していることを確認
- ターミナルに表示されるQRコードをiPhoneのカメラで読み取る
- 「Expo Goで開く」をタップ

## Androidでのテスト方法

### 1. Expo Goアプリをインストール
- Google Playで「Expo Go」を検索してインストール

### 2. QRコードをスキャン
- Expo Goアプリを開く
- 「Scan QR Code」をタップ
- ターミナルのQRコードを読み取る

## トンネル接続（Wi-Fiが異なる場合）

```bash
# トンネルモードで起動（少し遅いが確実）
npx expo start --tunnel
```

## 実機テストのメリット
- ✅ **エミュレーターの10倍以上高速**
- ✅ 実際のユーザー体験を確認可能
- ✅ タッチ操作の感覚が正確
- ✅ カメラ・GPS等の機能も使用可能
- ✅ バッテリー消費も少ない
