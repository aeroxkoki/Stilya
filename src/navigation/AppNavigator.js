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
var react_1 = __importStar(require("react"));
var native_1 = require("@react-navigation/native");
var stack_1 = require("@react-navigation/stack");
var bottom_tabs_1 = require("@react-navigation/bottom-tabs");
var react_native_1 = require("react-native");
var vector_icons_1 = require("@expo/vector-icons");
// スクリーンの import
var SwipeScreen_1 = __importDefault(require("../screens/SwipeScreen"));
var ProductDetailScreen_1 = __importDefault(require("../screens/ProductDetailScreen"));
var RecommendationsScreen_1 = __importDefault(require("../screens/RecommendationsScreen"));
var ProfileScreen_1 = __importDefault(require("../screens/ProfileScreen"));
var AuthScreen_1 = __importDefault(require("../screens/AuthScreen"));
var OnboardingScreen_1 = __importDefault(require("../screens/OnboardingScreen"));
var useAuth_1 = require("../hooks/useAuth");
var ThemeContext_1 = require("../contexts/ThemeContext");
// スタックナビゲーター
var Stack = (0, stack_1.createStackNavigator)();
var Tab = (0, bottom_tabs_1.createBottomTabNavigator)();
// メインのタブナビゲーション
var MainTabNavigator = function () {
    var _a = (0, ThemeContext_1.useTheme)(), theme = _a.theme, isDarkMode = _a.isDarkMode;
    return (<Tab.Navigator screenOptions={{
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: theme.colors.text.secondary,
            tabBarStyle: {
                backgroundColor: theme.colors.background.main,
                borderTopWidth: 1,
                borderTopColor: theme.colors.border.light,
                elevation: 0, // Android用シャドウ除去
                shadowOpacity: 0, // iOS用シャドウ除去
                height: 60, // タブバーの高さ調整
                paddingBottom: 8, // 下部のパディング
            },
            tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '500',
                marginBottom: 4,
            },
            headerShown: false,
        }}>
      <Tab.Screen name="Swipe" component={SwipeScreen_1.default} options={{
            tabBarLabel: 'スワイプ',
            tabBarIcon: function (_a) {
                var color = _a.color, size = _a.size;
                return (<vector_icons_1.Feather name="repeat" size={size} color={color}/>);
            },
        }}/>
      <Tab.Screen name="Recommendations" component={RecommendationsScreen_1.default} options={{
            tabBarLabel: 'おすすめ',
            tabBarIcon: function (_a) {
                var color = _a.color, size = _a.size;
                return (<vector_icons_1.Feather name="heart" size={size} color={color}/>);
            },
        }}/>
      <Tab.Screen name="Profile" component={ProfileScreen_1.default} options={{
            tabBarLabel: 'マイページ',
            tabBarIcon: function (_a) {
                var color = _a.color, size = _a.size;
                return (<vector_icons_1.Feather name="user" size={size} color={color}/>);
            },
        }}/>
    </Tab.Navigator>);
};
// カスタムナビゲーションテーマ
var getNavigationTheme = function (appTheme, isDark) {
    var baseTheme = isDark ? native_1.DarkTheme : native_1.DefaultTheme;
    return __assign(__assign({}, baseTheme), { colors: __assign(__assign({}, baseTheme.colors), { primary: appTheme.colors.primary, background: appTheme.colors.background.main, card: appTheme.colors.background.card, text: appTheme.colors.text.primary, border: appTheme.colors.border.light, notification: appTheme.colors.status.error }) });
};
// ルートナビゲーター
var AppNavigator = function () {
    var _a = (0, useAuth_1.useAuth)(), user = _a.user, isLoading = _a.isLoading, fetchProfile = _a.fetchProfile, isSessionValid = _a.isSessionValid;
    var _b = (0, ThemeContext_1.useTheme)(), theme = _b.theme, isDarkMode = _b.isDarkMode;
    var _c = (0, react_1.useState)(false), hasCompletedOnboarding = _c[0], setHasCompletedOnboarding = _c[1];
    // カスタムナビゲーションテーマを取得
    var navigationTheme = getNavigationTheme(theme, isDarkMode);
    // セッションの有効性を定期的にチェック
    (0, react_1.useEffect)(function () {
        // アプリ起動時にセッションの有効性をチェック
        isSessionValid();
        // 定期的にセッションの有効性をチェック (5分ごと)
        var intervalId = setInterval(function () {
            isSessionValid();
        }, 5 * 60 * 1000);
        return function () {
            clearInterval(intervalId);
        };
    }, []);
    (0, react_1.useEffect)(function () {
        // ユーザーがオンボーディングを完了しているか確認するロジック
        var checkOnboardingStatus = function () { return __awaiter(void 0, void 0, void 0, function () {
            var hasCompleted;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!user) return [3 /*break*/, 2];
                        // プロファイルを取得
                        return [4 /*yield*/, fetchProfile()];
                    case 1:
                        // プロファイルを取得
                        _a.sent();
                        hasCompleted = !!(user.gender && user.stylePreference && user.ageGroup);
                        setHasCompletedOnboarding(hasCompleted);
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); };
        checkOnboardingStatus();
    }, [user]);
    // ローディング中はローディング画面を表示
    if (isLoading) {
        return (<react_native_1.View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: theme.colors.background.main
            }}>
        <react_native_1.ActivityIndicator size="large" color={theme.colors.primary}/>
      </react_native_1.View>);
    }
    return (<native_1.NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{
            headerShown: false,
            headerStyle: {
                backgroundColor: theme.colors.background.main,
                elevation: 0,
                shadowOpacity: 0,
            },
            headerTintColor: theme.colors.text.primary,
            headerTitleStyle: {
                fontWeight: '600',
            },
            cardStyle: {
                backgroundColor: theme.colors.background.main,
            }
        }}>
        {user ? (hasCompletedOnboarding ? (<>
              <Stack.Screen name="Main" component={MainTabNavigator}/>
              <Stack.Screen name="ProductDetail" component={ProductDetailScreen_1.default} options={{
                headerShown: true,
                title: '商品詳細',
            }}/>
            </>) : (<Stack.Screen name="Onboarding" component={OnboardingScreen_1.default}/>)) : (<Stack.Screen name="Auth" component={AuthScreen_1.default}/>)}
      </Stack.Navigator>
    </native_1.NavigationContainer>);
};
exports.default = AppNavigator;
