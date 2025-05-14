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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var vector_icons_1 = require("@expo/vector-icons");
var ThemeContext_1 = require("../../contexts/ThemeContext");
var Input = function (_a) {
    var label = _a.label, error = _a.error, leftIcon = _a.leftIcon, rightIcon = _a.rightIcon, _b = _a.showClearButton, showClearButton = _b === void 0 ? false : _b, containerStyle = _a.containerStyle, labelStyle = _a.labelStyle, inputStyle = _a.inputStyle, errorStyle = _a.errorStyle, _c = _a.isPassword, isPassword = _c === void 0 ? false : _c, value = _a.value, onChangeText = _a.onChangeText, rest = __rest(_a, ["label", "error", "leftIcon", "rightIcon", "showClearButton", "containerStyle", "labelStyle", "inputStyle", "errorStyle", "isPassword", "value", "onChangeText"]);
    var theme = (0, ThemeContext_1.useTheme)().theme;
    var _d = (0, react_1.useState)(false), isFocused = _d[0], setIsFocused = _d[1];
    var _e = (0, react_1.useState)(false), showPassword = _e[0], setShowPassword = _e[1];
    var handleFocus = function () {
        setIsFocused(true);
        if (rest.onFocus) {
            rest.onFocus(undefined);
        }
    };
    var handleBlur = function () {
        setIsFocused(false);
        if (rest.onBlur) {
            rest.onBlur(undefined);
        }
    };
    var handleClear = function () {
        if (onChangeText) {
            onChangeText('');
        }
    };
    var togglePasswordVisibility = function () {
        setShowPassword(!showPassword);
    };
    return (<react_native_1.View style={[styles.container, containerStyle]}>
      {label && (<react_native_1.Text style={[
                styles.label,
                { color: theme.colors.text.secondary },
                labelStyle,
            ]}>
          {label}
        </react_native_1.Text>)}

      <react_native_1.View style={[
            styles.inputContainer,
            {
                borderColor: error
                    ? theme.colors.status.error
                    : isFocused
                        ? theme.colors.primary
                        : theme.colors.border.light,
                backgroundColor: theme.colors.background.input,
                borderRadius: theme.radius.m,
            },
        ]}>
        {leftIcon && <react_native_1.View style={styles.leftIcon}>{leftIcon}</react_native_1.View>}

        <react_native_1.TextInput style={[
            styles.input,
            { color: theme.colors.text.primary },
            leftIcon ? { paddingLeft: 8 } : undefined,
            (rightIcon || showClearButton || isPassword) ? { paddingRight: 8 } : undefined,
            inputStyle,
        ]} value={value} onChangeText={onChangeText} onFocus={handleFocus} onBlur={handleBlur} placeholderTextColor={theme.colors.text.hint} secureTextEntry={isPassword && !showPassword} {...rest}/>

        {isPassword && (<react_native_1.TouchableOpacity style={styles.rightIcon} onPress={togglePasswordVisibility}>
            <vector_icons_1.Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color={theme.colors.text.secondary}/>
          </react_native_1.TouchableOpacity>)}

        {!isPassword && showClearButton && value && value.length > 0 && (<react_native_1.TouchableOpacity style={styles.rightIcon} onPress={handleClear}>
            <vector_icons_1.Feather name="x" size={18} color={theme.colors.text.hint}/>
          </react_native_1.TouchableOpacity>)}

        {!isPassword && !showClearButton && rightIcon && (<react_native_1.View style={styles.rightIcon}>{rightIcon}</react_native_1.View>)}
      </react_native_1.View>

      {error && (<react_native_1.Text style={[
                styles.error,
                { color: theme.colors.status.error },
                errorStyle,
            ]}>
          {error}
        </react_native_1.Text>)}
    </react_native_1.View>);
};
var styles = react_native_1.StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        marginBottom: 6,
        fontSize: 14,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        height: 48,
        overflow: 'hidden',
    },
    input: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 16,
        fontSize: 16,
    },
    leftIcon: {
        paddingLeft: 16,
    },
    rightIcon: {
        paddingRight: 16,
    },
    error: {
        marginTop: 4,
        fontSize: 12,
    },
});
exports.default = Input;
