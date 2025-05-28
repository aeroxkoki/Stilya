# Stilya Development Troubleshooting Guide

## iOS Simulator Connection Issues

### 問題の症状
- `Could not connect to development server` エラー
- 60秒後にタイムアウトで接続が切断
- URL: `http://127.0.0.1:8081` への接続失敗

### 原因
1. Metro bundlerとiOSシミュレータ間のネットワーク接続問題
2. キャッシュの不整合
3. localhost (127.0.0.1) の解決問題

### 解決方法

#### 方法1: 開発用スクリプトを使用（推奨）
```bash
./start-dev.sh
```

このスクリプトは以下を自動実行：
- 既存のExpoプロセスを終了
- キャッシュをクリア
- IPアドレスを自動検出
- LANモードで起動

#### 方法2: 手動での解決
```bash
# 1. 既存プロセスの終了
pkill -f "expo start"
pkill -f "metro"

# 2. キャッシュのクリア
rm -rf node_modules/.cache
rm -rf .expo
rm -rf $TMPDIR/metro-*

# 3. Expoを再起動
npx expo start --clear --host lan
```

#### 方法3: iOSシミュレータでの対処
1. シミュレータでアプリを開く
2. Cmd + D でデベロッパーメニューを開く
3. "Reload" を選択

### それでも解決しない場合

#### ネットワーク設定の確認
```bash
# IPアドレスの確認
ipconfig getifaddr en0

# ファイアウォール設定の確認
sudo pfctl -s all | grep 8081
```

#### 完全なリセット
```bash
# node_modulesを再インストール
rm -rf node_modules
npm install

# Expoを再起動
npx expo start -c
```

### 開発時の推奨設定

1. **常にLANモードを使用**
   - `npx expo start --host lan`
   - 実機テストにも対応

2. **キャッシュは定期的にクリア**
   - `npm run clean` を使用

3. **問題が続く場合はログを確認**
   - `npx expo start --verbose`

### 関連ファイル
- `metro.config.js` - Metro bundler設定
- `.expo/settings.json` - Expo設定
- `start-dev.sh` - 開発サーバー起動スクリプト

---

更新日: 2025-05-28
