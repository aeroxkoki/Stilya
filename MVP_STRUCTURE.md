# Stilya MVP最小構成

## ディレクトリ構造

```
Stilya/
├── src/
│   ├── app/                    # アプリケーションのエントリーポイント
│   │   └── App.tsx            # メインアプリコンポーネント
│   ├── components/            # 再利用可能なコンポーネント
│   │   ├── common/           # 共通UI部品
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── swipe/            # スワイプ関連
│   │   │   ├── SwipeCard.tsx
│   │   │   └── ActionButtons.tsx
│   │   └── product/          # 商品関連
│   │       ├── ProductCard.tsx
│   │       └── ProductDetail.tsx
│   ├── screens/              # 画面コンポーネント
│   │   ├── AuthScreen.tsx
│   │   ├── OnboardingScreen.tsx
│   │   ├── SwipeScreen.tsx
│   │   ├── RecommendationsScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── services/             # APIとサービス層
│   │   ├── supabase.ts      # Supabase設定
│   │   ├── authService.ts   # 認証
│   │   ├── productService.ts # 商品データ
│   │   ├── swipeService.ts   # スワイプ記録
│   │   └── recommendationService.ts # レコメンド
│   ├── hooks/                # カスタムフック
│   │   ├── useAuth.ts
│   │   ├── useProducts.ts
│   │   └── useSwipe.ts
│   ├── navigation/           # ナビゲーション
│   │   ├── AppNavigator.tsx
│   │   └── types.ts
│   ├── types/                # TypeScript型定義
│   │   └── index.ts
│   └── utils/                # ユーティリティ
│       ├── constants.ts
│       └── helpers.ts
├── assets/                   # 画像・フォント
├── app.config.js            # Expo設定
├── eas.json                 # EAS Build設定
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
└── README.md
```

## 主要な変更点

1. **削除されたディレクトリ/ファイル**:
   - `contexts/` → hooksに統合
   - `store/` → MVP段階では状態管理をシンプルに
   - 複数のNavigator → AppNavigatorのみに統合
   - 開発者向け画面・レポート機能
   - 重複したサービスファイル

2. **統合・簡略化**:
   - ナビゲーションを1つのファイルに統合
   - サービス層をシンプルに
   - コンポーネントを必要最小限に

3. **保持する重要な機能**:
   - スワイプUI
   - 認証（Supabase）
   - 商品表示・レコメンド
   - プロフィール管理
