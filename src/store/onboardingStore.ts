import { create } from 'zustand';
import { supabase } from '@/services/supabase';
import { useAuthStore } from './authStore';

interface OnboardingState {
  // ユーザープロファイル情報
  gender: 'male' | 'female' | 'other' | null;
  stylePreference: string[];
  ageGroup: string | null;
  
  // ステップ管理
  currentStep: number;
  totalSteps: number;
  
  // アクション
  setGender: (gender: 'male' | 'female' | 'other') => void;
  setStylePreference: (styles: string[]) => void;
  setAgeGroup: (ageGroup: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  
  // データ保存
  saveUserProfile: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  // ユーザープロファイル初期状態
  gender: null,
  stylePreference: [],
  ageGroup: null,
  
  // ステップ管理
  currentStep: 1,
  totalSteps: 4,
  
  // 保存状態
  isLoading: false,
  error: null,
  
  // アクション
  setGender: (gender) => set({ gender }),
  
  setStylePreference: (styles) => set({ stylePreference: styles }),
  
  setAgeGroup: (ageGroup) => set({ ageGroup }),
  
  nextStep: () => {
    const { currentStep, totalSteps } = get();
    if (currentStep < totalSteps) {
      set({ currentStep: currentStep + 1 });
    }
  },
  
  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 1) {
      set({ currentStep: currentStep - 1 });
    }
  },
  
  // ユーザープロファイルをSupabaseに保存
  saveUserProfile: async () => {
    const { gender, stylePreference, ageGroup } = get();
    const { user } = useAuthStore.getState();
    
    if (!user) {
      set({ error: 'ユーザーがログインしていません' });
      return;
    }
    
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase
        .from('users')
        .upsert([
          {
            id: user.id,
            gender,
            style_preference: stylePreference,
            age_group: ageGroup,
          },
        ], { onConflict: 'id' });
        
      if (error) throw error;
      
      // 認証ストアのユーザー情報も更新
      useAuthStore.getState().setUser({
        ...user,
        gender,
        stylePreference,
        ageGroup,
      });
      
    } catch (error: any) {
      console.error('Error saving user profile:', error);
      set({ error: error.message || 'プロファイルの保存中にエラーが発生しました' });
    } finally {
      set({ isLoading: false });
    }
  },
}));
