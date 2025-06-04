/**
 * 開発環境用Supabaseモックサービス
 * ネットワーク接続エラーを回避するための一時的なソリューション
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// 開発用モックデータ
const mockUsers = [
  {
    id: 'dev-user-1',
    email: 'test@example.com',
    password: 'password123',
    created_at: new Date().toISOString(),
  }
];

const mockProducts = [
  {
    id: 'prod-1',
    name: 'モードスタイル ジャケット',
    image_url: 'https://via.placeholder.com/300x400/333/fff?text=Mode+Jacket',
    price: 15800,
    brand: 'URBAN STYLE',
    category: 'jacket',
    tags: ['モード', 'メンズ', 'ジャケット'],
    affiliate_url: 'https://example.com/product1',
  },
  {
    id: 'prod-2',
    name: 'ナチュラル ワンピース',
    image_url: 'https://via.placeholder.com/300x400/f3e5d8/333?text=Natural+Dress',
    price: 8900,
    brand: 'NATURAL BEAUTY',
    category: 'dress',
    tags: ['ナチュラル', 'レディース', 'ワンピース'],
    affiliate_url: 'https://example.com/product2',
  },
];

let mockSwipes: any[] = [];
let mockFavorites: any[] = [];
let currentUser: any = null;

// 開発環境用のSupabase互換クライアント
export const devSupabase = {
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      console.log('[DevSupabase] signInWithPassword:', email);
      const user = mockUsers.find(u => u.email === email && u.password === password);
      if (user) {
        currentUser = { ...user, session: { access_token: 'dev-token', expires_at: Date.now() + 3600000 } };
        await AsyncStorage.setItem('dev-auth-user', JSON.stringify(currentUser));
        return { data: { user: currentUser, session: currentUser.session }, error: null };
      }
      return { data: null, error: { message: 'Invalid login credentials' } };
    },

    signUp: async ({ email, password }: { email: string; password: string }) => {
      console.log('[DevSupabase] signUp:', email);
      const exists = mockUsers.find(u => u.email === email);
      if (exists) {
        return { data: null, error: { message: 'User already registered' } };
      }
      const newUser = {
        id: `dev-user-${Date.now()}`,
        email,
        password,
        created_at: new Date().toISOString(),
      };
      mockUsers.push(newUser);
      currentUser = { ...newUser, session: { access_token: 'dev-token', expires_at: Date.now() + 3600000 } };
      await AsyncStorage.setItem('dev-auth-user', JSON.stringify(currentUser));
      return { data: { user: currentUser, session: currentUser.session }, error: null };
    },

    signOut: async () => {
      console.log('[DevSupabase] signOut');
      currentUser = null;
      await AsyncStorage.removeItem('dev-auth-user');
      return { error: null };
    },

    getSession: async () => {
      console.log('[DevSupabase] getSession');
      const stored = await AsyncStorage.getItem('dev-auth-user');
      if (stored) {
        currentUser = JSON.parse(stored);
        return { data: { session: currentUser.session }, error: null };
      }
      return { data: { session: null }, error: null };
    },

    refreshSession: async () => {
      console.log('[DevSupabase] refreshSession');
      if (currentUser) {
        currentUser.session.expires_at = Date.now() + 3600000;
        await AsyncStorage.setItem('dev-auth-user', JSON.stringify(currentUser));
        return { data: { session: currentUser.session }, error: null };
      }
      return { data: { session: null }, error: null };
    },

    updateUser: async (updates: any) => {
      console.log('[DevSupabase] updateUser');
      if (currentUser) {
        currentUser = { ...currentUser, ...updates };
        await AsyncStorage.setItem('dev-auth-user', JSON.stringify(currentUser));
        return { data: { user: currentUser }, error: null };
      }
      return { data: null, error: { message: 'No user logged in' } };
    },

    resetPasswordForEmail: async (email: string) => {
      console.log('[DevSupabase] resetPasswordForEmail:', email);
      return { data: {}, error: null };
    },

    onAuthStateChange: (callback: any) => {
      console.log('[DevSupabase] onAuthStateChange registered');
      // 開発環境では簡略化
      return {
        data: { subscription: { unsubscribe: () => {} } },
      };
    },
  },

  from: (table: string) => {
    console.log('[DevSupabase] from:', table);
    return {
      select: (columns = '*') => ({
        eq: (column: string, value: any) => ({
          single: async () => {
            if (table === 'users' && currentUser && column === 'id' && value === currentUser.id) {
              return { data: currentUser, error: null };
            }
            return { data: null, error: { message: 'Not found' } };
          },
        }),
        order: (column: string, options?: any) => ({
          limit: (count: number) => ({
            execute: async () => {
              if (table === 'products') {
                return { data: mockProducts.slice(0, count), error: null };
              }
              if (table === 'swipes' && currentUser) {
                return { data: mockSwipes.filter(s => s.user_id === currentUser.id).slice(0, count), error: null };
              }
              return { data: [], error: null };
            },
          }),
        }),
        execute: async () => {
          if (table === 'products') {
            return { data: mockProducts, error: null };
          }
          return { data: [], error: null };
        },
      }),
      insert: (data: any[]) => ({
        select: () => ({
          single: async () => {
            if (table === 'swipes') {
              const newSwipe = { ...data[0], id: `swipe-${Date.now()}`, created_at: new Date().toISOString() };
              mockSwipes.push(newSwipe);
              return { data: newSwipe, error: null };
            }
            if (table === 'favorites') {
              const newFavorite = { ...data[0], id: `fav-${Date.now()}`, created_at: new Date().toISOString() };
              mockFavorites.push(newFavorite);
              return { data: newFavorite, error: null };
            }
            return { data: data[0], error: null };
          },
        }),
      }),
      update: (updates: any) => ({
        eq: (column: string, value: any) => ({
          select: () => ({
            single: async () => {
              return { data: { ...updates, id: value }, error: null };
            },
          }),
        }),
      }),
      delete: () => ({
        eq: (column: string, value: any) => ({
          execute: async () => {
            if (table === 'favorites') {
              mockFavorites = mockFavorites.filter(f => f.id !== value);
            }
            return { error: null };
          },
        }),
      }),
    };
  },
};

// 開発環境でのみ使用するためのフラグ
export const isDevelopmentMode = __DEV__ && process.env.EXPO_PUBLIC_USE_DEV_MODE === 'true';

console.log('[DevSupabase] Development mode initialized');
