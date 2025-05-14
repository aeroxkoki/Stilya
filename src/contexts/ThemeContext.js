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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTheme = exports.ThemeProvider = exports.ThemeContext = void 0;
var react_1 = __importStar(require("react"));
var theme_1 = require("../styles/theme");
var async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
var react_native_1 = require("react-native");
// ThemeContextの作成
exports.ThemeContext = (0, react_1.createContext)({
    theme: theme_1.lightTheme,
    updateUserPreferences: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/];
    }); }); },
    isDarkMode: false,
    toggleDarkMode: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/];
    }); }); },
    setSystemTheme: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/];
    }); }); },
    isSystemTheme: false,
});
// AsyncStorageのキー
var USER_PREFERENCES_KEY = '@Stilya:userPreferences';
var DARK_MODE_KEY = '@Stilya:darkMode';
var SYSTEM_THEME_KEY = '@Stilya:systemTheme';
// ThemeProviderコンポーネント
var ThemeProvider = function (_a) {
    var children = _a.children;
    var _b = (0, react_1.useState)(theme_1.lightTheme), theme = _b[0], setTheme = _b[1];
    var _c = (0, react_1.useState)({}), userPreferences = _c[0], setUserPreferences = _c[1];
    var _d = (0, react_1.useState)(false), isDarkMode = _d[0], setIsDarkMode = _d[1];
    var _e = (0, react_1.useState)(true), isSystemTheme = _e[0], setIsSystemTheme = _e[1];
    // システムテーマの取得
    var colorScheme = (0, react_native_1.useColorScheme)();
    // テーマの適用関数
    var applyTheme = function (preferences, darkMode) {
        var newTheme = (0, theme_1.getThemeByUserPreferences)(preferences.gender, darkMode);
        setTheme(newTheme);
        // StatusBarの色を設定
        react_native_1.StatusBar.setBarStyle(darkMode ? 'light-content' : 'dark-content');
        if (react_native_1.StatusBar.setBackgroundColor) {
            react_native_1.StatusBar.setBackgroundColor(darkMode ? theme_1.darkTheme.colors.background.main : theme_1.lightTheme.colors.background.main);
        }
    };
    // 初期設定の読み込み
    (0, react_1.useEffect)(function () {
        var loadPreferences = function () { return __awaiter(void 0, void 0, void 0, function () {
            var preferencesString, preferences, systemThemeString, useSystemTheme, darkMode, darkModeString, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, async_storage_1.default.getItem(USER_PREFERENCES_KEY)];
                    case 1:
                        preferencesString = _a.sent();
                        preferences = {};
                        if (preferencesString) {
                            preferences = JSON.parse(preferencesString);
                            setUserPreferences(preferences);
                        }
                        return [4 /*yield*/, async_storage_1.default.getItem(SYSTEM_THEME_KEY)];
                    case 2:
                        systemThemeString = _a.sent();
                        useSystemTheme = true;
                        if (systemThemeString) {
                            useSystemTheme = JSON.parse(systemThemeString);
                            setIsSystemTheme(useSystemTheme);
                        }
                        darkMode = false;
                        if (!useSystemTheme) return [3 /*break*/, 3];
                        // システムテーマを使用する場合
                        darkMode = colorScheme === 'dark';
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, async_storage_1.default.getItem(DARK_MODE_KEY)];
                    case 4:
                        darkModeString = _a.sent();
                        if (darkModeString) {
                            darkMode = JSON.parse(darkModeString);
                        }
                        _a.label = 5;
                    case 5:
                        setIsDarkMode(darkMode);
                        applyTheme(preferences, darkMode);
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _a.sent();
                        console.error('Error loading preferences:', error_1);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        }); };
        loadPreferences();
    }, [colorScheme]);
    // ユーザー設定の更新
    var updateUserPreferences = function (preferences) { return __awaiter(void 0, void 0, void 0, function () {
        var updatedPreferences, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    updatedPreferences = __assign(__assign({}, userPreferences), preferences);
                    setUserPreferences(updatedPreferences);
                    // テーマを更新
                    applyTheme(updatedPreferences, isDarkMode);
                    // 設定を保存
                    return [4 /*yield*/, async_storage_1.default.setItem(USER_PREFERENCES_KEY, JSON.stringify(updatedPreferences))];
                case 1:
                    // 設定を保存
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('Error updating preferences:', error_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // ダークモードの切り替え
    var toggleDarkMode = function () { return __awaiter(void 0, void 0, void 0, function () {
        var newMode, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    if (!isSystemTheme) return [3 /*break*/, 2];
                    setIsSystemTheme(false);
                    return [4 /*yield*/, async_storage_1.default.setItem(SYSTEM_THEME_KEY, JSON.stringify(false))];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    newMode = !isDarkMode;
                    setIsDarkMode(newMode);
                    // テーマを更新
                    applyTheme(userPreferences, newMode);
                    // 設定を保存
                    return [4 /*yield*/, async_storage_1.default.setItem(DARK_MODE_KEY, JSON.stringify(newMode))];
                case 3:
                    // 設定を保存
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_3 = _a.sent();
                    console.error('Error toggling dark mode:', error_3);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // システムテーマの使用設定
    var setSystemTheme = function () { return __awaiter(void 0, void 0, void 0, function () {
        var systemDarkMode, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    setIsSystemTheme(true);
                    systemDarkMode = colorScheme === 'dark';
                    setIsDarkMode(systemDarkMode);
                    // テーマを更新
                    applyTheme(userPreferences, systemDarkMode);
                    // 設定を保存
                    return [4 /*yield*/, async_storage_1.default.setItem(SYSTEM_THEME_KEY, JSON.stringify(true))];
                case 1:
                    // 設定を保存
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_4 = _a.sent();
                    console.error('Error setting system theme:', error_4);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // システムテーマが変更された場合の対応
    (0, react_1.useEffect)(function () {
        if (isSystemTheme && colorScheme) {
            var systemDarkMode = colorScheme === 'dark';
            setIsDarkMode(systemDarkMode);
            applyTheme(userPreferences, systemDarkMode);
        }
    }, [colorScheme, isSystemTheme]);
    // コンテキスト値
    var contextValue = {
        theme: theme,
        updateUserPreferences: updateUserPreferences,
        isDarkMode: isDarkMode,
        toggleDarkMode: toggleDarkMode,
        setSystemTheme: setSystemTheme,
        isSystemTheme: isSystemTheme,
    };
    return (<exports.ThemeContext.Provider value={contextValue}>
      {children}
    </exports.ThemeContext.Provider>);
};
exports.ThemeProvider = ThemeProvider;
// カスタムフック
var useTheme = function () { return (0, react_1.useContext)(exports.ThemeContext); };
exports.useTheme = useTheme;
