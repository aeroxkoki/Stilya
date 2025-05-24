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
var useRecommendations_1 = require("@/hooks/useRecommendations");
var recommendationProfiler_1 = require("@/utils/recommendationProfiler");
var useAuth_1 = require("@/hooks/useAuth");
/**
 * レコメンドエンジンのテストとチューニングのための画面
 * 開発者用ツールとして利用可能
 */
var RecommendationTestScreen = function () {
    var user = (0, useAuth_1.useAuth)().user;
    var _a = (0, useRecommendations_1.useRecommendations)(20), recommendations = _a.recommendations, categoryRecommendations = _a.categoryRecommendations, userPreference = _a.userPreference, isLoading = _a.isLoading, error = _a.error, refreshRecommendations = _a.refreshRecommendations, clearCache = _a.clearCache;
    var _b = (0, react_1.useState)([]), testResults = _b[0], setTestResults = _b[1];
    var _c = (0, react_1.useState)(false), showDetails = _c[0], setShowDetails = _c[1];
    // パフォーマンステストを実行
    var runPerformanceTest = function () { return __awaiter(void 0, void 0, void 0, function () {
        var originalConsoleLog, logs, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!user)
                        return [2 /*return*/];
                    setTestResults(['パフォーマンステスト実行中...']);
                    originalConsoleLog = console.log;
                    logs = [];
                    console.log = function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        logs.push(args.join(' '));
                        originalConsoleLog.apply(void 0, args);
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, (0, recommendationProfiler_1.runRecommendationPerformanceTest)(user.id)];
                case 2:
                    _a.sent();
                    setTestResults(logs);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    console.error('Test failed:', err_1);
                    setTestResults(__spreadArray(__spreadArray([], logs, true), ["\u30C6\u30B9\u30C8\u5931\u6557: ".concat(err_1)], false));
                    return [3 /*break*/, 5];
                case 4:
                    // コンソール出力を元に戻す
                    console.log = originalConsoleLog;
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // キャッシュクリアとリロード
    var handleClearCacheAndRefresh = function () {
        clearCache();
        refreshRecommendations(true);
        setTestResults(['キャッシュをクリアしました。データを再読み込みしています...']);
    };
    // エッジケーステスト
    var testEdgeCases = function () { return __awaiter(void 0, void 0, void 0, function () {
        var logs, start1, end1, start2, end2, start3, end3, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setTestResults(['エッジケーステスト実行中...']);
                    if (!user) {
                        setTestResults(['ユーザーがログインしていません。テストを実行できません。']);
                        return [2 /*return*/];
                    }
                    logs = [];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    start1 = performance.now();
                    return [4 /*yield*/, refreshRecommendations(false)];
                case 2:
                    _a.sent();
                    end1 = performance.now();
                    logs.push("\u30C6\u30B9\u30C81: \u30AD\u30E3\u30C3\u30B7\u30E5\u4F7F\u7528 - ".concat((end1 - start1).toFixed(2), "ms"));
                    start2 = performance.now();
                    return [4 /*yield*/, refreshRecommendations(true)];
                case 3:
                    _a.sent();
                    end2 = performance.now();
                    logs.push("\u30C6\u30B9\u30C82: \u30AD\u30E3\u30C3\u30B7\u30E5\u306A\u3057 - ".concat((end2 - start2).toFixed(2), "ms"));
                    start3 = performance.now();
                    return [4 /*yield*/, Promise.all([
                            refreshRecommendations(false),
                            refreshRecommendations(false),
                            refreshRecommendations(false)
                        ])];
                case 4:
                    _a.sent();
                    end3 = performance.now();
                    logs.push("\u30C6\u30B9\u30C83: \u4E26\u884C\u51E6\u7406\u30C6\u30B9\u30C8 - ".concat((end3 - start3).toFixed(2), "ms"));
                    setTestResults(logs);
                    return [3 /*break*/, 6];
                case 5:
                    err_2 = _a.sent();
                    console.error('Edge case test failed:', err_2);
                    setTestResults(__spreadArray(__spreadArray([], logs, true), ["\u30C6\u30B9\u30C8\u5931\u6557: ".concat(err_2)], false));
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    return (<react_native_1.ScrollView style={styles.container}>
      <react_native_1.View style={styles.header}>
        <react_native_1.Text style={styles.title}>レコメンドエンジンテスト</react_native_1.Text>
        <react_native_1.Text style={styles.subtitle}>Day 26: テスト・チューニング</react_native_1.Text>
      </react_native_1.View>
      
      <react_native_1.View style={styles.section}>
        <react_native_1.Text style={styles.sectionTitle}>基本情報</react_native_1.Text>
        <react_native_1.Text>ユーザーID: {(user === null || user === void 0 ? void 0 : user.id) || '未ログイン'}</react_native_1.Text>
        <react_native_1.Text>読み込み状態: {isLoading ? '読込中...' : '完了'}</react_native_1.Text>
        {error && <react_native_1.Text style={styles.error}>{error}</react_native_1.Text>}
        <react_native_1.Text>レコメンド商品数: {recommendations.length}</react_native_1.Text>
        <react_native_1.Text>カテゴリ別商品: {Object.keys(categoryRecommendations).length} カテゴリ</react_native_1.Text>
        
        {userPreference && (<react_native_1.View style={styles.preferenceSection}>
            <react_native_1.Text style={styles.subheader}>ユーザー好み分析</react_native_1.Text>
            <react_native_1.Text>上位タグ: {userPreference.topTags.join(', ')}</react_native_1.Text>
            <react_native_1.TouchableOpacity onPress={function () { return setShowDetails(!showDetails); }}>
              <react_native_1.Text style={styles.link}>
                {showDetails ? '詳細を隠す' : '詳細を表示'}
              </react_native_1.Text>
            </react_native_1.TouchableOpacity>
            
            {showDetails && (<react_native_1.ScrollView style={styles.detailsContainer}>
                <react_native_1.Text style={styles.subheader}>タグスコア詳細:</react_native_1.Text>
                {Object.entries(userPreference.tagScores)
                    .sort(function (_a, _b) {
                    var a = _a[1];
                    var b = _b[1];
                    return b - a;
                })
                    .map(function (_a, index) {
                    var tag = _a[0], score = _a[1];
                    return (<react_native_1.Text key={index}>
                      {tag}: {score.toFixed(2)}
                    </react_native_1.Text>);
                })}
              </react_native_1.ScrollView>)}
          </react_native_1.View>)}
      </react_native_1.View>
      
      <react_native_1.View style={styles.section}>
        <react_native_1.Text style={styles.sectionTitle}>テスト機能</react_native_1.Text>
        <react_native_1.View style={styles.buttonContainer}>
          <react_native_1.Button title="パフォーマンステスト実行" onPress={runPerformanceTest} disabled={isLoading || !user}/>
        </react_native_1.View>
        
        <react_native_1.View style={styles.buttonContainer}>
          <react_native_1.Button title="キャッシュクリア＆リロード" onPress={handleClearCacheAndRefresh} disabled={isLoading || !user}/>
        </react_native_1.View>
        
        <react_native_1.View style={styles.buttonContainer}>
          <react_native_1.Button title="エッジケーステスト" onPress={testEdgeCases} disabled={isLoading || !user}/>
        </react_native_1.View>
        
        <react_native_1.View style={styles.buttonContainer}>
          <react_native_1.Button title="手動更新（キャッシュ使用）" onPress={function () { return refreshRecommendations(false); }} disabled={isLoading || !user}/>
        </react_native_1.View>
      </react_native_1.View>
      
      {testResults.length > 0 && (<react_native_1.View style={styles.section}>
          <react_native_1.Text style={styles.sectionTitle}>テスト結果</react_native_1.Text>
          <react_native_1.ScrollView style={styles.resultsContainer}>
            {testResults.map(function (line, index) { return (<react_native_1.Text key={index} style={styles.resultLine}>{line}</react_native_1.Text>); })}
          </react_native_1.ScrollView>
        </react_native_1.View>)}
    </react_native_1.ScrollView>);
};
var styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    section: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    preferenceSection: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    subheader: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    link: {
        color: 'blue',
        marginVertical: 8,
    },
    detailsContainer: {
        maxHeight: 200,
        marginVertical: 8,
    },
    buttonContainer: {
        marginBottom: 12,
    },
    resultsContainer: {
        maxHeight: 300,
        backgroundColor: '#f0f0f0',
        padding: 12,
        borderRadius: 4,
    },
    resultLine: {
        fontFamily: 'monospace',
        fontSize: 12,
        marginBottom: 2,
    },
    error: {
        color: 'red',
        marginVertical: 8,
    },
});
exports.default = RecommendationTestScreen;
