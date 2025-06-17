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
    status: {
      error: string;
      success: string;
      warning: string;
      info: string;
    };
    card: {
      background: string;
      border: string;
      shadow: string;
    };
    main: {
      background: string;
      surface: string;
    };
    input: {
      background: string;
      border: string;
      focused: string;
    };
    text: {
      primary: string;
      secondary: string;
      hint: string;
      inverse: string;
      disabled: string;
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

// スタイルタイプの定義
export type StyleType = 'minimal' | 'natural' | 'bold';

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
    status: {
      error: '#E53E3E',
      success: '#38A169',
      warning: '#D69E2E',
      info: '#3182CE',
    },
    card: {
      background: '#FFFFFF',
      border: '#E5E5E5',
      shadow: '#000000',
    },
    main: {
      background: '#FFFFFF',
      surface: '#F5F5F5',
    },
    input: {
      background: '#FFFFFF',
      border: '#E5E5E5',
      focused: '#000000',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#4A4A4A',
      hint: '#999999',
      inverse: '#FFFFFF',
      disabled: '#CCCCCC',
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
    status: {
      error: '#FC8181',
      success: '#68D391',
      warning: '#F6E05E',
      info: '#63B3ED',
    },
    card: {
      background: '#1A1A1A',
      border: '#2A2A2A',
      shadow: '#FFFFFF',
    },
    main: {
      background: '#000000',
      surface: '#1A1A1A',
    },
    input: {
      background: '#1A1A1A',
      border: '#2A2A2A',
      focused: '#FFFFFF',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#CCCCCC',
      hint: '#888888',
      inverse: '#000000',
      disabled: '#444444',
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

// スタイル別テーマ - ミニマル（シャープでモダン）
export const minimalTheme: Theme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    primary: '#2c3e50',
    secondary: '#34495e',
    background: '#f5f5f5',
    surface: '#ffffff',
    card: {
      background: '#ffffff',
      border: '#e0e0e0',
      shadow: '#000000',
    },
    main: {
      background: '#ffffff',
      surface: '#f5f5f5',
    },
    success: '#2ecc71',
    button: {
      primary: '#2c3e50',
      secondary: '#7f8c8d',
      disabled: '#bdc3c7',
    },
    text: {
      primary: '#2c3e50',
      secondary: '#7f8c8d',
      hint: '#95a5a6',
      inverse: '#ffffff',
      disabled: '#bdc3c7',
    },
  },
  radius: {
    s: 4,
    m: 8,
    l: 12,
    xl: 16,
  },
};

// スタイル別テーマ - ナチュラル（柔らかく有機的）
export const naturalTheme: Theme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    primary: '#8d6e63',
    secondary: '#a1887f',
    background: '#f8f5f2',
    surface: '#ffffff',
    card: {
      background: '#ffffff',
      border: '#e0d6d1',
      shadow: '#8d6e63',
    },
    main: {
      background: '#ffffff',
      surface: '#f8f5f2',
    },
    success: '#81c784',
    button: {
      primary: '#8d6e63',
      secondary: '#bcaaa4',
      disabled: '#d7ccc8',
    },
    text: {
      primary: '#5d4037',
      secondary: '#8d6e63',
      hint: '#bcaaa4',
      inverse: '#ffffff',
      disabled: '#d7ccc8',
    },
  },
  radius: {
    s: 12,
    m: 16,
    l: 24,
    xl: 32,
  },
};

// スタイル別テーマ - ボールド（大胆で鮮やか）
export const boldTheme: Theme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    primary: '#6200ea',
    secondary: '#7c4dff',
    background: '#f5f0fd',
    surface: '#ffffff',
    card: {
      background: '#ffffff',
      border: '#e1d5f5',
      shadow: '#6200ea',
    },
    main: {
      background: '#ffffff',
      surface: '#f5f0fd',
    },
    success: '#00c853',
    button: {
      primary: '#6200ea',
      secondary: '#b388ff',
      disabled: '#d1c4e9',
    },
    text: {
      primary: '#4a148c',
      secondary: '#6200ea',
      hint: '#b388ff',
      inverse: '#ffffff',
      disabled: '#d1c4e9',
    },
  },
  radius: {
    s: 8,
    m: 12,
    l: 16,
    xl: 20,
  },
};

// スタイル別テーマをマッピング
export const styleThemes: Record<StyleType, Theme> = {
  minimal: minimalTheme,
  natural: naturalTheme,
  bold: boldTheme,
};

// デフォルトテーマをエクスポート
export default lightTheme;
