"use strict";
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
exports.createUserProfile = exports.updateUserProfile = exports.getUserProfile = exports.signOut = exports.updatePassword = exports.resetPassword = exports.signIn = exports.signUp = exports.isSessionExpired = exports.refreshSession = exports.getSession = exports.supabase = void 0;
require("react-native-url-polyfill/auto");
var async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
var supabase_js_1 = require("@supabase/supabase-js");
// import * as SecureStore from 'expo-secure-store';
var env_1 = require("../utils/env");
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
// JSONデータの安全な保存・取得ヘルパー
var saveToSecureStore = function (key, value) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, SecureStore.setItemAsync(key, value)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var getFromSecureStore = function (key) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, SecureStore.getItemAsync(key)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
// セキュアストレージアダプター
var secureStorageAdapter = {
    getItem: getFromSecureStore,
    setItem: saveToSecureStore,
    removeItem: function (key) { return SecureStore.deleteItemAsync(key); },
};
// 通常のストレージアダプター（認証以外のデータ用）
var normalStorageAdapter = {
    getItem: function (key) {
        return async_storage_1.default.getItem(key);
    },
    setItem: function (key, value) {
        async_storage_1.default.setItem(key, value);
        return Promise.resolve();
    },
    removeItem: function (key) {
        async_storage_1.default.removeItem(key);
        return Promise.resolve();
    },
};
// Supabaseクライアントの作成
exports.supabase = (0, supabase_js_1.createClient)(env_1.SUPABASE_URL, env_1.SUPABASE_ANON_KEY, {
    auth: {
        storage: secureStorageAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
// ユーザーセッションの取得
var getSession = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, data, error, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                return [4 /*yield*/, exports.supabase.auth.getSession()];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error)
                    throw error;
                return [2 /*return*/, data.session];
            case 2:
                error_1 = _b.sent();
                console.error('Error getting session:', error_1);
                return [2 /*return*/, null];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getSession = getSession;
// セッションの更新
var refreshSession = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, data, error, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                return [4 /*yield*/, exports.supabase.auth.refreshSession()];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error)
                    throw error;
                return [2 /*return*/, data];
            case 2:
                error_2 = _b.sent();
                console.error('Error refreshing session:', error_2);
                throw error_2;
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.refreshSession = refreshSession;
// セッション有効期限をチェック
var isSessionExpired = function (session) {
    if (!session || !session.expires_at)
        return true;
    // expires_at はUNIXタイムスタンプ（秒）
    var expiresAt = session.expires_at * 1000; // ミリ秒に変換
    var now = Date.now();
    // 有効期限が1時間以内の場合も期限切れと見なして更新する
    var oneHour = 60 * 60 * 1000;
    return now >= (expiresAt - oneHour);
};
exports.isSessionExpired = isSessionExpired;
// サインアップ
var signUp = function (email, password) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, data, error, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                return [4 /*yield*/, exports.supabase.auth.signUp({
                        email: email,
                        password: password,
                    })];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error)
                    throw error;
                return [2 /*return*/, data];
            case 2:
                error_3 = _b.sent();
                console.error('Error signing up:', error_3);
                throw error_3;
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.signUp = signUp;
// サインイン
var signIn = function (email, password) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, data, error, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                return [4 /*yield*/, exports.supabase.auth.signInWithPassword({
                        email: email,
                        password: password,
                    })];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error)
                    throw error;
                return [2 /*return*/, data];
            case 2:
                error_4 = _b.sent();
                console.error('Error signing in:', error_4);
                throw error_4;
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.signIn = signIn;
// パスワードリセット用のメール送信
var resetPassword = function (email) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, data, error, error_5;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                return [4 /*yield*/, exports.supabase.auth.resetPasswordForEmail(email, {
                        redirectTo: 'stilya://reset-password', // ディープリンクURL
                    })];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error)
                    throw error;
                return [2 /*return*/, { data: data, success: true }];
            case 2:
                error_5 = _b.sent();
                console.error('Error sending password reset email:', error_5);
                throw error_5;
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.resetPassword = resetPassword;
// パスワード更新
var updatePassword = function (newPassword) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, data, error, error_6;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                return [4 /*yield*/, exports.supabase.auth.updateUser({
                        password: newPassword
                    })];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error)
                    throw error;
                return [2 /*return*/, { data: data, success: true }];
            case 2:
                error_6 = _b.sent();
                console.error('Error updating password:', error_6);
                throw error_6;
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.updatePassword = updatePassword;
// サインアウト
var signOut = function () { return __awaiter(void 0, void 0, void 0, function () {
    var error, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, exports.supabase.auth.signOut()];
            case 1:
                error = (_a.sent()).error;
                if (error)
                    throw error;
                return [3 /*break*/, 3];
            case 2:
                error_7 = _a.sent();
                console.error('Error signing out:', error_7);
                throw error_7;
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.signOut = signOut;
// ユーザープロフィールの取得
var getUserProfile = function (userId) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, data, error, error_8;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                return [4 /*yield*/, exports.supabase
                        .from('users')
                        .select('*')
                        .eq('id', userId)
                        .single()];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error)
                    throw error;
                return [2 /*return*/, data];
            case 2:
                error_8 = _b.sent();
                console.error('Error fetching user profile:', error_8);
                return [2 /*return*/, null];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getUserProfile = getUserProfile;
// ユーザープロフィールの更新
var updateUserProfile = function (userId, updates) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, data, error, error_9;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                return [4 /*yield*/, exports.supabase
                        .from('users')
                        .update(updates)
                        .eq('id', userId)
                        .select()];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error)
                    throw error;
                return [2 /*return*/, data];
            case 2:
                error_9 = _b.sent();
                console.error('Error updating user profile:', error_9);
                throw error_9;
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.updateUserProfile = updateUserProfile;
// ユーザープロフィールの作成
var createUserProfile = function (profile) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, data, error, error_10;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                return [4 /*yield*/, exports.supabase
                        .from('users')
                        .insert([profile])
                        .select()];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error)
                    throw error;
                return [2 /*return*/, data];
            case 2:
                error_10 = _b.sent();
                console.error('Error creating user profile:', error_10);
                throw error_10;
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.createUserProfile = createUserProfile;
