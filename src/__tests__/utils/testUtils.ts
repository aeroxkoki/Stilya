/**
 * テスト用のユーティリティ関数
 */

// モック用のSupabase
export const mockSupabase = {
  auth: {
    signUp: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(),
    getUser: jest.fn(),
    onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
  },
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    match: jest.fn().mockReturnThis(),
    then: jest.fn(cb => cb({
      data: [],
      error: null,
    })),
    catch: jest.fn(),
  }),
};

// モック用の製品データ
export const mockProducts = [
  {
    id: 'prod1',
    name: 'ベーシックTシャツ',
    brand: 'UNIQLO',
    price: 1990,
    image_url: 'https://example.com/tshirt.jpg',
    tags: ['casual', 'men', 'basic'],
    affiliate_url: 'https://example.com/affiliate/tshirt'
  },
  {
    id: 'prod2',
    name: 'スキニージーンズ',
    brand: 'GU',
    price: 2990,
    image_url: 'https://example.com/jeans.jpg',
    tags: ['casual', 'men', 'denim'],
    affiliate_url: 'https://example.com/affiliate/jeans'
  }
];

// スワイプ履歴のモックデータ
export const mockSwipes = [
  { id: 'swipe1', user_id: 'user1', product_id: 'prod1', result: 'yes', created_at: '2025-05-10T00:00:00Z' },
  { id: 'swipe2', user_id: 'user1', product_id: 'prod2', result: 'no', created_at: '2025-05-11T00:00:00Z' }
];

// お気に入りのモックデータ
export const mockFavorites = [
  { id: 'fav1', user_id: 'user1', product_id: 'prod1', created_at: '2025-05-12T00:00:00Z' }
];

// ユーザープロファイルのモックデータ
export const mockUserProfile = {
  id: 'user1',
  email: 'test@example.com',
  gender: 'men',
  age_group: '20s',
  style_preferences: ['casual', 'basic']
};

// モック成功レスポンス
export const mockSuccessResponse = (data = {}) => ({
  data,
  error: null
});

// モックエラーレスポンス
export const mockErrorResponse = (message = 'エラーが発生しました') => ({
  data: null,
  error: { message }
});
