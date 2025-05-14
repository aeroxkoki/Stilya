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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleImageLoadError = exports.clearMemoryCache = exports.useImagePrefetch = exports.cleanImageCache = exports.getImageCacheSize = exports.getOptimizedImageUrl = exports.cacheImage = exports.getImageCachePath = exports.getImageCacheKey = void 0;
var react_native_1 = require("react-native");
var react_1 = require("react");
var react_native_2 = require("react-native");
var FileSystem = __importStar(require("expo-file-system"));
var react_native_toast_message_1 = __importDefault(require("react-native-toast-message"));
// プラットフォームに応じた最適なキャッシュディレクトリを選択
var CACHE_FOLDER = "".concat(FileSystem.cacheDirectory, "image_cache/");
// 最適化設定情報
var IMAGE_QUALITY = 0.8; // 画像品質（0.0～1.0）
var CACHE_TIMEOUT = 7 * 24 * 60 * 60 * 1000; // 1週間キャッシュ保持
var MAX_CACHE_SIZE = 300 * 1024 * 1024; // 300MB キャッシュサイズ上限
var LOW_MEMORY_CACHE_SIZE = 100 * 1024 * 1024; // 100MB (低メモリデバイス用)
/**
 * 画像URLをキャッシュファイル名に変換する
 */
var getImageCacheKey = function (url) {
    if (!url)
        return '';
    try {
        // URLを一意のファイル名に変換（ハッシュ関数の代わり）
        var filename = url
            .replace(/[^a-zA-Z0-9]/g, '_') // 非英数字をアンダースコアに
            .replace(/__+/g, '_') // 複数のアンダースコアを1つに
            .slice(0, 200); // 長すぎるファイル名を防止
        return "".concat(filename, ".jpg");
    }
    catch (error) {
        console.error("Error generating cache key for URL: ".concat(url), error);
        // フォールバックとして単純なランダム文字列を返す
        return "fallback_".concat(Date.now(), "_").concat(Math.random().toString(36).substring(2, 10), ".jpg");
    }
};
exports.getImageCacheKey = getImageCacheKey;
/**
 * 画像のキャッシュパスを取得
 */
var getImageCachePath = function (url) {
    if (!url)
        return '';
    return "".concat(CACHE_FOLDER).concat((0, exports.getImageCacheKey)(url));
};
exports.getImageCachePath = getImageCachePath;
/**
 * 画像を最適化してキャッシュディレクトリに保存する
 */
var cacheImage = function (url) { return __awaiter(void 0, void 0, void 0, function () {
    var cacheFilePath, fileInfo, now, fileTimestamp, downloadOptions, downloadPromise, timeoutPromise, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!url)
                    return [2 /*return*/, ''];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 7, , 8]);
                // キャッシュディレクトリの作成
                return [4 /*yield*/, FileSystem.makeDirectoryAsync(CACHE_FOLDER, {
                        intermediates: true
                    }).catch(function () { })];
            case 2:
                // キャッシュディレクトリの作成
                _a.sent(); // ディレクトリが既に存在する場合のエラーを無視
                cacheFilePath = (0, exports.getImageCachePath)(url);
                return [4 /*yield*/, FileSystem.getInfoAsync(cacheFilePath)];
            case 3:
                fileInfo = _a.sent();
                if (!(fileInfo.exists && fileInfo.modificationTime)) return [3 /*break*/, 5];
                now = Date.now();
                fileTimestamp = fileInfo.modificationTime * 1000;
                if (now - fileTimestamp < CACHE_TIMEOUT) {
                    return [2 /*return*/, cacheFilePath];
                }
                // 期限切れの場合は削除して再ダウンロード
                return [4 /*yield*/, FileSystem.deleteAsync(cacheFilePath, { idempotent: true })
                        .catch(function (e) { return console.log('Error deleting expired cache:', e); })];
            case 4:
                // 期限切れの場合は削除して再ダウンロード
                _a.sent();
                _a.label = 5;
            case 5:
                downloadOptions = {
                    md5: false,
                    cache: true,
                    headers: {
                        'Cache-Control': 'max-age=31536000',
                    }
                };
                downloadPromise = FileSystem.downloadAsync(url, cacheFilePath, downloadOptions);
                timeoutPromise = new Promise(function (_, reject) {
                    setTimeout(function () { return reject(new Error('Download timeout')); }, 10000);
                });
                // Promise.raceでタイムアウト処理
                return [4 /*yield*/, Promise.race([downloadPromise, timeoutPromise])];
            case 6:
                // Promise.raceでタイムアウト処理
                _a.sent();
                return [2 /*return*/, cacheFilePath];
            case 7:
                error_1 = _a.sent();
                console.error("Error caching image ".concat(url, ":"), error_1);
                // ダウンロード失敗時は元のURLを返す
                if (__DEV__) {
                    console.log("Falling back to direct URL: ".concat(url));
                }
                return [2 /*return*/, url];
            case 8: return [2 /*return*/];
        }
    });
}); };
exports.cacheImage = cacheImage;
/**
 * 画像URLを解像度に応じて最適化する
 * ※CDNなどでURLベースの解像度指定に対応している場合に使用
 */
