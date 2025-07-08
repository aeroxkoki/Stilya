# Stilya MVP開発 - 2025年7月8日 デバッグレポート

## 🔧 実施した作業

### 1. データベースマイグレーション
- **問題**: `user_id`の型不一致（TEXT vs UUID）
- **解決**: すべての新規テーブルでUUID型に統一
- **適用済みマイグレーション**:
  - `recommendation_system_v2_fixed` - 推薦システムv2のテーブル作成
  - `performance_indexes_fixed` - パフォーマンス最適化インデックス

### 2. 推薦システムv2の実装
- ✅ `enhancedRecommendationService.ts` - 既に実装済み
- ✅ `useRecommendations.ts` - A/Bテスト対応済み
- ✅ 新規テーブル構造の作成完了
- ✅ RLSポリシーの設定完了

### 3. 作成したファイル
- `/docs/RECOMMENDATION_V2_IMPLEMENTATION_REPORT.md`
- `/src/tests/testEnhancedRecommendations.ts`
- `/scripts/git-push-recommendation-v2.sh`

## 🚀 次のステップ

### 開発環境での実行
```bash
# 方法1: npmスクリプトを使用
npm run dev

# 方法2: 開発スクリプトを直接実行
./scripts/build/start-dev.sh

# 方法3: Expoコマンドを直接使用
npx expo start --dev-client --clear
```

### テストの実行
```bash
# 推薦システムv2のテスト
npx ts-node src/tests/testEnhancedRecommendations.ts

# または、App.tsxに以下を追加してアプリ内でテスト
import { testEnhancedRecommendations } from './src/tests/testEnhancedRecommendations';
// useEffectで実行
```

### GitHubへのプッシュ
```bash
# 作成したスクリプトを使用
./scripts/git-push-recommendation-v2.sh

# または手動で
git add .
git commit -m "feat: 推薦システムv2の実装完了とUUID型対応"
git push origin main
```

## 📊 現在の状態

### ✅ 完了項目
- データベーススキーマの拡張
- 推薦アルゴリズムの改良
- A/Bテスト機能の実装
- セッション学習機能の実装
- パフォーマンス最適化

### 🔄 進行中の作業
- 開発ビルドでの動作確認
- 実機テストの実施

### ⚠️ 注意事項
1. **managed workflowの維持**
   - Expo managed workflowを使用しているため、ネイティブコードの変更は避けてください

2. **環境変数の確認**
   - `.env`ファイルに必要な環境変数が設定されていることを確認

3. **Supabase接続**
   - Supabaseプロジェクトがアクティブであることを確認

## 🐛 トラブルシューティング

### CocoaPodsエラーの場合
```bash
cd ios
pod deintegrate
pod install
```

### キャッシュクリア
```bash
# Expo キャッシュ
npx expo start --clear

# Metro キャッシュ
npx react-native start --reset-cache
```

### 開発ビルドの再作成
```bash
# iOSの場合
npx expo run:ios

# Androidの場合
npx expo run:android
```

## 📝 補足
推薦システムv2は段階的にロールアウトされます。初期は5%のユーザーに対して有効化され、効果測定後に拡大していきます。

問題が発生した場合は、`/docs/RECOMMENDATION_V2_IMPLEMENTATION_REPORT.md`を参照してください。
