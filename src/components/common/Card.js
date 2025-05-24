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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var react_native_1 = require("react-native");
var ThemeContext_1 = require("../../contexts/ThemeContext");
var StyledComponents_1 = require("./StyledComponents");
var Card = function (_a) {
    var children = _a.children, style = _a.style, _b = _a.elevation, elevation = _b === void 0 ? 'small' : _b, onPress = _a.onPress, _c = _a.disabled, disabled = _c === void 0 ? false : _c, _d = _a.variant, variant = _d === void 0 ? 'filled' : _d, padding = _a.padding, testID = _a.testID, className = _a.className;
    var _e = (0, ThemeContext_1.useTheme)(), theme = _e.theme, isDarkMode = _e.isDarkMode;
    // 影のレベルに基づいたスタイルを取得
    var getElevationStyle = function () {
        switch (elevation) {
            case 'none':
                return {
                    shadowOpacity: 0,
                    elevation: 0,
                };
            case 'small':
                return {
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: isDarkMode ? 0.3 : 0.1,
                    shadowRadius: 2,
                    elevation: 1,
                };
            case 'medium':
                return {
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isDarkMode ? 0.4 : 0.15,
                    shadowRadius: 3,
                    elevation: 3,
                };
            case 'large':
                return {
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isDarkMode ? 0.5 : 0.2,
                    shadowRadius: 4,
                    elevation: 5,
                };
            default:
                return {
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: isDarkMode ? 0.3 : 0.1,
                    shadowRadius: 2,
                    elevation: 1,
                };
        }
    };
    // アウトライン表示の場合のスタイル
    var variantStyle = variant === 'outlined'
        ? {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: theme.colors.border.light,
        }
        : {};
    // pxやremなどの単位を使った場合に対応するため、数値に変換
    var paddingValue = typeof padding === 'string'
        ? parseInt(padding, 10) || 16 // 数値に変換できない場合はデフォルト値
        : padding;
    var cardStyle = [
        styles.card,
        __assign(__assign({ backgroundColor: variant === 'outlined'
                ? 'transparent'
                : theme.colors.background.card, borderRadius: theme.radius.m, shadowColor: isDarkMode ? '#000' : '#222' }, (paddingValue !== undefined && { padding: paddingValue })), react_native_1.Platform.select({
            ios: __assign({}, getElevationStyle()),
            android: {
                elevation: variant === 'outlined' ? 0 : getElevationStyle().elevation,
            },
        })),
        variantStyle,
        style,
    ];
    if (onPress) {
        return (<StyledComponents_1.TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.8} disabled={disabled} testID={testID} className={className}>
        {children}
      </StyledComponents_1.TouchableOpacity>);
    }
    return <StyledComponents_1.View style={cardStyle} testID={testID} className={className}>{children}</StyledComponents_1.View>;
};
var styles = react_native_1.StyleSheet.create({
    card: {
        padding: 16,
        overflow: 'hidden',
    },
});
exports.default = Card;
