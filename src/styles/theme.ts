// 基本的なテーマ設定

export interface ThemeColors {
  primary: string;
  secondary: string;
  border: string;
  background: {
    main: string;
    secondary: string;
    card: string;
    input: string;
  };
  text: {
    primary: string;
    secondary: string;
    hint: string;
    inverse: string;
  };
  accent: {
    primary: string;
    secondary: string;
  };
  button: {
    disabled: string;
  };
  status: {
    success: string;
    error: string;
    warning: string;
    info: string;
  };
}

export interface Theme {
  colors: ThemeColors;
  spacing: {
    xs: number;
    s: number;
    m: number;
    l: number;
    xl: number;
  };
  radius: {
    s: number;
    m: number;
    l: number;
  };
  fontWeights: {
    regular: string;
    medium: string;
    bold: string;
  };
  fontSizes: {
    xs: number;
    s: number;
    m: number;
    l: number;
    xl: number;
  };
}

export const lightTheme: Theme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#10b981',
    border: '#e5e7eb',
    background: {
      main: '#ffffff',
      secondary: '#f8f9fa',
      card: '#ffffff',
      input: '#f9fafb',
    },
    text: {
      primary: '#000000',
      secondary: '#6b7280',
      hint: '#9ca3af',
      inverse: '#ffffff',
    },
    accent: {
      primary: '#3b82f6',
      secondary: '#10b981',
    },
    button: {
      disabled: '#e5e7eb',
    },
    status: {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
    },
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
  },
  radius: {
    s: 4,
    m: 8,
    l: 16,
  },
  fontWeights: {
    regular: '400',
    medium: '500',
    bold: '700',
  },
  fontSizes: {
    xs: 12,
    s: 14,
    m: 16,
    l: 18,
    xl: 24,
  },
};

export const darkTheme: Theme = {
  colors: {
    primary: '#60a5fa',
    secondary: '#34d399',
    border: '#374151',
    background: {
      main: '#1f2937',
      secondary: '#374151',
      card: '#111827',
      input: '#374151',
    },
    text: {
      primary: '#ffffff',
      secondary: '#d1d5db',
      hint: '#9ca3af',
      inverse: '#000000',
    },
    accent: {
      primary: '#60a5fa',
      secondary: '#34d399',
    },
    button: {
      disabled: '#4b5563',
    },
    status: {
      success: '#34d399',
      error: '#f87171',
      warning: '#fbbf24',
      info: '#60a5fa',
    },
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
  },
  radius: {
    s: 4,
    m: 8,
    l: 16,
  },
  fontWeights: {
    regular: '400',
    medium: '500',
    bold: '700',
  },
  fontSizes: {
    xs: 12,
    s: 14,
    m: 16,
    l: 18,
    xl: 24,
  },
};

export const getThemeByUserPreferences = (
  gender?: 'male' | 'female' | 'other',
  isDarkMode: boolean = false
): Theme => {
  return isDarkMode ? darkTheme : lightTheme;
};
