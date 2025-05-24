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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRecordClick = void 0;
var react_1 = require("react");
var react_native_1 = require("react-native");
var clickService_1 = require("@/services/clickService");
var analyticsService_1 = require("@/services/analyticsService");
/**
 * 商品クリックの記録とトラッキングを行うためのフック
 */
var useRecordClick = function (userId) {
    var _a = (0, react_1.useState)(false), loading = _a[0], setLoading = _a[1];
    var _b = (0, react_1.useState)(null), error = _b[0], setError = _b[1];
    /**
     * 商品クリックを記録する
     * - clickServiceを使ってDBにログを保存
     * - analyticsServiceを使ってイベント分析用のデータを送信
     *
     * @param productId 商品ID
     * @param product 商品データ（オプショナル、アナリティクス用）
     */
    var recordProductClick = function (productId, product) { return __awaiter(void 0, void 0, void 0, function () {
        var productData, err_1, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!userId) {
                        console.log('Cannot record click: No user ID provided');
                        return [2 /*return*/, false];
                    }
                    setLoading(true);
                    setError(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    // Supabaseにクリックログを保存
                    return [4 /*yield*/, (0, clickService_1.recordClick)(userId, productId)];
                case 2:
                    // Supabaseにクリックログを保存
                    _a.sent();
                    productData = product ? {
                        title: product.title,
                        brand: product.brand,
                        price: product.price,
                        category: product.category,
                        source: product.source,
                    } : { id: productId };
                    return [4 /*yield*/, (0, analyticsService_1.trackProductClick)(productId, __assign(__assign({}, productData), { platform: react_native_1.Platform.OS, timestamp: new Date().toISOString() }), userId)];
                case 3:
                    _a.sent();
                    setLoading(false);
                    return [2 /*return*/, true];
                case 4:
                    err_1 = _a.sent();
                    errorMessage = err_1 instanceof Error ? err_1.message : 'Unknown error';
                    console.error('Failed to record product click:', errorMessage);
                    setError("\u30AF\u30EA\u30C3\u30AF\u306E\u8A18\u9332\u306B\u5931\u6557\u3057\u307E\u3057\u305F: ".concat(errorMessage));
                    setLoading(false);
                    return [2 /*return*/, false];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return {
        recordProductClick: recordProductClick,
        loading: loading,
        error: error,
    };
};
exports.useRecordClick = useRecordClick;
