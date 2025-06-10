# 開発ガイドライン

## 概要

このドキュメントは、Stilyaプロジェクトの開発における規約、ベストプラクティス、および推奨事項をまとめたものです。

## コーディング規約

### TypeScript

1. **型安全性を最優先**
   ```typescript
   // ❌ Bad
   const handleSwipe = (direction: any) => { ... }
   
   // ✅ Good
   const handleSwipe = (direction: 'left' | 'right') => { ... }
   ```

2. **型推論を活用**
   ```typescript
   // ❌ Bad
   const products: Product[] = [];
   
   // ✅ Good (型が明確な場合)
   const products = [] as Product[];
   ```

3. **Supabaseの型を活用**
   ```typescript
   import { Database } from '@/types/database.types';
   
   type Product = Database['public']['Tables']['external_products']['Row'];
   ```

### React Native

1. **関数コンポーネント + Hooks を使用**
   ```typescript
   // ✅ Good
   const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
     const [isLiked, setIsLiked] = useState(false);
     return <View>...</View>;
   };
   ```

2. **メモ化を適切に使用**
   ```typescript
   const MemoizedProductList = React.memo(ProductList);
   const expensiveValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
   ```

3. **スタイルの管理**
   ```typescript
   // スタイルシートは別定義
   const styles = StyleSheet.create({
     container: {
       flex: 1,
       padding: 16,
     },
   });
   ```

### ファイル構造

1. **コンポーネントファイル**
   ```
   src/components/ProductCard/
   ├── ProductCard.tsx      # コンポーネント本体
   ├── ProductCard.styles.ts # スタイル定義
   ├── ProductCard.types.ts  # 型定義
   └── index.ts             # エクスポート
   ```

2. **命名規則**
   - コンポーネント: PascalCase (`ProductCard.tsx`)
   - フック: camelCase with 'use' prefix (`useProduct.ts`)
   - ユーティリティ: camelCase (`formatPrice.ts`)
   - 定数: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)

## Git ワークフロー

### ブランチ戦略

```
main
├── develop
│   ├── feature/user-authentication
│   ├── feature/swipe-animation
│   └── bugfix/product-loading-error
└── release/v1.0.0
```

### コミットメッセージ

[Conventional Commits](https://www.conventionalcommits.org/)に従う：

```bash
feat: スワイプアニメーションを実装
fix: 商品画像の読み込みエラーを修正
docs: READMEにセットアップ手順を追加
style: コードフォーマットを統一
refactor: 認証ロジックをカスタムフックに移動
test: スワイプ機能のテストを追加
chore: 依存関係を更新
```

## エラーハンドリング

### 1. Try-Catchパターン

```typescript
const fetchProducts = async () => {
  try {
    setLoading(true);
    const { data, error } = await supabase
      .from('external_products')
      .select('*');
      
    if (error) throw error;
    
    setProducts(data);
  } catch (error) {
    console.error('商品取得エラー:', error);
    Toast.show({
      type: 'error',
      text1: 'エラー',
      text2: '商品の取得に失敗しました',
    });
  } finally {
    setLoading(false);
  }
};
```

### 2. エラーバウンダリ

```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // エラーレポートサービスに送信
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

## パフォーマンス

### 1. 画像最適化

```typescript
import { Image } from 'expo-image';

// Expo Imageを使用してキャッシュとパフォーマンスを最適化
<Image
  source={{ uri: product.image_url }}
  style={styles.productImage}
  contentFit="cover"
  transition={200}
/>
```

### 2. リスト最適化

```typescript
// FlatListで大量データを効率的に表示
<FlatList
  data={products}
  keyExtractor={(item) => item.id}
  renderItem={renderProduct}
  getItemLayout={getItemLayout} // 高さが固定の場合
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
/>
```

### 3. 遅延読み込み

```typescript
// React.lazyは現在React Nativeでは未サポート
// 代わりに条件付きレンダリングを使用
{showAdvancedFeatures && <AdvancedFeatures />}
```

## セキュリティ

### 1. 環境変数

```typescript
// ❌ Bad - ハードコーディング
const supabaseUrl = "https://ycsydubuirflfuyqfshg.supabase.co";

// ✅ Good - 環境変数を使用
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
```

### 2. 入力検証

```typescript
// ユーザー入力は必ず検証
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
```

### 3. 認証チェック

```typescript
// 保護されたルートでは認証を確認
useEffect(() => {
  if (!user) {
    navigation.navigate('Login');
  }
}, [user]);
```

## テスト

### 1. ユニットテスト

```typescript
// utils/__tests__/formatPrice.test.ts
describe('formatPrice', () => {
  it('should format price correctly', () => {
    expect(formatPrice(1000)).toBe('¥1,000');
    expect(formatPrice(0)).toBe('¥0');
  });
});
```

### 2. 統合テスト

```typescript
// MVPテストの実行
npm test
```

## デバッグ

### 1. コンソールログ

```typescript
// 開発環境でのみログ出力
if (__DEV__) {
  console.log('Debug info:', data);
}
```

### 2. React Native Debugger

- Cmd+D (iOS) / Cmd+M (Android) でデバッグメニューを開く
- Chrome DevToolsでデバッグ

### 3. 開発メニュー

`EXPO_PUBLIC_DEBUG_MODE=true`を設定して、アプリ内開発メニューを有効化。

## ドキュメンテーション

### 1. コードコメント

```typescript
/**
 * 商品をスワイプした時の処理
 * @param productId - 商品ID
 * @param direction - スワイプ方向 ('left' | 'right')
 * @returns Promise<void>
 */
const handleSwipe = async (productId: string, direction: SwipeDirection): Promise<void> => {
  // 実装
};
```

### 2. README更新

新機能追加時は必ずREADMEを更新：
- セットアップ手順
- 環境変数
- 使用方法

## CI/CD

### GitHub Actions

プッシュ時に自動実行：
1. TypeScriptの型チェック
2. ESLintによるコード品質チェック
3. テストの実行
4. ビルドの成功確認

## チェックリスト

### PR作成前

- [ ] 型エラーがない (`npm run types:check`)
- [ ] コードフォーマット済み
- [ ] 不要なconsole.logを削除
- [ ] テストが通る
- [ ] ドキュメントを更新
- [ ] コミットメッセージが規約に従っている

### リリース前

- [ ] 環境変数が正しく設定されている
- [ ] デバッグモードが無効
- [ ] パフォーマンステスト実施
- [ ] セキュリティチェック完了

## 関連ドキュメント

- [プロジェクトアーキテクチャ](./PROJECT_ARCHITECTURE.md)
- [Supabase型生成ガイド](./SUPABASE_TYPE_GENERATION.md)
- [環境変数設定ガイド](./EAS_ENVIRONMENT_VARIABLES.md)
