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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuthStore = void 0;
var zustand_1 = require("zustand");
var supabase_1 = require("@/services/supabase");
exports.useAuthStore = (0, zustand_1.create)(function (set, get) { return ({
    user: null,
    session: null,
    loading: true,
    error: null,
    setUser: function (user) { return set({ user: user }); },
    clearError: function () { return set({ error: null }); },
    initialize: function () { return __awaiter(void 0, void 0, void 0, function () {
        var session, refreshResult, refreshedSession, user, user, profile, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 14, , 15]);
                    set({ loading: true, error: null });
                    return [4 /*yield*/, supabase_1.supabase.auth.getSession()];
                case 1:
                    session = (_a.sent()).data.session;
                    if (!session) return [3 /*break*/, 12];
                    if (!(0, supabase_1.isSessionExpired)(session)) return [3 /*break*/, 8];
                    return [4 /*yield*/, (0, supabase_1.refreshSession)()];
                case 2:
                    refreshResult = _a.sent();
                    refreshedSession = refreshResult.session;
                    if (!refreshedSession) return [3 /*break*/, 6];
                    return [4 /*yield*/, supabase_1.supabase.auth.getUser()];
                case 3:
                    user = (_a.sent()).data.user;
                    if (!user) return [3 /*break*/, 5];
                    return [4 /*yield*/, get().fetchUserProfile()];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    // 更新に失敗した場合はログアウト状態
                    set({ user: null, session: null, loading: false });
                    return [2 /*return*/];
                case 7: return [3 /*break*/, 11];
                case 8: return [4 /*yield*/, supabase_1.supabase.auth.getUser()];
                case 9:
                    user = (_a.sent()).data.user;
                    if (!user) return [3 /*break*/, 11];
                    return [4 /*yield*/, (0, supabase_1.getUserProfile)(user.id)];
                case 10:
                    profile = _a.sent();
                    set({
                        user: __assign({ id: user.id, email: user.email }, profile),
                        session: session,
                        loading: false,
                    });
                    _a.label = 11;
                case 11: return [3 /*break*/, 13];
                case 12:
                    // セッションがない場合はログアウト状態
                    set({ user: null, session: null, loading: false });
                    _a.label = 13;
                case 13: return [3 /*break*/, 15];
                case 14:
                    error_1 = _a.sent();
                    console.error('Error initializing auth store:', error_1);
                    set({ error: 'セッションの初期化に失敗しました', loading: false });
                    return [3 /*break*/, 15];
                case 15: return [2 /*return*/];
            }
        });
    }); },
    checkAndRefreshSession: function () { return __awaiter(void 0, void 0, void 0, function () {
        var session, refreshResult, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    session = get().session;
                    if (!session)
                        return [2 /*return*/, false];
                    if (!(0, supabase_1.isSessionExpired)(session)) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, supabase_1.refreshSession)()];
                case 1:
                    refreshResult = _a.sent();
                    if (refreshResult.session) {
                        set({ session: refreshResult.session });
                        return [2 /*return*/, true];
                    }
                    return [2 /*return*/, false];
                case 2: return [2 /*return*/, true];
                case 3:
                    error_2 = _a.sent();
                    console.error('Error refreshing session:', error_2);
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    }); },
    login: function (email, password) { return __awaiter(void 0, void 0, void 0, function () {
        var data, profile, error_3, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    set({ loading: true, error: null });
                    return [4 /*yield*/, (0, supabase_1.signIn)(email, password)];
                case 1:
                    data = _a.sent();
                    if (!data.user) return [3 /*break*/, 5];
                    return [4 /*yield*/, (0, supabase_1.getUserProfile)(data.user.id)];
                case 2:
                    profile = _a.sent();
                    if (!!profile) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, supabase_1.createUserProfile)({
                            id: data.user.id,
                            email: data.user.email,
                        })];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    set({
                        user: __assign({ id: data.user.id, email: data.user.email }, profile),
                        session: data.session,
                        loading: false,
                    });
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_3 = _a.sent();
                    console.error('Error logging in:', error_3);
                    errorMessage = 'ログインに失敗しました';
                    if (error_3.message) {
                        if (error_3.message.includes('Invalid login credentials')) {
                            errorMessage = 'メールアドレスかパスワードが間違っています';
                        }
                        else if (error_3.message.includes('Email not confirmed')) {
                            errorMessage = 'メールアドレスが確認されていません。メールをご確認ください';
                        }
                        else {
                            errorMessage = error_3.message;
                        }
                    }
                    set({
                        error: errorMessage,
                        loading: false,
                    });
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); },
    register: function (email, password) { return __awaiter(void 0, void 0, void 0, function () {
        var data, error_4, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    set({ loading: true, error: null });
                    return [4 /*yield*/, (0, supabase_1.signUp)(email, password)];
                case 1:
                    data = _a.sent();
                    if (!data.user) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, supabase_1.createUserProfile)({
                            id: data.user.id,
                            email: data.user.email,
                        })];
                case 2:
                    _a.sent();
                    set({
                        user: {
                            id: data.user.id,
                            email: data.user.email,
                        },
                        session: data.session,
                        loading: false,
                    });
                    return [3 /*break*/, 4];
                case 3:
                    // メール確認が必要な場合
                    set({
                        user: null,
                        session: null,
                        loading: false,
                        error: 'アカウント登録が完了しました。確認メールをご確認ください。',
                    });
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    error_4 = _a.sent();
                    console.error('Error registering:', error_4);
                    errorMessage = 'アカウント登録に失敗しました';
                    if (error_4.message) {
                        if (error_4.message.includes('User already registered')) {
                            errorMessage = 'このメールアドレスは既に登録されています';
                        }
                        else if (error_4.message.includes('Password should be')) {
                            errorMessage = 'パスワードは6文字以上である必要があります';
                        }
                        else {
                            errorMessage = error_4.message;
                        }
                    }
                    set({
                        error: errorMessage,
                        loading: false,
                    });
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); },
    logout: function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    set({ loading: true, error: null });
                    return [4 /*yield*/, (0, supabase_1.signOut)()];
                case 1:
                    _a.sent();
                    set({ user: null, session: null, loading: false });
                    return [3 /*break*/, 3];
                case 2:
                    error_5 = _a.sent();
                    console.error('Error logging out:', error_5);
                    set({
                        error: error_5.message || 'ログアウトに失敗しました',
                        loading: false,
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); },
    resetUserPassword: function (email) { return __awaiter(void 0, void 0, void 0, function () {
        var error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    set({ loading: true, error: null });
                    return [4 /*yield*/, (0, supabase_1.resetPassword)(email)];
                case 1:
                    _a.sent();
                    set({ loading: false });
                    return [3 /*break*/, 3];
                case 2:
                    error_6 = _a.sent();
                    console.error('Error resetting password:', error_6);
                    set({
                        error: error_6.message || 'パスワードリセットに失敗しました',
                        loading: false,
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); },
    updateUserPassword: function (newPassword) { return __awaiter(void 0, void 0, void 0, function () {
        var error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    set({ loading: true, error: null });
                    return [4 /*yield*/, (0, supabase_1.updatePassword)(newPassword)];
                case 1:
                    _a.sent();
                    set({ loading: false });
                    return [3 /*break*/, 3];
                case 2:
                    error_7 = _a.sent();
                    console.error('Error updating password:', error_7);
                    set({
                        error: error_7.message || 'パスワード更新に失敗しました',
                        loading: false,
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); },
    fetchUserProfile: function () { return __awaiter(void 0, void 0, void 0, function () {
        var user, profile, error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    user = get().user;
                    if (!user) {
                        throw new Error('ユーザーが認証されていません');
                    }
                    set({ loading: true, error: null });
                    return [4 /*yield*/, (0, supabase_1.getUserProfile)(user.id)];
                case 1:
                    profile = _a.sent();
                    set({
                        user: __assign(__assign({}, user), profile),
                        loading: false,
                    });
                    return [3 /*break*/, 3];
                case 2:
                    error_8 = _a.sent();
                    console.error('Error fetching user profile:', error_8);
                    set({
                        error: error_8.message || 'プロファイルの取得に失敗しました',
                        loading: false,
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); },
    createProfile: function (profile) { return __awaiter(void 0, void 0, void 0, function () {
        var user, error_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    user = get().user;
                    if (!user) {
                        throw new Error('ユーザーが認証されていません');
                    }
                    set({ loading: true, error: null });
                    return [4 /*yield*/, (0, supabase_1.createUserProfile)(__assign({ id: user.id }, profile))];
                case 1:
                    _a.sent();
                    set({
                        user: __assign(__assign({}, user), profile),
                        loading: false,
                    });
                    return [3 /*break*/, 3];
                case 2:
                    error_9 = _a.sent();
                    console.error('Error creating user profile:', error_9);
                    set({
                        error: error_9.message || 'プロファイルの作成に失敗しました',
                        loading: false,
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); },
    updateProfile: function (updates) { return __awaiter(void 0, void 0, void 0, function () {
        var user, error_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    user = get().user;
                    if (!user) {
                        throw new Error('ユーザーが認証されていません');
                    }
                    set({ loading: true, error: null });
                    return [4 /*yield*/, (0, supabase_1.updateUserProfile)(user.id, updates)];
                case 1:
                    _a.sent();
                    set({
                        user: __assign(__assign({}, user), updates),
                        loading: false,
                    });
                    return [3 /*break*/, 3];
                case 2:
                    error_10 = _a.sent();
                    console.error('Error updating user profile:', error_10);
                    set({
                        error: error_10.message || 'プロファイルの更新に失敗しました',
                        loading: false,
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); },
}); });
