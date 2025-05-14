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
var native_1 = require("@react-navigation/native");
var productService_1 = require("../services/productService");
var useAuth_1 = require("../hooks/useAuth");
var EmptyState_1 = __importDefault(require("../components/EmptyState"));
var RecommendationsScreen = function () {
    var navigation = (0, native_1.useNavigation)();
    var _a = (0, react_1.useState)([]), products = _a[0], setProducts = _a[1];
    var _b = (0, react_1.useState)(true), isLoading = _b[0], setIsLoading = _b[1];
    var _c = (0, react_1.useState)(null), error = _c[0], setError = _c[1];
    var user = (0, useAuth_1.useAuth)().user;
    // 商品データを取得
    var loadRecommendations = function () { return __awaiter(void 0, void 0, void 0, function () {
        var recommendedProducts, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setIsLoading(true);
                    setError(null);
                    if (!user) {
                        setError('ログインが必要です。');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, (0, productService_1.fetchRecommendedProducts)(user.id)];
                case 1:
                    recommendedProducts = _a.sent();
                    setProducts(recommendedProducts);
                    return [3 /*break*/, 4];
                case 2:
                    err_1 = _a.sent();
                    setError('おすすめ商品の読み込みに失敗しました。');
                    console.error('Error loading recommended products:', err_1);
                    return [3 /*break*/, 4];
                case 3:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // 初回マウント時に商品データを取得
    (0, react_1.useEffect)(function () {
        loadRecommendations();
    }, [user]);
    // 商品詳細画面に遷移
    var handleProductPress = function (productId) {
        navigation.navigate('ProductDetail', { productId: productId });
    };
    // 価格をフォーマット
    var formatPrice = function (price) {
        return price.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' });
    };
    // ローディング中
    if (isLoading) {
        return (<react_native_1.View style={styles.centerContainer}>
        <react_native_1.ActivityIndicator size="large" color="#3B82F6"/>
        <react_native_1.Text style={styles.loadingText}>おすすめ商品を読み込んでいます...</react_native_1.Text>
      </react_native_1.View>);
    }
    // エラー発生時
    if (error) {
        return (<EmptyState_1.default message={error} buttonText="再読み込み" onButtonPress={loadRecommendations}/>);
    }
    // 商品がない場合
    if (!products.length) {
        return (<EmptyState_1.default message="おすすめ商品がありません。もっと多くの商品をスワイプしてみましょう！" buttonText="スワイプに戻る" onButtonPress={function () { return navigation.navigate('Swipe'); }}/>);
    }
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Text style={styles.title}>あなたへのおすすめ</react_native_1.Text>
      <react_native_1.Text style={styles.subtitle}>あなたの好みに合わせた商品をピックアップしました</react_native_1.Text>

      <react_native_1.FlatList data={products} keyExtractor={function (item) { return item.id; }} renderItem={function (_a) {
            var item = _a.item;
            return (<react_native_1.TouchableOpacity style={styles.productCard} onPress={function () { return handleProductPress(item.id); }}>
            <react_native_1.Image source={{ uri: item.imageUrl }} style={styles.productImage} resizeMode="cover"/>
            <react_native_1.View style={styles.productInfo}>
              <react_native_1.Text style={styles.productBrand}>{item.brand}</react_native_1.Text>
              <react_native_1.Text style={styles.productTitle}>{item.title}</react_native_1.Text>
              <react_native_1.Text style={styles.productPrice}>{formatPrice(item.price)}</react_native_1.Text>

              <react_native_1.View style={styles.tagsContainer}>
                {item.tags.slice(0, 2).map(function (tag, index) { return (<react_native_1.View key={index} style={styles.tag}>
                    <react_native_1.Text style={styles.tagText}>{tag}</react_native_1.Text>
                  </react_native_1.View>); })}
              </react_native_1.View>
            </react_native_1.View>
          </react_native_1.TouchableOpacity>);
        }} contentContainerStyle={styles.listContainer}/>
    </react_native_1.View>);
};
var styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        padding: 16,
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#757575',
        marginBottom: 20,
    },
    listContainer: {
        paddingBottom: 20,
    },
    productCard: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        overflow: 'hidden',
    },
    productImage: {
        width: 120,
        height: 120,
        backgroundColor: '#F5F5F5',
    },
    productInfo: {
        flex: 1,
        padding: 12,
    },
    productBrand: {
        fontSize: 14,
        color: '#757575',
    },
    productTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginVertical: 4,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: '600',
        color: '#3B82F6',
        marginBottom: 8,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tag: {
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 6,
        marginBottom: 6,
    },
    tagText: {
        fontSize: 12,
        color: '#757575',
    },
});
exports.default = RecommendationsScreen;
