# iOS CocoaPods トラブルシューティングガイド

## 「The sandbox is not in sync with the Podfile.lock」エラーの解決方法

このエラーは、CocoaPodsの依存関係が同期されていない場合に発生します。

### エラーの原因

1. `Podfile.lock`が存在しないか、古い
2. `Pods`ディレクトリとの不整合
3. 他の開発者がPodfileを更新したが、`pod install`が実行されていない

### 解決手順

#### 1. プロジェクトディレクトリに移動

```bash
cd /path/to/your/project/ios
```

#### 2. 既存のPodsを削除（オプション）

問題が続く場合は、クリーンな状態から始めることを推奨：

```bash
rm -rf Pods
rm -rf ~/Library/Developer/Xcode/DerivedData/YourProject*
```

#### 3. pod installを実行

```bash
pod install
```

#### 4. Xcodeでの開き方を確認

重要：`pod install`実行後は、必ず`.xcworkspace`ファイルを使用してプロジェクトを開いてください：

```bash
open YourProject.xcworkspace
```

**注意**: `.xcodeproj`ファイルではなく、`.xcworkspace`ファイルを使用することが重要です。

### Expo開発ビルドでの注意事項

Expo managed workflowから開発ビルドに移行した場合：

1. `.gitignore`ファイルで`ios/`ディレクトリが無視されていないことを確認
2. `Podfile.lock`をGitリポジトリにコミット
3. チームメンバー全員が`pod install`を実行

### よくある問題と解決方法

#### CocoaPodsがインストールされていない

```bash
# CocoaPodsのインストール
sudo gem install cocoapods

# または、Homebrewを使用
brew install cocoapods
```

#### pod installが失敗する

```bash
# CocoaPodsのリポジトリを更新
pod repo update

# キャッシュをクリア
pod cache clean --all
```

#### M1/M2 Macでの問題

```bash
# Rosettaを使用してpod installを実行
arch -x86_64 pod install
```

### 推奨されるワークフロー

1. 新しいブランチをチェックアウトした後は必ず`pod install`を実行
2. `Podfile`を変更した場合は、`pod install`を実行して`Podfile.lock`を更新
3. `Podfile.lock`は必ずGitにコミット
4. CI/CDパイプラインでも`pod install`を実行

### 関連ドキュメント

- [DEVELOPMENT_BUILD_GUIDE.md](./DEVELOPMENT_BUILD_GUIDE.md)
- [IPHONE_SETUP_GUIDE.md](./IPHONE_SETUP_GUIDE.md)
