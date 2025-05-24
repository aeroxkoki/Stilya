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
exports.useAuth = exports.AuthProvider = exports.AuthContext = void 0;
var react_1 = __importStar(require("react"));
var supabase_1 = require("@/services/supabase");
// import * as SecureStore from 'expo-secure-store';
var swipeService_1 = require("@/services/swipeService");
var netinfo_1 = __importDefault(require("@react-native-community/netinfo"));
var async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
// SecureStore のモック
var SecureStore = {
    setItemAsync: function (key, value) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, async_storage_1.default.setItem("secure_".concat(key), value)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); },
    getItemAsync: function (key) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, async_storage_1.default.getItem("secure_".concat(key))];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); },
    deleteItemAsync: function (key) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, async_storage_1.default.removeItem("secure_".concat(key))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }
};
// ユーザーセッションストレージキー
var SESSION_KEY = 'stilya_user_session';
exports.AuthContext = (0, react_1.createContext)({
    user: null,
    isLoading: true,
    login: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, ({ success: false })];
    }); }); },
    register: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, ({ success: false })];
    }); }); },
    logout: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/];
    }); }); },
    isSessionValid: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, false];
    }); }); },
    profile: null,
    fetchProfile: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, null];
    }); }); },
    updateProfile: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, false];
    }); }); },
});
var AuthProvider = function (_a) {
    var children = _a.children;
    var _b = (0, react_1.useState)(null), user = _b[0], setUser = _b[1];
    var _c = (0, react_1.useState)(null), profile = _c[0], setProfile = _c[1];
    var _d = (0, react_1.useState)(true), isLoading = _d[0], setIsLoading = _d[1];
    // ユーザー認証状態の監視
    (0, react_1.useEffect)(function () {
        var mounted = true;
        var checkAuthStatus = function () { return __awaiter(void 0, void 0, void 0, function () {
            var sessionStr, session, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, 3, 4]);
                        return [4 /*yield*/, SecureStore.getItemAsync(SESSION_KEY)];
                    case 1:
                        sessionStr = _a.sent();
                        if (sessionStr) {
                            session = JSON.parse(sessionStr);
                            if (session && session.user) {
                                // セッションからユーザー情報を復元
                                setUser(session.user);
                                // プロファイル情報の取得を試みる
                                if (mounted) {
                                    fetchProfile();
                                }
                            }
                        }
                        return [3 /*break*/, 4];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Error checking auth status:', error_1);
                        return [3 /*break*/, 4];
                    case 3:
                        if (mounted) {
                            setIsLoading(false);
                        }
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        // Supabaseの認証状態変更イベントをリッスン
        var authListener = supabase_1.supabase.auth.onAuthStateChange(function (event, session) { return __awaiter(void 0, void 0, void 0, function () {
            var currentUser, netInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('Auth state changed:', event);
                        if (!(event === 'SIGNED_IN' && session)) return [3 /*break*/, 3];
                        currentUser = {
                            id: session.user.id,
                            email: session.user.email || '',
                            createdAt: new Date().toISOString(),
                        };
                        setUser(currentUser);
                        // SecureStoreにセッション情報を保存
                        return [4 /*yield*/, SecureStore.setItemAsync(SESSION_KEY, JSON.stringify({ user: currentUser, session: session }))];
                    case 1:
                        // SecureStoreにセッション情報を保存
                        _a.sent();
                        return [4 /*yield*/, netinfo_1.default.fetch()];
                    case 2:
                        netInfo = _a.sent();
                        if (netInfo.isConnected) {
                            (0, swipeService_1.syncOfflineSwipes)();
                        }
                        setIsLoading(false);
                        return [3 /*break*/, 5];
                    case 3:
                        if (!(event === 'SIGNED_OUT')) return [3 /*break*/, 5];
                        // ログアウトまたはユーザー削除時
                        setUser(null);
                        setProfile(null);
                        return [4 /*yield*/, SecureStore.deleteItemAsync(SESSION_KEY)];
                    case 4:
                        _a.sent();
                        setIsLoading(false);
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        }); }).data;
        checkAuthStatus();
        return function () {
            mounted = false;
            authListener === null || authListener === void 0 ? void 0 : authListener.subscription.unsubscribe();
        };
    }, []);
    // ログイン処理
    var login = function (email, password) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, authUser, session, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, 3, 4]);
                    setIsLoading(true);
                    return [4 /*yield*/, (0, supabase_1.signIn)(email, password)];
                case 1:
                    _a = _b.sent(), authUser = _a.user, session = _a.session;
                    if (!authUser) {
                        return [2 /*return*/, { success: false, message: 'メールアドレスまたはパスワードが正しくありません' }];
                    }
                    // ログイン成功
                    return [2 /*return*/, { success: true }];
                case 2:
                    error_2 = _b.sent();
                    console.error('Login error:', error_2.message);
                    return [2 /*return*/, {
                            success: false,
                            message: error_2.message === 'Invalid login credentials'
                                ? 'メールアドレスまたはパスワードが正しくありません'
                                : '認証エラーが発生しました。再度お試しください。'
                        }];
                case 3:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // 新規ユーザー登録
    var register = function (email, password) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, authUser, session, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, 3, 4]);
                    setIsLoading(true);
                    return [4 /*yield*/, (0, supabase_1.signUp)(email, password)];
                case 1:
                    _a = _b.sent(), authUser = _a.user, session = _a.session;
                    if (!authUser) {
                        return [2 /*return*/, { success: false, message: 'ユーザー登録に失敗しました' }];
                    }
                    return [2 /*return*/, { success: true }];
                case 2:
                    error_3 = _b.sent();
                    console.error('Register error:', error_3.message);
                    return [2 /*return*/, {
                            success: false,
                            message: error_3.message.includes('email')
                                ? 'このメールアドレスは既に使用されています'
                                : 'ユーザー登録に失敗しました。再度お試しください。'
                        }];
                case 3:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // ログアウト処理
    var logout = function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, 4, 5]);
                    setIsLoading(true);
                    return [4 /*yield*/, (0, supabase_1.signOut)()];
                case 1:
                    _a.sent();
                    setUser(null);
                    setProfile(null);
                    return [4 /*yield*/, SecureStore.deleteItemAsync(SESSION_KEY)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3:
                    error_4 = _a.sent();
                    console.error('Logout error:', error_4);
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // セッションの有効性確認
    var isSessionValid = function () { return __awaiter(void 0, void 0, void 0, function () {
        var session, refreshResult, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    return [4 /*yield*/, (0, supabase_1.getSession)()];
                case 1:
                    session = _a.sent();
                    if (!!session) return [3 /*break*/, 3];
                    console.log('No session found');
                    return [4 /*yield*/, logout()];
                case 2:
                    _a.sent();
                    return [2 /*return*/, false];
                case 3:
                    if (!(0, supabase_1.isSessionExpired)(session)) return [3 /*break*/, 7];
                    console.log('Session expired, refreshing...');
                    return [4 /*yield*/, (0, supabase_1.refreshSession)()];
                case 4:
                    refreshResult = _a.sent();
                    if (!(!refreshResult || !refreshResult.session)) return [3 /*break*/, 6];
                    console.log('Session refresh failed');
                    return [4 /*yield*/, logout()];
                case 5:
                    _a.sent();
                    return [2 /*return*/, false];
                case 6: 
                // セッション更新成功
                return [2 /*return*/, true];
                case 7: return [2 /*return*/, true];
                case 8:
                    error_5 = _a.sent();
                    console.error('Session validation error:', error_5);
                    return [2 /*return*/, false];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    // ユーザープロファイルの取得
    var fetchProfile = function () { return __awaiter(void 0, void 0, void 0, function () {
        var userProfile, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (!user)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, (0, supabase_1.getUserProfile)(user.id)];
                case 1:
                    userProfile = _a.sent();
                    if (userProfile) {
                        setProfile(userProfile);
                    }
                    return [2 /*return*/, userProfile];
                case 2:
                    error_6 = _a.sent();
                    console.error('Fetch profile error:', error_6);
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // プロファイル更新
    var updateProfile = function (data) { return __awaiter(void 0, void 0, void 0, function () {
        var updatedUser, sessionStr, session, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    if (!user)
                        return [2 /*return*/, false];
                    updatedUser = __assign(__assign({}, user), data);
                    setUser(updatedUser);
                    setProfile(updatedUser);
                    return [4 /*yield*/, SecureStore.getItemAsync(SESSION_KEY)];
                case 1:
                    sessionStr = _a.sent();
                    if (!sessionStr) return [3 /*break*/, 3];
                    session = JSON.parse(sessionStr);
                    session.user = updatedUser;
                    return [4 /*yield*/, SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session))];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/, true];
                case 4:
                    error_7 = _a.sent();
                    console.error('Update profile error:', error_7);
                    return [2 /*return*/, false];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var contextValue = {
        user: user,
        isLoading: isLoading,
        login: login,
        register: register,
        logout: logout,
        isSessionValid: isSessionValid,
        profile: profile,
        fetchProfile: fetchProfile,
        updateProfile: updateProfile,
    };
    return (<exports.AuthContext.Provider value={contextValue}>
      {children}
    </exports.AuthContext.Provider>);
};
exports.AuthProvider = AuthProvider;
// useAuth フックを作成
var useAuth = function () { return (0, react_1.useContext)(exports.AuthContext); };
exports.useAuth = useAuth;
