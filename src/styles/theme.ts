// テーマカラーの定義
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    error: string;
    success: string;
    warning: string;
    text: {
      primary: string;
      secondary: string;
      hint: string;
      inverse: string;
    };
    button: {
      primary: string;
      secondary: string;
      disabled: string;
    };
    border: string;
    divider: string;
  };
  spacing: {
    xs: number;
    s: number;
    m: number;
    l: number;
    xl: number;
    xxl: number;
  };
  fontSizes: {
    xs: number;
    s: number;
    m: number;
    l: number;
    xl: number;
    xxl: number;
  };
  fontWeights: {
    regular: string;
    medium: string;
    semibold: string;
    bold: string;
  };
  radius: {
    s: number;
    m: number;
    l: number;
    xl: number;
  };
  shadows: {
    small: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    medium: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    large: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
  };
}

// ライトテーマ
export const lightTheme: Theme = {
  colors: {
    primary: '#000000',
    secondary: '#666666',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    error: '#E53E3E',
    success: '#38A169',
    warning: '#D69E2E',
    text: {
      primary: '#1A1A1A',
      secondary: '#4A4A4A',
      hint: '#999999',
      inverse: '#FFFFFF',
    },
    button: {
      primary: '#000000',
      secondary: '#666666',
      disabled: '#CCCCCC',
    },
    border: '#E5E5E5',
    divider: '#EEEEEE',
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  fontSizes: {
    xs: 10,
    s: 12,
    m: 16,
    l: 18,
    xl: 24,
    xxl: 32,
  },
  fontWeights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  radius: {
    s: 4,
    m: 8,
    l: 16,
    xl: 24,
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};

// ダークテーマ
export const darkTheme: Theme = {
  colors: {
    primary: '#FFFFFF',
    secondary: '#AAAAAA',
    background: '#000000',
    surface: '#1A1A1A',
    error: '#FC8181',
    success: '#68D391',
    warning: '#F6E05E',
    text: {
      primary: '#FFFFFF',
      secondary: '#CCCCCC',
      hint: '#888888',
      inverse: '#000000',
    },
    button: {
      primary: '#FFFFFF',
      secondary: '#AAAAAA',
      disabled: '#444444',
    },
    border: '#2A2A2A',
    divider: '#333333',
  },
  spacing: lightTheme.spacing,
  fontSizes: lightTheme.fontSizes,
  fontWeights: lightTheme.fontWeights,
  radius: lightTheme.radius,
  shadows: {
    small: {
      shadowColor: '#FFF',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: '#FFF',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 4,
    },
    large: {
      shadowColor: '#FFF',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};

// デフォルトテーマをエクスポート
export default lightTheme;
