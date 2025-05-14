"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var react_native_1 = require("react-native");
var ThemeContext_1 = require("../../contexts/ThemeContext");
/**
 * ローディングインジケータコンポーネント
 *
 * @param message - 表示するメッセージ
 * @param fullscreen - フルスクリーン表示するかどうか
 * @param overlay - オーバーレイとして表示するかどうか
 * @param size - インジケータのサイズ
 */
var Loading = function (_a) {
    var message = _a.message, _b = _a.fullscreen, fullscreen = _b === void 0 ? false : _b, _c = _a.overlay, overlay = _c === void 0 ? false : _c, _d = _a.size, size = _d === void 0 ? 'large' : _d;
    var _e = (0, ThemeContext_1.useTheme)(), theme = _e.theme, isDarkMode = _e.isDarkMode;
    return (<react_native_1.View style={[
            styles.container,
            fullscreen && styles.fullscreen,
            overlay && styles.overlay,
            { backgroundColor: overlay
                    ? (isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)')
                    : (fullscreen ? theme.colors.background.main : 'transparent')
            }
        ]}>
      <react_native_1.View style={[
            styles.loaderContainer,
            {
                backgroundColor: isDarkMode
                    ? theme.colors.background.card
                    : theme.colors.background.main,
                shadowColor: isDarkMode ? '#000' : '#222',
                borderColor: theme.colors.border.light,
                borderWidth: isDarkMode ? 1 : 0,
            }
        ]}>
        <react_native_1.ActivityIndicator size={size} color={theme.colors.primary} style={styles.indicator}/>
        {message && (<react_native_1.Text style={[
                styles.message,
                { color: theme.colors.text.primary }
            ]}>
            {message}
          </react_native_1.Text>)}
      </react_native_1.View>
    </react_native_1.View>);
};
var styles = react_native_1.StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    fullscreen: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
    },
    loaderContainer: {
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 120,
        minHeight: 120,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    indicator: {
        marginBottom: 8,
    },
    message: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
        marginTop: 8,
    },
});
exports.default = Loading;
