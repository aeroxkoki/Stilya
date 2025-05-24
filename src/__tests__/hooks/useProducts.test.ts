import { renderHook, act } from '@testing-library/react-hooks';
import { useProducts } from '../../hooks/useProducts';
import { fetchProducts, saveSwipeResult } from '../../services/productService';

// モックデータとモジュールをモック
jest.mock('../../services/productService', () => ({
  fetchProducts: jest.fn(),
  saveSwipeResult: jest.fn(),
}));

jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
  }),
}));

const mockProducts = [
  {
    id: '1',
    title: 'テスト商品1',
    brand: 'テストブランド',
    price: 1990,
    imageUrl: 'https://example.com/image1.jpg',
    tags: ['タグ1', 'タグ2'],
    affiliateUrl: 'https://example.com/1',
  },
  {
    id: '2',
    title: 'テスト商品2',
    brand: 'テストブランド',
    price: 2990,
    imageUrl: 'https://example.com/image2.jpg',
    tags: ['タグ2', 'タグ3'],
    affiliateUrl: 'https://example.com/2',
  },
];

describe('useProducts Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetchProducts as jest.Mock).mockResolvedValue(mockProducts);
    (saveSwipeResult as jest.Mock).mockResolvedValue({});
  });

  it('初期化時に商品データを取得する', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useProducts());
    
    // 初期状態でローディング中
    expect(result.current.isLoading).toBe(true);
    
    await waitForNextUpdate();
    
    // データが取得され、ローディングが終了
    expect(result.current.isLoading).toBe(false);
    expect(result.current.products).toEqual(mockProducts);
    expect(result.current.currentProduct).toEqual(mockProducts[0]);
    expect(fetchProducts).toHaveBeenCalledTimes(1);
  });

  it('handleSwipeLeft を呼び出すと saveSwipeResult が実行され、次の商品に進む', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useProducts());
    
    // データの読み込み完了を待つ
    await waitForNextUpdate();
    
    // スワイプ左の実行
    await act(async () => {
      await result.current.handleSwipeLeft();
    });
    
    // saveSwipeResult が正しいパラメータで呼ばれたことを確認
    expect(saveSwipeResult).toHaveBeenCalledWith({
      productId: '1',
      result: 'no',
      userId: 'test-user-id',
    });
    
    // 次の商品に進んだことを確認
    expect(result.current.currentProduct).toEqual(mockProducts[1]);
  });

  it('handleSwipeRight を呼び出すと saveSwipeResult が実行され、次の商品に進む', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useProducts());
    
    // データの読み込み完了を待つ
    await waitForNextUpdate();
    
    // スワイプ右の実行
    await act(async () => {
      await result.current.handleSwipeRight();
    });
    
    // saveSwipeResult が正しいパラメータで呼ばれたことを確認
    expect(saveSwipeResult).toHaveBeenCalledWith({
      productId: '1',
      result: 'yes',
      userId: 'test-user-id',
    });
    
    // 次の商品に進んだことを確認
    expect(result.current.currentProduct).toEqual(mockProducts[1]);
  });

  it('resetProducts を呼び出すと currentIndex がリセットされ、商品データが再取得される', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useProducts());
    
    // データの読み込み完了を待つ
    await waitForNextUpdate();
    
    // スワイプ操作で次の商品へ進む
    await act(async () => {
      await result.current.handleSwipeLeft();
    });
    
    expect(result.current.currentProduct).toEqual(mockProducts[1]);
    
    // リセット実行
    await act(async () => {
      result.current.resetProducts();
    });
    
    // fetchProducts が再度呼ばれたことを確認
    expect(fetchProducts).toHaveBeenCalledTimes(2);
    expect(result.current.isLoading).toBe(true);
    
    // リセット後のデータ読み込み完了を待つ
    await waitForNextUpdate();
    
    // インデックスがリセットされたことを確認
    expect(result.current.currentProduct).toEqual(mockProducts[0]);
  });

  it('fetchProducts がエラーを返した場合、エラー状態が設定される', async () => {
    // fetchProducts がエラーを返すようにモックを設定
    (fetchProducts as jest.Mock).mockRejectedValueOnce(new Error('APIエラー'));
    
    const { result, waitForNextUpdate } = renderHook(() => useProducts());
    
    // 初期状態でローディング中
    expect(result.current.isLoading).toBe(true);
    
    await waitForNextUpdate();
    
    // エラー状態が設定されたことを確認
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('商品データの読み込みに失敗しました。');
  });
});
