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
exports.useSwipe = void 0;
var react_1 = require("react");
// import { useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
// Reanimatedのモック
var useSharedValue = function (initialValue) { return ({ value: initialValue }); };
var withSpring = function (toValue, config) { return toValue; };
var withTiming = function (toValue, config) { return toValue; };
var react_native_1 = require("react-native");
var swipeService_1 = require("@/services/swipeService");
var width = react_native_1.Dimensions.get('window').width;
var SWIPE_THRESHOLD = 120; // この値以上スワイプしたらアクションを実行
var CARD_WIDTH = width * 0.9;
/**
 * スワイプジェスチャーのロジックを扱うカスタムフック
 */
var useSwipe = function (_a) {
    var userId = _a.userId, onSwipeComplete = _a.onSwipeComplete;
    // Reanimated 2のSharedValue
    var translateX = useSharedValue(0);
    var translateY = useSharedValue(0);
    var scale = useSharedValue(1);
    var rotation = useSharedValue(0);
    // スワイプ左（NO）の処理
    var handleSwipeLeft = (0, react_1.useCallback)(function (product) { return __awaiter(void 0, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // アニメーション
                    translateX.value = withSpring(-CARD_WIDTH - 100, { damping: 15 });
                    if (!userId) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, swipeService_1.saveSwipeResult)(userId, product.id, 'no')];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.error('Error saving NO swipe result:', err_1);
                    return [3 /*break*/, 4];
                case 4:
                    // コールバックを実行
                    if (onSwipeComplete) {
                        onSwipeComplete('left', product);
                    }
                    return [2 /*return*/];
            }
        });
    }); }, [userId, translateX, onSwipeComplete]);
    // スワイプ右（YES）の処理
    var handleSwipeRight = (0, react_1.useCallback)(function (product) { return __awaiter(void 0, void 0, void 0, function () {
        var err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // アニメーション
                    translateX.value = withSpring(CARD_WIDTH + 100, { damping: 15 });
                    if (!userId) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, swipeService_1.saveSwipeResult)(userId, product.id, 'yes')];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _a.sent();
                    console.error('Error saving YES swipe result:', err_2);
                    return [3 /*break*/, 4];
                case 4:
                    // コールバックを実行
                    if (onSwipeComplete) {
                        onSwipeComplete('right', product);
                    }
                    return [2 /*return*/];
            }
        });
    }); }, [userId, translateX, onSwipeComplete]);
    // リセット処理
    var resetPosition = (0, react_1.useCallback)(function () {
        translateX.value = withSpring(0, { damping: 15 });
        translateY.value = withSpring(0, { damping: 15 });
        rotation.value = withTiming(0, { duration: 200 });
        scale.value = withTiming(1, { duration: 200 });
    }, [translateX, translateY, rotation, scale]);
    // スワイプ開始時の処理
    var handleSwipeStart = (0, react_1.useCallback)(function () {
        scale.value = withTiming(1.05, { duration: 200 });
    }, [scale]);
    return {
        // Animated値
        translateX: translateX,
        translateY: translateY,
        scale: scale,
        rotation: rotation,
        // スワイプアクション
        handleSwipeLeft: handleSwipeLeft,
        handleSwipeRight: handleSwipeRight,
        handleSwipeStart: handleSwipeStart,
        resetPosition: resetPosition,
        // 定数
        SWIPE_THRESHOLD: SWIPE_THRESHOLD,
        CARD_WIDTH: CARD_WIDTH,
    };
};
exports.useSwipe = useSwipe;
