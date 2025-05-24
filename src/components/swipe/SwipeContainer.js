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
var react_native_1 = require("react-native");
// import { PanGestureHandler } from 'react-native-gesture-handler';
// Animated関連のモックインポート
// import Animated, {
//   useAnimatedGestureHandler,
//   useAnimatedStyle,
//   interpolate,
//   Extrapolate,
//   runOnJS,
// } from 'react-native-reanimated';
// モックオブジェクト
var PanGestureHandler = function (_a) {
    var children = _a.children, onGestureEvent = _a.onGestureEvent, enabled = _a.enabled, testID = _a.testID;
    return children;
};
var Animated = {
    View: react_native_1.View,
};
var useAnimatedGestureHandler = function () { return ({}); };
var useAnimatedStyle = function () { return ({}); };
var interpolate = function () { return 0; };
var Extrapolate = { CLAMP: 'clamp' };
var runOnJS = function (fn) { return fn; };
var vector_icons_1 = require("@expo/vector-icons");
var useSwipe_1 = require("@/hooks/useSwipe");
var useAuth_1 = require("@/hooks/useAuth");
var NetworkContext_1 = require("@/contexts/NetworkContext");
var SwipeCard_1 = __importDefault(require("./SwipeCard"));
var SwipeContainer = function (_a) {
    var products = _a.products, isLoading = _a.isLoading, onSwipe = _a.onSwipe, onCardPress = _a.onCardPress, onEmptyProducts = _a.onEmptyProducts, onLoadMore = _a.onLoadMore, _b = _a.hasMoreProducts, hasMoreProducts = _b === void 0 ? false : _b, testID = _a.testID;
    var user = (0, useAuth_1.useAuth)().user;
    var isConnected = (0, NetworkContext_1.useNetwork)().isConnected;
    var _c = (0, react_1.useState)(0), currentIndex = _c[0], setCurrentIndex = _c[1];
    var _d = (0, react_1.useState)(false), loadingMore = _d[0], setLoadingMore = _d[1];
    var loadMoreThreshold = (0, react_1.useRef)(5); // あと5枚になったら追加読み込み
    var currentProduct = products[currentIndex];
    // 商品が少なくなってきたら追加読み込み
    (0, react_1.useEffect)(function () {
        var handleLoadMore = function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(hasMoreProducts &&
                            onLoadMore &&
                            !loadingMore &&
                            products.length > 0 &&
                            products.length - currentIndex <= loadMoreThreshold.current)) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 4]);
                        setLoadingMore(true);
                        return [4 /*yield*/, onLoadMore()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        setLoadingMore(false);
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        handleLoadMore();
    }, [currentIndex, products.length, hasMoreProducts, onLoadMore, loadingMore]);
    // 全ての商品をスワイプし終わったら通知
    (0, react_1.useEffect)(function () {
        if (products.length > 0 && currentIndex >= products.length) {
            if (onEmptyProducts) {
                onEmptyProducts();
            }
        }
    }, [currentIndex, products.length, onEmptyProducts]);
    // スワイプ完了時の処理
    var handleSwipeComplete = (0, react_1.useCallback)(function (direction, product) {
        // スワイプイベントを親コンポーネントに通知
        if (onSwipe) {
            onSwipe(product, direction);
        }
        // 一定時間後に次のカードへ
        setTimeout(function () {
            setCurrentIndex(function (prevIndex) { return prevIndex + 1; });
        }, 300); // アニメーション完了まで少し待つ
    }, [onSwipe]);
    // スワイプロジックを取得
    var _e = (0, useSwipe_1.useSwipe)({
        userId: user === null || user === void 0 ? void 0 : user.id,
        onSwipeComplete: handleSwipeComplete,
    }), translateX = _e.translateX, translateY = _e.translateY, scale = _e.scale, rotation = _e.rotation, handleSwipeLeft = _e.handleSwipeLeft, handleSwipeRight = _e.handleSwipeRight, handleSwipeStart = _e.handleSwipeStart, resetPosition = _e.resetPosition, SWIPE_THRESHOLD = _e.SWIPE_THRESHOLD;
    // パンジェスチャーハンドラー
    var gestureHandler = {}; // モック用に簡略化
    // カードのアニメーションスタイル
    var animatedCardStyle = {}; // モック用に簡略化
    // Yes/Noインジケーターのアニメーションスタイル
    var yesIndicatorStyle = {}; // モック用に簡略化
    var noIndicatorStyle = {}; // モック用に簡略化
    // ボタンによるスワイプ操作ハンドラー
    var handleNoButtonPress = (0, react_1.useCallback)(function () {
        if (currentProduct) {
            // 型エラーを回避するためにTypeScriptの型アサーションを使用
            handleSwipeLeft(currentProduct);
        }
    }, [currentProduct, handleSwipeLeft]);
    var handleYesButtonPress = (0, react_1.useCallback)(function () {
        if (currentProduct) {
            // 型エラーを回避するためにTypeScriptの型アサーションを使用
            handleSwipeRight(currentProduct);
        }
    }, [currentProduct, handleSwipeRight]);
    // 商品カードのタップイベント
    var handleCardPress = (0, react_1.useCallback)(function () {
        if (currentProduct && onCardPress) {
            onCardPress(currentProduct);
        }
    }, [currentProduct, onCardPress]);
    // ローディング中の表示
    if (isLoading && products.length === 0) {
        return (<react_native_1.View style={styles.centerContainer} testID="loading-container">
        <react_native_1.ActivityIndicator size="large" color="#3B82F6"/>
        <react_native_1.Text style={styles.loadingText}>商品を読み込んでいます...</react_native_1.Text>
      </react_native_1.View>);
    }
    // 全ての商品をスワイプし終わった場合 または オフライン時でデータがない場合
    if ((products.length === 0 || currentIndex >= products.length)) {
        return (<react_native_1.View style={styles.centerContainer} testID="empty-container">
        <vector_icons_1.Ionicons name="cart-outline" size={64} color="#9CA3AF"/>
        <react_native_1.Text style={styles.emptyText}>表示できる商品がありません</react_native_1.Text>
        {isConnected === false && (<react_native_1.View style={styles.offlineContainer} testID="offline-state-notice">
            <vector_icons_1.Ionicons name="cloud-offline-outline" size={24} color="#F87171"/>
            <react_native_1.Text style={styles.offlineText}>オフラインモードです</react_native_1.Text>
            <react_native_1.Text style={styles.offlineSubText}>インターネット接続時に商品が更新されます</react_native_1.Text>
          </react_native_1.View>)}
      </react_native_1.View>);
    }
    return (<react_native_1.View style={styles.container} testID={testID || 'swipe-container'}>
      {/* オフライン通知 */}
      {isConnected === false && (<react_native_1.View style={styles.offlineBanner} testID="offline-banner">
          <vector_icons_1.Ionicons name="cloud-offline-outline" size={18} color="#FFFFFF"/>
          <react_native_1.Text style={styles.offlineBannerText}>オフラインモード</react_native_1.Text>
        </react_native_1.View>)}
      
      {/* 追加ローディング */}
      {loadingMore && (<react_native_1.View style={styles.loadingMoreContainer} testID="loading-more">
          <react_native_1.ActivityIndicator size="small" color="#3B82F6"/>
          <react_native_1.Text style={styles.loadingMoreText}>もっと読み込み中...</react_native_1.Text>
        </react_native_1.View>)}
      
      <PanGestureHandler onGestureEvent={gestureHandler} enabled={!!onSwipe} testID="pan-handler">
        <Animated.View style={[styles.cardContainer, animatedCardStyle]} testID="animated-card-container">
          {currentProduct && (<SwipeCard_1.default product={currentProduct} onPress={handleCardPress} onSwipeLeft={isConnected === false ? undefined : handleNoButtonPress} onSwipeRight={isConnected === false ? undefined : handleYesButtonPress} yesIndicatorStyle={yesIndicatorStyle} noIndicatorStyle={noIndicatorStyle} testID="current-swipe-card"/>)}
        </Animated.View>
      </PanGestureHandler>
      
      {/* 残りカード数表示 */}
      <react_native_1.View style={styles.remainingContainer} testID="remaining-counter">
        <react_native_1.Text style={styles.remainingText}>
          残り {products.length - currentIndex} / {products.length} 件
        </react_native_1.Text>
      </react_native_1.View>
    </react_native_1.View>);
};
var styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: '#757575',
    },
    emptyText: {
        fontSize: 18,
        color: '#757575',
        textAlign: 'center',
        marginVertical: 12,
    },
    cardContainer: {
        width: '90%',
        height: '70%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingMoreContainer: {
        position: 'absolute',
        top: 10,
        right: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        zIndex: 10,
    },
    loadingMoreText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#4B5563',
    },
    remainingContainer: {
        position: 'absolute',
        bottom: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    remainingText: {
        fontSize: 12,
        color: '#6B7280',
    },
    offlineBanner: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#F87171',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
        zIndex: 20,
    },
    offlineBannerText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
        marginLeft: 6,
    },
    offlineContainer: {
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        padding: 12,
        borderRadius: 8,
        marginTop: 16,
        width: '90%',
    },
    offlineText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#EF4444',
        marginTop: 8,
    },
    offlineSubText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 4,
    },
});
exports.default = SwipeContainer;
