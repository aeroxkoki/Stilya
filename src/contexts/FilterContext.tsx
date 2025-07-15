import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/services/supabase';

// 簡素化されたフィルターオプション
export interface FilterOptions {
  priceRange: [number, number];  // 予算範囲
  style?: string;                // スタイル（単一選択）
  moods: string[];              // 気分タグ（複数選択）
}

// コンテキストの型定義
interface FilterContextType {
  globalFilters: FilterOptions;
  setGlobalFilters: (filters: FilterOptions) => void;
  resetFilters: () => void;
  getSmartDefaults: () => Promise<FilterOptions>;
  // 簡単なアクセス用のヘルパー関数
  setPriceRange: (range: [number, number]) => void;
  setStyle: (style: string | undefined) => void;
  toggleMood: (mood: string) => void;
}

// デフォルトフィルター
const defaultFilters: FilterOptions = {
  priceRange: [0, 50000],
  style: 'すべて',
  moods: []
};

// スタイルオプション
export const STYLE_OPTIONS = ['すべて', 'カジュアル', 'きれいめ', 'ナチュラル'];

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
          setGlobalFilters(parsedFilters);
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

  const setStyle = (style: string | undefined) => {
    setGlobalFilters(prev => ({
      ...prev,
      style: style
    }));
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

  return (
    <FilterContext.Provider value={{
      globalFilters,
      setGlobalFilters,
      resetFilters,
      getSmartDefaults,
      setPriceRange,
      setStyle,
      toggleMood
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
