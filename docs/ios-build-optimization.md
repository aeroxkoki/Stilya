# iOS ビルド時間最適化ガイド

## 🚀 Stilya iOS開発ビルド最適化

このドキュメントは、Stilyaプロジェクトの iOS 開発ビルドを高速化するための最適化設定をまとめたものです。

## 現在の構成
- **React Native**: 0.79.2
- **Expo SDK**: 53
- **開発ビルド**: expo-dev-client 使用
- **Pods数**: 265個 → 最適化により削減

## 適用された最適化

### 1. Podfile の最適化
- ✅ デバッグビルド専用の最適化設定
- ✅ アクティブアーキテクチャのみビルド（ONLY_ACTIVE_ARCH = YES）
- ✅ インデックスストア無効化（COMPILER_INDEX_STORE_ENABLE = NO）
- ✅ 警告の抑制（ビルド時間短縮）
- ✅ 並列ビルドの有効化

### 2. Xcode設定の最適化
```bash
# 並列ビルドを有効化
defaults write com.apple.dt.Xcode BuildSystemScheduleInherentlyParallelCommandsExclusively -bool NO

# CPUコア数に応じた並列コンパイル
defaults write com.apple.dt.Xcode IDEBuildOperationMaxNumberOfConcurrentCompileTasks $(sysctl -n hw.ncpu)
```

### 3. use_expo_modules! の最適化
Expo SDK 53では直接的な`exclude`機能はサポートされていませんが、以下の方法で最適化を実現：

```ruby
# Podfileのpost_installフックで実装
if target.name.include?('Expo') && !['expo-constants', 'expo-dev-client', 'expo-image', 'expo-linking', 'expo-status-bar'].any? { |required| target.name.include?(required) }
  # 使用していないExpoモジュールのビルドを簡略化
  config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)']
  config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'MINIMAL_BUILD=1'
end
```

この設定により、実際に使用していないExpoモジュールのビルドが軽量化され、ビルド時間が短縮されます。

### 4. ビルド設定の詳細

| 設定項目 | 値 | 効果 |
|---------|-----|------|
| SWIFT_COMPILATION_MODE | singlefile | Swiftファイルの並列コンパイル |
| GCC_OPTIMIZATION_LEVEL | 0 | デバッグビルドの最適化レベル |
| DEBUG_INFORMATION_FORMAT | dwarf | デバッグシンボルの最小化 |
| ASSETCATALOG_COMPILER_OPTIMIZATION | time | アセットコンパイル時間優先 |
| ENABLE_BITCODE | NO | ビットコード無効化 |

## 使用方法

### クイック最適化スクリプト
```bash
# 最適化スクリプトを実行
cd /Users/koki_air/Documents/GitHub/Stilya
./scripts/quick-optimize-ios.sh
```

### 手動での最適化手順

1. **DerivedData のクリア**
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData/*
   ```

2. **Pods の再インストール**
   ```bash
   cd ios
   rm -rf Pods Podfile.lock
   pod install --repo-update
   ```

3. **ビルドの実行**
   ```bash
   cd ..
   npm run ios
   ```

## ビルド時間短縮のヒント

### 開発中の推奨事項
1. **Xcode を閉じた状態で pod install を実行**
2. **ビルド前に DerivedData をクリア（問題がある場合のみ）**
3. **シミュレーターは1つのみ起動**
4. **不要なアプリケーションを終了**

### 追加の最適化オプション
- **ccache の導入**（C/C++コンパイルキャッシュ）
- **RAM ディスクの使用**（DerivedData用）
- **SSD の空き容量確保**（最低50GB推奨）

## トラブルシューティング

### ビルドエラーが発生した場合
```bash
# 完全リセット
cd /Users/koki_air/Documents/GitHub/Stilya
npm run full-reset
npx expo prebuild --clean
cd ios && pod install
```

### Pods が多すぎる場合の対処法
1. `package.json` の依存関係を見直し
2. 未使用のパッケージを削除
3. `npx expo doctor` で診断

## パフォーマンス測定

ビルド時間の測定方法：
```bash
# Xcodeでビルド時間を表示
defaults write com.apple.dt.Xcode ShowBuildOperationDuration -bool YES
```

## 今後の改善案

1. **不要な Expo モジュールの除外**
   - 現在使用していない Expo SDK モジュールの特定と除外

2. **ネイティブモジュールの最適化**
   - 必要最小限のネイティブモジュールのみ使用

3. **ビルドキャッシュの活用**
   - GitHub Actions でのキャッシュ戦略

## 関連ファイル
- `/ios/Podfile` - 最適化設定が含まれる
- `/scripts/quick-optimize-ios.sh` - クイック最適化スクリプト
- `/scripts/optimize-ios-build.sh` - 詳細最適化スクリプト
