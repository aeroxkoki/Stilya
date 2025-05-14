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
var react_native_safe_area_context_1 = require("react-native-safe-area-context");
var native_1 = require("@react-navigation/native");
// 実際のチャートコンポーネントのインポートは後で追加
// import ActivitySummary from '../../components/report/ActivitySummary';
// import ConversionChart from '../../components/report/ConversionChart';
// import TrendAnalysis from '../../components/report/TrendAnalysis';
var analyticsService_1 = require("../../services/analyticsService");
// 必要に応じてAnalyticsDataをインポート
// import { AnalyticsData } from '../../types';
var Button_1 = __importDefault(require("../../components/common/Button"));
var Card_1 = __importDefault(require("../../components/common/Card"));
var ReportScreen = function () {
    var _a = (0, react_1.useState)(null), analyticsData = _a[0], setAnalyticsData = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(null), error = _c[0], setError = _c[1];
    var navigation = (0, native_1.useNavigation)();
    (0, react_1.useEffect)(function () {
        var fetchData = function () { return __awaiter(void 0, void 0, void 0, function () {
            var data, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, 3, 4]);
                        setLoading(true);
                        return [4 /*yield*/, (0, analyticsService_1.getAnalyticsData)()];
                    case 1:
                        data = _a.sent();
                        setAnalyticsData(data);
                        setError(null);
                        return [3 /*break*/, 4];
                    case 2:
                        err_1 = _a.sent();
                        console.error('Error fetching analytics data:', err_1);
                        setError('データの読み込み中にエラーが発生しました。後でもう一度お試しください。');
                        return [3 /*break*/, 4];
                    case 3:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        fetchData();
    }, []);
    // この時点では実際のチャートライブラリがないので、プレースホルダーを表示する
    var renderPlaceholder = function (title, height) {
        if (height === void 0) { height = 200; }
        return (<react_native_1.View style={[styles.placeholder, { height: height }]}>
      <react_native_1.Text style={styles.placeholderText}>{title}</react_native_1.Text>
    </react_native_1.View>);
    };
    if (loading) {
        return (<react_native_safe_area_context_1.SafeAreaView style={styles.loadingContainer}>
        <react_native_1.ActivityIndicator size="large" color="#3B82F6"/>
        <react_native_1.Text style={styles.loadingText}>データをロード中...</react_native_1.Text>
      </react_native_safe_area_context_1.SafeAreaView>);
    }
    if (error) {
        return (<react_native_safe_area_context_1.SafeAreaView style={styles.loadingContainer}>
        <react_native_1.Text style={styles.errorText}>{error}</react_native_1.Text>
        <Button_1.default title="再読み込み" onPress={function () { return navigation.navigate('Report'); }} variant="primary"/>
      </react_native_safe_area_context_1.SafeAreaView>);
    }
    return (<react_native_safe_area_context_1.SafeAreaView style={styles.container}>
      <react_native_1.ScrollView style={styles.scrollContainer}>
        <react_native_1.Text style={styles.headerText}>アプリ使用状況</react_native_1.Text>
        
        <Card_1.default style={styles.card} padding={16}>
          <react_native_1.Text style={styles.sectionTitle}>あなたのアクティビティ概要</react_native_1.Text>
          {/* 実際のチャートライブラリが導入されたらコメントアウトを解除
        <ActivitySummary data={analyticsData?.activity || []} />
        */}
          {renderPlaceholder('アクティビティ概要チャート', 180)}
          
          <react_native_1.View style={styles.statsRow}>
            <react_native_1.View style={styles.statItem}>
              <react_native_1.Text style={styles.statLabel}>スワイプ数</react_native_1.Text>
              <react_native_1.Text style={styles.statValue}>{(analyticsData === null || analyticsData === void 0 ? void 0 : analyticsData.totalSwipes) || 0}</react_native_1.Text>
            </react_native_1.View>
            <react_native_1.View style={styles.statItem}>
              <react_native_1.Text style={styles.statLabel}>お気に入り</react_native_1.Text>
              <react_native_1.Text style={styles.statValue}>{(analyticsData === null || analyticsData === void 0 ? void 0 : analyticsData.totalFavorites) || 0}</react_native_1.Text>
            </react_native_1.View>
            <react_native_1.View style={styles.statItem}>
              <react_native_1.Text style={styles.statLabel}>商品閲覧</react_native_1.Text>
              <react_native_1.Text style={styles.statValue}>{(analyticsData === null || analyticsData === void 0 ? void 0 : analyticsData.totalViews) || 0}</react_native_1.Text>
            </react_native_1.View>
          </react_native_1.View>
        </Card_1.default>

        <Card_1.default style={styles.card} padding={16}>
          <react_native_1.Text style={styles.sectionTitle}>コンバージョン分析</react_native_1.Text>
          {/* 実際のチャートライブラリが導入されたらコメントアウトを解除
        <ConversionChart data={analyticsData?.conversion || []} />
        */}
          {renderPlaceholder('コンバージョンチャート', 200)}
          
          <react_native_1.View style={styles.conversionSection}>
            <react_native_1.View style={styles.conversionRow}>
              <react_native_1.Text style={styles.conversionLabel}>クリック率 (CTR)</react_native_1.Text>
              <react_native_1.Text style={styles.conversionValue}>{(analyticsData === null || analyticsData === void 0 ? void 0 : analyticsData.ctr) || '0'}%</react_native_1.Text>
            </react_native_1.View>
            <react_native_1.View style={styles.conversionRow}>
              <react_native_1.Text style={styles.conversionLabel}>購入率 (CVR)</react_native_1.Text>
              <react_native_1.Text style={styles.conversionValue}>{(analyticsData === null || analyticsData === void 0 ? void 0 : analyticsData.cvr) || '0'}%</react_native_1.Text>
            </react_native_1.View>
          </react_native_1.View>
        </Card_1.default>

        <Card_1.default style={styles.card} padding={16}>
          <react_native_1.Text style={styles.sectionTitle}>スタイル傾向分析</react_native_1.Text>
          {/* 実際のチャートライブラリが導入されたらコメントアウトを解除
        <TrendAnalysis data={analyticsData?.styleTrends || []} />
        */}
          {renderPlaceholder('スタイル傾向チャート', 220)}
          
          <react_native_1.View style={styles.styleSection}>
            <react_native_1.Text style={styles.styleLabel}>あなたの好みのスタイル:</react_native_1.Text>
            <react_native_1.View style={styles.styleTagsContainer}>
              {((analyticsData === null || analyticsData === void 0 ? void 0 : analyticsData.preferredStyles) || []).map(function (style, index) { return (<react_native_1.View key={index} style={styles.styleTag}>
                  <react_native_1.Text style={styles.styleTagText}>{style}</react_native_1.Text>
                </react_native_1.View>); })}
            </react_native_1.View>
          </react_native_1.View>
        </Card_1.default>
      </react_native_1.ScrollView>
    </react_native_safe_area_context_1.SafeAreaView>);
};
exports.default = ReportScreen;
var styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    scrollContainer: {
        flex: 1,
        padding: 16,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    card: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    statItem: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    conversionSection: {
        marginTop: 16,
    },
    conversionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    conversionLabel: {
        color: '#6B7280',
    },
    conversionValue: {
        fontWeight: '600',
    },
    styleSection: {
        marginTop: 16,
    },
    styleLabel: {
        color: '#6B7280',
        marginBottom: 8,
    },
    styleTagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    styleTag: {
        backgroundColor: '#DBEAFE',
        borderRadius: 9999,
        paddingHorizontal: 12,
        paddingVertical: 4,
        marginRight: 8,
        marginBottom: 8,
    },
    styleTagText: {
        color: '#1E40AF',
    },
    placeholder: {
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 16,
        width: '100%',
    },
    placeholderText: {
        color: '#6B7280',
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: 'white',
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 16,
        color: '#6B7280',
    },
    errorText: {
        color: '#EF4444',
        marginBottom: 16,
    },
});
