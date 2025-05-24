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
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var vector_icons_1 = require("@expo/vector-icons");
var useAuth_1 = require("../hooks/useAuth");
// 画面の幅を取得
var width = react_native_1.Dimensions.get('window').width;
// オンボーディングの手順
var STEPS = [
    {
        id: 'gender',
        title: 'あなたの性別は？',
        options: [
            { id: 'male', label: 'メンズ', icon: 'user' },
            { id: 'female', label: 'レディース', icon: 'user' },
            { id: 'other', label: 'その他', icon: 'users' },
        ],
    },
    {
        id: 'style',
        title: 'どんなスタイルが好き？',
        options: [
            { id: 'casual', label: 'カジュアル', icon: 'smile' },
            { id: 'formal', label: 'フォーマル', icon: 'briefcase' },
            { id: 'street', label: 'ストリート', icon: 'music' },
            { id: 'minimal', label: 'ミニマル', icon: 'square' },
            { id: 'vintage', label: 'ビンテージ', icon: 'clock' },
        ],
    },
    {
        id: 'age',
        title: '年代を選択',
        options: [
            { id: 'teens', label: '10代', icon: 'circle' },
            { id: 'twenties', label: '20代', icon: 'circle' },
            { id: 'thirties', label: '30代', icon: 'circle' },
            { id: 'forties', label: '40代', icon: 'circle' },
            { id: 'fifties', label: '50代以上', icon: 'circle' },
        ],
    },
];
var OnboardingScreen = function () {
    var _a = (0, react_1.useState)(0), currentStep = _a[0], setCurrentStep = _a[1];
    var _b = (0, react_1.useState)({
        gender: '',
        style: [],
        age: '',
    }), selections = _b[0], setSelections = _b[1];
    var user = (0, useAuth_1.useAuth)().user;
    // 現在の手順を取得
    var step = STEPS[currentStep];
    // 選択を更新する
    var handleSelect = function (optionId) {
        var stepId = step.id;
        if (stepId === 'style') {
            // スタイルの場合は複数選択可能
            setSelections(function (prev) {
                var _a, _b;
                var currentSelections = prev[stepId] || [];
                if (currentSelections.includes(optionId)) {
                    // 選択済みなら削除
                    return __assign(__assign({}, prev), (_a = {}, _a[stepId] = currentSelections.filter(function (id) { return id !== optionId; }), _a));
                }
                else {
                    // 未選択なら追加（最大3つまで）
                    if (currentSelections.length < 3) {
                        return __assign(__assign({}, prev), (_b = {}, _b[stepId] = __spreadArray(__spreadArray([], currentSelections, true), [optionId], false), _b));
                    }
                    return prev;
                }
            });
        }
        else {
            // 性別と年代の場合は単一選択
            setSelections(function (prev) {
                var _a;
                return (__assign(__assign({}, prev), (_a = {}, _a[stepId] = optionId, _a)));
            });
        }
    };
    // 次のステップに進む
    var handleNext = function () {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(function (prev) { return prev + 1; });
        }
        else {
            // 最後のステップの場合は完了処理
            completeOnboarding();
        }
    };
    // 前のステップに戻る
    var handleBack = function () {
        if (currentStep > 0) {
            setCurrentStep(function (prev) { return prev - 1; });
        }
    };
    // オンボーディング完了処理
    var completeOnboarding = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                // TODO: Supabaseにユーザー設定を保存する
                console.log('Onboarding completed with selections:', selections);
                // ここで実際にはSupabaseにデータを保存するコードを追加
                // 例: await supabase.from('profiles').upsert({ user_id: user?.id, ...preferences });
            }
            catch (error) {
                console.error('Error saving onboarding preferences:', error);
            }
            return [2 /*return*/];
        });
    }); };
    // 現在のステップが有効か（選択が必要な場合に選択されているか）
    var isCurrentStepValid = function () {
        var stepId = step.id;
        if (stepId === 'style') {
            return (selections[stepId] || []).length > 0;
        }
        return !!selections[stepId];
    };
    // オプションが選択されているかチェック
    var isOptionSelected = function (optionId) {
        var stepId = step.id;
        if (stepId === 'style') {
            return (selections[stepId] || []).includes(optionId);
        }
        return selections[stepId] === optionId;
    };
    return (<react_native_1.View style={styles.container}>
      {/* ヘッダー */}
      <react_native_1.View style={styles.header}>
        <react_native_1.Text style={styles.title}>プロフィール設定</react_native_1.Text>
        <react_native_1.Text style={styles.subtitle}>
          あなたの好みに合った商品をおすすめするために、いくつか質問に答えてください。
        </react_native_1.Text>
      </react_native_1.View>

      {/* プログレスバー */}
      <react_native_1.View style={styles.progressContainer}>
        {STEPS.map(function (_, index) { return (<react_native_1.View key={index} style={[
                styles.progressDot,
                index <= currentStep ? styles.progressDotActive : {},
            ]}/>); })}
      </react_native_1.View>

      {/* 質問 */}
      <react_native_1.View style={styles.questionContainer}>
        <react_native_1.Text style={styles.questionTitle}>{step.title}</react_native_1.Text>

        <react_native_1.FlatList data={step.options} keyExtractor={function (item) { return item.id; }} renderItem={function (_a) {
            var item = _a.item;
            return (<react_native_1.TouchableOpacity style={[
                    styles.optionButton,
                    isOptionSelected(item.id) ? styles.optionButtonSelected : {},
                ]} onPress={function () { return handleSelect(item.id); }}>
              <vector_icons_1.Feather name={item.icon} size={24} color={isOptionSelected(item.id) ? 'white' : '#757575'} style={styles.optionIcon}/>
              <react_native_1.Text style={[
                    styles.optionLabel,
                    isOptionSelected(item.id) ? styles.optionLabelSelected : {},
                ]}>
                {item.label}
              </react_native_1.Text>
              {isOptionSelected(item.id) && (<vector_icons_1.Feather name="check" size={20} color="white" style={styles.checkIcon}/>)}
            </react_native_1.TouchableOpacity>);
        }} numColumns={2} contentContainerStyle={styles.optionsGrid}/>

        {step.id === 'style' && (<react_native_1.Text style={styles.helperText}>
            最大3つまで選択できます（{(selections.style || []).length}/3）
          </react_native_1.Text>)}
      </react_native_1.View>

      {/* ナビゲーションボタン */}
      <react_native_1.View style={styles.navContainer}>
        {currentStep > 0 ? (<react_native_1.TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <vector_icons_1.Feather name="arrow-left" size={20} color="#3B82F6"/>
            <react_native_1.Text style={styles.backButtonText}>戻る</react_native_1.Text>
          </react_native_1.TouchableOpacity>) : (<react_native_1.View style={{ width: 80 }}/>)}

        <react_native_1.TouchableOpacity style={[
            styles.nextButton,
            !isCurrentStepValid() ? styles.nextButtonDisabled : {},
        ]} onPress={handleNext} disabled={!isCurrentStepValid()}>
          <react_native_1.Text style={styles.nextButtonText}>
            {currentStep < STEPS.length - 1 ? '次へ' : '完了'}
          </react_native_1.Text>
          <vector_icons_1.Feather name={currentStep < STEPS.length - 1 ? 'arrow-right' : 'check'} size={20} color="white" style={styles.nextButtonIcon}/>
        </react_native_1.TouchableOpacity>
      </react_native_1.View>

      {/* スキップボタン */}
      <react_native_1.TouchableOpacity style={styles.skipButton} onPress={completeOnboarding}>
        <react_native_1.Text style={styles.skipButtonText}>スキップ</react_native_1.Text>
      </react_native_1.TouchableOpacity>
    </react_native_1.View>);
};
var styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        paddingTop: 50,
    },
    header: {
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333333',
    },
    subtitle: {
        fontSize: 16,
        color: '#757575',
        lineHeight: 22,
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 30,
    },
    progressDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#E0E0E0',
        marginHorizontal: 5,
    },
    progressDotActive: {
        backgroundColor: '#3B82F6',
        width: 20,
    },
    questionContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    questionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 20,
        color: '#333333',
    },
    optionsGrid: {
        paddingBottom: 20,
    },
    optionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        padding: 15,
        marginHorizontal: 5,
        marginBottom: 10,
        minHeight: 60,
    },
    optionButtonSelected: {
        backgroundColor: '#3B82F6',
    },
    optionIcon: {
        marginRight: 10,
    },
    optionLabel: {
        fontSize: 16,
        color: '#333333',
        flex: 1,
    },
    optionLabelSelected: {
        color: 'white',
    },
    checkIcon: {
        marginLeft: 5,
    },
    helperText: {
        fontSize: 14,
        color: '#757575',
        marginTop: 5,
        textAlign: 'center',
    },
    navContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    backButtonText: {
        fontSize: 16,
        color: '#3B82F6',
        marginLeft: 5,
    },
    nextButton: {
        backgroundColor: '#3B82F6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        minWidth: 100,
    },
    nextButtonDisabled: {
        backgroundColor: '#BDBDBD',
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    nextButtonIcon: {
        marginLeft: 5,
    },
    skipButton: {
        alignSelf: 'center',
        padding: 15,
        marginBottom: 30,
    },
    skipButtonText: {
        fontSize: 14,
        color: '#9E9E9E',
    },
});
exports.default = OnboardingScreen;
