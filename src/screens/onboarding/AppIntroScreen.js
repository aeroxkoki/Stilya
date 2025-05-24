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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var vector_icons_1 = require("@expo/vector-icons");
var common_1 = require("@/components/common");
var IntroSlide_1 = __importDefault(require("@/components/onboarding/IntroSlide"));
var width = react_native_1.Dimensions.get('window').width;
// アプリ紹介スライドのデータ
var slides = [
    {
        title: 'スワイプで好みを学習',
        description: '左右にスワイプするだけで、あなたの好みを簡単に教えてください。多くのアイテムをチェックするほど、おすすめの精度が上がります。',
        image: require('@/assets/style-casual.png'),
    },
    {
        title: 'パーソナライズされた提案',
        description: 'あなたの好みに基づいて、洋服やコーディネートを提案します。スワイプするほど、あなたにぴったりのアイテムが見つかります。',
        image: require('@/assets/style-mode.png'),
    },
    {
        title: '商品をチェック',
        description: '気に入ったアイテムはすぐに詳細をチェック。そのまま購入サイトへ移動することもできます。',
        image: require('@/assets/style-natural.png'),
    },
];
var AppIntroScreen = function (_a) {
    var navigation = _a.navigation;
    var _b = (0, react_1.useState)(0), currentIndex = _b[0], setCurrentIndex = _b[1];
    var flatListRef = (0, react_1.useRef)(null);
    var handleNext = function () {
        var _a;
        if (currentIndex === slides.length - 1) {
            // 最後のスライドの場合は性別選択画面へ
            navigation.navigate('Gender');
        }
        else {
            // 次のスライドへ
            var nextIndex = currentIndex + 1;
            (_a = flatListRef.current) === null || _a === void 0 ? void 0 : _a.scrollToIndex({
                animated: true,
                index: nextIndex,
            });
            setCurrentIndex(nextIndex);
        }
    };
    var handleSkip = function () {
        // スキップして性別選択画面へ
        navigation.navigate('Gender');
    };
    var handleBack = function () {
        var _a;
        if (currentIndex === 0) {
            // 最初のスライドの場合はウェルカム画面へ戻る
            navigation.goBack();
        }
        else {
            // 前のスライドへ
            var prevIndex = currentIndex - 1;
            (_a = flatListRef.current) === null || _a === void 0 ? void 0 : _a.scrollToIndex({
                animated: true,
                index: prevIndex,
            });
            setCurrentIndex(prevIndex);
        }
    };
    var onViewableItemsChanged = (0, react_1.useRef)(function (_a) {
        var viewableItems = _a.viewableItems;
        if (viewableItems[0]) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;
    var renderItem = function (_a) {
        var item = _a.item;
        return <IntroSlide_1.default {...item}/>;
    };
    return (<react_native_1.View className="flex-1 bg-white">
      <react_native_1.View className="flex-row justify-between items-center p-6">
        <react_native_1.TouchableOpacity onPress={handleBack}>
          <vector_icons_1.Ionicons name="arrow-back" size={24} color="#333"/>
        </react_native_1.TouchableOpacity>
        
        <react_native_1.TouchableOpacity onPress={handleSkip}>
          <react_native_1.Text className="text-gray-500 font-medium">スキップ</react_native_1.Text>
        </react_native_1.TouchableOpacity>
      </react_native_1.View>

      <react_native_1.FlatList ref={flatListRef} data={slides} renderItem={renderItem} keyExtractor={function (_, index) { return index.toString(); }} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onViewableItemsChanged={onViewableItemsChanged} viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }} initialNumToRender={1} getItemLayout={function (_, index) { return ({
            length: width,
            offset: width * index,
            index: index,
        }); }}/>

      {/* インジケーター */}
      <react_native_1.View className="flex-row justify-center mb-8">
        {slides.map(function (_, index) { return (<react_native_1.View key={index} className={"h-2 w-2 rounded-full mx-1 ".concat(index === currentIndex ? 'bg-primary' : 'bg-gray-300')}/>); })}
      </react_native_1.View>

      <react_native_1.View className="px-6 mb-10">
        <common_1.Button isFullWidth onPress={handleNext}>
          {currentIndex === slides.length - 1 ? '始める' : '次へ'}
        </common_1.Button>
      </react_native_1.View>
    </react_native_1.View>);
};
exports.default = AppIntroScreen;
