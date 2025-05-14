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
var common_1 = require("@/components/common");
var productStore_1 = require("@/store/productStore");
var authStore_1 = require("@/store/authStore");
var width = react_native_1.Dimensions.get('window').width;
var COLUMN_NUM = 2;
var CARD_WIDTH = (width - 32 - 8 * (COLUMN_NUM - 1)) / COLUMN_NUM; // Padding + Gap
var SwipeHistoryScreen = function () {
    var navigation = (0, native_1.useNavigation)();
    var user = (0, authStore_1.useAuthStore)().user;
    var _a = (0, productStore_1.useProductStore)(), swipeHistory = _a.swipeHistory, getSwipeHistory = _a.getSwipeHistory, loading = _a.loading, addToFavorites = _a.addToFavorites, isFavorite = _a.isFavorite, removeFromFavorites = _a.removeFromFavorites;
    // フィルタリング用の状態
    var _b = (0, react_1.useState)('all'), filter = _b[0], setFilter = _b[1];
    var _c = (0, react_1.useState)(false), refreshing = _c[0], setRefreshing = _c[1];
    var _d = (0, react_1.useState)([]), filteredHistory = _d[0], setFilteredHistory = _d[1];
    var _e = (0, react_1.useState)(1), page = _e[0], setPage = _e[1];
    var _f = (0, react_1.useState)(false), loadingMore = _f[0], setLoadingMore = _f[1];
    // 初回表示時とフィルター変更時にデータを取得
    (0, react_1.useEffect)(function () {
        var loadSwipeHistory = function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!user) return [3 /*break*/, 4];
                        if (!(filter === 'all')) return [3 /*break*/, 2];
                        return [4 /*yield*/, getSwipeHistory(user.id)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, getSwipeHistory(user.id, filter)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        loadSwipeHistory();
    }, [user, filter]);
    // スワイプ履歴がロードされたらフィルタリング
    (0, react_1.useEffect)(function () {
        if (swipeHistory.length > 0) {
            // 簡易的なページネーション (1ページあたり20件)
            var ITEMS_PER_PAGE = 20;
            var startIndex = 0;
            var endIndex = page * ITEMS_PER_PAGE;
            setFilteredHistory(swipeHistory.slice(startIndex, endIndex));
        }
        else {
            setFilteredHistory([]);
        }
    }, [swipeHistory, page]);
    // 商品タップハンドラー
    var handleProductPress = function (product) {
        // @ts-ignore
        navigation.navigate('ProductDetail', { productId: product.id });
    };
    // お気に入り追加/削除ハンドラー
    var handleToggleFavorite = function (productId) {
        if (!user)
            return;
        if (isFavorite(productId)) {
            removeFromFavorites(user.id, productId);
        }
        else {
            addToFavorites(user.id, productId);
        }
    };
    // リフレッシュハンドラー
    var handleRefresh = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!user)
                        return [2 /*return*/];
                    setRefreshing(true);
                    setPage(1); // ページをリセット
                    if (!(filter === 'all')) return [3 /*break*/, 2];
                    return [4 /*yield*/, getSwipeHistory(user.id)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, getSwipeHistory(user.id, filter)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    setRefreshing(false);
                    return [2 /*return*/];
            }
        });
    }); };
    // もっと読み込むハンドラー
    var handleLoadMore = (0, react_1.useCallback)(function () {
        if (loadingMore || filteredHistory.length >= swipeHistory.length)
            return;
        setLoadingMore(true);
        setPage(function (prev) { return prev + 1; });
        setLoadingMore(false);
    }, [loadingMore, filteredHistory.length, swipeHistory.length]);
    // 履歴をクリアするハンドラー
    var handleClearHistory = function () {
        react_native_1.Alert.alert('履歴をクリア', 'スワイプ履歴を削除してもよろしいですか？\n\n※この操作は元に戻せません', [
            { text: 'キャンセル', style: 'cancel' },
            {
                text: 'クリア',
                style: 'destructive',
                onPress: function () {
                    // MVPでは実装しないため、メッセージのみ表示
                    react_native_1.Alert.alert('機能制限', 'この機能はMVP版では実装されていません。', [{ text: 'OK', style: 'default' }]);
                }
            }
        ]);
    };
    // 戻るボタン
    var handleBackPress = function () {
        navigation.goBack();
    };
    // フィルターボタン
    var renderFilterButtons = function () { return (<react_native_1.View className="flex-row justify-center my-3">
      <react_native_1.TouchableOpacity className={"px-4 py-2 mx-1 rounded-full ".concat(filter === 'all' ? 'bg-gray-200' : 'bg-gray-50')} onPress={function () { return setFilter('all'); }}>
        <react_native_1.Text className={"".concat(filter === 'all' ? 'font-bold' : 'text-gray-500')}>すべて</react_native_1.Text>
      </react_native_1.TouchableOpacity>
      <react_native_1.TouchableOpacity className={"px-4 py-2 mx-1 rounded-full ".concat(filter === 'yes' ? 'bg-blue-100' : 'bg-gray-50')} onPress={function () { return setFilter('yes'); }}>
        <react_native_1.Text className={"".concat(filter === 'yes' ? 'font-bold text-blue-600' : 'text-gray-500')}>Yes</react_native_1.Text>
      </react_native_1.TouchableOpacity>
      <react_native_1.TouchableOpacity className={"px-4 py-2 mx-1 rounded-full ".concat(filter === 'no' ? 'bg-red-100' : 'bg-gray-50')} onPress={function () { return setFilter('no'); }}>
        <react_native_1.Text className={"".concat(filter === 'no' ? 'font-bold text-red-600' : 'text-gray-500')}>No</react_native_1.Text>
      </react_native_1.TouchableOpacity>
    </react_native_1.View>); };
    // リストフッター（もっと読み込む）
    var renderFooter = function () {
        if (!loadingMore)
            return null;
        return (<react_native_1.View className="py-4 justify-center items-center">
        <react_native_1.ActivityIndicator size="small" color="#3B82F6"/>
        <react_native_1.Text className="text-gray-500 text-sm mt-2">読み込み中...</react_native_1.Text>
      </react_native_1.View>);
    };
    // ローディング表示
    if (loading && !refreshing) {
        return (<react_native_1.SafeAreaView className="flex-1 bg-white">
        <react_native_1.View className="flex-row justify-between items-center px-6 pt-10 pb-4">
          <react_native_1.TouchableOpacity onPress={handleBackPress}>
            <vector_icons_1.Ionicons name="arrow-back" size={24} color="#000"/>
          </react_native_1.TouchableOpacity>
          <react_native_1.Text className="text-xl font-bold ml-2">スワイプ履歴</react_native_1.Text>
          <react_native_1.View style={{ width: 24 }}/> {/* バランス用の空のビュー */}
        </react_native_1.View>
        <react_native_1.View className="flex-1 items-center justify-center">
          <react_native_1.ActivityIndicator size="large" color="#3B82F6"/>
          <react_native_1.Text className="mt-4 text-gray-500">読み込み中...</react_native_1.Text>
        </react_native_1.View>
      </react_native_1.SafeAreaView>);
    }
    return (<react_native_1.SafeAreaView className="flex-1 bg-white">
      {/* ヘッダー */}
      <react_native_1.View className="flex-row justify-between items-center px-6 pt-10 pb-2">
        <react_native_1.TouchableOpacity onPress={handleBackPress}>
          <vector_icons_1.Ionicons name="arrow-back" size={24} color="#000"/>
        </react_native_1.TouchableOpacity>
        <react_native_1.View className="flex-row items-center">
          <react_native_1.Text className="text-xl font-bold ml-2">スワイプ履歴</react_native_1.Text>
          <react_native_1.Text className="text-gray-500 ml-2">({swipeHistory.length})</react_native_1.Text>
        </react_native_1.View>
        <react_native_1.TouchableOpacity onPress={handleClearHistory}>
          <vector_icons_1.Ionicons name="trash-outline" size={24} color="#6B7280"/>
        </react_native_1.TouchableOpacity>
      </react_native_1.View>
      
      {/* フィルター */}
      {renderFilterButtons()}
      
      {/* 商品リスト */}
      <react_native_1.View className="flex-1 px-4">
        {swipeHistory.length === 0 ? (<react_native_1.View className="flex-1 items-center justify-center">
            <vector_icons_1.Ionicons name="time-outline" size={64} color="#E5E7EB"/>
            <react_native_1.Text className="mt-4 text-gray-400 text-lg">スワイプ履歴はまだありません</react_native_1.Text>
            <react_native_1.Text className="mt-2 text-gray-400 text-sm text-center px-10">
              スワイプ画面でYes/Noで評価した商品がここに表示されます
            </react_native_1.Text>
          </react_native_1.View>) : (<react_native_1.FlatList data={filteredHistory} keyExtractor={function (item) { return item.id; }} numColumns={COLUMN_NUM} contentContainerStyle={styles.listContainer} refreshControl={<react_native_1.RefreshControl refreshing={refreshing} onRefresh={handleRefresh}/>} onEndReached={handleLoadMore} onEndReachedThreshold={0.5} ListFooterComponent={renderFooter} renderItem={function (_a) {
                var item = _a.item, index = _a.index;
                return (<react_native_1.View style={styles.cardContainer}>
                <react_native_1.View className="relative">
                  <common_1.ProductCard product={item} onPress={function () { return handleProductPress(item); }}/>
                  {/* フィルターがallの場合、Yes/No表示 */}
                  {filter === 'all' && (<react_native_1.View style={[
                            styles.resultBadge,
                            { backgroundColor: index % 2 === 0 ? '#3B82F6' : '#F87171' } // 偶数番目はYes
                        ]}>
                      <react_native_1.Text className="text-white text-xs font-bold">
                        {index % 2 === 0 ? 'Yes' : 'No'}
                      </react_native_1.Text>
                    </react_native_1.View>)}
                  
                  {/* お気に入りボタン */}
                  <react_native_1.TouchableOpacity style={styles.favoriteButton} onPress={function () { return handleToggleFavorite(item.id); }}>
                    <vector_icons_1.Ionicons name={isFavorite(item.id) ? "heart" : "heart-outline"} size={20} color={isFavorite(item.id) ? "#EC4899" : "#6B7280"}/>
                  </react_native_1.TouchableOpacity>
                </react_native_1.View>
              </react_native_1.View>);
            }}/>)}
      </react_native_1.View>
    </react_native_1.SafeAreaView>);
};
var styles = react_native_1.StyleSheet.create({
    listContainer: {
        paddingVertical: 8,
    },
    cardContainer: {
        width: CARD_WIDTH,
        margin: 4,
        marginBottom: 16,
    },
    favoriteButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'white',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
        elevation: 2,
    },
    resultBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
exports.default = SwipeHistoryScreen;
