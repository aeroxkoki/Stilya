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
var vector_icons_1 = require("@expo/vector-icons");
var native_1 = require("@react-navigation/native");
var common_1 = require("@/components/common");
var authStore_1 = require("@/store/authStore");
var productStore_1 = require("@/store/productStore");
var ProfileScreen = function () {
    var _a;
    var navigation = (0, native_1.useNavigation)();
    var _b = (0, authStore_1.useAuthStore)(), user = _b.user, logout = _b.logout, loading = _b.loading;
    var _c = (0, productStore_1.useProductStore)(), favorites = _c.favorites, swipeHistory = _c.swipeHistory, getFavorites = _c.getFavorites, getSwipeHistory = _c.getSwipeHistory;
    // 初回表示時にデータを取得
    (0, react_1.useEffect)(function () {
        var loadData = function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!user) return [3 /*break*/, 2];
                        // お気に入りとスワイプ履歴を取得
                        return [4 /*yield*/, Promise.all([
                                getFavorites(user.id),
                                getSwipeHistory(user.id)
                            ])];
                    case 1:
                        // お気に入りとスワイプ履歴を取得
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); };
        loadData();
    }, [user]);
    var handleLogout = function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, logout()];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('Logout error:', error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // 性別のマッピング
    var genderMap = {
        male: '男性',
        female: '女性',
        other: 'その他',
    };
    // 各画面への遷移
    var handleNavigateToFavorites = function () {
        navigation.navigate('Favorites');
    };
    var handleNavigateToSwipeHistory = function () {
        navigation.navigate('SwipeHistory');
    };
    var handleNavigateToSettings = function () {
        navigation.navigate('Settings');
    };
    var handleNavigateToHelp = function () {
        // MVPでは簡易的にアラートを表示
        react_native_1.Alert.alert('ヘルプ・サポート', 'お問い合わせは support@stilya.jp までご連絡ください。\n\nバージョン: 0.1.0 (MVP)', [{ text: 'OK', style: 'default' }]);
    };
    return (<react_native_1.SafeAreaView className="flex-1 bg-white">
      <react_native_1.ScrollView className="flex-1">
        {/* ヘッダー */}
        <react_native_1.View className="px-6 pt-10 pb-6">
          <react_native_1.Text className="text-2xl font-bold">マイページ</react_native_1.Text>
        </react_native_1.View>

        {/* プロフィール情報 */}
        <react_native_1.View className="px-6 mb-6">
          <common_1.Card className="p-4">
            <react_native_1.View className="items-center mb-4">
              <react_native_1.View className="bg-primary h-20 w-20 rounded-full items-center justify-center mb-2">
                <react_native_1.Text className="text-white text-2xl font-bold">
                  {((_a = user === null || user === void 0 ? void 0 : user.email) === null || _a === void 0 ? void 0 : _a.charAt(0).toUpperCase()) || 'U'}
                </react_native_1.Text>
              </react_native_1.View>
              <react_native_1.Text className="text-lg font-bold">{(user === null || user === void 0 ? void 0 : user.email) || 'ユーザー'}</react_native_1.Text>
            </react_native_1.View>

            <react_native_1.View className="border-t border-gray-100 pt-4">
              <react_native_1.View className="flex-row justify-between mb-2">
                <react_native_1.Text className="text-gray-500">性別</react_native_1.Text>
                <react_native_1.Text className="font-medium">
                  {(user === null || user === void 0 ? void 0 : user.gender) ? genderMap[user.gender] || user.gender : '未設定'}
                </react_native_1.Text>
              </react_native_1.View>
              <react_native_1.View className="flex-row justify-between mb-2">
                <react_native_1.Text className="text-gray-500">年代</react_native_1.Text>
                <react_native_1.Text className="font-medium">{(user === null || user === void 0 ? void 0 : user.ageGroup) || '未設定'}</react_native_1.Text>
              </react_native_1.View>
              <react_native_1.View className="flex-row justify-between">
                <react_native_1.Text className="text-gray-500">登録日</react_native_1.Text>
                <react_native_1.Text className="font-medium">
                  {(user === null || user === void 0 ? void 0 : user.createdAt)
            ? new Date(user.createdAt).toLocaleDateString('ja-JP')
            : '不明'}
                </react_native_1.Text>
              </react_native_1.View>
            </react_native_1.View>
          </common_1.Card>
        </react_native_1.View>

        {/* アクティビティ */}
        <react_native_1.View className="px-6 mb-6">
          <react_native_1.Text className="text-lg font-bold mb-3">アクティビティ</react_native_1.Text>
          <common_1.Card variant="outlined" className="p-0 divide-y divide-gray-100">
            <react_native_1.TouchableOpacity className="p-4 flex-row items-center" onPress={handleNavigateToFavorites}>
              <vector_icons_1.Ionicons name="heart-outline" size={20} color="#6B7280" style={{ marginRight: 12 }}/>
              <react_native_1.View className="flex-1">
                <react_native_1.Text className="text-base">お気に入り</react_native_1.Text>
                <react_native_1.Text className="text-xs text-gray-500">{favorites.length}件の商品</react_native_1.Text>
              </react_native_1.View>
              <vector_icons_1.Ionicons name="chevron-forward" size={20} color="#6B7280"/>
            </react_native_1.TouchableOpacity>
            
            <react_native_1.TouchableOpacity className="p-4 flex-row items-center" onPress={handleNavigateToSwipeHistory}>
              <vector_icons_1.Ionicons name="time-outline" size={20} color="#6B7280" style={{ marginRight: 12 }}/>
              <react_native_1.View className="flex-1">
                <react_native_1.Text className="text-base">スワイプ履歴</react_native_1.Text>
                <react_native_1.Text className="text-xs text-gray-500">{swipeHistory.length}件のスワイプ</react_native_1.Text>
              </react_native_1.View>
              <vector_icons_1.Ionicons name="chevron-forward" size={20} color="#6B7280"/>
            </react_native_1.TouchableOpacity>
          </common_1.Card>
        </react_native_1.View>

        {/* 設定メニュー */}
        <react_native_1.View className="px-6 mb-6">
          <react_native_1.Text className="text-lg font-bold mb-3">設定</react_native_1.Text>
          <common_1.Card variant="outlined" className="p-0 divide-y divide-gray-100">
            <react_native_1.TouchableOpacity className="p-4 flex-row items-center" onPress={handleNavigateToSettings}>
              <vector_icons_1.Ionicons name="settings-outline" size={20} color="#6B7280" style={{ marginRight: 12 }}/>
              <react_native_1.Text className="flex-1">アカウント設定</react_native_1.Text>
              <vector_icons_1.Ionicons name="chevron-forward" size={20} color="#6B7280"/>
            </react_native_1.TouchableOpacity>
            
            <react_native_1.TouchableOpacity className="p-4 flex-row items-center" onPress={handleNavigateToHelp}>
              <vector_icons_1.Ionicons name="help-circle-outline" size={20} color="#6B7280" style={{ marginRight: 12 }}/>
              <react_native_1.Text className="flex-1">ヘルプ・サポート</react_native_1.Text>
              <vector_icons_1.Ionicons name="chevron-forward" size={20} color="#6B7280"/>
            </react_native_1.TouchableOpacity>
          </common_1.Card>
        </react_native_1.View>

        {/* ログアウトボタン */}
        <react_native_1.View className="px-6 mb-10">
          <common_1.Button variant="outline" isFullWidth onPress={handleLogout} isLoading={loading}>
            ログアウト
          </common_1.Button>
        </react_native_1.View>
      </react_native_1.ScrollView>
    </react_native_1.SafeAreaView>);
};
exports.default = ProfileScreen;
