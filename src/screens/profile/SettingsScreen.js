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
var react_native_safe_area_context_1 = require("react-native-safe-area-context");
var vector_icons_1 = require("@expo/vector-icons");
var native_1 = require("@react-navigation/native");
var authStore_1 = require("@/store/authStore");
var SettingsScreen = function () {
    var navigation = (0, native_1.useNavigation)();
    var _a = (0, authStore_1.useAuthStore)(), user = _a.user, logout = _a.logout;
    var _b = (0, react_1.useState)(false), darkMode = _b[0], setDarkMode = _b[1];
    var _c = (0, react_1.useState)(true), pushNotifications = _c[0], setPushNotifications = _c[1];
    var _d = (0, react_1.useState)(true), emailNotifications = _d[0], setEmailNotifications = _d[1];
    // パスワード変更関連の状態
    var _e = (0, react_1.useState)(false), showPasswordFields = _e[0], setShowPasswordFields = _e[1];
    var _f = (0, react_1.useState)(''), currentPassword = _f[0], setCurrentPassword = _f[1];
    var _g = (0, react_1.useState)(''), newPassword = _g[0], setNewPassword = _g[1];
    var _h = (0, react_1.useState)(''), confirmPassword = _h[0], setConfirmPassword = _h[1];
    // パスワード保存処理
    var handleSavePassword = function () {
        if (!currentPassword) {
            react_native_1.Alert.alert('エラー', '現在のパスワードを入力してください');
            return;
        }
        if (newPassword !== confirmPassword) {
            react_native_1.Alert.alert('エラー', '新しいパスワードと確認用パスワードが一致しません');
            return;
        }
        if (newPassword.length < 8) {
            react_native_1.Alert.alert('エラー', 'パスワードは8文字以上で設定してください');
            return;
        }
        // TODO: パスワード変更APIを呼び出す
        react_native_1.Alert.alert('成功', 'パスワードを変更しました');
        setShowPasswordFields(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };
    // ログアウト処理
    var handleSignOut = function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, logout()];
                case 1:
                    _a.sent();
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Auth' }],
                    });
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('ログアウトエラー:', error_1);
                    react_native_1.Alert.alert('エラー', 'ログアウト処理に失敗しました');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    return (<react_native_safe_area_context_1.SafeAreaView style={styles.container}>
      <react_native_1.View style={styles.header}>
        <react_native_1.TouchableOpacity style={styles.backButton} onPress={function () { return navigation.goBack(); }}>
          <vector_icons_1.Ionicons name="chevron-back" size={24} color="#333"/>
        </react_native_1.TouchableOpacity>
        <react_native_1.Text style={styles.headerTitle}>設定</react_native_1.Text>
        <react_native_1.View style={styles.rightPlaceholder}/>
      </react_native_1.View>
      
      <react_native_1.ScrollView style={styles.scrollView}>
        {/* アカウント設定セクション */}
        <react_native_1.View style={styles.section}>
          <react_native_1.Text style={styles.sectionTitle}>アカウント</react_native_1.Text>
          
          <react_native_1.View style={styles.settingItem}>
            <react_native_1.View style={styles.settingTextContainer}>
              <react_native_1.Text style={styles.settingLabel}>メールアドレス</react_native_1.Text>
              <react_native_1.Text style={styles.settingValue}>{(user === null || user === void 0 ? void 0 : user.email) || '未設定'}</react_native_1.Text>
            </react_native_1.View>
          </react_native_1.View>
          
          <react_native_1.TouchableOpacity style={styles.settingItem} onPress={function () { return setShowPasswordFields(!showPasswordFields); }}>
            <react_native_1.View style={styles.settingTextContainer}>
              <react_native_1.Text style={styles.settingLabel}>パスワード変更</react_native_1.Text>
              <react_native_1.Text style={styles.settingDescription}>
                セキュリティのために定期的な変更をおすすめします
              </react_native_1.Text>
            </react_native_1.View>
            <vector_icons_1.Ionicons name={showPasswordFields ? "chevron-up" : "chevron-down"} size={20} color="#999"/>
          </react_native_1.TouchableOpacity>
          
          {showPasswordFields && (<react_native_1.View style={styles.passwordFields}>
              <react_native_1.TextInput style={styles.input} placeholder="現在のパスワード" secureTextEntry value={currentPassword} onChangeText={setCurrentPassword} placeholderTextColor="#999"/>
              <react_native_1.TextInput style={styles.input} placeholder="新しいパスワード" secureTextEntry value={newPassword} onChangeText={setNewPassword} placeholderTextColor="#999"/>
              <react_native_1.TextInput style={styles.input} placeholder="新しいパスワード（確認）" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} placeholderTextColor="#999"/>
              <react_native_1.TouchableOpacity style={styles.saveButton} onPress={handleSavePassword}>
                <react_native_1.Text style={styles.saveButtonText}>変更を保存</react_native_1.Text>
              </react_native_1.TouchableOpacity>
            </react_native_1.View>)}
        </react_native_1.View>
        
        {/* アプリ設定セクション */}
        <react_native_1.View style={styles.section}>
          <react_native_1.Text style={styles.sectionTitle}>アプリ設定</react_native_1.Text>
          
          <react_native_1.View style={styles.settingItem}>
            <react_native_1.View style={styles.settingTextContainer}>
              <react_native_1.Text style={styles.settingLabel}>ダークモード</react_native_1.Text>
              <react_native_1.Text style={styles.settingDescription}>
                画面を暗めの配色に切り替えます
              </react_native_1.Text>
            </react_native_1.View>
            <react_native_1.Switch value={darkMode} onValueChange={function (value) { return setDarkMode(value); }} trackColor={{ false: "#e0e0e0", true: "#3b82f6" }} thumbColor={darkMode ? "#fff" : "#f8f8f8"}/>
          </react_native_1.View>
          
          <react_native_1.View style={styles.settingItem}>
            <react_native_1.View style={styles.settingTextContainer}>
              <react_native_1.Text style={styles.settingLabel}>プッシュ通知</react_native_1.Text>
              <react_native_1.Text style={styles.settingDescription}>
                お気に入りアイテムの値下げなどをお知らせします
              </react_native_1.Text>
            </react_native_1.View>
            <react_native_1.Switch value={pushNotifications} onValueChange={function (value) { return setPushNotifications(value); }} trackColor={{ false: "#e0e0e0", true: "#3b82f6" }} thumbColor={pushNotifications ? "#fff" : "#f8f8f8"}/>
          </react_native_1.View>
          
          <react_native_1.View style={styles.settingItem}>
            <react_native_1.View style={styles.settingTextContainer}>
              <react_native_1.Text style={styles.settingLabel}>メール通知</react_native_1.Text>
              <react_native_1.Text style={styles.settingDescription}>
                おすすめ商品やセール情報をメールでお知らせします
              </react_native_1.Text>
            </react_native_1.View>
            <react_native_1.Switch value={emailNotifications} onValueChange={function (value) { return setEmailNotifications(value); }} trackColor={{ false: "#e0e0e0", true: "#3b82f6" }} thumbColor={emailNotifications ? "#fff" : "#f8f8f8"}/>
          </react_native_1.View>
        </react_native_1.View>
        
        {/* サポートセクション */}
        <react_native_1.View style={styles.section}>
          <react_native_1.Text style={styles.sectionTitle}>サポート</react_native_1.Text>
          
          <react_native_1.TouchableOpacity style={styles.settingItem}>
            <react_native_1.View style={styles.settingTextContainer}>
              <react_native_1.Text style={styles.settingLabel}>ヘルプ &amp; よくある質問</react_native_1.Text>
              <react_native_1.Text style={styles.settingDescription}>
                アプリの使い方やトラブルシューティング
              </react_native_1.Text>
            </react_native_1.View>
            <vector_icons_1.Ionicons name="chevron-forward" size={20} color="#999"/>
          </react_native_1.TouchableOpacity>
          
          <react_native_1.TouchableOpacity style={styles.settingItem}>
            <react_native_1.View style={styles.settingTextContainer}>
              <react_native_1.Text style={styles.settingLabel}>お問い合わせ</react_native_1.Text>
              <react_native_1.Text style={styles.settingDescription}>
                サポートチームにご連絡ください
              </react_native_1.Text>
            </react_native_1.View>
            <vector_icons_1.Ionicons name="chevron-forward" size={20} color="#999"/>
          </react_native_1.TouchableOpacity>
          
          <react_native_1.TouchableOpacity style={styles.settingItem}>
            <react_native_1.View style={styles.settingTextContainer}>
              <react_native_1.Text style={styles.settingLabel}>プライバシーポリシー</react_native_1.Text>
            </react_native_1.View>
            <vector_icons_1.Ionicons name="chevron-forward" size={20} color="#999"/>
          </react_native_1.TouchableOpacity>
          
          <react_native_1.TouchableOpacity style={styles.settingItem}>
            <react_native_1.View style={styles.settingTextContainer}>
              <react_native_1.Text style={styles.settingLabel}>利用規約</react_native_1.Text>
            </react_native_1.View>
            <vector_icons_1.Ionicons name="chevron-forward" size={20} color="#999"/>
          </react_native_1.TouchableOpacity>
        </react_native_1.View>
        
        {/* ログアウトボタン */}
        <react_native_1.TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <react_native_1.Text style={styles.signOutButtonText}>ログアウト</react_native_1.Text>
        </react_native_1.TouchableOpacity>
        
        <react_native_1.View style={styles.versionContainer}>
          <react_native_1.Text style={styles.versionText}>Stilya バージョン 1.0.0</react_native_1.Text>
        </react_native_1.View>
      </react_native_1.ScrollView>
    </react_native_safe_area_context_1.SafeAreaView>);
};
var styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    rightPlaceholder: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    section: {
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 12,
        color: '#3b82f6',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    settingTextContainer: {
        flex: 1,
        marginRight: 16,
    },
    settingLabel: {
        fontSize: 16,
        marginBottom: 2,
    },
    settingDescription: {
        fontSize: 14,
        color: '#777',
    },
    settingValue: {
        fontSize: 14,
        color: '#555',
    },
    passwordFields: {
        marginTop: 8,
        marginBottom: 16,
    },
    input: {
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        marginBottom: 12,
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: '#3b82f6',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    signOutButton: {
        backgroundColor: '#f8f8f8',
        paddingVertical: 14,
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    signOutButtonText: {
        color: '#f44336',
        fontSize: 16,
        fontWeight: 'bold',
    },
    versionContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    versionText: {
        fontSize: 14,
        color: '#999',
    }
});
exports.default = SettingsScreen;
