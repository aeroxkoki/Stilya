import React, { createContext, useContext, useState, ReactNode } from 'react';
import { lightTheme, darkTheme, Theme } from '../styles/theme';

// ThemeContextで提供する値の型
interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  colors: Theme['colors'];
}

// ThemeContextの作成
export const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDarkMode: false,
  toggleDarkMode: () => {},
  colors: lightTheme.colors,
});

// ThemeProviderのprops型
interface ThemeProviderProps {
  children: ReactNode;
}

// ThemeProviderコンポーネント
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const theme = isDarkMode ? darkTheme : lightTheme;

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // コンテキスト値
  const contextValue: ThemeContextType = {
    theme,
    isDarkMode,
    toggleDarkMode,
    colors: theme.colors,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// カスタムフック
export const useTheme = () => useContext(ThemeContext);