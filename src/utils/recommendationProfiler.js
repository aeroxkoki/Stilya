"use strict";
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
exports.runRecommendationPerformanceTest = exports.RecommendationProfiler = void 0;
var recommendationService_1 = require("@/services/recommendationService");
/**
 * レコメンデーションサービスのパフォーマンス測定ツール
 *
 * 使用例:
 * ```
 * const profiler = new RecommendationProfiler();
 * await profiler.runProfileTest('getRecommendedProducts', {
 *   userId: 'user123',
 *   limit: 20,
 *   excludeIds: ['prod1', 'prod2']
 * });
 * profiler.printResults();
 * ```
 */
var RecommendationProfiler = /** @class */ (function () {
    function RecommendationProfiler() {
        this.results = [];
    }
    /**
     * パフォーマンステストを実行し、結果を記録する
     * @param testName テスト名
     * @param params テストパラメータ
     */
    RecommendationProfiler.prototype.runProfileTest = function (testName, params) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, result, error_1, endTime, executionTime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = performance.now();
                        result = [];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, recommendationService_1.getRecommendedProducts)(params.userId, params.limit || 10, params.excludeIds || [])];
                    case 2:
                        // レコメンデーションAPI実行
                        result = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error("Error in profiling ".concat(testName, ":"), error_1);
                        return [3 /*break*/, 4];
                    case 4:
                        endTime = performance.now();
                        executionTime = endTime - startTime;
                        // 結果を記録
                        this.results.push({
                            testName: testName,
                            executionTime: executionTime,
                            resultCount: result.length,
                            params: params,
                        });
                        console.log("Test '".concat(testName, "' completed in ").concat(executionTime.toFixed(2), "ms"));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 全てのテスト結果を表示する
     */
    RecommendationProfiler.prototype.printResults = function () {
        console.log('\n===== RECOMMENDATION ENGINE PERFORMANCE TEST RESULTS =====');
        console.log('| Test Name | Execution Time (ms) | Result Count | Parameters |');
        console.log('|-----------|---------------------|--------------|------------|');
        this.results.forEach(function (result) {
            console.log("| ".concat(result.testName.padEnd(9), " | ") +
                "".concat(result.executionTime.toFixed(2).padEnd(19), " | ") +
                "".concat(String(result.resultCount).padEnd(12), " | ") +
                "".concat(JSON.stringify(result.params).slice(0, 40)).concat(JSON.stringify(result.params).length > 40 ? '...' : '', " |"));
        });
        // 統計情報の計算
        if (this.results.length > 0) {
            var avgTime = this.results.reduce(function (sum, r) { return sum + r.executionTime; }, 0) / this.results.length;
            var maxTime = Math.max.apply(Math, this.results.map(function (r) { return r.executionTime; }));
            var minTime = Math.min.apply(Math, this.results.map(function (r) { return r.executionTime; }));
            console.log('\n----- Statistics -----');
            console.log("Average execution time: ".concat(avgTime.toFixed(2), "ms"));
            console.log("Minimum execution time: ".concat(minTime.toFixed(2), "ms"));
            console.log("Maximum execution time: ".concat(maxTime.toFixed(2), "ms"));
        }
        console.log('\n===== END OF RESULTS =====');
    };
    /**
     * テスト結果をクリアする
     */
    RecommendationProfiler.prototype.clearResults = function () {
        this.results = [];
    };
    return RecommendationProfiler;
}());
exports.RecommendationProfiler = RecommendationProfiler;
/**
 * パフォーマンステストのシナリオを実行する
 * @param userId ユーザーID
 */
var runRecommendationPerformanceTest = function (userId) { return __awaiter(void 0, void 0, void 0, function () {
    var profiler;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                profiler = new RecommendationProfiler();
                console.log('Starting recommendation performance test...');
                // シナリオ1: 基本的なレコメンデーション取得
                return [4 /*yield*/, profiler.runProfileTest('基本取得', {
                        userId: userId,
                        limit: 10
                    })];
            case 1:
                // シナリオ1: 基本的なレコメンデーション取得
                _a.sent();
                // シナリオ2: 多数の商品を取得
                return [4 /*yield*/, profiler.runProfileTest('大量取得', {
                        userId: userId,
                        limit: 50
                    })];
            case 2:
                // シナリオ2: 多数の商品を取得
                _a.sent();
                // シナリオ3: 除外IDあり
                return [4 /*yield*/, profiler.runProfileTest('除外ID有', {
                        userId: userId,
                        limit: 10,
                        excludeIds: [
                            'product1', 'product2', 'product3', 'product4', 'product5',
                            'product6', 'product7', 'product8', 'product9', 'product10',
                        ]
                    })];
            case 3:
                // シナリオ3: 除外IDあり
                _a.sent();
                // シナリオ4: 連続実行による差（キャッシュ効果の確認）
                return [4 /*yield*/, profiler.runProfileTest('連続実行1', { userId: userId, limit: 10 })];
            case 4:
                // シナリオ4: 連続実行による差（キャッシュ効果の確認）
                _a.sent();
                return [4 /*yield*/, profiler.runProfileTest('連続実行2', { userId: userId, limit: 10 })];
            case 5:
                _a.sent();
                return [4 /*yield*/, profiler.runProfileTest('連続実行3', { userId: userId, limit: 10 })];
            case 6:
                _a.sent();
                // 結果出力
                profiler.printResults();
                return [2 /*return*/];
        }
    });
}); };
exports.runRecommendationPerformanceTest = runRecommendationPerformanceTest;
