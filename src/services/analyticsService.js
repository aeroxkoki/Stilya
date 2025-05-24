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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAnalytics = exports.getAnalyticsData = exports.trackOnboardingComplete = exports.trackShare = exports.trackSwipe = exports.trackProductClick = exports.trackProductView = exports.trackSessionEnd = exports.trackSessionStart = exports.trackScreenView = exports.trackEvent = exports.flushQueue = exports.getOrCreateSessionId = exports.getOrCreateAnonymousId = exports.getDeviceInfo = exports.EventType = void 0;
var supabase_1 = require("./supabase");
var async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
var react_native_1 = require("react-native");
// import * as Application from 'expo-application';
// import * as Device from 'expo-device';
var react_1 = require("react");
// モック化された端末情報関数
var getModelNameAsync = function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    return [2 /*return*/, 'Unknown Device'];
}); }); };
var nativeApplicationVersion = 'Unknown Version';
// イベントタイプ定義
var EventType;
(function (EventType) {
    EventType["APP_OPEN"] = "app_open";
    EventType["APP_CLOSE"] = "app_close";
    EventType["VIEW_PRODUCT"] = "view_product";
    EventType["SWIPE_YES"] = "swipe_yes";
    EventType["SWIPE_NO"] = "swipe_no";
    EventType["CLICK_PRODUCT"] = "click_product";
    EventType["SHARE_PRODUCT"] = "share_product";
    EventType["VIEW_RECOMMENDATION"] = "view_recommendation";
    EventType["SESSION_START"] = "session_start";
    EventType["SESSION_END"] = "session_end";
    EventType["SCREEN_VIEW"] = "screen_view";
    EventType["FAVORITE_ADD"] = "favorite_add";
    EventType["FAVORITE_REMOVE"] = "favorite_remove";
    EventType["ONBOARDING_COMPLETE"] = "onboarding_complete";
    EventType["AUTH_SUCCESS"] = "auth_success";
    EventType["AUTH_FAIL"] = "auth_fail";
})(EventType || (exports.EventType = EventType = {}));
// セッション管理
var currentSessionId = null;
var SESSION_TIMEOUT = 30 * 60 * 1000; // 30分
var lastActivityTimestamp = Date.now();
// 端末情報を取得
var getDeviceInfo = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = {
                    platform: react_native_1.Platform.OS,
                    osVersion: react_native_1.Platform.Version.toString()
                };
                return [4 /*yield*/, getModelNameAsync()];
            case 1: return [2 /*return*/, (_a.model = _b.sent(),
                    _a.appVersion = nativeApplicationVersion,
                    _a)];
        }
    });
}); };
exports.getDeviceInfo = getDeviceInfo;
// 匿名IDの取得または生成
var getOrCreateAnonymousId = function () { return __awaiter(void 0, void 0, void 0, function () {
    var anonymousId;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, async_storage_1.default.getItem('analytics_anonymous_id')];
            case 1:
                anonymousId = _a.sent();
                if (!!anonymousId) return [3 /*break*/, 3];
                anonymousId = "anon_".concat(Date.now(), "_").concat(Math.random().toString(36).substring(2, 9));
                return [4 /*yield*/, async_storage_1.default.setItem('analytics_anonymous_id', anonymousId)];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3: return [2 /*return*/, anonymousId];
        }
    });
}); };
exports.getOrCreateAnonymousId = getOrCreateAnonymousId;
// セッションIDの取得または生成
var getOrCreateSessionId = function () { return __awaiter(void 0, void 0, void 0, function () {
    var now, newSessionId_1, storedSessionId, storedTimestamp, lastTimestamp, now, newSessionId;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!currentSessionId) return [3 /*break*/, 3];
                now = Date.now();
                if (!(now - lastActivityTimestamp > SESSION_TIMEOUT)) return [3 /*break*/, 2];
                newSessionId_1 = "session_".concat(Date.now(), "_").concat(Math.random().toString(36).substring(2, 9));
                return [4 /*yield*/, async_storage_1.default.setItem('analytics_session_id', newSessionId_1)];
            case 1:
                _a.sent();
                currentSessionId = newSessionId_1;
                _a.label = 2;
            case 2:
                lastActivityTimestamp = now;
                return [2 /*return*/, currentSessionId];
            case 3: return [4 /*yield*/, async_storage_1.default.getItem('analytics_session_id')];
            case 4:
                storedSessionId = _a.sent();
                if (!storedSessionId) return [3 /*break*/, 7];
                return [4 /*yield*/, async_storage_1.default.getItem('analytics_last_activity')];
            case 5:
                storedTimestamp = _a.sent();
                lastTimestamp = storedTimestamp ? parseInt(storedTimestamp) : 0;
                now = Date.now();
                if (!(now - lastTimestamp <= SESSION_TIMEOUT)) return [3 /*break*/, 7];
                currentSessionId = storedSessionId;
                lastActivityTimestamp = now;
                return [4 /*yield*/, async_storage_1.default.setItem('analytics_last_activity', now.toString())];
            case 6:
                _a.sent();
                return [2 /*return*/, currentSessionId];
            case 7:
                newSessionId = "session_".concat(Date.now(), "_").concat(Math.random().toString(36).substring(2, 9));
                currentSessionId = newSessionId;
                lastActivityTimestamp = Date.now();
                return [4 /*yield*/, async_storage_1.default.setItem('analytics_session_id', newSessionId)];
            case 8:
                _a.sent();
                return [4 /*yield*/, async_storage_1.default.setItem('analytics_last_activity', lastActivityTimestamp.toString())];
            case 9:
                _a.sent();
                return [2 /*return*/, newSessionId];
        }
    });
}); };
exports.getOrCreateSessionId = getOrCreateSessionId;
// エラー発生時のキューイング
var QUEUE_KEY = 'analytics_event_queue';
// キューイングされたイベントを送信
var flushQueue = function () { return __awaiter(void 0, void 0, void 0, function () {
    var queueStr, queue, error, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 6, , 7]);
                return [4 /*yield*/, async_storage_1.default.getItem(QUEUE_KEY)];
            case 1:
                queueStr = _a.sent();
                if (!queueStr)
                    return [2 /*return*/];
                queue = JSON.parse(queueStr);
                if (queue.length === 0)
                    return [2 /*return*/];
                return [4 /*yield*/, supabase_1.supabase
                        .from('analytics_events')
                        .insert(queue)];
            case 2:
                error = (_a.sent()).error;
                if (!!error) return [3 /*break*/, 4];
                // 成功したらキューをクリア
                return [4 /*yield*/, async_storage_1.default.removeItem(QUEUE_KEY)];
            case 3:
                // 成功したらキューをクリア
                _a.sent();
                return [3 /*break*/, 5];
            case 4:
                console.error('Failed to flush analytics queue:', error);
                _a.label = 5;
            case 5: return [3 /*break*/, 7];
            case 6:
                error_1 = _a.sent();
                console.error('Error processing analytics queue:', error_1);
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.flushQueue = flushQueue;
// イベントをキューに追加
var queueEvent = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var queueStr, queue, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, async_storage_1.default.getItem(QUEUE_KEY)];
            case 1:
                queueStr = _a.sent();
                queue = queueStr ? JSON.parse(queueStr) : [];
                queue.push(event);
                return [4 /*yield*/, async_storage_1.default.setItem(QUEUE_KEY, JSON.stringify(queue))];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                error_2 = _a.sent();
                console.error('Error queuing analytics event:', error_2);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
