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
var common_1 = require("../components/common");
var ThemeContext_1 = require("../contexts/ThemeContext");
var performance_1 = require("../utils/performance");
var react_native_2 = require("react-native");
var SCREEN_WIDTH = react_native_1.Dimensions.get('window').width;
var SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
var SWIPE_OUT_DURATION = 300;
// スロットリング時間（ms）- パフォーマンス最適化用
var GESTURE_UPDATE_THROTTLE = 8;
var SwipeCard = function (_a) {
    var product = _a.product, onSwipeLeft = _a.onSwipeLeft, onSwipeRight = _a.onSwipeRight, onCardPress = _a.onCardPress, _b = _a.index, index = _b === void 0 ? 0 : _b, testID = _a.testID;
    // 開発モードのみパフォーマンスモニタリング
    if (__DEV__) {
        (0, performance_1.useRenderMeasure)('SwipeCard');
    }
    var _c = (0, ThemeContext_1.useTheme)(), theme = _c.theme, isDarkMode = _c.isDarkMode;
    var position = (0, react_1.useRef)(new react_native_1.Animated.ValueXY()).current;
    var scale = (0, react_1.useRef)(new react_native_1.Animated.Value(index === 0 ? 1 : 0.95)).current;
    var opacity = (0, react_1.useRef)(new react_native_1.Animated.Value(index === 0 ? 1 : 0.8)).current;
    // 最後のジェスチャー更新時間（スロットリング用）
    var lastGestureUpdate = (0, react_1.useRef)(Date.now());
    // 初期アニメーションの適用
    (0, react_1.useEffect)(function () {
        if (index === 0) {
            react_native_1.Animated.spring(scale, {
                toValue: 1,
                friction: 6,
                tension: 50,
                useNativeDriver: true,
            }).start();
            react_native_1.Animated.spring(opacity, {
                toValue: 1,
                friction: 6,
                useNativeDriver: true,
            }).start();
        }
    }, [index, scale, opacity]);
    // カードの回転を計算（メモ化して再計算を防止）
    var rotate = (0, react_1.useMemo)(function () {
        return position.x.interpolate({
            inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
            outputRange: ['-12deg', '0deg', '12deg'],
            extrapolate: 'clamp',
        });
    }, [position.x]);
    // Yes / No ラベルの透明度を計算（メモ化して再計算を防止）
    var likeOpacity = (0, react_1.useMemo)(function () {
        return position.x.interpolate({
            inputRange: [0, SCREEN_WIDTH / 5],
            outputRange: [0, 1],
            extrapolate: 'clamp',
        });
    }, [position.x]);
    var nopeOpacity = (0, react_1.useMemo)(function () {
        return position.x.interpolate({
            inputRange: [-SCREEN_WIDTH / 5, 0],
            outputRange: [1, 0],
            extrapolate: 'clamp',
        });
    }, [position.x]);
    // カードの背景色を変化させる（メモ化して再計算を防止）
    var cardColor = (0, react_1.useMemo)(function () {
        return position.x.interpolate({
            inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
            outputRange: [
                'rgba(239, 68, 68, 0.1)', // 薄い赤
                'rgba(0, 0, 0, 0)', // 透明
                'rgba(34, 197, 94, 0.1)' // 薄い緑
            ],
            extrapolate: 'clamp',
        });
    }, [position.x]);
    // スワイプ処理の最適化版
    var handlePanResponderMove = (0, react_1.useCallback)(function (_, gesture) {
        var now = Date.now();
        // スロットリング適用（頻繁な更新を防止）
        if (now - lastGestureUpdate.current > GESTURE_UPDATE_THROTTLE) {
            position.setValue({ x: gesture.dx, y: gesture.dy });
            lastGestureUpdate.current = now;
        }
    }, [position]);
    var handlePanResponderRelease = (0, react_1.useCallback)(function (_, gesture) {
        if (gesture.dx > SWIPE_THRESHOLD) {
            forceSwipe('right');
        }
        else if (gesture.dx < -SWIPE_THRESHOLD) {
            forceSwipe('left');
        }
        else {
            resetPosition();
        }
    }, []);
    // スワイプアニメーションを強制的に実行
    var forceSwipe = (0, react_1.useCallback)(function (direction) {
        var x = direction === 'right' ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100;
        react_native_1.Animated.timing(position, {
            toValue: { x: x, y: direction === 'right' ? 30 : -30 },
            duration: SWIPE_OUT_DURATION,
            useNativeDriver: true,
        }).start(function () { return onSwipeComplete(direction); });
    }, [position]);
    // スワイプ完了時の処理
    var onSwipeComplete = (0, react_1.useCallback)(function (direction) {
        // スワイプ処理をメインスレッドの処理完了後に実行
        react_native_2.InteractionManager.runAfterInteractions(function () {
            if (direction === 'right') {
                onSwipeRight();
            }
            else {
                onSwipeLeft();
            }
            position.setValue({ x: 0, y: 0 });
        });
    }, [onSwipeLeft, onSwipeRight, position]);
    // カードの位置をリセット
    var resetPosition = (0, react_1.useCallback)(function () {
        react_native_1.Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            tension: 40,
            useNativeDriver: true,
        }).start();
    }, [position]);
    // パンレスポンダーの設定（メモ化して再生成を防止）
    var panResponder = (0, react_1.useMemo)(function () {
        return react_native_1.PanResponder.create({
            onStartShouldSetPanResponder: function () { return true; },
            onPanResponderMove: handlePanResponderMove,
            onPanResponderRelease: handlePanResponderRelease,
        });
    }, [handlePanResponderMove, handlePanResponderRelease]);
    // 価格をフォーマット
    var formatPrice = (0, react_1.useCallback)(function (price) {
        return price.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' });
    }, []);
    // カードのスタイルを定義（メモ化して再計算を防止）
    var cardAnimStyle = (0, react_1.useMemo)(function () { return ({
        transform: [
            { translateX: position.x },
            { translateY: position.y },
            { rotate: rotate },
            { scale: scale }
        ],
        opacity: opacity,
        zIndex: 100 - index,
    }); }, [position.x, position.y, rotate, scale, opacity, index]);
    return (<react_native_1.Animated.View style={[
            styles.container,
            cardAnimStyle,
            { padding: theme.spacing.s }
        ]} testID={testID} {...(index === 0 ? panResponder.panHandlers : {})}>
      <react_native_1.TouchableOpacity activeOpacity={0.95} onPress={index === 0 ? onCardPress : undefined} style={[
            styles.card,
            {
                borderRadius: theme.radius.l,
                backgroundColor: isDarkMode ? theme.colors.background.card : '#fff',
                shadowColor: isDarkMode ? '#000' : '#222',
                borderColor: theme.colors.border.light,
                borderWidth: isDarkMode ? 1 : 0,
            }
        ]}>
        <react_native_1.Animated.View style={[
            react_native_1.StyleSheet.absoluteFill,
            { backgroundColor: cardColor, zIndex: 1 }
        ]}/>

        <common_1.CachedImage source={{ uri: product.imageUrl || '' }} style={styles.image} resizeMode="cover" showLoadingIndicator={true} 
    // 優先度と最適化設定を追加
    priority={index === 0 ? 'high' : index < 3 ? 'normal' : 'low'} cachePolicy="memory-disk" blurRadius={5} // 低解像度プレースホルダーを利用
    />

        <react_native_1.View style={[
            styles.overlay,
            {
                backgroundColor: isDarkMode
                    ? 'rgba(0, 0, 0, 0.6)'
                    : 'rgba(0, 0, 0, 0.4)'
            }
        ]}>
          <react_native_1.View style={styles.titleContainer}>
            <react_native_1.Text style={[
            styles.brand,
            { color: theme.colors.text.inverse }
        ]}>
              {product.brand}
            </react_native_1.Text>
            <react_native_1.Text style={[
            styles.title,
            { color: theme.colors.text.inverse }
        ]}>
              {product.title}
            </react_native_1.Text>
            <react_native_1.Text style={[
            styles.price,
            { color: theme.colors.accent }
        ]}>
              {formatPrice(product.price)}
            </react_native_1.Text>
          </react_native_1.View>

          <react_native_1.View style={styles.tagsContainer}>
            {product.tags.slice(0, 3).map(function (tag, tagIndex) { return (<react_native_1.View key={tagIndex} style={[
                styles.tag,
                { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
            ]}>
                <react_native_1.Text style={[
                styles.tagText,
                { color: theme.colors.text.inverse }
            ]}>
                  {tag}
                </react_native_1.Text>
              </react_native_1.View>); })}
          </react_native_1.View>
        </react_native_1.View>

        {/* Yes / No ラベル */}
        <react_native_1.Animated.View style={[
            styles.yesLabel,
            { opacity: likeOpacity },
        ]}>
          <vector_icons_1.Feather name="check-circle" size={80} color={theme.colors.status.success}/>
        </react_native_1.Animated.View>

        <react_native_1.Animated.View style={[
            styles.noLabel,
            { opacity: nopeOpacity },
        ]}>
          <vector_icons_1.Feather name="x-circle" size={80} color={theme.colors.status.error}/>
        </react_native_1.Animated.View>
      </react_native_1.TouchableOpacity>
    </react_native_1.Animated.View>);
};
var styles = react_native_1.StyleSheet.create({
    container: {
        position: 'absolute',
        width: SCREEN_WIDTH,
        height: '100%',
    },
    card: __assign({ flex: 1, overflow: 'hidden' }, react_native_1.Platform.select({
        ios: {
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
        },
        android: {
            elevation: 3,
        },
    })),
    image: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
    },
    titleContainer: {
        marginBottom: 8,
    },
    brand: {
        fontSize: 14,
        fontWeight: '500',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 4,
    },
    price: {
        fontSize: 18,
        fontWeight: '600',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        marginRight: 6,
        marginBottom: 6,
    },
    tagText: {
        fontSize: 12,
    },
    yesLabel: {
        position: 'absolute',
        top: 50,
        right: 40,
        transform: [{ rotate: '15deg' }],
        zIndex: 10,
    },
    noLabel: {
        position: 'absolute',
        top: 50,
        left: 40,
        transform: [{ rotate: '-15deg' }],
        zIndex: 10,
    },
});
// メモ化して再レンダリングを最小限に
exports.default = react_1.default.memo(SwipeCard);
