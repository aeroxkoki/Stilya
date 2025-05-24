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
var useAuth_1 = require("../hooks/useAuth");
var AuthScreen = function () {
    var _a = (0, react_1.useState)(''), email = _a[0], setEmail = _a[1];
    var _b = (0, react_1.useState)(''), password = _b[0], setPassword = _b[1];
    var _c = (0, react_1.useState)('signin'), mode = _c[0], setMode = _c[1];
    var _d = (0, react_1.useState)(false), isLoading = _d[0], setIsLoading = _d[1];
    var _e = (0, react_1.useState)(false), showPassword = _e[0], setShowPassword = _e[1];
    var _f = (0, useAuth_1.useAuth)(), login = _f.login, register = _f.register;
    var toggleMode = function () {
        setMode(mode === 'signin' ? 'signup' : 'signin');
    };
    var handleAuth = function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_1, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!email || !password) {
                        react_native_1.Alert.alert('エラー', 'メールアドレスとパスワードを入力してください。');
                        return [2 /*return*/];
                    }
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    if (!(mode === 'signin')) return [3 /*break*/, 3];
                    return [4 /*yield*/, login(email, password)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, register(email, password)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [3 /*break*/, 8];
                case 6:
                    error_1 = _a.sent();
                    console.error('Auth error:', error_1);
                    errorMessage = 'エラーが発生しました。';
                    if (mode === 'signin') {
                        errorMessage = 'ログインに失敗しました。メールアドレスまたはパスワードが正しくありません。';
                    }
                    else {
                        errorMessage = '新規登録に失敗しました。別のメールアドレスを試すか、パスワードを変更してください。';
                    }
                    react_native_1.Alert.alert('エラー', errorMessage);
                    return [3 /*break*/, 8];
                case 7:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    return (<react_native_1.KeyboardAvoidingView style={styles.container} behavior={react_native_1.Platform.OS === 'ios' ? 'padding' : 'height'}>
      <react_native_1.ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <react_native_1.View style={styles.headerContainer}>
          <react_native_1.View style={styles.logoContainer}>
            <react_native_1.Text style={styles.logoText}>Stilya</react_native_1.Text>
          </react_native_1.View>
          <react_native_1.Text style={styles.headerText}>
            {mode === 'signin' ? 'ログイン' : '新規登録'}
          </react_native_1.Text>
          <react_native_1.Text style={styles.subHeaderText}>
            {mode === 'signin'
            ? 'アカウントにログインしてあなたの好みを発見しましょう'
            : '新しいアカウントを作成して、あなたのスタイルを見つけましょう'}
          </react_native_1.Text>
        </react_native_1.View>

        <react_native_1.View style={styles.formContainer}>
          <react_native_1.View style={styles.inputContainer}>
            <vector_icons_1.Feather name="mail" size={20} color="#9E9E9E" style={styles.inputIcon}/>
            <react_native_1.TextInput style={styles.input} placeholder="メールアドレス" placeholderTextColor="#9E9E9E" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"/>
          </react_native_1.View>

          <react_native_1.View style={styles.inputContainer}>
            <vector_icons_1.Feather name="lock" size={20} color="#9E9E9E" style={styles.inputIcon}/>
            <react_native_1.TextInput style={styles.input} placeholder="パスワード" placeholderTextColor="#9E9E9E" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} autoCapitalize="none"/>
            <react_native_1.TouchableOpacity style={styles.passwordVisibilityButton} onPress={function () { return setShowPassword(!showPassword); }}>
              <vector_icons_1.Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color="#9E9E9E"/>
            </react_native_1.TouchableOpacity>
          </react_native_1.View>

          <react_native_1.TouchableOpacity style={styles.authButton} onPress={handleAuth} disabled={isLoading}>
            {isLoading ? (<react_native_1.ActivityIndicator color="white" size="small"/>) : (<react_native_1.Text style={styles.authButtonText}>
                {mode === 'signin' ? 'ログイン' : '登録する'}
              </react_native_1.Text>)}
          </react_native_1.TouchableOpacity>

          {mode === 'signin' && (<react_native_1.TouchableOpacity style={styles.forgotPasswordButton}>
              <react_native_1.Text style={styles.forgotPasswordText}>パスワードをお忘れですか？</react_native_1.Text>
            </react_native_1.TouchableOpacity>)}
        </react_native_1.View>

        <react_native_1.View style={styles.footerContainer}>
          <react_native_1.Text style={styles.footerText}>
            {mode === 'signin' ? 'アカウントをお持ちでないですか？' : 'すでにアカウントをお持ちですか？'}
          </react_native_1.Text>
          <react_native_1.TouchableOpacity onPress={toggleMode}>
            <react_native_1.Text style={styles.footerActionText}>
              {mode === 'signin' ? '新規登録' : 'ログイン'}
            </react_native_1.Text>
          </react_native_1.TouchableOpacity>
        </react_native_1.View>
      </react_native_1.ScrollView>
    </react_native_1.KeyboardAvoidingView>);
};
var styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    logoText: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
    },
    headerText: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333333',
    },
    subHeaderText: {
        fontSize: 16,
        color: '#757575',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    formContainer: {
        marginBottom: 30,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 15,
        height: 55,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333333',
    },
    passwordVisibilityButton: {
        padding: 8,
    },
    authButton: {
        backgroundColor: '#3B82F6',
        height: 55,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    authButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    forgotPasswordButton: {
        alignSelf: 'center',
        marginTop: 15,
        padding: 5,
    },
    forgotPasswordText: {
        color: '#3B82F6',
        fontSize: 14,
    },
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#757575',
    },
    footerActionText: {
        fontSize: 14,
        color: '#3B82F6',
        fontWeight: '600',
        marginLeft: 5,
    },
});
exports.default = AuthScreen;
