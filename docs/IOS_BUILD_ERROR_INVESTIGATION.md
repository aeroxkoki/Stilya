# iOS Build Error Investigation Report

## 問題の概要
XCodeでのビルド時にSIGTERMエラーが発生し、CocoaPodsのインストールが中断される問題が発生しています。

## エラー詳細
```
SignalException - SIGTERM
/usr/local/Cellar/ruby/3.4.4/lib/ruby/3.4.0/pathname.rb:52:in 'Regexp#match?'
```

## 環境情報
- macOS: 15.5
- Xcode: 16.4
- CocoaPods: 1.16.2
- Ruby: 3.4.4
- Node: v22.15.0 (nvm使用)

## 根本原因の分析

### 1. **Node.jsパスの不一致**
- `.xcode.env.local`ファイルのNode.jsパスが古い
- 実際のパス: `/Users/koki_air/.nvm/versions/node/v22.15.0/bin/node`
- 記載されていたパス: `/usr/local/Cellar/node/23.10.0/bin/node`

### 2. **権限の問題**
- Podsディレクトリが権限の問題で削除できない可能性
- buildディレクトリのファイル数が異常に多い（65535ファイル）

### 3. **Ruby/CocoaPods互換性**
- Ruby 3.4.4は比較的新しいバージョン
- CocoaPods 1.16.2との互換性に問題がある可能性

## 解決策

### 即座に実行可能な対策

1. **手動でのクリーンアップ**
```bash
cd /Users/koki_air/Documents/GitHub/Stilya/ios
sudo rm -rf Pods Podfile.lock build
```

2. **Node.jsパスの修正**（実施済み）
```bash
echo "export NODE_BINARY=$(which node)" > .xcode.env.local
```

3. **Podsの再インストール**
```bash
cd ios
pod cache clean --all
pod repo update
pod install --repo-update --verbose
```

### 長期的な対策

1. **開発環境の標準化**
   - nvmのバージョンを固定
   - `.nvmrc`ファイルを作成してNode.jsバージョンを固定

2. **ビルドプロセスの改善**
   - GitHub Actionsでの自動ビルドに移行
   - EAS Buildの活用を検討

3. **依存関係の最適化**
   - 不要なPodの削除
   - New Architectureの無効化（実施済み）

## 推奨アクション

1. **即座に実行**
   ```bash
   # 1. Podsディレクトリの削除（管理者権限が必要）
   cd /Users/koki_air/Documents/GitHub/Stilya/ios
   sudo rm -rf Pods Podfile.lock build
   
   # 2. Podsの再インストール
   pod install --repo-update
   ```

2. **XCodeでの確認**
   - Stilya.xcworkspaceを開く（.xcodeprojではない）
   - Build Settings > Build Phases を確認
   - Signing & Capabilitiesで開発チームを設定

3. **ビルドテスト**
   ```bash
   # シミュレーターでのテスト
   npx expo run:ios
   
   # 実機でのテスト（開発者アカウントが必要）
   npx expo run:ios --device
   ```

## トラブルシューティング

### pod installが失敗する場合
1. CocoaPodsを更新: `sudo gem install cocoapods`
2. Ruby環境を確認: `ruby --version`
3. システムRubyを使用: `/usr/bin/ruby -S pod install`

### XCodeビルドエラーが続く場合
1. DerivedDataを削除: `rm -rf ~/Library/Developer/Xcode/DerivedData`
2. XCode > Product > Clean Build Folder
3. XCode > Product > Build

## 参考リンク
- [CocoaPods Troubleshooting](https://guides.cocoapods.org/using/troubleshooting.html)
- [Expo iOS Build Issues](https://docs.expo.dev/build-reference/troubleshooting/)
