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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var react_native_1 = require("react-native");
var vector_icons_1 = require("@expo/vector-icons");
var useAuth_1 = require("../hooks/useAuth");
var common_1 = require("../components/common");
var theme_1 = require("../styles/theme");
var ProfileScreen = function () {
    var _a = (0, useAuth_1.useAuth)(), user = _a.user, logout = _a.logout;
    // ログアウト確認
    var handleSignOut = function () {
        react_native_1.Alert.alert('ログアウト', 'ログアウトしてもよろしいですか？', [
            {
                text: 'キャンセル',
                style: 'cancel',
            },
            {
                text: 'ログアウト',
                style: 'destructive',
                onPress: function () { return __awaiter(void 0, void 0, void 0, function () {
                    var error_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, logout()];
                            case 1:
                                _a.sent();
                                return [3 /*break*/, 3];
                            case 2:
                                error_1 = _a.sent();
                                console.error('Error signing out:', error_1);
                                react_native_1.Alert.alert('エラー', 'ログアウトに失敗しました。');
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); },
            },
        ], { cancelable: true });
    };
    var MenuItem = function (_a) {
        var icon = _a.icon, title = _a.title, onPress = _a.onPress;
        return (<react_native_1.TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <vector_icons_1.Feather name={icon} size={24} color={theme_1.defaultTheme.colors.status.success} style={styles.menuIcon}/>
      <react_native_1.Text style={styles.menuText}>{title}</react_native_1.Text>
      <vector_icons_1.Feather name="chevron-right" size={24} color={theme_1.defaultTheme.colors.text.hint}/>
    </react_native_1.TouchableOpacity>);
    };
    var SectionTitle = function (_a) {
        var title = _a.title;
        return (<react_native_1.Text style={styles.sectionTitle}>{title}</react_native_1.Text>);
    };
    return (<react_native_1.ScrollView style={styles.container}>
      <react_native_1.View style={styles.header}>
        <react_native_1.View style={styles.profileIcon}>
          <vector_icons_1.Feather name="user" size={50} color={theme_1.defaultTheme.colors.primary}/>
        </react_native_1.View>
        <react_native_1.Text style={styles.email}>{user === null || user === void 0 ? void 0 : user.email}</react_native_1.Text>
      </react_native_1.View>

      <common_1.Card style={styles.section}>
        <SectionTitle title="アカウント設定"/>
        <MenuItem icon="user" title="プロフィール編集"/>
        <MenuItem icon="bell" title="通知設定"/>
      </common_1.Card>

      <common_1.Card style={styles.section}>
        <SectionTitle title="ファッション設定"/>
        <MenuItem icon="tag" title="スタイル設定"/>
        <MenuItem icon="heart" title="お気に入り商品"/>
        <MenuItem icon="repeat" title="スワイプ履歴"/>
      </common_1.Card>

      <common_1.Card style={styles.section}>
        <SectionTitle title="サポート"/>
        <MenuItem icon="help-circle" title="ヘルプ・サポート"/>
        <MenuItem icon="info" title="利用規約・プライバシーポリシー"/>
        <MenuItem icon="mail" title="お問い合わせ"/>
      </common_1.Card>

      <react_native_1.View style={styles.buttonContainer}>
        <common_1.Button title="ログアウト" variant="outline" onPress={handleSignOut} style={styles.signOutButton} textStyle={{ color: theme_1.defaultTheme.colors.status.error }}/>
      </react_native_1.View>

      <react_native_1.Text style={styles.versionText}>アプリバージョン: 0.1.0 (MVP)</react_native_1.Text>
    </react_native_1.ScrollView>);
};
var styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme_1.defaultTheme.colors.background.main,
    },
    header: {
        backgroundColor: theme_1.defaultTheme.colors.background.main,
        paddingVertical: theme_1.defaultTheme.spacing.xl,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: theme_1.defaultTheme.colors.border.light,
    },
    profileIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme_1.defaultTheme.colors.background.card,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme_1.defaultTheme.spacing.m,
    },
    email: {
        fontSize: theme_1.defaultTheme.fontSizes.l,
        color: theme_1.defaultTheme.colors.text.primary,
    },
    section: {
        marginTop: theme_1.defaultTheme.spacing.m,
        padding: theme_1.defaultTheme.spacing.m,
    },
    sectionTitle: {
        fontSize: theme_1.defaultTheme.fontSizes.m,
        fontWeight: theme_1.defaultTheme.fontWeights.medium,
        color: theme_1.defaultTheme.colors.text.secondary,
        marginBottom: theme_1.defaultTheme.spacing.s,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme_1.defaultTheme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: theme_1.defaultTheme.colors.border.light,
    },
    menuIcon: {
        marginRight: theme_1.defaultTheme.spacing.m,
    },
    menuText: {
        flex: 1,
        fontSize: theme_1.defaultTheme.fontSizes.m,
        color: theme_1.defaultTheme.colors.text.primary,
    },
    buttonContainer: {
        marginVertical: theme_1.defaultTheme.spacing.l,
        paddingHorizontal: theme_1.defaultTheme.spacing.l,
    },
    signOutButton: {
        borderColor: theme_1.defaultTheme.colors.status.error,
    },
    versionText: {
        textAlign: 'center',
        marginTop: theme_1.defaultTheme.spacing.m,
        marginBottom: theme_1.defaultTheme.spacing.xxl,
        fontSize: theme_1.defaultTheme.fontSizes.s,
        color: theme_1.defaultTheme.colors.text.secondary,
    },
});
exports.default = ProfileScreen;