var getOptimizedImageUrl = function (url, width, height) {
    if (!url)
        return '';
    // 画面の解像度に基づいて最適なサイズを計算
    var screenScale = react_native_2.PixelRatio.get();
    var optimizedWidth = width ? Math.round(width * screenScale) : undefined;
    var optimizedHeight = height ? Math.round(height * screenScale) : undefined;
    try {
        // URLパース
        var urlObj = new URL(url);
        // CDNサービスのパターンをチェック
        if (urlObj.hostname.includes('cloudinary.com') && optimizedWidth && optimizedHeight) {
            // Cloudinaryのリサイズパラメータ
            return url.replace('/upload/', "/upload/w_".concat(optimizedWidth, ",h_").concat(optimizedHeight, ",q_").concat(IMAGE_QUALITY * 100, "/"));
        }
        else if (urlObj.hostname.includes('imgix.net') && optimizedWidth) {
            // imgixのリサイズパラメータ
            urlObj.searchParams.append('w', optimizedWidth.toString());
            urlObj.searchParams.append('q', (IMAGE_QUALITY * 100).toString());
            return urlObj.toString();
        }
        else if (urlObj.hostname.includes('images.rakuten.co.jp') && optimizedWidth) {
            // 楽天画像APIのリサイズパラメータ
            if (url.includes('?')) {
                return "".concat(url, "&ex=").concat(optimizedWidth, "x0");
            }
            else {
                return "".concat(url, "?ex=").concat(optimizedWidth, "x0");
            }
        }
        else if (urlObj.hostname.includes('images-amazon.com') && optimizedWidth) {
            // Amazon画像のリサイズパラメータ
            return url.replace(/\._[^.]*_\./, "._SL".concat(optimizedWidth, "_AC_"));
        }
    }
    catch (e) {
        // URLパース失敗時はそのまま返す
        if (__DEV__) {
            console.warn("Error optimizing URL ".concat(url, ":"), e);
        }
    }
    // 対応していない場合は元のURLをそのまま返す
    return url;
};
exports.getOptimizedImageUrl = getOptimizedImageUrl;
/**
 * キャッシュサイズを取得する
 */
var getImageCacheSize = function () { return __awaiter(void 0, void 0, void 0, function () {
    var cacheExists, files, totalSize, BATCH_SIZE, i, batch, sizePromises, sizes, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 8, , 9]);
                return [4 /*yield*/, FileSystem.getInfoAsync(CACHE_FOLDER)];
            case 1:
                cacheExists = _a.sent();
                if (!cacheExists.exists)
                    return [2 /*return*/, 0];
                return [4 /*yield*/, FileSystem.readDirectoryAsync(CACHE_FOLDER)];
            case 2:
                files = _a.sent();
                totalSize = 0;
                BATCH_SIZE = 20;
                i = 0;
                _a.label = 3;
            case 3:
                if (!(i < files.length)) return [3 /*break*/, 7];
                batch = files.slice(i, i + BATCH_SIZE);
                sizePromises = batch.map(function (file) { return __awaiter(void 0, void 0, void 0, function () {
                    var filePath, fileInfo;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                filePath = "".concat(CACHE_FOLDER).concat(file);
                                return [4 /*yield*/, FileSystem.getInfoAsync(filePath)];
                            case 1:
                                fileInfo = _a.sent();
                                return [2 /*return*/, fileInfo.exists && fileInfo.size ? fileInfo.size : 0];
                        }
                    });
                }); });
                return [4 /*yield*/, Promise.all(sizePromises)];
            case 4:
                sizes = _a.sent();
                totalSize += sizes.reduce(function (sum, size) { return sum + size; }, 0);
                if (!(i + BATCH_SIZE < files.length)) return [3 /*break*/, 6];
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 0); })];
            case 5:
                _a.sent();
                _a.label = 6;
            case 6:
                i += BATCH_SIZE;
                return [3 /*break*/, 3];
            case 7: return [2 /*return*/, totalSize];
            case 8:
                error_2 = _a.sent();
                console.error('Error getting cache size:', error_2);
                return [2 /*return*/, 0];
            case 9: return [2 /*return*/];
        }
    });
}); };
exports.getImageCacheSize = getImageCacheSize;
/**
 * キャッシュ期限切れの画像を削除する
 */
