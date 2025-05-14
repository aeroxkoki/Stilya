"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var ThemeContext_1 = require("../../contexts/ThemeContext");
var Button = function (_a) {
    var onPress = _a.onPress, title = _a.title, children = _a.children, _b = _a.variant, variant = _b === void 0 ? 'primary' : _b, _c = _a.size, size = _c === void 0 ? 'medium' : _c, _d = _a.disabled, disabled = _d === void 0 ? false : _d, _e = _a.loading, loading = _e === void 0 ? false : _e, isLoading = _a.isLoading, icon = _a.icon, _f = _a.iconPosition, iconPosition = _f === void 0 ? 'left' : _f, style = _a.style, textStyle = _a.textStyle, _g = _a.fullWidth, fullWidth = _g === void 0 ? false : _g, isFullWidth = _a.isFullWidth, testID = _a.testID, className = _a.className;
    // isFullWidthをfullWidthに統合（互換性のため）
    var useFullWidth = fullWidth || isFullWidth;
    // isLoadingをloadingに統合（互換性のため）
    var isButtonLoading = loading || isLoading;
    var _h = (0, ThemeContext_1.useTheme)(), theme = _h.theme, isDarkMode = _h.isDarkMode;
    // アニメーション用の値
    var scaleAnimation = (0, react_1.useRef)(new react_native_1.Animated.Value(1)).current;
    // タッチアニメーション
    var handlePressIn = function () {
        react_native_1.Animated.timing(scaleAnimation, {
            toValue: 0.97,
            duration: 150,
            easing: react_native_1.Easing.out(react_native_1.Easing.cubic),
            useNativeDriver: true,
        }).start();
    };
    var handlePressOut = function () {
        react_native_1.Animated.spring(scaleAnimation, {
            toValue: 1,
            friction: 5,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };
    // サイズに基づくスタイル
    var getSizeStyle = function () {
        switch (size) {
            case 'small':
                return {
                    paddingVertical: theme.spacing.xs,
                    paddingHorizontal: theme.spacing.m,
                    borderRadius: theme.radius.s,
                };
            case 'large':
                return {
                    paddingVertical: theme.spacing.m,
                    paddingHorizontal: theme.spacing.xl,
                    borderRadius: theme.radius.m,
                };
            case 'medium':
            default:
                return {
                    paddingVertical: theme.spacing.s,
                    paddingHorizontal: theme.spacing.l,
                    borderRadius: theme.radius.m,
                };
        }
    };
    // バリアントに基づくスタイル
    var getVariantStyle = function () {
        if (disabled) {
            return {
                backgroundColor: theme.colors.button.disabled,
                borderWidth: 0,
            };
        }
        switch (variant) {
            case 'secondary':
                return {
                    backgroundColor: theme.colors.secondary,
                    borderWidth: 0,
                };
            case 'outline':
                return {
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: theme.colors.primary,
                };
            case 'text':
                return {
                    backgroundColor: 'transparent',
                    borderWidth: 0,
                };
            case 'primary':
            default:
                return {
                    backgroundColor: theme.colors.primary,
                    borderWidth: 0,
                };
        }
    };
    // テキストスタイル
    var getTextStyle = function () {
        if (disabled) {
            return {
                color: isDarkMode ? theme.colors.text.secondary : theme.colors.text.hint,
                fontSize: getFontSize(),
                fontWeight: theme.fontWeights.medium,
            };
        }
        switch (variant) {
            case 'outline':
                return {
                    color: theme.colors.primary,
                    fontSize: getFontSize(),
                    fontWeight: theme.fontWeights.medium,
                };
            case 'text':
                return {
                    color: theme.colors.primary,
                    fontSize: getFontSize(),
                    fontWeight: theme.fontWeights.medium,
                };
            case 'primary':
            case 'secondary':
            default:
                return {
                    color: theme.colors.text.inverse,
                    fontSize: getFontSize(),
                    fontWeight: theme.fontWeights.medium,
                };
        }
    };
    // フォントサイズを取得
    var getFontSize = function () {
        switch (size) {
            case 'small':
                return theme.fontSizes.s;
            case 'large':
                return theme.fontSizes.l;
            case 'medium':
            default:
                return theme.fontSizes.m;
        }
    };
    // classNameがあればconvertしたスタイルを適用する（実際は無視する）
    // 実際のNativeWindの処理はランタイムで行われるため、ここでは単にpropsとして扱う
    return (<react_native_1.Animated.View style={[
            {
                transform: [{ scale: scaleAnimation }],
                width: useFullWidth ? '100%' : 'auto',
            }
        ]} testID={testID}>
      <react_native_1.TouchableOpacity onPress={disabled || isButtonLoading ? undefined : onPress} disabled={disabled || isButtonLoading} style={[
            styles.button,
            getVariantStyle(),
            getSizeStyle(),
            style,
        ]} activeOpacity={0.9} onPressIn={handlePressIn} onPressOut={handlePressOut} {...(className ? { className: className } : {})}>
        {isButtonLoading ? (<react_native_1.ActivityIndicator color={variant === 'outline' || variant === 'text' ? theme.colors.primary : theme.colors.text.inverse} size="small"/>) : (<>
            {icon && iconPosition === 'left' && <>{icon}</>}
            <react_native_1.Text style={[
                getTextStyle(),
                icon && iconPosition === 'left' ? { marginLeft: 8 } : null,
                icon && iconPosition === 'right' ? { marginRight: 8 } : null,
                textStyle
            ]}>
              {children || title}
            </react_native_1.Text>
            {icon && iconPosition === 'right' && <>{icon}</>}
          </>)}
      </react_native_1.TouchableOpacity>
    </react_native_1.Animated.View>);
};
var styles = react_native_1.StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    textWithLeftIcon: {
        marginLeft: 8,
    },
    textWithRightIcon: {
        marginRight: 8,
    },
});
exports.default = Button;
