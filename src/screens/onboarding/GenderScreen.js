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
var GenderScreen = function (_a) {
    var navigation = _a.navigation;
    var _b = (0, onboardingStore_1.useOnboardingStore)(), gender = _b.gender, setGender = _b.setGender, nextStep = _b.nextStep;
    var handleNext = function () {
        nextStep();
        navigation.navigate('Style');
    };
    return (<react_native_1.SafeAreaView className="flex-1 bg-white">
      <react_native_1.View className="p-6 flex-1">
        {/* ヘッダー */}
        <react_native_1.View className="flex-row items-center justify-between mb-8">
          <react_native_1.TouchableOpacity onPress={function () { return navigation.goBack(); }}>
            <vector_icons_1.Ionicons name="arrow-back" size={24} color="#333"/>
          </react_native_1.TouchableOpacity>
          <react_native_1.Text className="text-lg font-medium">1/4</react_native_1.Text>
        </react_native_1.View>

        {/* タイトル */}
        <react_native_1.Text className="text-2xl font-bold mb-2">あなたの性別を教えてください</react_native_1.Text>
        <react_native_1.Text className="text-gray-500 mb-8">
          より適切なスタイル提案のために使用されます
        </react_native_1.Text>

        {/* 選択肢 */}
        <react_native_1.View className="mb-8">
          <onboarding_1.SelectionButton title="男性" subtitle="メンズスタイル" isSelected={gender === 'male'} onPress={function () { return setGender('male'); }}/>

          <onboarding_1.SelectionButton title="女性" subtitle="レディーススタイル" isSelected={gender === 'female'} onPress={function () { return setGender('female'); }}/>

          <onboarding_1.SelectionButton title="その他" subtitle="ユニセックススタイル" isSelected={gender === 'other'} onPress={function () { return setGender('other'); }}/>
        </react_native_1.View>

        {/* 次へボタン */}
        <common_1.Button isFullWidth onPress={handleNext} disabled={!gender} className="mt-auto">
          次へ
        </common_1.Button>
      </react_native_1.View>
    </react_native_1.SafeAreaView>);
};
exports.default = GenderScreen;
