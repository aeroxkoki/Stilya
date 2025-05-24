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
var common_1 = require("@/components/common");
var onboardingStore_1 = require("@/store/onboardingStore");
var styleOptions = [
    {
        id: 'casual',
        name: 'カジュアル',
        description: '日常的でリラックスした着こなし',
        image: require('@/assets/style-casual.png'),
    },
    {
        id: 'street',
        name: 'ストリート',
        description: '個性的で都会的なスタイル',
        image: require('@/assets/style-street.png'),
    },
    {
        id: 'mode',
        name: 'モード',
        description: 'モノトーンを基調としたスタイリッシュな装い',
        image: require('@/assets/style-mode.png'),
    },
    {
        id: 'natural',
        name: 'ナチュラル',
        description: '自然体で優しい雰囲気のコーディネート',
        image: require('@/assets/style-natural.png'),
    },
    {
        id: 'classic',
        name: 'クラシック',
        description: '上品で落ち着いた大人のスタイル',
        image: require('@/assets/style-classic.png'),
    },
    {
        id: 'feminine',
        name: 'フェミニン',
        description: '女性らしさを強調した華やかな装い',
        image: require('@/assets/style-feminine.png'),
    },
];
var StyleScreen = function (_a) {
    var navigation = _a.navigation;
    var _b = (0, onboardingStore_1.useOnboardingStore)(), stylePreference = _b.stylePreference, setStylePreference = _b.setStylePreference, nextStep = _b.nextStep, prevStep = _b.prevStep;
    var _c = (0, react_1.useState)(stylePreference), selectedStyles = _c[0], setSelectedStyles = _c[1];
    var toggleStyle = function (styleId) {
        setSelectedStyles(function (prev) {
            if (prev.includes(styleId)) {
                return prev.filter(function (id) { return id !== styleId; });
            }
            else {
                return __spreadArray(__spreadArray([], prev, true), [styleId], false);
            }
        });
    };
    var handleNext = function () {
        setStylePreference(selectedStyles);
        nextStep();
        navigation.navigate('AgeGroup');
    };
    var handleBack = function () {
        prevStep();
        navigation.goBack();
    };
    return (<react_native_1.SafeAreaView className="flex-1 bg-white">
      <react_native_1.View className="flex-1">
        {/* ヘッダー */}
        <react_native_1.View className="flex-row items-center justify-between p-6 mb-2">
          <react_native_1.TouchableOpacity onPress={handleBack}>
            <vector_icons_1.Ionicons name="arrow-back" size={24} color="#333"/>
          </react_native_1.TouchableOpacity>
          <react_native_1.Text className="text-lg font-medium">2/4</react_native_1.Text>
        </react_native_1.View>

        {/* タイトル */}
        <react_native_1.View className="px-6 mb-4">
          <react_native_1.Text className="text-2xl font-bold mb-2">好きなスタイルを選んでください</react_native_1.Text>
          <react_native_1.Text className="text-gray-500">
            複数選択可能です。あなたの好みに合わせたアイテムを提案します。
          </react_native_1.Text>
        </react_native_1.View>

        {/* スタイル選択 */}
        <react_native_1.ScrollView className="flex-1 px-6">
          <react_native_1.View className="flex-row flex-wrap justify-between">
            {styleOptions.map(function (style) { return (<react_native_1.TouchableOpacity key={style.id} className="w-[48%] mb-4" activeOpacity={0.7} onPress={function () { return toggleStyle(style.id); }}>
                <react_native_1.View className={"relative rounded-lg overflow-hidden ".concat(selectedStyles.includes(style.id) ? 'border-2 border-primary' : 'border border-gray-200')}>
                  <react_native_1.Image source={style.image} className="w-full h-32" resizeMode="cover"/>
                  <react_native_1.View className="absolute top-0 right-0 m-2">
                    {selectedStyles.includes(style.id) && (<react_native_1.View className="bg-primary rounded-full p-1">
                        <vector_icons_1.Ionicons name="checkmark" size={16} color="#fff"/>
                      </react_native_1.View>)}
                  </react_native_1.View>
                  <react_native_1.View className="p-3 bg-white">
                    <react_native_1.Text className={"font-medium ".concat(selectedStyles.includes(style.id) ? 'text-primary' : 'text-gray-800')}>
                      {style.name}
                    </react_native_1.Text>
                    <react_native_1.Text className="text-xs text-gray-500 mt-1" numberOfLines={2}>
                      {style.description}
                    </react_native_1.Text>
                  </react_native_1.View>
                </react_native_1.View>
              </react_native_1.TouchableOpacity>); })}
          </react_native_1.View>
        </react_native_1.ScrollView>

        {/* 次へボタン */}
        <react_native_1.View className="p-6">
          <common_1.Button isFullWidth onPress={handleNext} disabled={selectedStyles.length === 0}>
            次へ
          </common_1.Button>
        </react_native_1.View>
      </react_native_1.View>
    </react_native_1.SafeAreaView>);
};
exports.default = StyleScreen;
