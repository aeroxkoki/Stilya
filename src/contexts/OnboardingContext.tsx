import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '@/services/supabase';
import { useAuth } from './AuthContext';

interface OnboardingContextType {
  // ユーザープロファイル情報
  gender?: 'male' | 'female' | 'other';
  stylePreference: string[];
  ageGroup?: string;
  styleQuizResults?: StyleQuizResult[];
  
  // ステップ管理
  currentStep: number;
  totalSteps: number;
  
  // アクション
  setGender: (gender: 'male' | 'female' | 'other') => void;
  setStylePreference: (styles: string[]) => void;
  setAgeGroup: (ageGroup: string) => void;
  setStyleQuizResults: (results: StyleQuizResult[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  
  // データ保存
  saveUserProfile: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// スタイル診断結果の型定義
export interface StyleQuizResult {
  productId: string;
  liked: boolean;
  category?: string;
  tags?: string[];
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, setUser } = useAuth();
  
  // ユーザープロファイル初期状態
  const [gender, setGender] = useState<'male' | 'female' | 'other' | undefined>();
  const [stylePreference, setStylePreference] = useState<string[]>([]);
  const [ageGroup, setAgeGroup] = useState<string | undefined>();
  const [styleQuizResults, setStyleQuizResults] = useState<StyleQuizResult[]>([]);
  
  // ステップ管理
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5; // 診断を含めて5ステップに増加
  
  // 保存状態
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // ユーザープロファイルをSupabaseに保存
  const saveUserProfile = async () => {
    if (!user) {
      setError('ユーザーがログインしていません');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('users')
        .upsert([
          {
            id: user.id,
            gender,
            style_preferences: stylePreference, // DBのフィールド名に合わせて修正
            age_group: ageGroup,
          },
        ], { onConflict: 'id' });

      if (updateError) throw updateError;

      // スタイル診断結果を保存（スワイプ履歴として記録）
      if (styleQuizResults && styleQuizResults.length > 0) {
        const swipeData = styleQuizResults.map(result => ({
          user_id: user.id,
          product_id: result.productId,
          result: result.liked ? 'yes' : 'no',
        }));

        const { error: swipeError } = await supabase
          .from('swipes')
          .insert(swipeData);

        if (swipeError) {
          console.error('Error saving style quiz results:', swipeError);
          // スワイプの保存エラーは致命的ではないので続行
        }
      }

      // AuthContextのユーザー情報も更新
      setUser({
        ...user,
        gender,
        stylePreference,
        ageGroup,
      });
    } catch (error: any) {
      console.error('Error saving user profile:', error);
      setError(error.message || 'プロファイルの保存中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const value: OnboardingContextType = {
    gender,
    stylePreference,
    ageGroup,
    styleQuizResults,
    currentStep,
    totalSteps,
    setGender,
    setStylePreference,
    setAgeGroup,
    setStyleQuizResults,
    nextStep,
    prevStep,
    saveUserProfile,
    isLoading,
    error,
  };

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
};
