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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAppLifecycle = void 0;
var react_1 = require("react");
var react_native_1 = require("react-native");
var authStore_1 = require("@/store/authStore");
var analyticsService_1 = require("@/services/analyticsService");
/**
 * アプリのライフサイクル検知とアナリティクスを統合するフック
 * - アプリの起動/終了を検知
 * - セッション開始/終了を記録
 * - バックグラウンド/フォアグラウンド遷移をトラック
 */
var useAppLifecycle = function () {
    var user = (0, authStore_1.useAuthStore)().user;
    var appState = (0, react_1.useRef)(react_native_1.AppState.currentState);
    var _a = (0, react_1.useState)(true), isActive = _a[0], setIsActive = _a[1];
    var wasActiveRef = (0, react_1.useRef)(true);
    var sessionTimeoutRef = (0, react_1.useRef)(null);
    var userId = user === null || user === void 0 ? void 0 : user.id;
    // ライフサイクルイベントのリスナー設定
    (0, react_1.useEffect)(function () {
        // アプリの起動をトラック
        var trackAppOpen = function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, analyticsService_1.trackEvent)(analyticsService_1.EventType.APP_OPEN, {
                            device_info: {
                                platform: react_native_1.Platform.OS,
                                version: react_native_1.Platform.Version,
                            }
                        }, userId)];
                    case 1:
                        _a.sent();
                        // セッション開始を記録
                        return [4 /*yield*/, (0, analyticsService_1.trackSessionStart)(userId)];
                    case 2:
                        // セッション開始を記録
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        trackAppOpen();
        // AppStateの変更を監視
        var subscription = react_native_1.AppState.addEventListener('change', handleAppStateChange);
        // クリーンアップ関数
        return function () {
            subscription.remove();
            // セッションのタイムアウトクリア
            if (sessionTimeoutRef.current) {
                clearTimeout(sessionTimeoutRef.current);
            }
            // アプリ終了前にセッション終了記録を試みる
            (0, analyticsService_1.trackSessionEnd)(userId).catch(console.error);
            (0, analyticsService_1.trackEvent)(analyticsService_1.EventType.APP_CLOSE, {}, userId).catch(console.error);
        };
    }, [userId]);
    // アプリの状態変更時の処理
    var handleAppStateChange = function (nextAppState) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // バックグラウンド→フォアグラウンド
            if (appState.current.match(/inactive|background/) &&
                nextAppState === 'active') {
                console.log('App has come to the foreground');
                setIsActive(true);
                // セッションタイムアウトがある場合はクリア
                if (sessionTimeoutRef.current) {
                    clearTimeout(sessionTimeoutRef.current);
                    sessionTimeoutRef.current = null;
                }
                // アプリがバックグラウンドから復帰したイベントを記録
                if (!wasActiveRef.current) {
                    (0, analyticsService_1.trackEvent)(analyticsService_1.EventType.APP_OPEN, { from_background: true }, userId)
                        .catch(console.error);
                    // 新しいセッションを開始
                    (0, analyticsService_1.trackSessionStart)(userId).catch(console.error);
                }
            }
            // フォアグラウンド→バックグラウンド
            else if (nextAppState.match(/inactive|background/) &&
                appState.current === 'active') {
                console.log('App has gone to the background');
                setIsActive(false);
                // セッション終了のタイムアウトを設定（30秒以上バックグラウンドならセッション終了とみなす）
                sessionTimeoutRef.current = setTimeout(function () {
                    wasActiveRef.current = false;
                    (0, analyticsService_1.trackSessionEnd)(userId).catch(console.error);
                }, 30000); // 30秒
            }
            appState.current = nextAppState;
            wasActiveRef.current = nextAppState === 'active';
            return [2 /*return*/];
        });
    }); };
    return {
        isActive: isActive
    };
};
exports.useAppLifecycle = useAppLifecycle;
