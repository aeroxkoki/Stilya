import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { lightTheme, darkTheme, Theme, StyleType, styleThemes } from '../styles/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

// StyleContextで提供する値の型
interface StyleContextType {
  theme: Theme;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  colors: Theme['colors'];
  styleType: StyleType;
  setStyleType: (style: StyleType) => void;
}

// ストレージのキー
const DARK_MODE_STORAGE_KEY = 'STILYA_DARK_MODE';
const STYLE_TYPE_STORAGE_KEY = 'STILYA_STYLE_TYPE';

// StyleContextの作成
export const StyleContext = createContext<StyleContextType>({
  theme: lightTheme,
  isDarkMode: false,
  toggleDarkMode: () => {},
  colors: lightTheme.colors,
  styleType: 'minimal',
  setStyleType: () => {},
});

// StyleProviderのprops型
interface StyleProviderProps {
  children: ReactNode;
}

// StyleProviderコンポーネント
export const StyleProvider: React.FC<StyleProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [styleType, setStyleType] = useState<StyleType>('minimal');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // 初期設定の読み込み
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // ダークモード設定の読み込み
        const darkModeSetting = await AsyncStorage.getItem(DARK_MODE_STORAGE_KEY);
        if (darkModeSetting !== null) {
          setIsDarkMode(darkModeSetting === 'true');
        }

        // スタイル設定の読み込み
        const styleSetting = await AsyncStorage.getItem(STYLE_TYPE_STORAGE_KEY) as StyleType | null;
        if (styleSetting !== null && Object.keys(styleThemes).includes(styleSetting)) {
          setStyleType(styleSetting as StyleType);
        }
      } catch (error) {
        console.error('Failed to load theme settings:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadSettings();
  }, []);

  // ダークモードの切り替え
  const toggleDarkMode = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    try {
      await AsyncStorage.setItem(DARK_MODE_STORAGE_KEY, String(newMode));
    } catch (error) {
      console.error('Failed to save dark mode setting:', error);
    }
  };

  // スタイルタイプの設定
  const handleSetStyleType = async (style: StyleType) => {
    setStyleType(style);
    try {
      await AsyncStorage.setItem(STYLE_TYPE_STORAGE_KEY, style);
    } catch (error) {
      console.error('Failed to save style type setting:', error);
    }
  };

  // 現在のテーマの決定
  // ダークモード優先: ダークモードがONの場合はダークテーマを使用
  // それ以外は選択されたスタイルのテーマを使用
  const theme = isDarkMode ? darkTheme : styleThemes[styleType];

  // コンテキスト値
  const contextValue: StyleContextType = {
    theme,
    isDarkMode,
    toggleDarkMode,
    colors: theme.colors,
    styleType,
    setStyleType: handleSetStyleType,
  };

  // 設定がロードされるまでもデフォルトテーマで表示
  // (白い画面を防ぐため、nullを返さない)
  return (
    <StyleContext.Provider value={contextValue}>
      {children}
    </StyleContext.Provider>
  );
};

// カスタムフック
export const useStyle = () => useContext(StyleContext);