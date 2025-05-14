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
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var vector_icons_1 = require("@expo/vector-icons");
// import Animated from 'react-native-reanimated';
// 一時的にAnimatedをモックして型エラーを解消
var Animated = {
    View: StyledComponents_1.View
};
var utils_1 = require("@/utils");
var common_1 = require("@/components/common");
var imageUtils_1 = require("@/utils/imageUtils");
var NetworkContext_1 = require("@/contexts/NetworkContext");
var StyledComponents_1 = require("../common/StyledComponents");
var CachedImage_1 = require("../common/CachedImage");
var _a = react_native_1.Dimensions.get('window'), width = _a.width, height = _a.height;
var CARD_WIDTH = width * 0.9;
var CARD_HEIGHT = height * 0.6;
var SwipeCard = function (_a) {
    var product = _a.product, onPress = _a.onPress, onCardPress = _a.onCardPress, // onCardPress を追加
    onSwipeLeft = _a.onSwipeLeft, onSwipeRight = _a.onSwipeRight, yesIndicatorStyle = _a.yesIndicatorStyle, noIndicatorStyle = _a.noIndicatorStyle, testID = _a.testID, _b = _a.screenshotMode, screenshotMode = _b === void 0 ? false : _b;
    var isConnected = (0, NetworkContext_1.useNetwork)().isConnected;
    var _c = (0, react_1.useState)(true), isLoading = _c[0], setIsLoading = _c[1];
    var _d = (0, react_1.useState)(false), loadError = _d[0], setLoadError = _d[1];
    // スクリーンショットモードでは操作ボタンを無効化
    var swipeLeftAction = screenshotMode ? undefined : onSwipeLeft;
    var swipeRightAction = screenshotMode ? undefined : onSwipeRight;
    // オフラインモードでも操作ボタンを無効化
    var canSwipeLeft = isConnected !== false && swipeLeftAction;
    var canSwipeRight = isConnected !== false && swipeRightAction;
    // 商品画像がない場合にフォールバック画像を表示
    var imageUrl = product.imageUrl || 'https://via.placeholder.com/350x500?text=No+Image';
    // APIエラー時のリトライ
    var handleRetry = function () {
        setLoadError(false);
        setIsLoading(true);
    };
    // コンポーネントがマウントされたときにロード状態をリセット
    (0, react_1.useEffect)(function () {
        setIsLoading(true);
        setLoadError(false);
    }, [product.id]);
    return (<StyledComponents_1.View style={styles.card} className="overflow-hidden w-full h-full" testID={testID || 'swipe-card'}>
        <StyledComponents_1.TouchableOpacity activeOpacity={0.9} onPress={!loadError ? (onPress || onCardPress) : handleRetry} className="bg-white rounded-xl shadow-lg overflow-hidden w-full h-full" testID={testID ? "".concat(testID, "-touch") : 'swipe-card-touch'} disabled={screenshotMode}>
          <StyledComponents_1.View className="w-full h-full">
            {isLoading && (<StyledComponents_1.View className="absolute z-10 w-full h-full items-center justify-center bg-gray-100">
                <react_native_1.ActivityIndicator size="large" color="#3B82F6"/>
                <StyledComponents_1.Text className="mt-2 text-gray-600">読み込み中...</StyledComponents_1.Text>
              </StyledComponents_1.View>)}
            
            {loadError && (<StyledComponents_1.View className="absolute z-10 w-full h-full items-center justify-center bg-gray-100">
                <vector_icons_1.Ionicons name="alert-circle-outline" size={48} color="#F87171"/>
                <StyledComponents_1.Text className="mt-2 text-gray-700 text-center">
                  画像の読み込みに失敗しました
                </StyledComponents_1.Text>
                <StyledComponents_1.TouchableOpacity onPress={handleRetry} className="mt-4 py-2 px-4 bg-blue-500 rounded-lg">
                  <StyledComponents_1.Text className="text-white font-bold">再読み込み</StyledComponents_1.Text>
                </StyledComponents_1.TouchableOpacity>
              </StyledComponents_1.View>)}
            
            <CachedImage_1.ExpoImage source={{ uri: imageUrl }} style={styles.image} className="w-full h-full" contentFit="cover" transition={300} testID="product-image" onLoadStart={function () { return setIsLoading(true); }} onLoad={function () { return setIsLoading(false); }} onError={function () {
            setIsLoading(false);
            setLoadError(true);
            (0, imageUtils_1.handleImageLoadError)(imageUrl);
        }} cachePolicy={isConnected === false ? 'memory-disk' : 'disk'}/>
            
            {/* Yes/Noインジケーター */}
            {!loadError && (<>
                <Animated.View style={[styles.indicator, styles.yesIndicator, yesIndicatorStyle]} testID="yes-indicator">
                  <StyledComponents_1.Text style={styles.indicatorText}>YES</StyledComponents_1.Text>
                </Animated.View>
                
                <Animated.View style={[styles.indicator, styles.noIndicator, noIndicatorStyle]} testID="no-indicator">
                  <StyledComponents_1.Text style={styles.indicatorText}>NO</StyledComponents_1.Text>
                </Animated.View>
              </>)}
            
            <StyledComponents_1.View className="absolute bottom-0 left-0 right-0 bg-black/50 p-4" testID="product-info">
              <StyledComponents_1.View className="flex-row justify-between items-center">
                <StyledComponents_1.View className="flex-1">
                  <StyledComponents_1.Text className="text-white font-bold text-xl" numberOfLines={1}>
                    {product.title}
                  </StyledComponents_1.Text>
                  {product.brand && (<StyledComponents_1.Text className="text-gray-200 text-base" numberOfLines={1}>
                      {product.brand}
                    </StyledComponents_1.Text>)}
                </StyledComponents_1.View>
                <StyledComponents_1.Text className="text-white font-bold text-xl ml-2">
                  {(0, utils_1.formatPrice)(product.price)}
                </StyledComponents_1.Text>
              </StyledComponents_1.View>
              
              {product.tags && product.tags.length > 0 && (<StyledComponents_1.View className="mt-2">
                  <common_1.Tags tags={product.tags} size="small"/>
                </StyledComponents_1.View>)}
            </StyledComponents_1.View>
            
            {/* スワイプアクションボタン - スクリーンショットモードかオフラインでは非表示/無効化 */}
            {!loadError && !screenshotMode && (<StyledComponents_1.View className="absolute bottom-28 left-4 right-4 flex-row justify-between">
                <StyledComponents_1.TouchableOpacity className="w-16 h-16 bg-white rounded-full items-center justify-center shadow-md" onPress={canSwipeLeft ? swipeLeftAction : undefined} testID="swipe-left-button" disabled={!canSwipeLeft} style={!canSwipeLeft ? { opacity: 0.5 } : {}} accessibilityLabel="いいえ" accessibilityRole="button" accessibilityState={{ disabled: !canSwipeLeft }}>
                  <vector_icons_1.Ionicons name="close" size={32} color="#F87171"/>
                </StyledComponents_1.TouchableOpacity>
                
                <StyledComponents_1.TouchableOpacity className="w-16 h-16 bg-white rounded-full items-center justify-center shadow-md" onPress={canSwipeRight ? swipeRightAction : undefined} testID="swipe-right-button" disabled={!canSwipeRight} style={!canSwipeRight ? { opacity: 0.5 } : {}} accessibilityLabel="はい" accessibilityRole="button" accessibilityState={{ disabled: !canSwipeRight }}>
                  <vector_icons_1.Ionicons name="heart" size={32} color="#3B82F6"/>
                </StyledComponents_1.TouchableOpacity>
              </StyledComponents_1.View>)}
          </StyledComponents_1.View>
        </StyledComponents_1.TouchableOpacity>
      </StyledComponents_1.View>);
};
var styles = react_native_1.StyleSheet.create({
    card: __assign({ width: CARD_WIDTH, height: CARD_HEIGHT, borderRadius: 12, overflow: 'hidden', backgroundColor: 'white' }, react_native_1.Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 5,
        },
        android: {
            elevation: 5,
        },
    })),
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        borderRadius: 12,
    },
    indicator: {
        position: 'absolute',
        padding: 10,
        borderWidth: 5,
        borderRadius: 12,
        top: 30,
        transform: [{ rotate: '-20deg' }],
        zIndex: 10,
    },
    yesIndicator: {
        right: 20,
        borderColor: '#22C55E',
    },
    noIndicator: {
        left: 20,
        borderColor: '#F87171',
    },
    indicatorText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    }
});
exports.default = SwipeCard;
