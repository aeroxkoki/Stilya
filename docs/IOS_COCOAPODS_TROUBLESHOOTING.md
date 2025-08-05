# iOS CocoaPods トラブルシューティング

## 解決済みの問題

### 問題: "The sandbox is not in sync with the Podfile.lock"

#### エラーメッセージ
```
The sandbox is not in sync with the Podfile.lock. Run 'pod install' or update your CocoaPods installation.
```

#### 原因
- Podfile.lockとPodsディレクトリの同期が取れていない
- node_modulesの変更後にpod installが実行されていない
- CocoaPodsのキャッシュの問題

#### 解決方法

1. **Podsディレクトリとlockファイルのクリーンアップ**
```bash
cd ios
rm -rf Pods Podfile.lock
```

2. **pod installの実行**
```bash
pod install --verbose
```

3. **変更のコミット**
```bash
git add ios/Podfile.lock ios/Podfile.properties.json ios/Stilya.xcodeproj/project.pbxproj
git commit -m "fix: CocoaPods sync error resolved by reinstalling pods"
```

#### 注意事項
- Expo managed workflowを維持しながら開発ビルドを使用する場合、iOSディレクトリが生成されます
- Podsディレクトリは`.gitignore`に含まれているため、GitHubにはプッシュされません
- Podfile.lockは必ずコミットしてください（チーム間での依存関係の一貫性を保つため）

#### 予防策
- `npm install`や`yarn install`を実行した後は、必ず`cd ios && pod install`を実行する
- 定期的に`pod repo update`を実行してCocoaPodsのスペックリポジトリを更新する
- チーム内でCocoaPodsのバージョンを統一する

## 実行日時
- 2025年8月5日
- CocoaPods version: 1.16.2
- Expo SDK: 53.0.0
