// 基本的なテーマ設定

export interface ThemeColors {
  background: {
    main: string;
    secondary: string;
  };
  text: {
    primary: string;
    secondary: string;
  };
  accent: {
    primary: string;
    secondary: string;
  };
}

export interface Theme {
  colors: ThemeColors;
}

export const lightTheme: Theme = {
  colors: {
    background: {
      main: '#ffffff',
      secondary: '#f8f9fa',
    },
    text: {
      primary: '#000000',
      secondary: '#6b7280',
    },
    accent: {
      primary: '#3b82f6',
      secondary: '#10b981',
    },
  },
};

export const darkTheme: Theme = {
  colors: {
    background: {
      main: '#1f2937',
      secondary: '#374151',
    },
    text: {
      primary: '#ffffff',
      secondary: '#d1d5db',
    },
    accent: {
      primary: '#60a5fa',
      secondary: '#34d399',
    },
  },
};

export const getThemeByUserPreferences = (
  gender?: 'male' | 'female' | 'other',
  isDarkMode: boolean = false
): Theme => {
  return isDarkMode ? darkTheme : lightTheme;
};
