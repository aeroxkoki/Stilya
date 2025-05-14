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
exports.handleError = exports.getApiErrorMessage = exports.getAuthErrorMessage = exports.env = exports.formatPrice = exports.getSimilarProducts = exports.formatErrorMessage = exports.getRandomTags = void 0;
var formatPrice_1 = __importDefault(require("./formatPrice"));
exports.formatPrice = formatPrice_1.default;
var errorUtils_1 = require("./errorUtils");
Object.defineProperty(exports, "getAuthErrorMessage", { enumerable: true, get: function () { return errorUtils_1.getAuthErrorMessage; } });
Object.defineProperty(exports, "getApiErrorMessage", { enumerable: true, get: function () { return errorUtils_1.getApiErrorMessage; } });
Object.defineProperty(exports, "handleError", { enumerable: true, get: function () { return errorUtils_1.handleError; } });
var env = __importStar(require("./env"));
exports.env = env;
// ランダムなタグを生成するヘルパー関数
var getRandomTags = function () {
    var inputs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        inputs[_i] = arguments[_i];
    }
    // 一般的なファッションタグ
    var commonTags = [
        'カジュアル', 'モード', 'ナチュラル', 'ストリート', 'クラシック', 'フェミニン',
        '春', '夏', '秋', '冬', 'おすすめ', 'トレンド', 'ベーシック', '定番',
        'コーデ', 'オフィス', 'デート', 'デイリー', 'リラックス', 'スポーティ'
    ];
    // 引数で渡された文字列をタグとして追加
    var tags = __spreadArray([], inputs, true).filter(Boolean);
    // 追加のランダムタグを選択（重複を避ける）
    var additionalTagsNeeded = Math.max(0, 5 - tags.length);
    if (additionalTagsNeeded > 0) {
        // すでに入っているタグを除外
        var availableTags = commonTags.filter(function (tag) { return !tags.includes(tag); });
        // ランダムに選択
        var shuffled = __spreadArray([], availableTags, true).sort(function () { return 0.5 - Math.random(); });
        tags.push.apply(tags, shuffled.slice(0, additionalTagsNeeded));
    }
    return tags;
};
exports.getRandomTags = getRandomTags;
// エラーメッセージのフォーマット
var formatErrorMessage = function (error) {
    if (!error)
        return '不明なエラーが発生しました';
    // すでに文字列の場合はそのまま返す
    if (typeof error === 'string')
        return error;
    // エラーオブジェクトからメッセージを抽出
    if (error.message)
        return error.message;
    // Supabaseの認証エラーの場合
    if (error.error_description)
        return error.error_description;
    // その他のケース
    return JSON.stringify(error);
};
exports.formatErrorMessage = formatErrorMessage;
// 類似商品を取得するヘルパー関数
var getSimilarProducts = function (product, allProducts, count) {
    if (count === void 0) { count = 3; }
    if (!product || !product.tags || !Array.isArray(allProducts) || allProducts.length === 0) {
        return [];
    }
    // 同じ商品を除外
    var otherProducts = allProducts.filter(function (p) { return p.id !== product.id; });
    // タグの一致度によって並べ替え
    var productsWithScore = otherProducts.map(function (p) {
        var _a;
        // タグの一致スコアを計算
        var matchingTags = ((_a = p.tags) === null || _a === void 0 ? void 0 : _a.filter(function (tag) {
            return product.tags.includes(tag);
        })) || [];
        return __assign(__assign({}, p), { score: matchingTags.length });
    });
    // スコアで降順ソート
    var sorted = productsWithScore.sort(function (a, b) { return b.score - a.score; });
    // 上位N件を返す
    return sorted.slice(0, count);
};
exports.getSimilarProducts = getSimilarProducts;
