"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getThemeByUserPreferences = exports.femaleDarkTheme = exports.maleDarkTheme = exports.femaleLightTheme = exports.maleLightTheme = exports.defaultTheme = exports.darkTheme = exports.lightTheme = void 0;
// ライトテーマ（デフォルトテーマ）
exports.lightTheme = {
    colors: {
        primary: '#3B82F6', // メインカラー（青）
        secondary: '#6366F1', // セカンダリカラー（紫がかった青）
        accent: '#F59E0B', // アクセントカラー（オレンジ）
        background: {
            main: '#FFFFFF', // 背景メインカラー（白）
            card: '#F5F7FA', // カード背景（薄いグレー）
            input: '#F3F4F6', // 入力フィールド背景（薄いグレー）
        },
        text: {
            primary: '#1F2937', // メインテキスト（濃いグレー）
            secondary: '#6B7280', // セカンダリテキスト（グレー）
            hint: '#9CA3AF', // ヒントテキスト（薄いグレー）
            inverse: '#FFFFFF', // 反転テキスト（白、濃い背景用）
        },
        button: {
            primary: '#3B82F6', // プライマリボタン（青）
            secondary: '#6B7280', // セカンダリボタン（グレー）
            disabled: '#D1D5DB', // 無効ボタン（薄いグレー）
        },
        border: {
            light: '#E5E7EB', // 薄いボーダー
            medium: '#D1D5DB', // 中程度のボーダー
        },
        status: {
            success: '#10B981', // 成功（緑）
            error: '#EF4444', // エラー（赤）
            warning: '#F59E0B', // 警告（オレンジ）
            info: '#3B82F6', // 情報（青）
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
exports.darkTheme = {
    colors: {
        primary: '#60A5FA', // メインカラー（明るい青）
        secondary: '#818CF8', // セカンダリカラー（明るい紫がかった青）
        accent: '#FBBF24', // アクセントカラー（明るいオレンジ）
        background: {
            main: '#111827', // 背景メインカラー（濃いグレー）
            card: '#1F2937', // カード背景（濃いグレー）
            input: '#374151', // 入力フィールド背景（グレー）
        },
        text: {
            primary: '#F9FAFB', // メインテキスト（白）
            secondary: '#E5E7EB', // セカンダリテキスト（薄いグレー）
            hint: '#9CA3AF', // ヒントテキスト（グレー）
            inverse: '#111827', // 反転テキスト（黒、明るい背景用）
        },
        button: {
            primary: '#60A5FA', // プライマリボタン（明るい青）
            secondary: '#6B7280', // セカンダリボタン（グレー）
            disabled: '#4B5563', // 無効ボタン（濃いグレー）
        },
        border: {
            light: '#374151', // 薄いボーダー
            medium: '#4B5563', // 中程度のボーダー
        },
        status: {
            success: '#34D399', // 成功（明るい緑）
            error: '#F87171', // エラー（明るい赤）
            warning: '#FBBF24', // 警告（明るいオレンジ）
            info: '#60A5FA', // 情報（明るい青）
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
exports.defaultTheme = exports.lightTheme;
// 男性向けテーマ（ライトモード）
exports.maleLightTheme = {
    primary: '#3B82F6', // より青みの強いプライマリカラー
    secondary: '#1E40AF', // 濃い青のセカンダリカラー
    accent: '#0284C7', // 水色系アクセント
};
// 女性向けテーマ（ライトモード）
exports.femaleLightTheme = {
    primary: '#EC4899', // ピンク系プライマリカラー  
    secondary: '#BE185D', // 濃いピンク系セカンダリカラー
    accent: '#F472B6', // 明るいピンク系アクセント
};
// 男性向けテーマ（ダークモード）
exports.maleDarkTheme = {
    primary: '#60A5FA', // 明るい青みのプライマリカラー
    secondary: '#3B82F6', // 水色系セカンダリカラー
    accent: '#38BDF8', // 水色系アクセント
};
// 女性向けテーマ（ダークモード）
exports.femaleDarkTheme = {
    primary: '#F472B6', // 明るいピンク系プライマリカラー  
    secondary: '#EC4899', // ピンク系セカンダリカラー
    accent: '#FB7185', // 明るいピンク系アクセント
};
// ユーザー設定に基づいてテーマを取得する関数
var getThemeByUserPreferences = function (gender, isDarkMode) {
    if (isDarkMode === void 0) { isDarkMode = false; }
    // ベースとなるテーマを設定
    var baseTheme = isDarkMode ? exports.darkTheme : exports.lightTheme;
    var colors = __assign({}, baseTheme.colors);
    // 性別に基づいた色の調整
    if (gender === 'male') {
        colors = __assign(__assign({}, colors), (isDarkMode ? exports.maleDarkTheme : exports.maleLightTheme));
    }
    else if (gender === 'female') {
        colors = __assign(__assign({}, colors), (isDarkMode ? exports.femaleDarkTheme : exports.femaleLightTheme));
    }
    return __assign(__assign({}, baseTheme), { colors: colors });
};
exports.getThemeByUserPreferences = getThemeByUserPreferences;
