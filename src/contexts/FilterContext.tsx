import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/services/supabase';
import { FILTER_STYLE_OPTIONS } from '@/constants/constants';

// 改良されたフィルターオプション
export interface FilterOptions {
  priceRange: [number, number];  // 予算範囲
  styles: string[];              // スタイル（複数選択可能）に変更
  moods: string[];              // 気分タグ（複数選択）
  includeUsed?: boolean;        // 中古品を含むかどうか（デフォルト: true）
  gender?: 'male' | 'female' | 'unisex' | 'all';  // 性別フィルター追加
  ageGroup?: string;            // 年齢層フィルター追加
}

// コンテキストの型定義
interface FilterContextType {
  globalFilters: FilterOptions;
  setGlobalFilters: (filters: FilterOptions) => void;
  resetFilters: () => void;
  getSmartDefaults: () => Promise<FilterOptions>;
  // 簡単なアクセス用のヘルパー関数
  setPriceRange: (range: [number, number]) => void;
  toggleStyle: (style: string) => void;  // setStyleから変更
  toggleMood: (mood: string) => void;
  setIncludeUsed: (include: boolean) => void;
  setGender: (gender: 'male' | 'female' | 'unisex' | 'all') => void;
  setAgeGroup: (ageGroup: string | undefined) => void;
  clearStyles: () => void;  // スタイルをクリアする関数追加
}

// デフォルトフィルター
const defaultFilters: FilterOptions = {
  priceRange: [0, 50000],
  styles: [],  // 空配列に変更
  moods: [],
  includeUsed: true,  // デフォルトで中古品も含む
  gender: 'all',
  ageGroup: undefined
};

// スタイルオプション（constants.tsから取得）
export const STYLE_OPTIONS = FILTER_STYLE_OPTIONS.filter(style => style !== 'すべて');

// 気分タグオプション
export const MOOD_OPTIONS = ['新着', '人気', 'セール'];

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [globalFilters, setGlobalFilters] = useState<FilterOptions>(defaultFilters);

  // 初回読み込み時にローカルストレージから復元
  useEffect(() => {
    const loadStoredFilters = async () => {
      try {
        const stored = await AsyncStorage.getItem('globalFilters');
        if (stored) {
          const parsedFilters = JSON.parse(stored);
          // 旧形式から新形式への移行処理
          if (parsedFilters.style && typeof parsedFilters.style === 'string') {
            parsedFilters.styles = parsedFilters.style === 'すべて' ? [] : [parsedFilters.style];
            delete parsedFilters.style;
          }
          setGlobalFilters({ ...defaultFilters, ...parsedFilters });
        }
      } catch (error) {
        console.error('Failed to load stored filters:', error);
      }
    };
    
    loadStoredFilters();
  }, []);

  // フィルター変更時に保存
  useEffect(() => {
    AsyncStorage.setItem('globalFilters', JSON.stringify(globalFilters));
  }, [globalFilters]);

  // フィルターリセット
  const resetFilters = () => {
    setGlobalFilters(defaultFilters);
  };

  // スマートデフォルト取得
  const getSmartDefaults = async (): Promise<FilterOptions> => {
    try {
      const { user } = (await supabase.auth.getUser()).data;
      if (!user) return defaultFilters;

      // smartFilterServiceからインポート
      const { getSmartDefaults: getSmartDefaultsFromService } = await import('@/services/smartFilterService');
      return await getSmartDefaultsFromService(user.id);
    } catch (error) {
      console.error('Failed to get smart defaults:', error);
      return defaultFilters;
    }
  };

  // ヘルパー関数
  const setPriceRange = (range: [number, number]) => {
    setGlobalFilters(prev => ({
      ...prev,
      priceRange: range
    }));
  };

  // スタイルのトグル（複数選択対応）
  const toggleStyle = (style: string) => {
    setGlobalFilters(prev => {
      const styles = prev.styles || [];
      if (styles.includes(style)) {
        return {
          ...prev,
          styles: styles.filter(s => s !== style)
        };
      } else {
        return {
          ...prev,
          styles: [...styles, style]
        };
      }
    });
  };

  const toggleMood = (mood: string) => {
    setGlobalFilters(prev => {
      const moods = prev.moods || [];
      if (moods.includes(mood)) {
        return {
          ...prev,
          moods: moods.filter(m => m !== mood)
        };
      } else {
        return {
          ...prev,
          moods: [...moods, mood]
        };
      }
    });
  };

  const setIncludeUsed = (include: boolean) => {
    setGlobalFilters(prev => ({
      ...prev,
      includeUsed: include
    }));
  };

  const setGender = (gender: 'male' | 'female' | 'unisex' | 'all') => {
    setGlobalFilters(prev => ({
      ...prev,
      gender: gender
    }));
  };

  const setAgeGroup = (ageGroup: string | undefined) => {
    setGlobalFilters(prev => ({
      ...prev,
      ageGroup: ageGroup
    }));
  };

  const clearStyles = () => {
    setGlobalFilters(prev => ({
      ...prev,
      styles: []
    }));
  };

  return (
    <FilterContext.Provider value={{
      globalFilters,
      setGlobalFilters,
      resetFilters,
      getSmartDefaults,
      setPriceRange,
      toggleStyle,
      toggleMood,
      setIncludeUsed,
      setGender,
      setAgeGroup,
      clearStyles
    }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};
