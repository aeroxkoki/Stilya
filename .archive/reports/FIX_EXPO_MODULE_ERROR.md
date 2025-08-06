# Stilya iOS Xcode Build Error 解決ガイド

## エラー: "No such module 'Expo'"

このエラーは、Xcodeがビルド時にExpoフレームワークを見つけられない場合に発生します。

## 根本原因

1. **Pods が正しくインストールされていない**
2. **Expo prebuild が正しく実行されていない**
3. **Xcode の DerivedData にキャッシュの問題がある**
4. **.xcworkspace ではなく .xcodeproj を開いている**

## 解決手順

### 1. 診断スクリプトの実行

まず、問題を特定するために診断スクリプトを実行します：

```bash
chmod +x /Users/koki_air/Documents/GitHub/Stilya/scripts/diagnose-expo-module-error.sh
/Users/koki_air/Documents/GitHub/Stilya/scripts/diagnose-expo-module-error.sh
```

### 2. 根本解決スクリプトの実行

診断結果に基づいて、以下のスクリプトを実行します：

```bash
chmod +x /Users/koki_air/Documents/GitHub/Stilya/scripts/fix-expo-module-error-root-cause.sh
/Users/koki_air/Documents/GitHub/Stilya/scripts/fix-expo-module-error-root-cause.sh
```

### 3. 手動での解決方法（スクリプトが失敗した場合）

#### ステップ 1: プロジェクトのクリーンアップ
```bash
cd /Users/koki_air/Documents/GitHub/Stilya
rm -rf node_modules
rm -rf ios
npm install
```

#### ステップ 2: Expo Prebuild の実行
```bash
npx expo prebuild --clean --ios
```

#### ステップ 3: Pods のインストール
```bash
cd ios
pod install
```

#### ステップ 4: Xcode のキャッシュクリア
```bash
rm -rf ~/Library/Developer/Xcode/DerivedData/*
```

#### ステップ 5: Xcode でビルド
1. Xcode を完全に終了
2. `ios/Stilya.xcworkspace` を開く（.xcodeproj ではない！）
3. Product > Clean Build Folder (Shift+Cmd+K)
4. Product > Build (Cmd+B)

## よくある問題と解決策

### 問題: pod install でエラーが発生する
```bash
cd ios
pod deintegrate
pod cache clean --all
pod install --repo-update
```

### 問題: AppDelegate.swift でエラーが続く
AppDelegate.swift の最初の行を確認し、以下のインポートが正しいことを確認：
```swift
import Expo
import React
import ReactAppDependencyProvider
```

### 問題: Framework Search Paths の問題
Xcode で以下を確認：
1. プロジェクトナビゲータで Stilya プロジェクトを選択
2. Build Settings タブを開く
3. "Framework Search Paths" を検索
4. `$(inherited)` と `"${PODS_CONFIGURATION_BUILD_DIR}"` が含まれていることを確認

## 開発ビルドの再作成が必要な場合

上記の手順で解決しない場合、開発ビルドを再作成する必要があるかもしれません：

```bash
eas build --platform ios --profile development
```

## GitHubへのプッシュ前の確認事項

1. **ios/Pods/ ディレクトリはコミットしない**（.gitignore に含まれている）
2. **ios/Podfile.lock はコミットする**（他の開発者が同じバージョンを使用できるように）
3. **修正スクリプトはコミットする**（将来の参照用）

## 問題が解決したら

```bash
cd /Users/koki_air/Documents/GitHub/Stilya
git add .
git commit -m "fix: iOS Expo module import error - regenerated iOS project with expo prebuild"
git push origin main
```
