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
exports.setupMemoryWarningListener = exports.logMemoryUsage = exports.forceCleanupMemory = exports.autoCleanupMemoryIfNeeded = exports.isLowEndDevice = exports.checkMemoryWarningLevel = exports.getMemoryUsage = void 0;
var react_native_1 = require("react-native");
var imageUtils_1 = require("../imageUtils");
// メモリ使用量しきい値（MB）
var MEMORY_WARNING_THRESHOLD = 150; // MB
var LOW_MEMORY_THRESHOLD = 80; // MB
/**
 * アプリのメモリ使用量を取得（クロスプラットフォーム対応）
 * @returns メモリ使用量（MB）または-1（非対応）
 */
var getMemoryUsage = function () { return __awaiter(void 0, void 0, void 0, function () {
    var memory, PerformanceMonitor, memoryInfo, totalMem, availableMem, usedMem, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 7, , 8]);
                if (!(react_native_1.Platform.OS === 'ios')) return [3 /*break*/, 3];
                memory = (react_native_1.NativeModules.PerfMonitor || {}).memory;
                if (!(memory === null || memory === void 0 ? void 0 : memory.currentMemoryUsage)) return [3 /*break*/, 2];
                return [4 /*yield*/, memory.currentMemoryUsage()];
            case 1: return [2 /*return*/, (_a.sent()) / (1024 * 1024)]; // バイトからMBに変換
            case 2: return [3 /*break*/, 6];
            case 3:
                if (!(react_native_1.Platform.OS === 'android')) return [3 /*break*/, 6];
                PerformanceMonitor = react_native_1.NativeModules.PerformanceMonitor;
                if (!(PerformanceMonitor === null || PerformanceMonitor === void 0 ? void 0 : PerformanceMonitor.getAvailableMemory)) return [3 /*break*/, 5];
                return [4 /*yield*/, PerformanceMonitor.getAvailableMemory()];
            case 4:
                memoryInfo = _a.sent();
                if (memoryInfo) {
                    totalMem = memoryInfo.totalMem, availableMem = memoryInfo.availableMem;
                    usedMem = totalMem - availableMem;
                    return [2 /*return*/, usedMem / (1024 * 1024)]; // バイトからMBに変換
                }
                _a.label = 5;
            case 5: 
            // ネイティブモジュールが利用できない場合は-1を返す
            return [2 /*return*/, -1];
            case 6: return [3 /*break*/, 8];
            case 7:
                e_1 = _a.sent();
                console.error('Failed to get memory usage:', e_1);
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/, -1];
        }
    });
}); };
exports.getMemoryUsage = getMemoryUsage;
/**
 * メモリ使用量が一定のしきい値を超えたかどうかをチェック
 * @returns 警告レベル
 */
var checkMemoryWarningLevel = function () { return __awaiter(void 0, void 0, void 0, function () {
    var memoryUsage;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.getMemoryUsage)()];
            case 1:
                memoryUsage = _a.sent();
                if (memoryUsage === -1) {
                    // メモリ測定不可の場合はモバイル環境(ios/android)で実行されていない可能性があり、
                    // そのような場合は常に'normal'を返す
                    return [2 /*return*/, 'normal'];
                }
                if (memoryUsage > MEMORY_WARNING_THRESHOLD) {
                    return [2 /*return*/, 'critical'];
                }
                else if (memoryUsage > LOW_MEMORY_THRESHOLD) {
                    return [2 /*return*/, 'warning'];
                }
                return [2 /*return*/, 'normal'];
        }
    });
}); };
exports.checkMemoryWarningLevel = checkMemoryWarningLevel;
/**
 * デバイスがローエンドかどうかを判定
 * パフォーマンス最適化の判断に使用
 */
var isLowEndDevice = function () { return __awaiter(void 0, void 0, void 0, function () {
    var PerformanceMonitor, deviceInfo, processorCount, totalMemory, e_2, memoryUsage;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(react_native_1.Platform.OS === 'android')) return [3 /*break*/, 5];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                PerformanceMonitor = react_native_1.NativeModules.PerformanceMonitor;
                if (!(PerformanceMonitor === null || PerformanceMonitor === void 0 ? void 0 : PerformanceMonitor.getDeviceInfo)) return [3 /*break*/, 3];
                return [4 /*yield*/, PerformanceMonitor.getDeviceInfo()];
            case 2:
                deviceInfo = _a.sent();
                // プロセッサコア数・総メモリ量からローエンドデバイスを判定
                if (deviceInfo) {
                    processorCount = deviceInfo.processorCount, totalMemory = deviceInfo.totalMemory;
                    // 4GB未満のメモリ、または4コア以下のCPUをローエンドとみなす
                    return [2 /*return*/, (processorCount <= 4 ||
                            (totalMemory / (1024 * 1024 * 1024)) < 4)];
                }
                _a.label = 3;
            case 3: return [3 /*break*/, 5];
            case 4:
                e_2 = _a.sent();
                console.error('Failed to determine device capability:', e_2);
                return [3 /*break*/, 5];
            case 5: return [4 /*yield*/, (0, exports.getMemoryUsage)()];
            case 6:
                memoryUsage = _a.sent();
                if (memoryUsage === -1)
                    return [2 /*return*/, false]; // 判定不能
                // メモリ使用量が少ないデバイスはローエンドとみなす
                return [2 /*return*/, memoryUsage < 50]; // 50MB未満はおそらく古いデバイス
        }
    });
}); };
exports.isLowEndDevice = isLowEndDevice;
/**
 * メモリ使用量が高い場合に自動的にクリーンアップを行う
 */
