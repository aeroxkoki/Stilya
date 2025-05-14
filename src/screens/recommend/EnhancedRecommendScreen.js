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
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var native_1 = require("@react-navigation/native");
var vector_icons_1 = require("@expo/vector-icons");
var recommend_1 = require("@/components/recommend");
var common_1 = require("@/components/common");
var useAuth_1 = require("@/hooks/useAuth");
var integratedRecommendationService_1 = require("@/services/integratedRecommendationService");
var width = react_native_1.Dimensions.get('window').width;
var EnhancedRecommendScreen = function () {
    var navigation = (0, native_1.useNavigation)();
    var user = (0, useAuth_1.useAuth)().user;
    // 状態管理
    var _a = (0, react_1.useState)(true), isLoading = _a[0], setIsLoading = _a[1];
    var _b = (0, react_1.useState)({
        recommended: [],
        trending: [],
        forYou: [],
    }), recommendations = _b[0], setRecommendations = _b[1];
    var _c = (0, react_1.useState)([]), outfits = _c[0], setOutfits = _c[1];
    var _d = (0, react_1.useState)(null), error = _d[0], setError = _d[1];
    var _e = (0, react_1.useState)('all'), activeTab = _e[0], setActiveTab = _e[1];
    // データ読み込み
    var loadData = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, recommendationResults, outfitResults, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!user)
                        return [2 /*return*/];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    setIsLoading(true);
                    setError(null);
                    return [4 /*yield*/, Promise.all([
                            (0, integratedRecommendationService_1.getEnhancedRecommendations)(user.id, 20),
                            (0, integratedRecommendationService_1.getOutfitRecommendations)(user.id, 5)
                        ])];
                case 2:
                    _a = _b.sent(), recommendationResults = _a[0], outfitResults = _a[1];
                    setRecommendations({
                        recommended: recommendationResults.recommended,
                        trending: recommendationResults.trending,
                        forYou: recommendationResults.forYou,
                    });
                    setOutfits(outfitResults.outfits);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _b.sent();
                    console.error('Failed to load recommendations:', err_1);
                    setError(err_1.message || 'レコメンデーションの取得に失敗しました');
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [user]);
    // 初回読み込み
    (0, react_1.useEffect)(function () {
        loadData();
    }, [loadData]);
    // 商品タップハンドラー
    var handleProductPress = function (product) {
        // @ts-ignore
        navigation.navigate('ProductDetail', { productId: product.id });
    };
    // コーディネートタップハンドラー
    var handleOutfitPress = function (outfit) {
        // 最初の商品で詳細ページを開く（実際のアプリでは複数商品を表示する専用ページがベター）
        var firstProduct = outfit.top || outfit.bottom || outfit.outerwear || outfit.accessories;
        if (firstProduct) {
            handleProductPress(firstProduct);
        }
    };
    // スワイプ画面に移動
    var handleGoToSwipe = function () {
        // @ts-ignore
        navigation.navigate('Swipe');
    };
    // タブ切り替え
    var handleTabChange = function (tab) {
        setActiveTab(tab);
    };
    // ローディング表示
    if (isLoading && recommendations.recommended.length === 0 && recommendations.trending.length === 0) {
        return (<react_native_1.SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <react_native_1.View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <react_native_1.ActivityIndicator size="large" color="#3B82F6"/>
          <react_native_1.Text style={{ marginTop: 16, color: '#666' }}>おすすめ商品を読み込み中...</react_native_1.Text>
        </react_native_1.View>
      </react_native_1.SafeAreaView>);
    }
    return (<react_native_1.SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <react_native_1.ScrollView style={{ flex: 1 }} refreshControl={<react_native_1.RefreshControl refreshing={isLoading} onRefresh={loadData}/>}>
        {/* ヘッダー */}
        <react_native_1.View style={styles.header}>
          <react_native_1.View>
            <react_native_1.Text style={styles.headerTitle}>Stilya</react_native_1.Text>
            <react_native_1.Text style={styles.headerSubtitle}>
              あなたにピッタリのアイテム
            </react_native_1.Text>
          </react_native_1.View>
          
          {/* 検索ボタン（実際の機能は省略） */}
          <react_native_1.TouchableOpacity style={styles.searchButton} onPress={function () {
            // 検索画面へ遷移するコードを追加
            console.log('Search button pressed');
        }}>
            <vector_icons_1.Ionicons name="search-outline" size={22} color="#333"/>
          </react_native_1.TouchableOpacity>
        </react_native_1.View>
        
        {/* ログインしていない場合 */}
        {!user && (<react_native_1.View style={styles.promptCard}>
            <react_native_1.Text style={styles.promptText}>
              ログインすると、あなたの好みに合わせた商品をおすすめできます。
            </react_native_1.Text>
            <common_1.Button onPress={handleGoToSwipe} style={{ backgroundColor: '#3B82F6', marginTop: 8 }}>
              まずはスワイプしてみる
            </common_1.Button>
          </react_native_1.View>)}
        
        {/* エラー表示 */}
        {error && (<react_native_1.View style={styles.errorCard}>
            <vector_icons_1.Ionicons name="alert-circle-outline" size={24} color="#EF4444"/>
            <react_native_1.Text style={styles.errorText}>{error}</react_native_1.Text>
            <react_native_1.TouchableOpacity style={styles.retryButton} onPress={loadData}>
              <react_native_1.Text style={styles.retryButtonText}>再読み込み</react_native_1.Text>
            </react_native_1.TouchableOpacity>
          </react_native_1.View>)}
        
        {/* タブナビゲーション */}
        <react_native_1.View style={styles.tabBar}>
          <react_native_1.TouchableOpacity style={[styles.tab, activeTab === 'all' && styles.activeTab]} onPress={function () { return handleTabChange('all'); }}>
            <react_native_1.Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>すべて</react_native_1.Text>
          </react_native_1.TouchableOpacity>
          <react_native_1.TouchableOpacity style={[styles.tab, activeTab === 'outfits' && styles.activeTab]} onPress={function () { return handleTabChange('outfits'); }}>
            <react_native_1.Text style={[styles.tabText, activeTab === 'outfits' && styles.activeTabText]}>コーデ</react_native_1.Text>
          </react_native_1.TouchableOpacity>
          <react_native_1.TouchableOpacity style={[styles.tab, activeTab === 'forYou' && styles.activeTab]} onPress={function () { return handleTabChange('forYou'); }}>
            <react_native_1.Text style={[styles.tabText, activeTab === 'forYou' && styles.activeTabText]}>あなたへ</react_native_1.Text>
          </react_native_1.TouchableOpacity>
          <react_native_1.TouchableOpacity style={[styles.tab, activeTab === 'trending' && styles.activeTab]} onPress={function () { return handleTabChange('trending'); }}>
            <react_native_1.Text style={[styles.tabText, activeTab === 'trending' && styles.activeTabText]}>トレンド</react_native_1.Text>
          </react_native_1.TouchableOpacity>
        </react_native_1.View>
        
        {/* コンテンツ表示（タブに応じて切り替え） */}
        {activeTab === 'all' && (<>
            {/* おすすめコーディネート */}
            {outfits.length > 0 && (<react_native_1.View style={styles.section}>
                <react_native_1.View style={styles.sectionHeader}>
                  <react_native_1.Text style={styles.sectionTitle}>おすすめコーディネート</react_native_1.Text>
                  <react_native_1.TouchableOpacity onPress={function () { return handleTabChange('outfits'); }}>
                    <react_native_1.Text style={styles.seeAllText}>すべて見る</react_native_1.Text>
                  </react_native_1.TouchableOpacity>
                </react_native_1.View>
                
                <react_native_1.ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.outfitsContainer}>
                  {outfits.slice(0, 3).map(function (outfit, index) { return (<recommend_1.OutfitRecommendation key={"outfit-".concat(index)} outfit={outfit} onPress={function () { return handleOutfitPress(outfit); }}/>); })}
                </react_native_1.ScrollView>
              </react_native_1.View>)}
            
            {/* あなたへのおすすめ */}
            {recommendations.forYou.length > 0 && (<recommend_1.ProductHorizontalList title="あなたへのおすすめ" products={recommendations.forYou} onProductPress={handleProductPress} onSeeAllPress={function () { return handleTabChange('forYou'); }} style={styles.section}/>)}
            
            {/* あなたにおすすめ（内部DB） */}
            {recommendations.recommended.length > 0 && (<recommend_1.ProductHorizontalList title="最近の傾向を反映" products={recommendations.recommended} onProductPress={handleProductPress} style={styles.section}/>)}
            
            {/* トレンドアイテム */}
            {recommendations.trending.length > 0 && (<recommend_1.ProductHorizontalList title="今週のトレンドアイテム" products={recommendations.trending} onProductPress={handleProductPress} onSeeAllPress={function () { return handleTabChange('trending'); }} style={styles.section}/>)}
          </>)}
        
        {/* コーディネートタブ */}
        {activeTab === 'outfits' && (<react_native_1.View style={styles.fullWidthSection}>
            <react_native_1.Text style={styles.sectionTitle}>おすすめコーディネート</react_native_1.Text>
            {outfits.length > 0 ? (outfits.map(function (outfit, index) { return (<recommend_1.OutfitRecommendation key={"outfit-full-".concat(index)} outfit={outfit} onPress={function () { return handleOutfitPress(outfit); }} layout="full" style={styles.fullOutfitItem}/>); })) : (<react_native_1.View style={styles.emptyState}>
                <react_native_1.Text style={styles.emptyStateText}>
                  コーディネートがありません。もっとスワイプして好みを教えてください。
                </react_native_1.Text>
                <common_1.Button onPress={handleGoToSwipe} style={{ backgroundColor: '#3B82F6', marginTop: 12 }}>
                  スワイプする
                </common_1.Button>
              </react_native_1.View>)}
          </react_native_1.View>)}
        
        {/* あなたへのおすすめタブ */}
        {activeTab === 'forYou' && (<react_native_1.View style={styles.gridSection}>
            <react_native_1.Text style={styles.sectionTitle}>あなたへのおすすめ</react_native_1.Text>
            
            {recommendations.forYou.length > 0 ? (<react_native_1.View style={styles.productGrid}>
                {recommendations.forYou.map(function (product) { return (<react_native_1.TouchableOpacity key={"for-you-".concat(product.id)} style={styles.gridItem} onPress={function () { return handleProductPress(product); }}>
                    <common_1.Card style={styles.productCard}>
                      <react_native_1.Image source={{ uri: product.imageUrl }} style={styles.productImage}/>
                      <react_native_1.View style={styles.productInfo}>
                        <react_native_1.Text style={styles.productTitle} numberOfLines={1}>
                          {product.title}
                        </react_native_1.Text>
                        {product.brand && (<react_native_1.Text style={styles.productBrand} numberOfLines={1}>
                            {product.brand}
                          </react_native_1.Text>)}
                        <react_native_1.Text style={styles.productPrice}>
                          ¥{product.price.toLocaleString()}
                        </react_native_1.Text>
                      </react_native_1.View>
                    </common_1.Card>
                  </react_native_1.TouchableOpacity>); })}
              </react_native_1.View>) : (<react_native_1.View style={styles.emptyState}>
                <react_native_1.Text style={styles.emptyStateText}>
                  まだおすすめがありません。スワイプして好みを教えてください。
                </react_native_1.Text>
                <common_1.Button onPress={handleGoToSwipe} style={{ backgroundColor: '#3B82F6', marginTop: 12 }}>
                  スワイプする
                </common_1.Button>
              </react_native_1.View>)}
          </react_native_1.View>)}
        
        {/* トレンドタブ */}
        {activeTab === 'trending' && (<react_native_1.View style={styles.gridSection}>
            <react_native_1.Text style={styles.sectionTitle}>今週のトレンドアイテム</react_native_1.Text>
            
            {recommendations.trending.length > 0 ? (<react_native_1.View style={styles.productGrid}>
                {recommendations.trending.map(function (product) { return (<react_native_1.TouchableOpacity key={"trending-".concat(product.id)} style={styles.gridItem} onPress={function () { return handleProductPress(product); }}>
                    <common_1.Card style={styles.productCard}>
                      <react_native_1.Image source={{ uri: product.imageUrl }} style={styles.productImage}/>
                      <react_native_1.View style={styles.productInfo}>
                        <react_native_1.Text style={styles.productTitle} numberOfLines={1}>
                          {product.title}
                        </react_native_1.Text>
                        {product.brand && (<react_native_1.Text style={styles.productBrand} numberOfLines={1}>
                            {product.brand}
                          </react_native_1.Text>)}
                        <react_native_1.Text style={styles.productPrice}>
                          ¥{product.price.toLocaleString()}
                        </react_native_1.Text>
                      </react_native_1.View>
                    </common_1.Card>
                  </react_native_1.TouchableOpacity>); })}
              </react_native_1.View>) : (<react_native_1.View style={styles.emptyState}>
                <react_native_1.Text style={styles.emptyStateText}>
                  トレンドアイテムの読み込みに失敗しました。
                </react_native_1.Text>
                <common_1.Button onPress={loadData} style={{ backgroundColor: '#3B82F6', marginTop: 12 }}>
                  再試行
                </common_1.Button>
              </react_native_1.View>)}
          </react_native_1.View>)}
        
        {/* 商品無しの場合 */}
        {activeTab === 'all' &&
            recommendations.recommended.length === 0 &&
            recommendations.trending.length === 0 &&
            recommendations.forYou.length === 0 && (<react_native_1.View style={styles.emptyState}>
            <vector_icons_1.Ionicons name="heart-outline" size={64} color="#9CA3AF"/>
            <react_native_1.Text style={styles.emptyStateTitle}>おすすめがありません</react_native_1.Text>
            <react_native_1.Text style={styles.emptyStateText}>
              スワイプして「好き」「興味なし」を教えると、
              AIがあなたの好みを学習します。
            </react_native_1.Text>
            <common_1.Button onPress={handleGoToSwipe} style={{ backgroundColor: '#3B82F6', marginTop: 16 }}>
              スワイプする
            </common_1.Button>
          </react_native_1.View>)}
      </react_native_1.ScrollView>
    </react_native_1.SafeAreaView>);
};
var styles = react_native_1.StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
    },
    searchButton: {
        width: 40,
        height: 40,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    promptCard: {
        backgroundColor: '#EBF5FF',
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
        borderRadius: 12,
    },
    promptText: {
        fontSize: 14,
        color: '#1F2937',
        lineHeight: 20,
    },
    errorCard: {
        backgroundColor: '#FEF2F2',
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    errorText: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: '#B91C1C',
    },
    retryButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: 'white',
        borderRadius: 16,
        marginLeft: 8,
    },
    retryButtonText: {
        fontSize: 12,
        color: '#EF4444',
        fontWeight: '500',
    },
    tabBar: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 6,
    },
    activeTab: {
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
    },
    tabText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#111827',
        fontWeight: '600',
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginLeft: 16,
        marginBottom: 12,
    },
    seeAllText: {
        fontSize: 14,
        color: '#3B82F6',
        fontWeight: '500',
    },
    outfitsContainer: {
        paddingLeft: 16,
        paddingRight: 8,
    },
    fullWidthSection: {
        paddingTop: 8,
        paddingBottom: 24,
    },
    fullOutfitItem: {
        marginHorizontal: 16,
        marginBottom: 16,
    },
    gridSection: {
        padding: 16,
    },
    productGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridItem: {
        width: (width - 48) / 2,
        marginBottom: 16,
    },
    productCard: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    productImage: {
        width: '100%',
        height: 180,
        resizeMode: 'cover',
    },
    productInfo: {
        padding: 12,
    },
    productTitle: {
        fontSize: 13,
        fontWeight: '500',
        color: '#1F2937',
        marginBottom: 4,
    },
    productBrand: {
        fontSize: 11,
        color: '#6B7280',
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111827',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginVertical: 8,
    },
    emptyStateText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
    },
});
exports.default = EnhancedRecommendScreen;
