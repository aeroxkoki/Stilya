"use strict";
/**
 * 商品データ同期バッチ処理
 *
 * このスクリプトは以下の処理を行います：
 * 1. LinkShareやA8.netなどのアフィリエイトAPIから商品データを取得
 * 2. 取得したデータを加工して、Supabaseのproductsテーブルに保存
 * 3. 一定期間で古くなったデータを削除
 *
 * 使用方法：
 * - 開発環境：`npm run sync-products`
 * - 本番環境：Supabase Edge Functionsとして登録し、定期実行するスケジューラを設定
 */
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
exports.syncProducts = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var axios_1 = __importDefault(require("axios"));
var dotenv_1 = __importDefault(require("dotenv"));
// 環境変数の読み込み
dotenv_1.default.config();
// Supabaseクライアントの作成
var supabaseUrl = process.env.SUPABASE_URL;
var supabaseKey = process.env.SUPABASE_SERVICE_KEY;
if (!supabaseUrl || !supabaseKey) {
    console.error('環境変数が設定されていません: SUPABASE_URL, SUPABASE_SERVICE_KEY');
    process.exit(1);
}
var supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
// LinkShare API設定
var linkShareApiKey = process.env.LINKSHARE_API_KEY;
var linkShareMerchantId = process.env.LINKSHARE_MERCHANT_ID;
if (!linkShareApiKey || !linkShareMerchantId) {
    console.error('環境変数が設定されていません: LINKSHARE_API_KEY, LINKSHARE_MERCHANT_ID');
    process.exit(1);
}
/**
 * LinkShare APIから商品データを取得
 */
function fetchProductsFromLinkShare(keyword_1) {
    return __awaiter(this, arguments, void 0, function (keyword, limit, category) {
        var url, params, response, error_1;
        if (limit === void 0) { limit = 20; }
        if (category === void 0) { category = ''; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    url = 'https://api.linksynergy.com/v1/search/products';
                    params = {
                        keyword: keyword,
                        cat: category,
                        max: limit,
                        merchandiseId: linkShareMerchantId,
                        apiKey: linkShareApiKey,
                    };
                    return [4 /*yield*/, axios_1.default.get(url, { params: params })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data.products || []];
                case 2:
                    error_1 = _a.sent();
                    console.error('LinkShare APIエラー:', error_1);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * 商品データを正規化して保存用フォーマットに変換
 */
function normalizeProduct(product, source) {
    var _a;
    // タグの抽出（カテゴリから一部を抽出）
    var extractedTags = [];
    if (product.category) {
        // カテゴリをタグに変換
        var categoryParts = product.category.split(' > ');
        extractedTags.push.apply(extractedTags, categoryParts);
    }
    // ブランド名を追加
    if (product.brand) {
        extractedTags.push(product.brand);
    }
    // 性別タグの抽出
    if (product.keywords) {
        if (product.keywords.includes('mens') || product.keywords.includes('男性')) {
            extractedTags.push('メンズ');
        }
        if (product.keywords.includes('womens') || product.keywords.includes('女性')) {
            extractedTags.push('レディース');
        }
    }
    // 重複を削除
    var uniqueTags = __spreadArray([], new Set(extractedTags), true);
    return {
        title: product.productName || 'Untitled',
        brand: product.brand || '',
        price: parseFloat(product.price) || 0,
        image_url: product.imageUrl || '',
        description: product.description || '',
        tags: uniqueTags,
        category: ((_a = product.category) === null || _a === void 0 ? void 0 : _a.split(' > ')[0]) || '',
        affiliate_url: product.productUrl || '',
        source: source,
        created_at: new Date().toISOString(),
    };
}
/**
 * 商品データをSupabaseに保存
 */
function saveProductsToSupabase(products) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, data, error, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, supabase
                            .from('products')
                            .upsert(products, { onConflict: 'affiliate_url' })];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error('Supabase保存エラー:', error);
                        return [2 /*return*/, false];
                    }
                    console.log("".concat(products.length, "\u4EF6\u306E\u5546\u54C1\u304C\u4FDD\u5B58\u3055\u308C\u307E\u3057\u305F"));
                    return [2 /*return*/, true];
                case 2:
                    error_2 = _b.sent();
                    console.error('Supabase保存エラー:', error_2);
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * 古い商品データを削除
 */
function deleteOldProducts() {
    return __awaiter(this, arguments, void 0, function (daysOld) {
        var date, dateString, _a, data, error, error_3;
        if (daysOld === void 0) { daysOld = 30; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    date = new Date();
                    date.setDate(date.getDate() - daysOld);
                    dateString = date.toISOString();
                    return [4 /*yield*/, supabase
                            .from('products')
                            .delete()
                            .lt('created_at', dateString)];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error('古いデータの削除エラー:', error);
                        return [2 /*return*/, false];
                    }
                    console.log("".concat(daysOld, "\u65E5\u3088\u308A\u53E4\u3044\u5546\u54C1\u304C\u524A\u9664\u3055\u308C\u307E\u3057\u305F"));
                    return [2 /*return*/, true];
                case 2:
                    error_3 = _b.sent();
                    console.error('古いデータの削除エラー:', error_3);
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * メイン処理
 */
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var mensFashionProducts, womensFashionProducts, normalizedMensProducts, normalizedWomensProducts, allProducts, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    console.log('商品データ同期を開始します...');
                    return [4 /*yield*/, fetchProductsFromLinkShare('mens fashion', 50, 'クロージング')];
                case 1:
                    mensFashionProducts = _a.sent();
                    return [4 /*yield*/, fetchProductsFromLinkShare('womens fashion', 50, 'クロージング')];
                case 2:
                    womensFashionProducts = _a.sent();
                    normalizedMensProducts = mensFashionProducts.map(function (p) { return normalizeProduct(p, 'linkshare'); });
                    normalizedWomensProducts = womensFashionProducts.map(function (p) { return normalizeProduct(p, 'linkshare'); });
                    allProducts = __spreadArray(__spreadArray([], normalizedMensProducts, true), normalizedWomensProducts, true);
                    return [4 /*yield*/, saveProductsToSupabase(allProducts)];
                case 3:
                    _a.sent();
                    // 30日以上前の古いデータを削除
                    return [4 /*yield*/, deleteOldProducts(30)];
                case 4:
                    // 30日以上前の古いデータを削除
                    _a.sent();
                    console.log('商品データ同期が完了しました');
                    return [3 /*break*/, 6];
                case 5:
                    error_4 = _a.sent();
                    console.error('商品データ同期エラー:', error_4);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// スクリプト実行
main().catch(console.error);
// Supabase Edge Functionsでの実行用エクスポート
exports.syncProducts = main;
