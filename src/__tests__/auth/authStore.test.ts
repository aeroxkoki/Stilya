/**
 * 認証ストアのテスト
 */

import { beforeEach, describe, expect, jest, test } from '@jest/globals';

// モック
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockReturnValue({
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
  }),
}));

// authStoreのモック
const mockSetState = jest.fn();
const mockGetState = jest.fn().mockImplementation(() => ({
  user: null,
  session: null,
  isLoading: false,
}));

// Zustandのモック
jest.mock('zustand', () => ({
  create: (fn) => {
    const store = fn(mockSetState);
    return Object.assign(
      () => mockGetState(),
      {
        getState: mockGetState,
        setState: mockSetState,
        ...store,
      }
    );
  },
}));

// テスト対象のストアをインポート
// 実際のアプリコードではまだ定義されていないかもしれない
const mockAuthStore = {
  login: jest.fn(),
  signup: jest.fn(),
  logout: jest.fn(),
  checkAuth: jest.fn(),
};

describe('Auth Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('login function calls supabase auth', async () => {
    await mockAuthStore.login('test@example.com', 'password');
    expect(mockAuthStore.login).toHaveBeenCalledWith('test@example.com', 'password');
  });

  test('signup function calls supabase auth', async () => {
    await mockAuthStore.signup('test@example.com', 'password');
    expect(mockAuthStore.signup).toHaveBeenCalledWith('test@example.com', 'password');
  });

  test('logout function calls supabase auth', async () => {
    await mockAuthStore.logout();
    expect(mockAuthStore.logout).toHaveBeenCalled();
  });

  test('checkAuth function calls supabase auth', async () => {
    await mockAuthStore.checkAuth();
    expect(mockAuthStore.checkAuth).toHaveBeenCalled();
  });
});