var cleanImageCache = function () {
    var args_1 = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args_1[_i] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (force) {
        if (force === void 0) { force = false; }
        return __generator(this, function (_a) {
            try {
                // オフロードタスクとして実行（UIスレッドをブロックしない）
                react_native_2.InteractionManager.runAfterInteractions(function () { return __awaiter(void 0, void 0, void 0, function () {
                    var cacheExists, files, now, fileInfos, BATCH_SIZE, i, batch, batchInfos, filesToDelete, i, deleteBatch, remainingFiles, totalSize, cacheLimit, sizeToFree, _loop_1, _i, remainingFiles_1, file, state_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, FileSystem.getInfoAsync(CACHE_FOLDER)];
                            case 1:
                                cacheExists = _a.sent();
                                if (!!cacheExists.exists) return [3 /*break*/, 3];
                                return [4 /*yield*/, FileSystem.makeDirectoryAsync(CACHE_FOLDER, { intermediates: true })
                                        .catch(function () { })];
                            case 2:
                                _a.sent();
                                return [2 /*return*/];
                            case 3: return [4 /*yield*/, FileSystem.readDirectoryAsync(CACHE_FOLDER)];
                            case 4:
                                files = _a.sent();
                                now = Date.now();
                                if (files.length === 0)
                                    return [2 /*return*/];
                                fileInfos = [];
                                BATCH_SIZE = 20;
                                i = 0;
                                _a.label = 5;
                            case 5:
                                if (!(i < files.length)) return [3 /*break*/, 9];
                                batch = files.slice(i, i + BATCH_SIZE);
                                return [4 /*yield*/, Promise.all(batch.map(function (file) { return __awaiter(void 0, void 0, void 0, function () {
                                        var filePath, fileInfo;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    filePath = "".concat(CACHE_FOLDER).concat(file);
                                                    return [4 /*yield*/, FileSystem.getInfoAsync(filePath)];
                                                case 1:
                                                    fileInfo = _a.sent();
                                                    if (fileInfo.exists && fileInfo.modificationTime) {
                                                        return [2 /*return*/, {
                                                                path: filePath,
                                                                timestamp: fileInfo.modificationTime * 1000,
                                                                size: fileInfo.size || 0
                                                            }];
                                                    }
                                                    return [2 /*return*/, null];
                                            }
                                        });
                                    }); }))];
                            case 6:
                                batchInfos = _a.sent();
                                // null以外の結果をfileInfosに追加
                                fileInfos = fileInfos.concat(batchInfos.filter(Boolean));
                                if (!(i + BATCH_SIZE < files.length)) return [3 /*break*/, 8];
                                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 0); })];
                            case 7:
                                _a.sent();
                                _a.label = 8;
                            case 8:
                                i += BATCH_SIZE;
                                return [3 /*break*/, 5];
                            case 9:
                                filesToDelete = force
                                    ? fileInfos
                                    : fileInfos.filter(function (file) { return now - file.timestamp > CACHE_TIMEOUT; });
                                i = 0;
                                _a.label = 10;
                            case 10:
                                if (!(i < filesToDelete.length)) return [3 /*break*/, 14];
                                deleteBatch = filesToDelete.slice(i, i + BATCH_SIZE);
                                return [4 /*yield*/, Promise.all(deleteBatch.map(function (file) {
                                        return FileSystem.deleteAsync(file.path, { idempotent: true }).catch(function (e) {
                                            return console.warn("Failed to delete cache file ".concat(file.path, ":"), e);
                                        });
                                    }))];
                            case 11:
                                _a.sent();
                                if (!(i + BATCH_SIZE < filesToDelete.length)) return [3 /*break*/, 13];
                                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 0); })];
                            case 12:
                                _a.sent();
                                _a.label = 13;
                            case 13:
                                i += BATCH_SIZE;
                                return [3 /*break*/, 10];
                            case 14:
                                remainingFiles = force
                                    ? []
                                    : fileInfos.filter(function (file) { return now - file.timestamp <= CACHE_TIMEOUT; });
                                totalSize = remainingFiles.reduce(function (total, file) { return total + file.size; }, 0);
                                return [4 /*yield*/, isLowMemoryDevice()];
                            case 15:
                                cacheLimit = (_a.sent()) ? LOW_MEMORY_CACHE_SIZE : MAX_CACHE_SIZE;
                                if (!(totalSize > cacheLimit)) return [3 /*break*/, 19];
                                // 最終アクセス日時の古い順にソート
                                remainingFiles.sort(function (a, b) { return a.timestamp - b.timestamp; });
                                sizeToFree = totalSize - cacheLimit;
                                _loop_1 = function (file) {
                                    return __generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0:
                                                if (sizeToFree <= 0)
                                                    return [2 /*return*/, "break"];
                                                return [4 /*yield*/, FileSystem.deleteAsync(file.path, { idempotent: true })
                                                        .catch(function (e) { return console.warn("Failed to delete cache file ".concat(file.path, ":"), e); })];
                                            case 1:
                                                _b.sent();
                                                sizeToFree -= file.size;
                                                // 処理が長時間になる場合はタイムスライシング
                                                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 0); })];
                                            case 2:
                                                // 処理が長時間になる場合はタイムスライシング
                                                _b.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                };
                                _i = 0, remainingFiles_1 = remainingFiles;
                                _a.label = 16;
                            case 16:
                                if (!(_i < remainingFiles_1.length)) return [3 /*break*/, 19];
                                file = remainingFiles_1[_i];
                                return [5 /*yield**/, _loop_1(file)];
                            case 17:
                                state_1 = _a.sent();
                                if (state_1 === "break")
                                    return [3 /*break*/, 19];
                                _a.label = 18;
                            case 18:
                                _i++;
                                return [3 /*break*/, 16];
                            case 19:
                                if (__DEV__) {
                                    console.log("[CACHE] Cleaned up ".concat(filesToDelete.length, " files, ").concat(remainingFiles.length, " remaining"));
                                }
                                return [2 /*return*/];
                        }
                    });
                }); });
            }
            catch (error) {
                console.error('Error cleaning image cache:', error);
            }
            return [2 /*return*/];
        });
    });
};
exports.cleanImageCache = cleanImageCache;
/**
 * ローメモリデバイスの判定
 */
