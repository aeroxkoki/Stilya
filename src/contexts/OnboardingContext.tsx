import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { useAuth } from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingContextType {
  // ユーザープロファイル情報
  gender?: 'male' | 'female' | 'other';
  stylePreference: string[];
  ageGroup?: string;
  styleQuizResults?: StyleQuizResult[];
  
  // ステップ管理
  currentStep: number;
  totalSteps: number;
  
  // 初回ユーザー管理
  isFirstTimeUser: boolean;
  setIsFirstTimeUser: (value: boolean) => void;
  
  // アクション
  setGender: (gender: 'male' | 'female' | 'other') => void;
  setStylePreference: (styles: string[]) => void;
  setAgeGroup: (ageGroup: string) => void;
  setStyleQuizResults: (results: StyleQuizResult[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  
  // データ保存
  saveUserProfile: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  
  // 新規追加メソッド
  getRecommendedStyles: () => string[];
  getSelectionInsights: () => SelectionInsights;
}

// 新規型定義
export interface SelectionInsights {
  likePercentage: number;
  dominantStyles: string[];
  consistentWithPreference: boolean;
}

// スタイル診断結果の型定義
export interface StyleQuizResult {
  productId: string;
  liked: boolean;
  category?: string;
  tags?: string[];
  isTutorial?: boolean; // チュートリアル商品かどうか
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
  
  // 初回ユーザー管理
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);
  
  // ステップ管理
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5; // 診断を含めて5ステップに増加
  
  // 保存状態
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 初回ユーザーステータスをロード
  useEffect(() => {
    const loadFirstTimeStatus = async () => {
      try {
        const stored = await AsyncStorage.getItem('isFirstTimeUser');
        if (stored === 'false') {
          setIsFirstTimeUser(false);
        }
      } catch (error) {
        console.error('Error loading first time status:', error);
      }
    };
    loadFirstTimeStatus();
  }, []);

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

      // スタイル診断結果を保存（チュートリアル商品を除外）
      if (styleQuizResults && styleQuizResults.length > 0) {
        // チュートリアル以外の結果のみを保存
        const realQuizResults = styleQuizResults.filter(result => !result.isTutorial);
        
        if (realQuizResults.length > 0) {
          const swipeData = realQuizResults.map(result => ({
            user_id: user.id,
            product_id: result.productId,
            result: result.liked ? 'yes' : 'no',
            is_style_quiz: true, // 診断であることを示すフラグ
          }));

          const { error: swipeError } = await supabase
            .from('swipes')
            .insert(swipeData);

          if (swipeError) {
            console.error('Error saving style quiz results:', swipeError);
            // スワイプの保存エラーは致命的ではないので続行
          }
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

  // 新規メソッド: 性別に基づいた推奨スタイル
  const getRecommendedStyles = (): string[] => {
    if (gender === 'male') {
      return ['casual', 'street', 'mode', 'classic'];
    } else if (gender === 'female') {
      return ['casual', 'natural', 'feminine', 'classic'];
    }
    return ['casual', 'street', 'mode', 'natural', 'classic', 'feminine'];
  };

  // 新規メソッド: 選択内容の分析結果
  const getSelectionInsights = (): SelectionInsights => {
    // チュートリアル以外の結果のみを分析対象にする
    const quizResults = (styleQuizResults || []).filter(r => !r.isTutorial);
    const likedItems = quizResults.filter(r => r.liked);
    
    // Like率の計算
    const likePercentage = quizResults.length > 0
      ? Math.round((likedItems.length / quizResults.length) * 100)
      : 0;
    
    // 最も多くLikeされたタグを集計
    const tagCounts: Record<string, number> = {};
    likedItems.forEach(item => {
      item.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    // 上位2つのスタイルを特定
    const dominantStyles = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([tag]) => tag);
    
    // 選択したスタイルとの一致度
    const consistentWithPreference = stylePreference.some(style => 
      dominantStyles.some(tag => tag.toLowerCase().includes(style.toLowerCase()))
    );
    
    return { likePercentage, dominantStyles, consistentWithPreference };
  };

  // CompleteScreenへの遷移時に更新
  const completeOnboarding = async () => {
    await AsyncStorage.setItem('isFirstTimeUser', 'false');
    setIsFirstTimeUser(false);
  };

  const value: OnboardingContextType = {
    gender,
    stylePreference,
    ageGroup,
    styleQuizResults,
    currentStep,
    totalSteps,
    isFirstTimeUser,
    setIsFirstTimeUser,
    setGender,
    setStylePreference,
    setAgeGroup,
    setStyleQuizResults,
    nextStep,
    prevStep,
    saveUserProfile,
    completeOnboarding,
    isLoading,
    error,
    getRecommendedStyles,
    getSelectionInsights,
  };

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
};
