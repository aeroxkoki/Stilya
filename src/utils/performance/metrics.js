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
exports.recordAppStartupTime = exports.useRenderMeasure = exports.getAllMetrics = exports.clearMetrics = exports.measureAsync = exports.measure = exports.endMeasure = exports.startMeasure = void 0;
var react_native_1 = require("react-native");
var react_1 = require("react");
// グローバルに保持するメトリクス（開発モードでのみ使用）
var metrics = [];
/**
 * パフォーマンスメトリクスの記録を開始
 * @param name メトリクス名
 * @param metadata 追加情報
 * @returns メトリクスID
 */
var startMeasure = function (name, metadata) {
    // 本番環境では計測しない
    if (!__DEV__)
        return '';
    var id = "".concat(name, "-").concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 5));
    metrics.push({
        name: name,
        startTime: performance.now(),
        metadata: metadata
    });
    return id;
};
exports.startMeasure = startMeasure;
/**
 * パフォーマンスメトリクスの記録を終了
 * @param id メトリクスID
 * @returns 計測結果（ミリ秒）
 */
var endMeasure = function (id) {
    // 本番環境では計測しない
    if (!__DEV__ || !id)
        return 0;
    var index = metrics.findIndex(function (metric) {
        return metric.name === id.split('-')[0] && !metric.endTime;
    });
    if (index === -1)
        return 0;
    var endTime = performance.now();
    var duration = endTime - metrics[index].startTime;
    metrics[index] = __assign(__assign({}, metrics[index]), { endTime: endTime, duration: duration });
    console.log("[PERF] ".concat(metrics[index].name, ": ").concat(duration.toFixed(2), "ms"));
    return duration;
};
exports.endMeasure = endMeasure;
/**
 * 特定の処理のパフォーマンスを計測する
 * @param callback 実行する関数
 * @param name メトリック名
 * @returns 関数の戻り値
 */
var measure = function (callback, name) {
    if (!__DEV__)
        return callback();
    var id = (0, exports.startMeasure)(name);
    var result = callback();
    (0, exports.endMeasure)(id);
    return result;
};
exports.measure = measure;
/**
 * 非同期処理のパフォーマンスを計測する
 * @param callback 実行する非同期関数
 * @param name メトリック名
 * @returns Promise
 */
var measureAsync = function (callback, name) { return __awaiter(void 0, void 0, void 0, function () {
    var id, result, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!__DEV__)
                    return [2 /*return*/, callback()];
                id = (0, exports.startMeasure)(name);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, callback()];
            case 2:
                result = _a.sent();
                (0, exports.endMeasure)(id);
                return [2 /*return*/, result];
            case 3:
                error_1 = _a.sent();
                (0, exports.endMeasure)(id);
                throw error_1;
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.measureAsync = measureAsync;
/**
 * すべてのメトリクスをクリア
 */
var clearMetrics = function () {
    if (!__DEV__)
        return;
    metrics.length = 0;
};
exports.clearMetrics = clearMetrics;
/**
 * すべてのメトリクスを取得
 */
var getAllMetrics = function () {
    if (!__DEV__)
        return [];
    return __spreadArray([], metrics, true);
};
exports.getAllMetrics = getAllMetrics;
/**
 * コンポーネントのレンダリング時間を計測するカスタムフック
 * @param componentName コンポーネント名
 */
var useRenderMeasure = function (componentName) {
    var renderCount = (0, react_1.useRef)(0);
    var lastRender = (0, react_1.useRef)(performance.now());
    (0, react_1.useEffect)(function () {
        if (!__DEV__)
            return;
        var currentTime = performance.now();
        var renderTime = currentTime - lastRender.current;
        renderCount.current += 1;
        // UIスレッドをブロックしないようにする
        react_native_1.InteractionManager.runAfterInteractions(function () {
            console.log("[RENDER] ".concat(componentName, " rendered in ").concat(renderTime.toFixed(2), "ms (count: ").concat(renderCount.current, ")"));
        });
        lastRender.current = currentTime;
    });
};
exports.useRenderMeasure = useRenderMeasure;
/**
 * アプリ起動時間を記録
 */
var recordAppStartupTime = function () {
    if (!__DEV__)
        return;
    // アプリ全体の起動時間を計測
    var startupTime = performance.now();
    react_native_1.InteractionManager.runAfterInteractions(function () {
        var totalTime = performance.now() - startupTime;
        console.log("[STARTUP] App is interactive in ".concat(totalTime.toFixed(2), "ms"));
        metrics.push({
            name: 'AppStartup',
            startTime: 0,
            endTime: totalTime,
            duration: totalTime
        });
    });
};
exports.recordAppStartupTime = recordAppStartupTime;
