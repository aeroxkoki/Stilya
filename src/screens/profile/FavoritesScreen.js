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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
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
var FavoritesScreen = function () {
    var navigation = (0, native_1.useNavigation)();
    var user = (0, authStore_1.useAuthStore)().user;
    var _a = (0, productStore_1.useProductStore)(), favorites = _a.favorites, getFavorites = _a.getFavorites, removeFromFavorites = _a.removeFromFavorites, loading = _a.loading;
    var _b = (0, react_1.useState)(false), refreshing = _b[0], setRefreshing = _b[1];
    var _c = (0, react_1.useState)([]), displayFavorites = _c[0], setDisplayFavorites = _c[1];
    var _d = (0, react_1.useState)(1), page = _d[0], setPage = _d[1];
    var _e = (0, react_1.useState)(false), loadingMore = _e[0], setLoadingMore = _e[1];
    var _f = (0, react_1.useState)('recent'), sortOrder = _f[0], setSortOrder = _f[1];
    // 初回表示時にデータを取得
    (0, react_1.useEffect)(function () {
        var loadFavorites = function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!user) return [3 /*break*/, 2];
                        return [4 /*yield*/, getFavorites(user.id)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); };
        loadFavorites();
    }, [user]);
    // お気に入りがロードされたらソートして表示
    (0, react_1.useEffect)(function () {
        if (favorites.length > 0) {
            var sorted = sortFavorites(favorites, sortOrder);
            // 簡易的なページネーション (1ページあたり20件)
            var ITEMS_PER_PAGE = 20;
            var startIndex = 0;
            var endIndex = page * ITEMS_PER_PAGE;
            setDisplayFavorites(sorted.slice(startIndex, endIndex));
        }
        else {
            setDisplayFavorites([]);
        }
    }, [favorites, page, sortOrder]);
    // ソート機能
    var sortFavorites = function (items, order) {
        var clonedItems = __spreadArray([], items, true);
        switch (order) {
            case 'price_high':
                return clonedItems.sort(function (a, b) { return b.price - a.price; });
            case 'price_low':
                return clonedItems.sort(function (a, b) { return a.price - b.price; });
            case 'recent':
            default:
                // 日付でソート（最新順）
                // 日付情報がなければ元の順序を維持
                return clonedItems.sort(function (a, b) {
                    if (!a.createdAt || !b.createdAt)
                        return 0;
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                });
        }
    };
    // 商品タップハンドラー
    var handleProductPress = function (product) {
        navigation.navigate('ProductDetail', { productId: product.id });
    };
    // お気に入り削除ハンドラー
    var handleRemoveFavorite = function (productId) {
        react_native_1.Alert.alert('お気に入りから削除', 'この商品をお気に入りから削除しますか？', [
            { text: 'キャンセル', style: 'cancel' },
            {
                text: '削除',
                style: 'destructive',
                onPress: function () {
                    if (user) {
                        removeFromFavorites(user.id, productId);
                    }
                }
            }
        ]);
    };
    // リフレッシュハンドラー
    var handleRefresh = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!user)
                        return [2 /*return*/];
                    setRefreshing(true);
                    setPage(1);
                    return [4 /*yield*/, getFavorites(user.id)];
                case 1:
                    _a.sent();
                    setRefreshing(false);
                    return [2 /*return*/];
            }
        });
    }); };
    // もっと読み込むハンドラー
    var handleLoadMore = (0, react_1.useCallback)(function () {
        if (loadingMore || displayFavorites.length >= favorites.length)
            return;
        setLoadingMore(true);
        setPage(function (prev) { return prev + 1; });
        setLoadingMore(false);
    }, [loadingMore, displayFavorites.length, favorites.length]);
    // すべてのお気に入りをクリア
    var handleClearAll = function () {
        if (!user || favorites.length === 0)
            return;
        react_native_1.Alert.alert('すべて削除', 'お気に入りをすべて削除してもよろしいですか？\n\nこの操作は元に戻せません。', [
            { text: 'キャンセル', style: 'cancel' },
            {
                text: 'すべて削除',
                style: 'destructive',
                onPress: function () {
                    // MVPでは未実装のため、アラートのみ表示
                    react_native_1.Alert.alert('機能制限', 'この機能はMVP版では実装されていません。', [{ text: 'OK', style: 'default' }]);
                }
            }
        ]);
    };
    // 並び替えメニュー
    var handleShowSortOptions = function () {
        react_native_1.Alert.alert('並び替え', '表示順を選択してください', [
            {
                text: '最新順',
                onPress: function () { return setSortOrder('recent'); }
            },
            {
                text: '価格が高い順',
                onPress: function () { return setSortOrder('price_high'); }
            },
            {
                text: '価格が低い順',
                onPress: function () { return setSortOrder('price_low'); }
            },
            {
                text: 'キャンセル',
                style: 'cancel'
            }
        ]);
    };
    // 戻るボタン
    var handleBackPress = function () {
        navigation.goBack();
    };
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
          <react_native_1.Text className="text-xl font-bold ml-2">お気に入り</react_native_1.Text>
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
      <react_native_1.View className="flex-row justify-between items-center px-6 pt-10 pb-4">
        <react_native_1.TouchableOpacity onPress={handleBackPress}>
          <vector_icons_1.Ionicons name="arrow-back" size={24} color="#000"/>
        </react_native_1.TouchableOpacity>
        <react_native_1.View className="flex-row items-center">
          <react_native_1.Text className="text-xl font-bold ml-2">お気に入り</react_native_1.Text>
          <react_native_1.Text className="text-gray-500 ml-2">({favorites.length})</react_native_1.Text>
        </react_native_1.View>
        <react_native_1.View className="flex-row">
          <react_native_1.TouchableOpacity onPress={handleShowSortOptions} className="mr-4">
            <vector_icons_1.Ionicons name="filter-outline" size={24} color="#6B7280"/>
          </react_native_1.TouchableOpacity>
          <react_native_1.TouchableOpacity onPress={handleClearAll}>
            <vector_icons_1.Ionicons name="trash-outline" size={24} color="#6B7280"/>
          </react_native_1.TouchableOpacity>
        </react_native_1.View>
      </react_native_1.View>
      
      {/* ソート状態表示 */}
      <react_native_1.View className="px-6 mb-2">
        <react_native_1.Text className="text-xs text-gray-500">
          {sortOrder === 'recent' ? '最新順' :
            sortOrder === 'price_high' ? '価格が高い順' : '価格が低い順'}
           で表示中
        </react_native_1.Text>
      </react_native_1.View>
      
      {/* 商品リスト */}
      <react_native_1.View className="flex-1 px-4">
        {favorites.length === 0 ? (<react_native_1.View className="flex-1 items-center justify-center">
            <vector_icons_1.Ionicons name="heart-outline" size={64} color="#E5E7EB"/>
            <react_native_1.Text className="mt-4 text-gray-400 text-lg">お気に入りはまだありません</react_native_1.Text>
            <react_native_1.Text className="mt-2 text-gray-400 text-sm text-center px-10">
              スワイプ画面で「いいね」した商品や詳細画面でお気に入り登録した商品がここに表示されます
            </react_native_1.Text>
          </react_native_1.View>) : (<react_native_1.FlatList data={displayFavorites} keyExtractor={function (item) { return item.id; }} numColumns={COLUMN_NUM} contentContainerStyle={styles.listContainer} refreshControl={<react_native_1.RefreshControl refreshing={refreshing} onRefresh={handleRefresh}/>} onEndReached={handleLoadMore} onEndReachedThreshold={0.5} ListFooterComponent={renderFooter} renderItem={function (_a) {
                var item = _a.item;
                return (<react_native_1.View style={styles.cardContainer}>
                <react_native_1.View className="relative">
                  <common_1.ProductCard product={item} onPress={function () { return handleProductPress(item); }}/>
                  <react_native_1.TouchableOpacity style={styles.favoriteButton} onPress={function () { return handleRemoveFavorite(item.id); }}>
                    <vector_icons_1.Ionicons name="heart" size={20} color="#EC4899"/>
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
});
exports.default = FavoritesScreen;
