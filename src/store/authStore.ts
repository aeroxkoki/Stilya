import { create } from 'zustand';
import { AuthState, User } from '@/types';
import { supabase, signIn, signUp, signOut } from '@/services/supabase';

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  error: null,
  
  setUser: (user) => set({ user }),
  
  initialize: async () => {
    try {
      set({ loading: true, error: null });
      
      // セッションを取得
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // セッションがある場合はユーザー情報を取得
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // ユーザープロファイルを取得（Supabaseのprofilesテーブルから）
          const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (error && error.code !== 'PGRST116') {
            // PGRST116はデータが見つからないエラー
            console.error('Error fetching user profile:', error);
          }
          
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
      } else {
        // セッションがない場合はログアウト状態
        set({ user: null, session: null, loading: false });
      }
    } catch (error) {
      console.error('Error initializing auth store:', error);
      set({ error: 'セッションの初期化に失敗しました', loading: false });
    }
  },
  
  login: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const data = await signIn(email, password);
      
      if (data.user) {
        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user profile:', error);
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
      set({
        error: error.message || 'ログインに失敗しました',
        loading: false,
      });
    }
  },
  
  register: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const data = await signUp(email, password);
      
      // サインアップ後は、ユーザーが確認メールを受け取る場合があるため、
      // すぐにログイン状態にならない場合がある
      set({
        user: data.user ? {
          id: data.user.id,
          email: data.user.email,
        } : null,
        session: data.session,
        loading: false,
      });
    } catch (error: any) {
      console.error('Error registering:', error);
      set({
        error: error.message || 'アカウント登録に失敗しました',
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
}));
