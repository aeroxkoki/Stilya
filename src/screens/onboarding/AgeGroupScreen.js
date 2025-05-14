"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var react_native_1 = require("react-native");
var vector_icons_1 = require("@expo/vector-icons");
var common_1 = require("@/components/common");
var onboarding_1 = require("@/components/onboarding");
var onboardingStore_1 = require("@/store/onboardingStore");
// 年代の選択肢
var ageGroups = [
    { id: 'teens', label: '10代' },
    { id: '20s', label: '20代' },
    { id: '30s', label: '30代' },
    { id: '40s', label: '40代' },
    { id: '50s', label: '50代' },
    { id: '60plus', label: '60代以上' },
];
var AgeGroupScreen = function (_a) {
    var navigation = _a.navigation;
    var _b = (0, onboardingStore_1.useOnboardingStore)(), ageGroup = _b.ageGroup, setAgeGroup = _b.setAgeGroup, nextStep = _b.nextStep, prevStep = _b.prevStep;
    var handleNext = function () {
        nextStep();
        navigation.navigate('Complete');
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
          <react_native_1.Text className="text-lg font-medium">3/4</react_native_1.Text>
        </react_native_1.View>

        {/* タイトル */}
        <react_native_1.View className="px-6 mb-6">
          <react_native_1.Text className="text-2xl font-bold mb-2">あなたの年代を教えてください</react_native_1.Text>
          <react_native_1.Text className="text-gray-500">
            年代に合わせたスタイル提案のために使用されます
          </react_native_1.Text>
        </react_native_1.View>

        {/* 年代選択 */}
        <react_native_1.ScrollView className="flex-1 px-6">
          {ageGroups.map(function (age) { return (<onboarding_1.SelectionButton key={age.id} title={age.label} isSelected={ageGroup === age.id} onPress={function () { return setAgeGroup(age.id); }}/>); })}
        </react_native_1.ScrollView>

        {/* 次へボタン */}
        <react_native_1.View className="p-6">
          <common_1.Button isFullWidth onPress={handleNext} disabled={!ageGroup}>
            次へ
          </common_1.Button>
        </react_native_1.View>
      </react_native_1.View>
    </react_native_1.SafeAreaView>);
};
exports.default = AgeGroupScreen;
