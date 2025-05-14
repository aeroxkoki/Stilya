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
exports.useDeepLinks = exports.handleDeepLink = exports.isAppScheme = exports.parseDeepLink = void 0;
var react_1 = require("react");
var react_native_1 = require("react-native");
var native_1 = require("@react-navigation/native");
var authStore_1 = require("@/store/authStore");
var analyticsService_1 = require("@/services/analyticsService");
// ディープリンクパラメータをパース
var parseDeepLink = function (url) {
    var _a;
    try {
        var parsed = new URL(url);
        var params_1 = {};
        // クエリパラメータを取得
        parsed.searchParams.forEach(function (value, key) {
            params_1[key] = value;
        });
        // パスからパラメータを抽出
        // 例: stilya://product/123 -> { action: 'product', id: '123' }
        var pathParts = ((_a = parsed.pathname) === null || _a === void 0 ? void 0 : _a.split('/').filter(Boolean)) || [];
        if (pathParts.length > 0) {
            params_1.action = pathParts[0];
            if (pathParts.length > 1) {
                params_1.id = pathParts[1];
            }
        }
        return params_1;
    }
    catch (error) {
        console.error('Failed to parse deep link:', error);
        return {};
    }
};
exports.parseDeepLink = parseDeepLink;
// URLスキームをチェック
var isAppScheme = function (url) {
    return url.startsWith('stilya://') || url.startsWith('com.stilya://');
};
exports.isAppScheme = isAppScheme;
// ディープリンクの処理
var handleDeepLink = function (url, navigation, userId) {
    if (!url)
        return;
    // App Schema以外は処理しない
    if (!(0, exports.isAppScheme)(url))
        return;
    console.log('Processing deep link:', url);
    // URLを解析
    var params = (0, exports.parseDeepLink)(url);
    // アナリティクスにディープリンク記録
    (0, analyticsService_1.trackEvent)(analyticsService_1.EventType.SCREEN_VIEW, {
        screen_name: 'deep_link',
        url: url,
        params: params,
    }, userId);
    // アクションに基づいて処理
    switch (params.action) {
        case 'product':
            if (params.id) {
                navigation.navigate('Recommend', {
                    screen: 'ProductDetail',
                    params: { productId: params.id },
                });
            }
            break;
        case 'reset-password':
            navigation.navigate('Auth', {
                screen: 'ResetPassword',
                params: { token: params.token },
            });
            break;
        case 'profile':
            navigation.navigate('Profile');
            break;
        case 'recommend':
            navigation.navigate('Recommend');
            break;
        case 'swipe':
            navigation.navigate('Swipe');
            break;
        default:
            console.log('Unknown deep link action:', params.action);
    }
};
exports.handleDeepLink = handleDeepLink;
// ディープリンク処理のためのカスタムフック
var useDeepLinks = function () {
    var navigation = (0, native_1.useNavigation)();
    var user = (0, authStore_1.useAuthStore)().user;
    (0, react_1.useEffect)(function () {
        // 初期URLのチェック
        var checkInitialURL = function () { return __awaiter(void 0, void 0, void 0, function () {
            var initialURL, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, react_native_1.Linking.getInitialURL()];
                    case 1:
                        initialURL = _a.sent();
                        if (initialURL) {
                            (0, exports.handleDeepLink)(initialURL, navigation, user === null || user === void 0 ? void 0 : user.id);
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Error checking initial URL:', error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        checkInitialURL();
        // リンクイベントのリスナー設定
        var linkingSubscription = react_native_1.Linking.addEventListener('url', function (event) {
            (0, exports.handleDeepLink)(event.url, navigation, user === null || user === void 0 ? void 0 : user.id);
        });
        // クリーンアップ
        return function () {
            linkingSubscription.remove();
        };
    }, [navigation, user === null || user === void 0 ? void 0 : user.id]);
    // 商品共有用ディープリンクの生成
    var generateProductLink = function (productId) {
        var scheme = react_native_1.Platform.OS === 'ios' ? 'stilya://' : 'stilya://';
        return "".concat(scheme, "product/").concat(productId);
    };
    return {
        generateProductLink: generateProductLink,
    };
};
exports.useDeepLinks = useDeepLinks;
