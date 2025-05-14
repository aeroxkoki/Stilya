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
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var vector_icons_1 = require("@expo/vector-icons");
var common_1 = require("@/components/common");
var authStore_1 = require("@/store/authStore");
var utils_1 = require("@/utils");
var LoginScreen = function (_a) {
    var navigation = _a.navigation;
    var _b = (0, authStore_1.useAuthStore)(), login = _b.login, loading = _b.loading, error = _b.error;
    var _c = (0, react_1.useState)(''), email = _c[0], setEmail = _c[1];
    var _d = (0, react_1.useState)(''), password = _d[0], setPassword = _d[1];
    var _e = (0, react_1.useState)({}), validationErrors = _e[0], setValidationErrors = _e[1];
    var validateForm = function () {
        var errors = {};
        var isValid = true;
        // メールアドレスのバリデーション
        if (!email) {
            errors.email = 'メールアドレスを入力してください';
            isValid = false;
        }
        else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.email = '有効なメールアドレスを入力してください';
            isValid = false;
        }
        // パスワードのバリデーション
        if (!password) {
            errors.password = 'パスワードを入力してください';
            isValid = false;
        }
        else if (password.length < 6) {
            errors.password = 'パスワードは6文字以上である必要があります';
            isValid = false;
        }
        setValidationErrors(errors);
        return isValid;
    };
    var handleLogin = function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!validateForm())
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, login(email, password)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('Login error:', error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return (<react_native_1.SafeAreaView className="flex-1 bg-white">
      <react_native_1.KeyboardAvoidingView behavior={react_native_1.Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <react_native_1.ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <react_native_1.View className="px-6 py-10 flex-1 justify-center">
            {/* ロゴ */}
            <react_native_1.View className="items-center mb-8">
              <react_native_1.Image source={require('@/assets/logo-placeholder.png')} className="w-24 h-24 mb-4" resizeMode="contain"/>
              <react_native_1.Text className="text-2xl font-bold text-gray-800">Stilya</react_native_1.Text>
              <react_native_1.Text className="text-sm text-gray-500 mt-1">スワイプで、あなたの"好き"が見つかる。</react_native_1.Text>
            </react_native_1.View>

            {/* エラーメッセージ */}
            {error && (<react_native_1.View className="mb-4 p-3 bg-red-50 rounded-md">
                <react_native_1.Text className="text-red-500">{(0, utils_1.formatErrorMessage)(error)}</react_native_1.Text>
              </react_native_1.View>)}

            {/* 入力フォーム */}
            <react_native_1.View className="space-y-4">
              <common_1.Input label="メールアドレス" placeholder="example@email.com" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} error={validationErrors.email} leftIcon={<vector_icons_1.Ionicons name="mail-outline" size={20} color="#6B7280"/>}/>

              <common_1.Input label="パスワード" placeholder="6文字以上のパスワード" value={password} onChangeText={setPassword} isPassword error={validationErrors.password} leftIcon={<vector_icons_1.Ionicons name="lock-closed-outline" size={20} color="#6B7280"/>}/>

              <react_native_1.TouchableOpacity onPress={function () { return navigation.navigate('ForgotPassword'); }} className="self-end">
                <react_native_1.Text className="text-primary-dark font-medium">
                  パスワードをお忘れですか？
                </react_native_1.Text>
              </react_native_1.TouchableOpacity>
            </react_native_1.View>

            {/* ログインボタン */}
            <common_1.Button isFullWidth onPress={handleLogin} isLoading={loading} className="mt-6">
              ログイン
            </common_1.Button>

            {/* サインアップリンク */}
            <react_native_1.View className="flex-row justify-center mt-8">
              <react_native_1.Text className="text-gray-600">アカウントをお持ちでないですか？</react_native_1.Text>
              <react_native_1.TouchableOpacity onPress={function () { return navigation.navigate('Register'); }}>
                <react_native_1.Text className="text-primary-dark font-medium ml-1">
                  登録する
                </react_native_1.Text>
              </react_native_1.TouchableOpacity>
            </react_native_1.View>
          </react_native_1.View>
        </react_native_1.ScrollView>
      </react_native_1.KeyboardAvoidingView>
    </react_native_1.SafeAreaView>);
};
exports.default = LoginScreen;