// イベントを記録する基本関数
var trackEvent = function (eventType_1) {
    var args_1 = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([eventType_1], args_1, true), void 0, function (eventType, properties, userId) {
        var anonymousId, sessionId, deviceInfo, event_1, error, error_3;
        if (properties === void 0) { properties = {}; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    // 開発環境ではログだけ出力
                    if (__DEV__) {
                        console.log("[Analytics] Event: ".concat(eventType), { properties: properties, userId: userId });
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, (0, exports.getOrCreateAnonymousId)()];
                case 1:
                    anonymousId = _a.sent();
                    return [4 /*yield*/, (0, exports.getOrCreateSessionId)()];
                case 2:
                    sessionId = _a.sent();
                    return [4 /*yield*/, (0, exports.getDeviceInfo)()];
                case 3:
                    deviceInfo = _a.sent();
                    event_1 = {
                        userId: userId,
                        anonymousId: anonymousId,
                        eventType: eventType,
                        properties: properties,
                        timestamp: new Date().toISOString(),
                        sessionId: sessionId,
                        deviceInfo: deviceInfo,
                    };
                    return [4 /*yield*/, supabase_1.supabase.from('analytics_events').insert([event_1])];
                case 4:
                    error = (_a.sent()).error;
                    if (!error) return [3 /*break*/, 6];
                    console.error('Failed to track event:', error);
                    // エラー時はキューに追加
                    return [4 /*yield*/, queueEvent(event_1)];
                case 5:
                    // エラー時はキューに追加
                    _a.sent();
                    _a.label = 6;
                case 6: return [3 /*break*/, 8];
                case 7:
                    error_3 = _a.sent();
                    console.error('Error tracking event:', error_3);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
};
exports.trackEvent = trackEvent;
// 画面表示イベント
var trackScreenView = function (screenName_1) {
    var args_1 = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([screenName_1], args_1, true), void 0, function (screenName, params, userId) {
        if (params === void 0) { params = {}; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, exports.trackEvent)(EventType.SCREEN_VIEW, __assign({ screen_name: screenName }, params), userId)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
};
exports.trackScreenView = trackScreenView;
// セッション開始イベント
var trackSessionStart = function (userId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.trackEvent)(EventType.SESSION_START, {}, userId)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.trackSessionStart = trackSessionStart;
// セッション終了イベント
var trackSessionEnd = function (userId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.trackEvent)(EventType.SESSION_END, {
                    duration_ms: Date.now() - lastActivityTimestamp
                }, userId)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.trackSessionEnd = trackSessionEnd;
// 商品表示イベント
var trackProductView = function (productId, productData, userId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.trackEvent)(EventType.VIEW_PRODUCT, __assign({ product_id: productId }, productData), userId)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.trackProductView = trackProductView;
// 商品クリックイベント
var trackProductClick = function (productId, productData, userId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.trackEvent)(EventType.CLICK_PRODUCT, __assign({ product_id: productId }, productData), userId)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.trackProductClick = trackProductClick;
// スワイプイベント
var trackSwipe = function (productId, result, userId) { return __awaiter(void 0, void 0, void 0, function () {
    var eventType;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                eventType = result === 'yes' ? EventType.SWIPE_YES : EventType.SWIPE_NO;
                return [4 /*yield*/, (0, exports.trackEvent)(eventType, {
                        product_id: productId,
                    }, userId)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.trackSwipe = trackSwipe;
// 商品シェアイベント
var trackShare = function (productId, platform, userId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.trackEvent)(EventType.SHARE_PRODUCT, {
                    product_id: productId,
                    platform: platform,
                }, userId)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.trackShare = trackShare;
// オンボーディング完了イベント
var trackOnboardingComplete = function (onboardingData, userId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.trackEvent)(EventType.ONBOARDING_COMPLETE, onboardingData, userId)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.trackOnboardingComplete = trackOnboardingComplete;
// アナリティクスデータの取得（レポート画面用）
var getAnalyticsData = function (userId) { return __awaiter(void 0, void 0, void 0, function () {
    var anonymousId, getLastNDays, last7Days, styleOptions_1, activity, totalSwipes, totalFavorites, totalViews, conversion, totalImpressions, totalClicks, totalConversions, ctr, cvr, remainingPercentage_1, styleTrends, preferredStyles, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, exports.getOrCreateAnonymousId)()];
            case 1:
                anonymousId = _a.sent();
                getLastNDays = function (n) {
                    var dates = [];
                    var today = new Date();
                    for (var i = n - 1; i >= 0; i--) {
                        var date = new Date(today);
                        date.setDate(date.getDate() - i);
                        dates.push(date.toISOString().split('T')[0]);
                    }
                    return dates;
                };
                last7Days = getLastNDays(7);
                styleOptions_1 = ['カジュアル', 'モード', 'ナチュラル', 'ストリート', 'クラシック', 'フェミニン'];
                activity = last7Days.map(function (date) { return ({
                    date: date,
                    swipes: Math.floor(Math.random() * 30),
                    favorites: Math.floor(Math.random() * 10),
                    views: Math.floor(Math.random() * 15),
                }); });
                totalSwipes = activity.reduce(function (acc, day) { return acc + day.swipes; }, 0);
                totalFavorites = activity.reduce(function (acc, day) { return acc + day.favorites; }, 0);
                totalViews = activity.reduce(function (acc, day) { return acc + day.views; }, 0);
                conversion = last7Days.map(function (date) { return ({
                    date: date,
                    impressions: Math.floor(Math.random() * 50) + 10,
                    clicks: Math.floor(Math.random() * 15),
                    conversions: Math.floor(Math.random() * 3),
                }); });
                totalImpressions = conversion.reduce(function (acc, day) { return acc + day.impressions; }, 0);
                totalClicks = conversion.reduce(function (acc, day) { return acc + day.clicks; }, 0);
                totalConversions = conversion.reduce(function (acc, day) { return acc + day.conversions; }, 0);
                ctr = totalImpressions > 0
                    ? ((totalClicks / totalImpressions) * 100).toFixed(1)
                    : '0.0';
                cvr = totalClicks > 0
                    ? ((totalConversions / totalClicks) * 100).toFixed(1)
                    : '0.0';
                remainingPercentage_1 = 100;
                styleTrends = styleOptions_1.map(function (style, index) {
                    if (index === styleOptions_1.length - 1) {
                        return { style: style, percentage: remainingPercentage_1 };
                    }
                    var percentage = index === 0
                        ? Math.floor(Math.random() * 40) + 10 // 最初のスタイルは主要傾向にする
                        : Math.floor(Math.random() * Math.min(30, remainingPercentage_1 - styleOptions_1.length + index + 1));
                    remainingPercentage_1 -= percentage;
                    return { style: style, percentage: percentage };
                }).sort(function (a, b) { return b.percentage - a.percentage; });
                preferredStyles = styleTrends
                    .slice(0, 2)
                    .map(function (style) { return style.style; });
                // レスポンスを生成
                return [2 /*return*/, {
                        totalSwipes: totalSwipes,
                        totalFavorites: totalFavorites,
                        totalViews: totalViews,
                        activity: activity,
                        ctr: ctr,
                        cvr: cvr,
                        conversion: conversion,
                        preferredStyles: preferredStyles,
                        styleTrends: styleTrends,
                    }];
            case 2:
                error_4 = _a.sent();
                console.error('Error fetching analytics data:', error_4);
                throw error_4;
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getAnalyticsData = getAnalyticsData;
// Reactフックとして使用するためのカスタムフック
var useAnalytics = function (userId) {
    var _a = (0, react_1.useState)(false), isReady = _a[0], setIsReady = _a[1];
    (0, react_1.useEffect)(function () {
        var initAnalytics = function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, exports.getOrCreateSessionId)()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, (0, exports.flushQueue)()];
                    case 2:
                        _a.sent();
                        setIsReady(true);
                        return [2 /*return*/];
                }
            });
        }); };
        initAnalytics();
        return function () {
            // コンポーネントのアンマウント時にセッション終了を記録
            (0, exports.trackSessionEnd)(userId).catch(console.error);
        };
    }, [userId]);
    return {
        isReady: isReady,
        trackEvent: function (eventType, properties) {
            if (properties === void 0) { properties = {}; }
            return (0, exports.trackEvent)(eventType, properties, userId);
        },
        trackScreenView: function (screenName, params) {
            if (params === void 0) { params = {}; }
            return (0, exports.trackScreenView)(screenName, params, userId);
        },
        trackProductView: function (productId, productData) {
            return (0, exports.trackProductView)(productId, productData, userId);
        },
        trackProductClick: function (productId, productData) {
            return (0, exports.trackProductClick)(productId, productData, userId);
        },
        trackSwipe: function (productId, result) {
            return (0, exports.trackSwipe)(productId, result, userId);
        },
        trackShare: function (productId, platform) {
            return (0, exports.trackShare)(productId, platform, userId);
        },
    };
};
exports.useAnalytics = useAnalytics;
