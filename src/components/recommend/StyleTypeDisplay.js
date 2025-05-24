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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var react_native_1 = require("react-native");
// 定義済みのスタイルタイプ
var STYLE_TYPES = [
    {
        id: 'casual',
        name: 'カジュアル',
        description: '日常的で着心地のよい、リラックスしたスタイル',
        image: require('@/assets/style-casual.png'),
        tags: ['カジュアル', 'デイリー', 'シンプル', 'ベーシック', 'ナチュラル']
    },
    {
        id: 'mode',
        name: 'モード',
        description: '洗練されたシルエットと都会的なエッセンスを持つスタイル',
        image: require('@/assets/style-mode.png'),
        tags: ['モード', 'モノトーン', '都会的', 'ミニマル', 'クール']
    },
    {
        id: 'classic',
        name: 'クラシック',
        description: '時代を超えた普遍的なデザインと上品さを備えたスタイル',
        image: require('@/assets/style-classic.png'),
        tags: ['クラシック', 'エレガント', 'フォーマル', '上品', 'トラッド']
    },
    {
        id: 'natural',
        name: 'ナチュラル',
        description: '素材感を活かした自然体で優しい印象のスタイル',
        image: require('@/assets/style-natural.png'),
        tags: ['ナチュラル', 'オーガニック', '優しい', 'リラックス', 'コットン']
    },
    {
        id: 'street',
        name: 'ストリート',
        description: '都市文化やスポーツの要素を取り入れた個性的なスタイル',
        image: require('@/assets/style-street.png'),
        tags: ['ストリート', 'スポーティ', '個性的', 'カジュアル', 'ワイド']
    },
    {
        id: 'feminine',
        name: 'フェミニン',
        description: '女性らしさや柔らかさを強調した優美なスタイル',
        image: require('@/assets/style-feminine.png'),
        tags: ['フェミニン', 'ガーリー', 'ロマンティック', 'スウィート', '華やか']
    }
];
var StyleTypeDisplay = function (_a) {
    var userPreference = _a.userPreference;
    if (!userPreference || !userPreference.topTags || userPreference.topTags.length === 0) {
        return null;
    }
    // ユーザーの好みのタグから、最も合致するスタイルタイプを計算
    var matchedStyles = STYLE_TYPES.map(function (style) {
        var matchScore = 0;
        // スタイルタイプのタグがユーザーの好みのタグに含まれているかチェック
        style.tags.forEach(function (tag) {
            if (userPreference.topTags.includes(tag)) {
                matchScore += 1;
            }
            // タグスコアも考慮（タグスコアが高いものはより高いスコアを加算）
            if (userPreference.tagScores[tag]) {
                matchScore += userPreference.tagScores[tag] * 0.5;
            }
        });
        return __assign(__assign({}, style), { matchScore: matchScore });
    })
        .filter(function (style) { return style.matchScore > 0; }) // マッチしたスタイルのみ
        .sort(function (a, b) { return b.matchScore - a.matchScore; }) // スコアの高い順にソート
        .slice(0, 3); // 上位3つのみ表示
    if (matchedStyles.length === 0) {
        return null;
    }
    return (<react_native_1.View className="mb-6">
      <react_native_1.Text className="text-lg font-bold mb-3 px-4">あなたのスタイルタイプ</react_native_1.Text>
      <react_native_1.ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {matchedStyles.map(function (style) { return (<react_native_1.View key={style.id} className="bg-white rounded-lg shadow-sm mr-4 w-64 overflow-hidden">
            <react_native_1.Image source={style.image} className="w-full h-32" resizeMode="cover"/>
            <react_native_1.View className="p-3">
              <react_native_1.Text className="text-base font-bold mb-1">{style.name}</react_native_1.Text>
              <react_native_1.Text className="text-sm text-gray-600 mb-2">{style.description}</react_native_1.Text>
              <react_native_1.View className="flex-row flex-wrap">
                {style.tags.slice(0, 3).map(function (tag) { return (<react_native_1.View key={tag} className="bg-gray-100 rounded-full px-2 py-1 mr-1 mb-1">
                    <react_native_1.Text className="text-xs text-gray-700">{tag}</react_native_1.Text>
                  </react_native_1.View>); })}
              </react_native_1.View>
            </react_native_1.View>
          </react_native_1.View>); })}
      </react_native_1.ScrollView>
    </react_native_1.View>);
};
var styles = react_native_1.StyleSheet.create({
    scrollContent: {
        paddingHorizontal: 16,
        paddingVertical: 8
    }
});
exports.default = StyleTypeDisplay;