var autoCleanupMemoryIfNeeded = function () { return __awaiter(void 0, void 0, void 0, function () {
    var warningLevel;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.checkMemoryWarningLevel)()];
            case 1:
                warningLevel = _a.sent();
                if (warningLevel === 'critical') {
                    // UIスレッドをブロックしないようにする
                    react_native_1.InteractionManager.runAfterInteractions(function () {
                        console.log('[MEMORY] Critical memory usage detected, cleaning up...');
                        // 画像キャッシュをクリア
                        (0, imageUtils_1.clearMemoryCache)();
                        // 明示的なガベージコレクションを促す
                        if (global.gc) {
                            try {
                                global.gc();
                            }
                            catch (e) {
                                console.error('Failed to force garbage collection:', e);
                            }
                        }
                    });
                }
                else if (warningLevel === 'warning') {
                    console.log('[MEMORY] High memory usage detected');
                    // 警告レベルでは非表示の画像のみキャッシュをクリア
                    // この機能はReact Native Image APIには存在しないため、一旦コメントアウト
                    // if (Image.clearDiskCache) {
                    //   try {
                    //     await Image.clearDiskCache();
                    //   } catch (e) {
                    //     console.error('Failed to clear disk cache:', e);
                    //   }
                    // }
                }
                return [2 /*return*/];
        }
    });
}); };
exports.autoCleanupMemoryIfNeeded = autoCleanupMemoryIfNeeded;
/**
 * キャッシュとリソースをクリアする
 */
var forceCleanupMemory = function () {
    try {
        // メモリキャッシュクリア
        (0, imageUtils_1.clearMemoryCache)();
        // ディスクキャッシュのクリア
        // この機能はReact Native Image APIには存在しないため、一旦コメントアウト
        // if (Image.clearDiskCache) {
        //   Image.clearDiskCache().catch(e => 
        //     console.error('Failed to clear disk cache:', e)
        //   );
        // }
        // タイムアウト後に追加クリーンアップ
        setTimeout(function () {
            try {
                // ガベージコレクションを促進
                if (global.gc) {
                    global.gc();
                }
                console.log('[MEMORY] Memory cleanup completed');
            }
            catch (e) {
                console.error('Failed to complete cleanup:', e);
            }
        }, 500);
    }
    catch (e) {
        console.error('Failed to cleanup memory:', e);
    }
};
exports.forceCleanupMemory = forceCleanupMemory;
/**
 * メモリ使用量をログに記録する（デバッグ用）
 */
var logMemoryUsage = function () { return __awaiter(void 0, void 0, void 0, function () {
    var memoryUsage;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!__DEV__)
                    return [2 /*return*/];
                return [4 /*yield*/, (0, exports.getMemoryUsage)()];
            case 1:
                memoryUsage = _a.sent();
                if (memoryUsage !== -1) {
                    console.log("[MEMORY] Current memory usage: ".concat(memoryUsage.toFixed(2), " MB"));
                }
                else {
                    console.log('[MEMORY] Unable to measure memory usage on this platform');
                }
                return [2 /*return*/];
        }
    });
}); };
exports.logMemoryUsage = logMemoryUsage;
/**
 * メモリ警告イベントのリスナーを設定
 */
var setupMemoryWarningListener = function () {
    var _a;
    if (react_native_1.Platform.OS === 'ios' && ((_a = react_native_1.NativeModules.PerfMonitor) === null || _a === void 0 ? void 0 : _a.startObservingMemoryWarnings)) {
        try {
            // iOSのメモリ警告イベントを監視
            react_native_1.NativeModules.PerfMonitor.startObservingMemoryWarnings();
            // クリーンアップ関数を返す
            return function () {
                var _a;
                if ((_a = react_native_1.NativeModules.PerfMonitor) === null || _a === void 0 ? void 0 : _a.stopObservingMemoryWarnings) {
                    react_native_1.NativeModules.PerfMonitor.stopObservingMemoryWarnings();
                }
            };
        }
        catch (e) {
            console.error('Failed to setup memory warning listener:', e);
        }
    }
    // 空のクリーンアップ関数を返す
    return function () { };
};
exports.setupMemoryWarningListener = setupMemoryWarningListener;
