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
exports.useNetwork = exports.NetworkProvider = exports.NetworkContext = void 0;
var react_1 = __importStar(require("react"));
var netinfo_1 = __importDefault(require("@react-native-community/netinfo"));
var swipeService_1 = require("@/services/swipeService");
// コンテキストの作成
exports.NetworkContext = (0, react_1.createContext)({
    isConnected: null,
    isInternetReachable: null,
    syncOfflineData: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/];
    }); }); },
    lastSync: null,
});
var NetworkProvider = function (_a) {
    var children = _a.children;
    var _b = (0, react_1.useState)({
        isConnected: null,
        isInternetReachable: null,
    }), networkState = _b[0], setNetworkState = _b[1];
    var _c = (0, react_1.useState)(null), lastSync = _c[0], setLastSync = _c[1];
    var _d = (0, react_1.useState)(null), previouslyConnected = _d[0], setPreviouslyConnected = _d[1];
    // ネットワーク状態の変化を監視
    (0, react_1.useEffect)(function () {
        // 初期状態を取得
        var getInitialState = function () { return __awaiter(void 0, void 0, void 0, function () {
            var state;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, netinfo_1.default.fetch()];
                    case 1:
                        state = _a.sent();
                        setNetworkState({
                            isConnected: state.isConnected,
                            isInternetReachable: state.isInternetReachable,
                        });
                        setPreviouslyConnected(state.isConnected);
                        return [2 /*return*/];
                }
            });
        }); };
        getInitialState();
        // 状態変化のリスナーを登録
        var unsubscribe = netinfo_1.default.addEventListener(function (state) {
            console.log('Network state changed:', state);
            setNetworkState({
                isConnected: state.isConnected,
                isInternetReachable: state.isInternetReachable,
            });
            // オフラインからオンラインに戻った場合、オフラインデータを同期
            if (previouslyConnected === false && state.isConnected === true) {
                syncOfflineData();
            }
            setPreviouslyConnected(state.isConnected);
        });
        // クリーンアップ関数
        return function () {
            unsubscribe();
        };
    }, [previouslyConnected]);
    // オフラインデータの同期機能
    var syncOfflineData = function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    if (!networkState.isConnected) return [3 /*break*/, 2];
                    console.log('Syncing offline data...');
                    // スワイプデータの同期
                    return [4 /*yield*/, (0, swipeService_1.syncOfflineSwipes)()];
                case 1:
                    // スワイプデータの同期
                    _a.sent();
                    // 同期完了時刻を更新
                    setLastSync(new Date());
                    console.log('Offline data synced successfully');
                    return [3 /*break*/, 3];
                case 2:
                    console.log('Cannot sync offline data: device is offline');
                    _a.label = 3;
                case 3: return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error('Error syncing offline data:', error_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (<exports.NetworkContext.Provider value={{
            isConnected: networkState.isConnected,
            isInternetReachable: networkState.isInternetReachable,
            syncOfflineData: syncOfflineData,
            lastSync: lastSync,
        }}>
      {children}
    </exports.NetworkContext.Provider>);
};
exports.NetworkProvider = NetworkProvider;
// カスタムフックの作成
var useNetwork = function () { return (0, react_1.useContext)(exports.NetworkContext); };
exports.useNetwork = useNetwork;
