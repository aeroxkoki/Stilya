# iOS実機テスト ビルド最適化ガイド

## 🎯 問題の概要
Xcodeでの実機ビルドが1時間以上かかる問題を解決します。

## 📊 診断ツール

まず、以下のスクリプトで現在の状況を診断してください：

```bash
# ビルド問題の診断
./scripts/build/diagnose-ios-build.sh
```

## 🚀 クイックフィックス（推奨手順）

### 1. 環境のクリーンアップ（5分）

```bash
# すべてのキャッシュをクリア
cd ios
rm -rf ~/Library/Developer/Xcode/DerivedData/*
rm -rf Pods
rm -rf build
rm Podfile.lock
pod cache clean --all

# node_modulesもクリア
cd ..
rm -rf node_modules
npm install
```

### 2. 最適化されたビルド設定の適用（5分）

```bash
# 最適化スクリプトの実行
./scripts/build/optimize-ios-build.sh
```

### 3. Xcodeでの設定確認

1. **Xcodeを開く**
   ```bash
   cd ios
   open Stilya.xcworkspace
   ```

2. **ビルド設定の確認**
   - Product > Scheme > Edit Scheme
   - Run > Build Configuration を「Debug」に設定
   - Close

3. **プロジェクト設定の最適化**
   - プロジェクトナビゲータで「Stilya」を選択
   - Build Settings タブを開く
   - 以下を設定：
     - `Build Active Architecture Only` = `Yes` (Debug)
     - `Enable Bitcode` = `No`
     - `Debug Information Format` = `DWARF`

### 4. 実機でのビルド

1. **デバイスの準備**
   - iPhoneをUSBで接続
   - 「このコンピュータを信頼」を選択

2. **ビルドの実行**
   - Xcodeで実機を選択
   - Command + R でビルド開始

## 🔍 ビルド時間の詳細確認

ビルドプロセスのどこで時間がかかっているか確認：

```bash
# Xcodeの Report Navigator で確認
# View > Navigators > Reports (Cmd+9)
# 最新のビルドレポートを選択
```

## ⚡️ 追加の最適化オプション

### A. 増分ビルドの活用

```bash
# 2回目以降のビルドを高速化
# Xcodeで Cmd+Shift+K を使わない（Clean Build Folderを避ける）
# 代わりに Cmd+B（ビルド）または Cmd+R（実行）を使用
```

### B. モジュールの最適化

1. **不要な依存関係の削除**
   - package.jsonから未使用のパッケージを削除
   - `npm prune` で不要なパッケージを削除

2. **Hermesの最適化**
   - すでに有効になっていることを確認

### C. 並列ビルドの設定

Xcodeで：
- Build Settings > Build Options > Enable Parallel Building = Yes

## 🛠 トラブルシューティング

### 問題: ビルドが特定の段階で止まる

**解決策:**
```bash
# プロセスの確認
ps aux | grep xcodebuild

# 強制終了が必要な場合
killall xcodebuild
```

### 問題: "No space left on device" エラー

**解決策:**
```bash
# ディスク容量の確認
df -h

# Xcodeのキャッシュをクリア
rm -rf ~/Library/Developer/Xcode/Archives/*
rm -rf ~/Library/Developer/Xcode/Products/*
```

### 問題: Pod installが遅い

**解決策:**
```bash
# CDNを使用せずにインストール
pod install --repo-update --verbose
```

## 📈 期待される結果

最適化後の予想ビルド時間：
- 初回ビルド: 15-30分
- 2回目以降: 2-5分

## 🔄 継続的な改善

1. **定期的なメンテナンス**（週1回）
   ```bash
   # DerivedDataのクリア
   rm -rf ~/Library/Developer/Xcode/DerivedData/*
   ```

2. **依存関係の更新**（月1回）
   ```bash
   npm update
   cd ios && pod update
   ```

## 📝 注意事項

- ビルド中はMacの他の重いアプリケーションを閉じる
- 十分な空き容量（20GB以上）を確保する
- Xcodeが最新版であることを確認する

---

問題が解決しない場合は、`diagnose-ios-build.sh`の出力結果を共有してください。
