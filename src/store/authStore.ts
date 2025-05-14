import { create } from 'zustand';
import { AuthState, User } from '@/types';
import {
  supabase,
  signIn,
  signUp,
  signOut,
  resetPassword,
  updatePassword,
  refreshSession,
  isSessionExpired,
  createUserProfile,
  getUserProfile,
  updateUserProfile
} from '@/services/supabase';

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  resetUserPassword: (email: string) => Promise<void>;
  updateUserPassword: (newPassword: string) => Promise<void>;
  checkAndRefreshSession: () => Promise<boolean>;
  setUser: (user: User | null) => void;
  createProfile: (profile: Partial<User>) => Promise<void>;
  fetchUserProfile: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  error: null,
  
  setUser: (user) => set({ user }),
  clearError: () => set({ error: null }),
  
  initialize: async () => {
    try {
      set({ loading: true, error: null });
      
      // セッションを取得
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      
      if (session) {
        // セッションの有効期限をチェック
        if (isSessionExpired(session)) {
          // セッションの更新が必要な場合
          const refreshResult = await refreshSession();
          const refreshData = refreshResult.data;
          
          if (refreshData.session) {
            const userResult = await supabase.auth.getUser();
            const userData = userResult.data;
            const user = userData.user;
            
            if (user) {
              await get().fetchUserProfile();
            }
          } else {
            // 更新に失敗した場合はログアウト状態
            set({ user: null, session: null, loading: false });
            return;
          }
        } else {
          // 有効なセッションがある場合はユーザー情報を取得
          const userResult = await supabase.auth.getUser();
          const userData = userResult.data;
          const user = userData.user;
          
          if (user) {
            // ユーザープロファイルを取得
            const profile = await getUserProfile(user.id);
            
            set({
              user: {
                id: user.id,
                email: user.email,
                ...profile
              },
              session,
              loading: false,
            });
          }
        }
      } else {
        // セッションがない場合はログアウト状態
        set({ user: null, session: null, loading: false });
      }
    } catch (error) {
      console.error('Error initializing auth store:', error);
      set({ error: 'セッションの初期化に失敗しました', loading: false });
    }
  },
  
  checkAndRefreshSession: async () => {
    try {
      const { session } = get();
      
      if (!session) return false;
      
      if (isSessionExpired(session)) {
        const refreshResult = await refreshSession();
        const refreshData = refreshResult.data;
        if (refreshData.session) {
          set({ session: refreshData.session });
          return true;
        }
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return false;
    }
  },
  
  login: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const data = await signIn(email, password);
      
      if (data.user) {
        // ユーザープロファイルを取得
        const profile = await getUserProfile(data.user.id);
        
        // プロファイルがない場合は作成
        if (!profile) {
          await createUserProfile({
            id: data.user.id,
            email: data.user.email,
          });
        }
        
        set({
          user: {
            id: data.user.id,
            email: data.user.email,
            ...profile
          },
          session: data.session,
          loading: false,
        });
      }
    } catch (error: any) {
      console.error('Error logging in:', error);
      
      // エラーメッセージを整形
      let errorMessage = 'ログインに失敗しました';
      if (error.message) {
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'メールアドレスかパスワードが間違っています';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'メールアドレスが確認されていません。メールをご確認ください';
        } else {
          errorMessage = error.message;
        }
      }
      
      set({
        error: errorMessage,
        loading: false,
      });
    }
  },
  
  register: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const data = await signUp(email, password);
      
      // サインアップ後、ユーザーが存在する場合はプロファイルを作成
      if (data.user) {
        await createUserProfile({
          id: data.user.id,
          email: data.user.email,
        });
        
        set({
          user: {
            id: data.user.id,
            email: data.user.email,
          },
          session: data.session,
          loading: false,
        });
      } else {
        // メール確認が必要な場合
        set({
          user: null,
          session: null,
          loading: false,
          error: 'アカウント登録が完了しました。確認メールをご確認ください。',
        });
      }
    } catch (error: any) {
      console.error('Error registering:', error);
      
      // エラーメッセージを整形
      let errorMessage = 'アカウント登録に失敗しました';
      if (error.message) {
        if (error.message.includes('User already registered')) {
          errorMessage = 'このメールアドレスは既に登録されています';
        } else if (error.message.includes('Password should be')) {
          errorMessage = 'パスワードは6文字以上である必要があります';
        } else {
          errorMessage = error.message;
        }
      }
      
      set({
        error: errorMessage,
        loading: false,
      });
    }
  },
  
  logout: async () => {
    try {
      set({ loading: true, error: null });
      await signOut();
      set({ user: null, session: null, loading: false });
    } catch (error: any) {
      console.error('Error logging out:', error);
      set({
        error: error.message || 'ログアウトに失敗しました',
        loading: false,
      });
    }
  },
  
  resetUserPassword: async (email) => {
    try {
      set({ loading: true, error: null });
      await resetPassword(email);
      set({ loading: false });
    } catch (error: any) {
      console.error('Error resetting password:', error);
      set({
        error: error.message || 'パスワードリセットに失敗しました',
        loading: false,
      });
    }
  },
  
  updateUserPassword: async (newPassword) => {
    try {
      set({ loading: true, error: null });
      await updatePassword(newPassword);
      set({ loading: false });
    } catch (error: any) {
      console.error('Error updating password:', error);
      set({
        error: error.message || 'パスワード更新に失敗しました',
        loading: false,
      });
    }
  },
  
  fetchUserProfile: async () => {
    try {
      const { user } = get();
      if (!user) {
        throw new Error('ユーザーが認証されていません');
      }
      
      set({ loading: true, error: null });
      const profile = await getUserProfile(user.id);
      
      set({
        user: {
          ...user,
          ...profile,
        },
        loading: false,
      });
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      set({
        error: error.message || 'プロファイルの取得に失敗しました',
        loading: false,
      });
    }
  },
  
  createProfile: async (profile) => {
    try {
      const { user } = get();
      if (!user) {
        throw new Error('ユーザーが認証されていません');
      }
      
      set({ loading: true, error: null });
      await createUserProfile({
        id: user.id,
        ...profile,
      });
      
      set({
        user: {
          ...user,
          ...profile,
        },
        loading: false,
      });
    } catch (error: any) {
      console.error('Error creating user profile:', error);
      set({
        error: error.message || 'プロファイルの作成に失敗しました',
        loading: false,
      });
    }
  },
  
  updateProfile: async (updates) => {
    try {
      const { user } = get();
      if (!user) {
        throw new Error('ユーザーが認証されていません');
      }
      
      set({ loading: true, error: null });
      await updateUserProfile(user.id, updates);
      
      set({
        user: {
          ...user,
          ...updates,
        },
        loading: false,
      });
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      set({
        error: error.message || 'プロファイルの更新に失敗しました',
        loading: false,
      });
    }
  },
}));
