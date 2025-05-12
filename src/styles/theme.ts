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

// デフォルトテーマ
export const defaultTheme: Theme = {
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

// 男性向けテーマ
export const maleTheme: Partial<ThemeColors> = {
  primary: '#3B82F6',      // より青みの強いプライマリカラー
  secondary: '#1E40AF',    // 濃い青のセカンダリカラー
  accent: '#0284C7',       // 水色系アクセント
};

// 女性向けテーマ
export const femaleTheme: Partial<ThemeColors> = {
  primary: '#EC4899',      // ピンク系プライマリカラー  
  secondary: '#BE185D',    // 濃いピンク系セカンダリカラー
  accent: '#F472B6',       // 明るいピンク系アクセント
};

// ユーザー設定に基づいてテーマを取得する関数
export const getThemeByUserPreferences = (
  gender?: 'male' | 'female' | 'other'
): Theme => {
  let colors = { ...defaultTheme.colors };

  // 性別に基づいた色の調整
  if (gender === 'male') {
    colors = { ...colors, ...maleTheme };
  } else if (gender === 'female') {
    colors = { ...colors, ...femaleTheme };
  }

  return {
    ...defaultTheme,
    colors,
  };
};
