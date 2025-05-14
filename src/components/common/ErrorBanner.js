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
var vector_icons_1 = require("@expo/vector-icons");
/**
 * エラーメッセージを表示するバナーコンポーネント
 */
var ErrorBanner = function (_a) {
    var message = _a.message, _b = _a.type, type = _b === void 0 ? 'error' : _b, onDismiss = _a.onDismiss, _c = _a.autoHideDuration, autoHideDuration = _c === void 0 ? 5000 : _c, // デフォルトで5秒後に自動で消える
    _d = _a.showIcon, // デフォルトで5秒後に自動で消える
    showIcon = _d === void 0 ? true : _d;
    var opacity = (0, react_1.useState)(new react_native_1.Animated.Value(0))[0];
    var _e = (0, react_1.useState)(true), isVisible = _e[0], setIsVisible = _e[1];
    (0, react_1.useEffect)(function () {
        // バナーを表示するアニメーション
        react_native_1.Animated.timing(opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
        // 自動で非表示にする場合
        if (autoHideDuration > 0) {
            var timer_1 = setTimeout(function () {
                hide();
            }, autoHideDuration);
            return function () { return clearTimeout(timer_1); };
        }
    }, []);
    // バナーを非表示にする関数
    var hide = function () {
        react_native_1.Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(function () {
            setIsVisible(false);
            if (onDismiss) {
                onDismiss();
            }
        });
    };
    // アイコンとカラーを設定
    var getIconAndColor = function () {
        switch (type) {
            case 'error':
                return {
                    iconName: 'alert-circle',
                    backgroundColor: '#FFE8E6',
                    textColor: '#D32F2F',
                    iconColor: '#D32F2F',
                };
            case 'warning':
                return {
                    iconName: 'warning',
                    backgroundColor: '#FFF8E1',
                    textColor: '#F57C00',
                    iconColor: '#F57C00',
                };
            case 'info':
                return {
                    iconName: 'information-circle',
                    backgroundColor: '#E8F4FD',
                    textColor: '#0288D1',
                    iconColor: '#0288D1',
                };
            case 'success':
                return {
                    iconName: 'checkmark-circle',
                    backgroundColor: '#E8F5E9',
                    textColor: '#388E3C',
                    iconColor: '#388E3C',
                };
            default:
                return {
                    iconName: 'alert-circle',
                    backgroundColor: '#FFE8E6',
                    textColor: '#D32F2F',
                    iconColor: '#D32F2F',
                };
        }
    };
    var _f = getIconAndColor(), iconName = _f.iconName, backgroundColor = _f.backgroundColor, textColor = _f.textColor, iconColor = _f.iconColor;
    if (!isVisible) {
        return null;
    }
    return (<react_native_1.Animated.View style={[
            styles.container,
            {
                backgroundColor: backgroundColor,
                opacity: opacity,
            },
        ]}>
      <react_native_1.View style={styles.contentContainer}>
        {showIcon && (<vector_icons_1.Ionicons name={iconName} size={20} color={iconColor} style={styles.icon}/>)}
        <react_native_1.Text style={[styles.message, { color: textColor }]}>{message}</react_native_1.Text>
      </react_native_1.View>
      {onDismiss && (<react_native_1.TouchableOpacity onPress={hide} style={styles.closeButton}>
          <vector_icons_1.Ionicons name="close" size={18} color={iconColor}/>
        </react_native_1.TouchableOpacity>)}
    </react_native_1.Animated.View>);
};
var styles = react_native_1.StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        marginHorizontal: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    contentContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 8,
    },
    message: {
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
    closeButton: {
        marginLeft: 8,
        padding: 4,
    },
});
exports.default = ErrorBanner;
