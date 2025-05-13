// テーマの型定義
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: {
    main: string;
    card: string;
    input: string;
  };
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
  border: {
    light: string;
    medium: string;
  };
  status: {
    success: string;
    error: string;
    warning: string;
    info: string;
  };
}

export interface ThemeSpacing {
  xs: number;
  s: number;
  m: number;
  l: number;
  xl: number;
  xxl: number;
}

export interface ThemeFontSizes {
  xs: number;
  s: number;
  m: number;
  l: number;
  xl: number;
  xxl: number;
}

export interface ThemeFontWeights {
  regular: string;
  medium: string;
  bold: string;
}

export interface ThemeRadius {
  xs: number;
  s: number;
  m: number;
  l: number;
  round: number;
}

export interface Theme {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  fontSizes: ThemeFontSizes;
  fontWeights: ThemeFontWeights;
  radius: ThemeRadius;
}

// ライトテーマ（デフォルトテーマ）
export const lightTheme: Theme = {
  colors: {
    primary: '#3B82F6',    // メインカラー（青）
    secondary: '#6366F1',  // セカンダリカラー（紫がかった青）
    accent: '#F59E0B',     // アクセントカラー（オレンジ）
    background: {
      main: '#FFFFFF',     // 背景メインカラー（白）
      card: '#F5F7FA',     // カード背景（薄いグレー）
      input: '#F3F4F6',    // 入力フィールド背景（薄いグレー）
    },
    text: {
      primary: '#1F2937',  // メインテキスト（濃いグレー）
      secondary: '#6B7280', // セカンダリテキスト（グレー）
      hint: '#9CA3AF',     // ヒントテキスト（薄いグレー）
      inverse: '#FFFFFF',  // 反転テキスト（白、濃い背景用）
    },
    button: {
      primary: '#3B82F6',  // プライマリボタン（青）
      secondary: '#6B7280', // セカンダリボタン（グレー）
      disabled: '#D1D5DB', // 無効ボタン（薄いグレー）
    },
    border: {
      light: '#E5E7EB',    // 薄いボーダー
      medium: '#D1D5DB',   // 中程度のボーダー
    },
    status: {
      success: '#10B981',  // 成功（緑）
      error: '#EF4444',    // エラー（赤）
      warning: '#F59E0B',  // 警告（オレンジ）
      info: '#3B82F6',     // 情報（青）
    },
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
    xs: 12,
    s: 14,
    m: 16,
    l: 18,
    xl: 24,
    xxl: 32,
  },
  fontWeights: {
    regular: '400',
    medium: '500',
    bold: '700',
  },
  radius: {
    xs: 4,
    s: 8,
    m: 12,
    l: 20,
    round: 9999,
  },
};

// ダークテーマ
export const darkTheme: Theme = {
  colors: {
    primary: '#60A5FA',    // メインカラー（明るい青）
    secondary: '#818CF8',  // セカンダリカラー（明るい紫がかった青）
    accent: '#FBBF24',     // アクセントカラー（明るいオレンジ）
    background: {
      main: '#111827',     // 背景メインカラー（濃いグレー）
      card: '#1F2937',     // カード背景（濃いグレー）
      input: '#374151',    // 入力フィールド背景（グレー）
    },
    text: {
      primary: '#F9FAFB',  // メインテキスト（白）
      secondary: '#E5E7EB', // セカンダリテキスト（薄いグレー）
      hint: '#9CA3AF',     // ヒントテキスト（グレー）
      inverse: '#111827',  // 反転テキスト（黒、明るい背景用）
    },
    button: {
      primary: '#60A5FA',  // プライマリボタン（明るい青）
      secondary: '#6B7280', // セカンダリボタン（グレー）
      disabled: '#4B5563', // 無効ボタン（濃いグレー）
    },
    border: {
      light: '#374151',    // 薄いボーダー
      medium: '#4B5563',   // 中程度のボーダー
    },
    status: {
      success: '#34D399',  // 成功（明るい緑）
      error: '#F87171',    // エラー（明るい赤）
      warning: '#FBBF24',  // 警告（明るいオレンジ）
      info: '#60A5FA',     // 情報（明るい青）
    },
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
    xs: 12,
    s: 14,
    m: 16,
    l: 18,
    xl: 24,
    xxl: 32,
  },
  fontWeights: {
    regular: '400',
    medium: '500',
    bold: '700',
  },
  radius: {
    xs: 4,
    s: 8,
    m: 12,
    l: 20,
    round: 9999,
  },
};

// デフォルトテーマ（ライトテーマと同じ）
export const defaultTheme: Theme = lightTheme;

// 男性向けテーマ（ライトモード）
export const maleLightTheme: Partial<ThemeColors> = {
  primary: '#3B82F6',      // より青みの強いプライマリカラー
  secondary: '#1E40AF',    // 濃い青のセカンダリカラー
  accent: '#0284C7',       // 水色系アクセント
};

// 女性向けテーマ（ライトモード）
export const femaleLightTheme: Partial<ThemeColors> = {
  primary: '#EC4899',      // ピンク系プライマリカラー  
  secondary: '#BE185D',    // 濃いピンク系セカンダリカラー
  accent: '#F472B6',       // 明るいピンク系アクセント
};

// 男性向けテーマ（ダークモード）
export const maleDarkTheme: Partial<ThemeColors> = {
  primary: '#60A5FA',      // 明るい青みのプライマリカラー
  secondary: '#3B82F6',    // 水色系セカンダリカラー
  accent: '#38BDF8',       // 水色系アクセント
};

// 女性向けテーマ（ダークモード）
export const femaleDarkTheme: Partial<ThemeColors> = {
  primary: '#F472B6',      // 明るいピンク系プライマリカラー  
  secondary: '#EC4899',    // ピンク系セカンダリカラー
  accent: '#FB7185',       // 明るいピンク系アクセント
};

// ユーザー設定に基づいてテーマを取得する関数
export const getThemeByUserPreferences = (
  gender?: 'male' | 'female' | 'other',
  isDarkMode: boolean = false
): Theme => {
  // ベースとなるテーマを設定
  const baseTheme = isDarkMode ? darkTheme : lightTheme;
  let colors = { ...baseTheme.colors };

  // 性別に基づいた色の調整
  if (gender === 'male') {
    colors = { 
      ...colors, 
      ...(isDarkMode ? maleDarkTheme : maleLightTheme) 
    };
  } else if (gender === 'female') {
    colors = { 
      ...colors, 
      ...(isDarkMode ? femaleDarkTheme : femaleLightTheme) 
    };
  }

  return {
    ...baseTheme,
    colors,
  };
};
