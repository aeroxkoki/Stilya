"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var react_native_1 = require("react-native");
var common_1 = require("@/components/common");
var _a = react_native_1.Dimensions.get('window'), width = _a.width, height = _a.height;
var WelcomeScreen = function (_a) {
    var navigation = _a.navigation;
    return (<react_native_1.SafeAreaView className="flex-1 bg-white">
      <react_native_1.View className="flex-1 items-center justify-between py-10 px-6">
        {/* ヘッダー */}
        <react_native_1.View className="w-full items-center mb-4">
          <react_native_1.Image source={require('@/assets/logo-placeholder.png')} className="w-20 h-20" resizeMode="contain"/>
          <react_native_1.Text className="text-2xl font-bold text-gray-800 mt-2">Stilya</react_native_1.Text>
        </react_native_1.View>

        {/* メインコンテンツ */}
        <react_native_1.View className="items-center px-4">
          <react_native_1.Image source={require('@/assets/welcome-illustration.png')} style={styles.illustration} resizeMode="contain"/>
          
          <react_native_1.Text className="text-2xl font-bold text-center mt-8 mb-2">
            ファッションとの新しい出会い
          </react_native_1.Text>
          
          <react_native_1.Text className="text-gray-600 text-center mb-8 leading-6">
            あなたの好みを学習して、最適なファッションアイテムを提案します。スワイプするだけで、あなたの"好き"が見つかります。
          </react_native_1.Text>
        </react_native_1.View>

        {/* フッター */}
        <react_native_1.View className="w-full">
          <common_1.Button isFullWidth onPress={function () { return navigation.navigate('AppIntro'); }}>
            始める
          </common_1.Button>
          
          <react_native_1.Text className="text-gray-400 text-xs text-center mt-6">
            続行すると、利用規約とプライバシーポリシーに同意したことになります。
          </react_native_1.Text>
        </react_native_1.View>
      </react_native_1.View>
    </react_native_1.SafeAreaView>);
};
var styles = react_native_1.StyleSheet.create({
    illustration: {
        width: width * 0.8,
        height: height * 0.3,
    },
});
exports.default = WelcomeScreen;
