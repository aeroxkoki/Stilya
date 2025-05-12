import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { defaultTheme, Theme, getThemeByUserPreferences } from '../styles/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ユーザーの好みを表すインターフェース
interface UserPreferences {
  gender?: 'male' | 'female' | 'other';
  stylePreferences?: string[];
}

// ThemeContextで提供する値の型
interface ThemeContextType {
  theme: Theme;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  isDarkMode: boolean;
  toggleDarkMode: () => Promise<void>;
}

// ThemeContextの作成
export const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  updateUserPreferences: async () => {},
  isDarkMode: false,
  toggleDarkMode: async () => {},
});

// ThemeProviderのprops型
interface ThemeProviderProps {
  children: ReactNode;
}

// AsyncStorageのキー
const USER_PREFERENCES_KEY = '@Stilya:userPreferences';
const DARK_MODE_KEY = '@Stilya:darkMode';

// ThemeProviderコンポーネント
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({});
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // 初期設定の読み込み
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        // ユーザー設定の読み込み
        const preferencesString = await AsyncStorage.getItem(USER_PREFERENCES_KEY);
        if (preferencesString) {
          const preferences = JSON.parse(preferencesString) as UserPreferences;
          setUserPreferences(preferences);
          // 設定に基づいてテーマを更新
          setTheme(getThemeByUserPreferences(preferences.gender));
        }

        // ダークモード設定の読み込み
        const darkModeString = await AsyncStorage.getItem(DARK_MODE_KEY);
        if (darkModeString) {
          setIsDarkMode(JSON.parse(darkModeString));
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };

    loadPreferences();
  }, []);

  // ユーザー設定の更新
  const updateUserPreferences = async (preferences: Partial<UserPreferences>) => {
    try {
      const updatedPreferences = { ...userPreferences, ...preferences };
      setUserPreferences(updatedPreferences);
      
      // テーマを更新
      setTheme(getThemeByUserPreferences(updatedPreferences.gender));
      
      // 設定を保存
      await AsyncStorage.setItem(
        USER_PREFERENCES_KEY,
        JSON.stringify(updatedPreferences)
      );
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  // ダークモードの切り替え
  const toggleDarkMode = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      
      // 設定を保存
      await AsyncStorage.setItem(DARK_MODE_KEY, JSON.stringify(newMode));
      
      // TODO: ダークモードテーマの適用
      // 現在はダークモードテーマが実装されていないため、切り替えても見た目は変わりません
    } catch (error) {
      console.error('Error toggling dark mode:', error);
    }
  };

  // コンテキスト値
  const contextValue: ThemeContextType = {
    theme,
    updateUserPreferences,
    isDarkMode,
    toggleDarkMode,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// カスタムフック
export const useTheme = () => useContext(ThemeContext);
