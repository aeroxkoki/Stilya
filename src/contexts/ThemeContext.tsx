import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { lightTheme, darkTheme, Theme, ThemeColors, getThemeByUserPreferences } from '../styles/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar, useColorScheme } from 'react-native';

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
  setSystemTheme: () => Promise<void>;
  isSystemTheme: boolean;
  colors: ThemeColors; // colorsプロパティを追加
}

// ThemeContextの作成
export const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  updateUserPreferences: async () => {},
  isDarkMode: false,
  toggleDarkMode: async () => {},
  setSystemTheme: async () => {},
  isSystemTheme: false,
  colors: lightTheme.colors, // colorsプロパティを追加
});

// ThemeProviderのprops型
interface ThemeProviderProps {
  children: ReactNode;
}

// AsyncStorageのキー
const USER_PREFERENCES_KEY = '@Stilya:userPreferences';
const DARK_MODE_KEY = '@Stilya:darkMode';
const SYSTEM_THEME_KEY = '@Stilya:systemTheme';

// ThemeProviderコンポーネント
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(lightTheme);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({});
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isSystemTheme, setIsSystemTheme] = useState<boolean>(true);
  
  // システムテーマの取得
  const colorScheme = useColorScheme();

  // テーマの適用関数
  const applyTheme = (preferences: UserPreferences, darkMode: boolean) => {
    const newTheme = getThemeByUserPreferences(preferences.gender, darkMode);
    setTheme(newTheme);
    
    // StatusBarの色を設定
    StatusBar.setBarStyle(darkMode ? 'light-content' : 'dark-content');
    if (StatusBar.setBackgroundColor) {
      StatusBar.setBackgroundColor(darkMode ? darkTheme.colors.background.main : lightTheme.colors.background.main);
    }
  };

  // 初期設定の読み込み
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        // ユーザー設定の読み込み
        const preferencesString = await AsyncStorage.getItem(USER_PREFERENCES_KEY);
        let preferences: UserPreferences = {};
        
        if (preferencesString) {
          preferences = JSON.parse(preferencesString) as UserPreferences;
          setUserPreferences(preferences);
        }

        // システムテーマ設定の読み込み
        const systemThemeString = await AsyncStorage.getItem(SYSTEM_THEME_KEY);
        let useSystemTheme = true;
        
        if (systemThemeString) {
          useSystemTheme = JSON.parse(systemThemeString);
          setIsSystemTheme(useSystemTheme);
        }

        // ダークモード設定の読み込み
        let darkMode = false;
        
        if (useSystemTheme) {
          // システムテーマを使用する場合
          darkMode = colorScheme === 'dark';
        } else {
          // 手動設定の場合
          const darkModeString = await AsyncStorage.getItem(DARK_MODE_KEY);
          if (darkModeString) {
            darkMode = JSON.parse(darkModeString);
          }
        }
        
        setIsDarkMode(darkMode);
        applyTheme(preferences, darkMode);
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };

    loadPreferences();
  }, [colorScheme]);

  // ユーザー設定の更新
  const updateUserPreferences = async (preferences: Partial<UserPreferences>) => {
    try {
      const updatedPreferences = { ...userPreferences, ...preferences };
      setUserPreferences(updatedPreferences);
      
      // テーマを更新
      applyTheme(updatedPreferences, isDarkMode);
      
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
      // システムテーマを使用している場合はオフにする
      if (isSystemTheme) {
        setIsSystemTheme(false);
        await AsyncStorage.setItem(SYSTEM_THEME_KEY, JSON.stringify(false));
      }
      
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      
      // テーマを更新
      applyTheme(userPreferences, newMode);
      
      // 設定を保存
      await AsyncStorage.setItem(DARK_MODE_KEY, JSON.stringify(newMode));
    } catch (error) {
      console.error('Error toggling dark mode:', error);
    }
  };

  // システムテーマの使用設定
  const setSystemTheme = async () => {
    try {
      setIsSystemTheme(true);
      
      // システムのダークモード状態を取得
      const systemDarkMode = colorScheme === 'dark';
      setIsDarkMode(systemDarkMode);
      
      // テーマを更新
      applyTheme(userPreferences, systemDarkMode);
      
      // 設定を保存
      await AsyncStorage.setItem(SYSTEM_THEME_KEY, JSON.stringify(true));
    } catch (error) {
      console.error('Error setting system theme:', error);
    }
  };

  // システムテーマが変更された場合の対応
  useEffect(() => {
    if (isSystemTheme && colorScheme) {
      const systemDarkMode = colorScheme === 'dark';
      setIsDarkMode(systemDarkMode);
      applyTheme(userPreferences, systemDarkMode);
    }
  }, [colorScheme, isSystemTheme]);

  // コンテキスト値
  const contextValue: ThemeContextType = {
    theme,
    updateUserPreferences,
    isDarkMode,
    toggleDarkMode,
    setSystemTheme,
    isSystemTheme,
    colors: theme.colors, // themeからcolorsを提供
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// カスタムフック
export const useTheme = () => useContext(ThemeContext);