var isLowMemoryDevice = function () { return __awaiter(void 0, void 0, void 0, function () {
    var isLowEndDevice;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('./performance/memory')); })];
            case 1:
                isLowEndDevice = (_a.sent()).isLowEndDevice;
                return [4 /*yield*/, isLowEndDevice()];
            case 2: return [2 /*return*/, _a.sent()];
        }
    });
}); };
/**
 * 画像プリフェッチのカスタムフック（FlatListなどで先読みに使用）
 */
var useImagePrefetch = function () {
    var _a = (0, react_1.useState)(false), isPrefetching = _a[0], setIsPrefetching = _a[1];
    var isMounted = (0, react_1.useRef)(true);
    var prefetchTimeoutRef = (0, react_1.useRef)(null);
    var prefetchErrorCount = (0, react_1.useRef)(0);
    // コンポーネントのアンマウント時にクリーンアップ
    (0, react_1.useEffect)(function () {
        return function () {
            isMounted.current = false;
            if (prefetchTimeoutRef.current) {
                clearTimeout(prefetchTimeoutRef.current);
            }
        };
    }, []);
    var prefetchImages = (0, react_1.useCallback)(function (urls_1) {
        var args_1 = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args_1[_i - 1] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([urls_1], args_1, true), void 0, function (urls, priority) {
            var validUrls, highPriorityUrls, lowPriorityUrls_1, prefetchPromises, error_3;
            var _a;
            if (priority === void 0) { priority = false; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!urls || urls.length === 0)
                            return [2 /*return*/];
                        validUrls = __spreadArray([], new Set(urls.filter(function (url) { return !!url; })), true);
                        if (validUrls.length === 0)
                            return [2 /*return*/];
                        setIsPrefetching(true);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, 5, 6]);
                        highPriorityUrls = priority ? validUrls.slice(0, 5) : [];
                        lowPriorityUrls_1 = priority ? validUrls.slice(5) : validUrls;
                        if (!(highPriorityUrls.length > 0)) return [3 /*break*/, 3];
                        prefetchPromises = highPriorityUrls.map(function (url) {
                            return react_native_1.Image.prefetch(url)
                                .catch(function (e) {
                                prefetchErrorCount.current += 1;
                                console.warn("Failed to prefetch high priority image: ".concat(url), e);
                                return false;
                            });
                        });
                        return [4 /*yield*/, Promise.all(prefetchPromises)];
                    case 2:
                        _b.sent();
                        // エラーが多すぎる場合はユーザーに通知（オプション）
                        if (prefetchErrorCount.current > 5 && prefetchErrorCount.current > highPriorityUrls.length / 2) {
                            // ネットワーク接続の問題の可能性を示唆
                            (_a = react_native_toast_message_1.default === null || react_native_toast_message_1.default === void 0 ? void 0 : react_native_toast_message_1.default.show) === null || _a === void 0 ? void 0 : _a.call(react_native_toast_message_1.default, ({
                                type: 'info',
                                text1: '画像の読み込みに問題が発生しています',
                                text2: 'ネットワーク接続を確認してください',
                                position: 'bottom',
                                visibilityTime: 3000,
                            }));
                            prefetchErrorCount.current = 0; // カウンターリセット
                        }
                        _b.label = 3;
                    case 3:
                        // 低プライオリティ画像を遅延プリフェッチ（UIスレッドをブロックしない）
                        if (lowPriorityUrls_1.length > 0) {
                            prefetchTimeoutRef.current = setTimeout(function () {
                                react_native_2.InteractionManager.runAfterInteractions(function () {
                                    if (!isMounted.current)
                                        return;
                                    // バッチごとに処理（全てを一度に処理しない）
                                    var batchSize = 10;
                                    var currentBatch = 0;
                                    var processBatch = function () {
                                        if (!isMounted.current)
                                            return;
                                        var start = currentBatch * batchSize;
                                        var end = Math.min(start + batchSize, lowPriorityUrls_1.length);
                                        var batch = lowPriorityUrls_1.slice(start, end);
                                        batch.forEach(function (url) {
                                            react_native_1.Image.prefetch(url).catch(function (e) {
                                                if (__DEV__) {
                                                    console.log("Failed to prefetch low priority image: ".concat(url), e);
                                                }
                                            });
                                        });
                                        currentBatch++;
                                        // 次のバッチがある場合は遅延実行
                                        if (start + batchSize < lowPriorityUrls_1.length) {
                                            setTimeout(processBatch, 300);
                                        }
                                    };
                                    processBatch();
                                });
                            }, 200);
                        }
                        return [3 /*break*/, 6];
                    case 4:
                        error_3 = _b.sent();
                        console.error('Error prefetching images:', error_3);
                        return [3 /*break*/, 6];
                    case 5:
                        if (isMounted.current) {
                            setIsPrefetching(false);
                        }
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    }, []);
    var cancelPrefetching = (0, react_1.useCallback)(function () {
        if (prefetchTimeoutRef.current) {
            clearTimeout(prefetchTimeoutRef.current);
            prefetchTimeoutRef.current = null;
        }
        setIsPrefetching(false);
        prefetchErrorCount.current = 0;
    }, []);
    return {
        prefetchImages: prefetchImages,
        cancelPrefetching: cancelPrefetching,
        isPrefetching: isPrefetching
    };
};
exports.useImagePrefetch = useImagePrefetch;
/**
 * メモリキャッシュをクリアする
 */
var clearMemoryCache = function () {
    try {
        // ExpoImage.clearMemoryCache();
        // この機能は標準のReact Native Imageでは利用できないかもしれません
        console.log('Memory cache cleared');
    }
    catch (e) {
        console.error('Failed to clear memory cache:', e);
    }
};
exports.clearMemoryCache = clearMemoryCache;
/**
 * 画像読み込みエラー処理のための関数
 * @param url 画像URL
 * @param onError エラーコールバック
 */
var handleImageLoadError = function (url, onError) {
    console.warn("Image load error: ".concat(url));
    // エラーが発生した画像のキャッシュを削除
    try {
        var cachePath = (0, exports.getImageCachePath)(url);
        if (cachePath) {
            FileSystem.deleteAsync(cachePath, { idempotent: true })
                .catch(function (e) { return console.log('Error deleting cached image:', e); });
        }
    }
    catch (e) {
        console.error('Error handling image load error:', e);
    }
    // コールバックが提供されている場合は実行
    if (onError) {
        onError();
    }
};
exports.handleImageLoadError = handleImageLoadError;
