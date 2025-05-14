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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var native_1 = require("@react-navigation/native");
var SwipeContainer_1 = __importDefault(require("@/components/swipe/SwipeContainer"));
var EmptyState_1 = __importDefault(require("@/components/common/EmptyState"));
var useProducts_1 = require("@/hooks/useProducts");
var useRecordClick_1 = require("@/hooks/useRecordClick");
var useAuth_1 = require("@/hooks/useAuth");
var SwipeScreen = function () {
    var navigation = (0, native_1.useNavigation)();
    var user = (0, useAuth_1.useAuth)().user;
    var recordProductClick = (0, useRecordClick_1.useRecordClick)(user === null || user === void 0 ? void 0 : user.id).recordProductClick;
    var _a = (0, useProducts_1.useProducts)(), products = _a.products, currentProduct = _a.currentProduct, isLoading = _a.isLoading, error = _a.error, handleSwipe = _a.handleSwipe, resetProducts = _a.resetProducts, refreshProducts = _a.refreshProducts;
    // 商品詳細画面に遷移
    var handleCardPress = (0, react_1.useCallback)(function (product) {
        if (product) {
            // クリックログを記録
            recordProductClick(product.id, product);
            // 詳細画面に遷移
            navigation.navigate('ProductDetail', { productId: product.id });
        }
    }, [navigation, recordProductClick]);
    // スワイプ処理
    var handleSwipeEvent = (0, react_1.useCallback)(function (product, direction) {
        handleSwipe(product, direction);
    }, [handleSwipe]);
    // 商品をすべてスワイプし終わった時の処理
    var handleEmptyProducts = (0, react_1.useCallback)(function () {
        resetProducts();
    }, [resetProducts]);
    // エラー発生時
    if (error) {
        return (<EmptyState_1.default title="エラーが発生しました" message={error} buttonText="再読み込み" onButtonPress={resetProducts}/>);
    }
    return (<react_native_1.View style={styles.container}>
      <react_native_1.ScrollView contentContainerStyle={styles.scrollContent} refreshControl={<react_native_1.RefreshControl refreshing={isLoading} onRefresh={refreshProducts} colors={['#3B82F6']} tintColor="#3B82F6"/>}>
        <SwipeContainer_1.default products={products} isLoading={isLoading} onSwipe={handleSwipeEvent} onCardPress={handleCardPress} onEmptyProducts={handleEmptyProducts}/>
      </react_native_1.ScrollView>
    </react_native_1.View>);
};
var styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    scrollContent: {
        flexGrow: 1,
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
    },
});
exports.default = SwipeScreen;
