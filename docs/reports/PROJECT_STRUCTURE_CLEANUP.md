# Stilya プロジェクト整理レポート

## 実施日時
2025年5月28日

## 整理内容

### 1. 重複ファイルの削除 ✅

#### screens/ディレクトリ
以下の重複ファイルを削除し、サブディレクトリの構造化されたファイルを残しました：
- `src/screens/AuthScreen.tsx` → `src/screens/auth/AuthScreen.tsx`を使用
- `src/screens/OnboardingScreen.tsx` → `src/screens/onboarding/OnboardingScreen.tsx`を使用
- `src/screens/ProductDetailScreen.tsx` → `src/screens/detail/ProductDetailScreen.tsx`を使用
- `src/screens/ProfileScreen.tsx` → `src/screens/profile/ProfileScreen.tsx`を使用
- `src/screens/SwipeScreen.tsx` → `src/screens/swipe/SwipeScreen.tsx`を使用
- `src/screens/RecommendationsScreen.tsx` → `src/screens/recommend/RecommendScreen.tsx`を使用

#### components/ディレクトリ
以下の重複ファイルを削除し、サブディレクトリの構造化されたファイルを残しました：
- `src/components/EmptyState.tsx` → `src/components/common/EmptyState.tsx`を使用
- `src/components/SwipeCard.tsx` → `src/components/swipe/SwipeCard.tsx`を使用
- `src/components/ActionButtons.tsx` → 削除（未使用）

### 2. 空のディレクトリの削除 ✅
- `src/components/auth/` (空のディレクトリ)
- `.github/workflows 2/` (誤って作成されたディレクトリ)

### 3. ドキュメントの整理 ✅

#### docs/reports/へ移動
- `BABEL_FIX_REPORT.md`
- `DIAGNOSTIC_REPORT.md`
- `PROJECT_CLEANUP_REPORT.md`
- `PROBLEM_DIAGNOSIS_REPORT.md`

#### docs/setup-guides/へ移動
- `ENV_SETUP_GUIDE.md`
- `MANAGED_WORKFLOW_GUIDE.md`
- `MANAGED_WORKFLOW_SETUP.md`

#### ルートディレクトリに残したファイル
- `README.md` - プロジェクトの概要
- `MVP_STRUCTURE.md` - MVP構造の説明（重要）

### 4. ナビゲーションの更新 ✅
- `AppNavigator.tsx`を更新し、適切なスクリーンファイルをインポートするよう修正

### 5. クリーンアップスクリプトの削除 ✅
- `cleanup-project.sh` - 実行後に削除

## 現在のプロジェクト構造

```
Stilya/
├── App.tsx
├── README.md
├── MVP_STRUCTURE.md
├── app.config.js
├── app.json
├── assets/
├── docs/
│   ├── reports/         # 各種レポート
│   ├── setup-guides/    # セットアップガイド
│   └── ...             # その他のドキュメント
├── scripts/
├── src/
│   ├── components/
│   │   ├── common/      # 共通コンポーネント
│   │   ├── onboarding/  # オンボーディング関連
│   │   ├── product/     # 商品関連
│   │   ├── recommend/   # レコメンド関連
│   │   ├── swipe/       # スワイプ関連
│   │   └── test/        # テスト関連
│   ├── screens/
│   │   ├── auth/        # 認証関連画面
│   │   ├── detail/      # 詳細画面
│   │   ├── dev/         # 開発用画面
│   │   ├── onboarding/  # オンボーディング画面
│   │   ├── profile/     # プロフィール関連画面
│   │   ├── recommend/   # レコメンド画面
│   │   ├── report/      # レポート画面
│   │   └── swipe/       # スワイプ画面
│   └── ...
└── ...
```

## 推奨される追加の整理

### 1. imageUtils の統合
現在、以下の2つのファイルが存在します：
- `src/utils/imageUtils.ts` (479行)
- `src/utils/imageUtils/index.ts` (179行)

これらは機能が重複しているため、統合することを推奨します。

### 2. ナビゲーションファイルの整理
`src/navigation/`に複数のナビゲーターファイルがありますが、現在使用されているのは`AppNavigator.tsx`のみです。他のファイルの必要性を確認し、不要なものは削除することを推奨します。

### 3. 開発用ファイルの管理
`src/screens/dev/`ディレクトリには開発用の画面があります。本番ビルドでは除外するような仕組みを検討することを推奨します。

## まとめ

プロジェクトの構造がより整理され、以下の利点が得られました：

1. **明確な構造**: ファイルがカテゴリごとに整理されています
2. **重複の排除**: 同じ機能のファイルが複数存在しなくなりました
3. **ドキュメントの整理**: ドキュメントが適切なディレクトリに配置されています
4. **保守性の向上**: ファイルの場所が予測しやすくなりました

今後は、この構造を維持しながら開発を進めることで、効率的な開発が可能になります。
