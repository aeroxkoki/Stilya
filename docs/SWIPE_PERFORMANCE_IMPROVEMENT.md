# スワイプパフォーマンス改善ドキュメント

## 概要
スワイプ後の次の商品表示に遅延があり、UXを損なっていた問題を改善しました。

## 実施日
2025年1月18日

## 問題点
1. **カードの再レンダリング問題**
   - ReactのkeyにproductIDのみを使用していたため、スワイプ時に全カードが再作成されていた
   - DOMから完全に削除・再作成されるため、表示に遅延が発生

2. **商品のプリロード不足**
   - 次の商品の準備が間に合わず、スワイプ後に読み込みが発生
   - 画像のプリフェッチが5枚のみで不十分

3. **同期的な処理**
   - スワイプ処理が同期的に実行され、UIをブロック
   - 状態更新とアニメーションが競合

## 改善内容

### 1. カードレンダリング最適化
```tsx
// 改善前
key={product.id}

// 改善後  
key={`card-${currentIndex}-${index}`}
```
- インデックスベースのkeyで再レンダリングを最小化
- カードの再利用を促進

### 2. 商品プリロード強化
```tsx
// 改善前
const pageSize = 20;
products.slice(currentIndex, Math.min(currentIndex + 3, products.length))

// 改善後
const pageSize = 30;
products.slice(currentIndex, Math.min(currentIndex + 5, products.length))
```
- 商品取得数を20→30に増加
- カードを3枚→5枚先読み（非表示含む）
- 商品追加ロードのタイミングを残り5枚→10枚に早期化

### 3. 画像プリフェッチ改善
```tsx
// 改善前
const nextImages = newProducts.slice(0, 5)
await prefetchImages(imagesToPrefetch)

// 改善後
const nextImages = newProducts.slice(0, 10)
prefetchImages(imagesToPrefetch).catch(console.error) // 非同期化

// 並列バッチ処理を追加
const prefetchBatch = async (batchUrls: string[]) => {
  // 3枚ずつ並列でプリフェッチ
}
```
- プリフェッチ数を5→10枚に増加
- 非同期化してUIブロックを回避
- 並列バッチ処理で効率化

### 4. 状態更新の非同期化
```tsx
// 改善前
setCurrentIndex(prev => {
  const nextIndex = prev + 1;
  // 同期的に処理
  return nextIndex;
});

// 改善後
requestAnimationFrame(() => {
  setCurrentIndex(prev => {
    const nextIndex = prev + 1;
    // 非同期でロード開始
    setTimeout(() => loadMore(false), 0);
    return nextIndex;
  });
});
```
- requestAnimationFrameで次フレームまで遅延
- setTimeoutで非同期ロード

### 5. アニメーション高速化
```tsx
// 改善前
const SWIPE_OUT_DURATION = 250;
duration: 200,

// 改善後  
const SWIPE_OUT_DURATION = 150;
duration: 120,
friction: 10, // より高速に
tension: 50,  // より高速に
```
- スワイプアウト速度を250ms→150msに短縮
- カード表示アニメーションを200ms→120msに短縮
- スプリングアニメーションのパラメータを調整

## 効果
- スワイプ後の次の商品表示が即座に行われるように改善
- 連続スワイプ時のカクつきが解消
- 全体的なスワイプ体験が滑らかに

## 今後の改善案
1. **Virtual List導入**
   - FlatListのvirtualizationを活用
   - メモリ効率の向上

2. **画像フォーマット最適化**
   - WebP形式への変換
   - 適応的画像サイズ

3. **Worker Thread活用**
   - 重い処理をWorkerに移動
   - メインスレッドの負荷軽減

## 関連ファイル
- `/src/components/swipe/StyledSwipeContainer.tsx`
- `/src/components/swipe/SwipeCardImproved.tsx`
- `/src/hooks/useProducts.ts`
- `/src/utils/imageUtils.ts`

## テスト方法
1. `npm start` でアプリを起動
2. Expo Goでアプリを開く
3. スワイプ画面で連続スワイプを実行
4. 次の商品表示の遅延がないことを確認

## パフォーマンス指標
- 次の商品表示までの時間: ~250ms → ~50ms（推定）
- プリロード済み商品数: 20件 → 30件
- プリフェッチ済み画像数: 5枚 → 10枚
- アニメーション時間: 250ms → 150ms
