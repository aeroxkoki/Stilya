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
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var vector_icons_1 = require("@expo/vector-icons");
var StyleTips = function (_a) {
    var userPreference = _a.userPreference, _b = _a.compact, compact = _b === void 0 ? false : _b;
    // ユーザーの好みデータが存在しない場合は表示しない
    if (!userPreference || !userPreference.topTags || userPreference.topTags.length === 0) {
        return null;
    }
    // ユーザーの好みタグから、おすすめのスタイリングTipsを生成
    var styleTips = (0, react_1.useMemo)(function () {
        var tips = [];
        // カジュアル系のタグがあるかチェック
        var hasCasualStyle = userPreference.topTags.some(function (tag) { return ['カジュアル', 'ナチュラル', 'デイリー', 'シンプル'].includes(tag); });
        // モード系のタグがあるかチェック
        var hasModeStyle = userPreference.topTags.some(function (tag) { return ['モード', 'モノトーン', '都会的', 'ミニマル', 'クール'].includes(tag); });
        // フェミニン系のタグがあるかチェック
        var hasFeminineStyle = userPreference.topTags.some(function (tag) { return ['フェミニン', 'ガーリー', 'ロマンティック', 'スウィート'].includes(tag); });
        // ストリート系のタグがあるかチェック
        var hasStreetStyle = userPreference.topTags.some(function (tag) { return ['ストリート', 'スポーティ', '個性的', 'ワイド'].includes(tag); });
        // タグに基づいてTipsを追加
        if (hasCasualStyle) {
            tips.push({
                title: 'シンプルさを大切に',
                description: 'ナチュラル素材のアイテムを中心に、着回しやすいベーシックカラーを選びましょう。',
                icon: 'shirt-outline',
            });
        }
        if (hasModeStyle) {
            tips.push({
                title: '洗練されたシルエット',
                description: '黒・白・グレーを基調に、シャープでクリーンなラインを意識したスタイリングがおすすめです。',
                icon: 'contrast-outline',
            });
        }
        if (hasFeminineStyle) {
            tips.push({
                title: '優しい色合いと素材感',
                description: 'パステルカラーやフリル、柔らかな素材でフェミニンな印象を引き立てましょう。',
                icon: 'flower-outline',
            });
        }
        if (hasStreetStyle) {
            tips.push({
                title: 'レイヤードで個性を',
                description: 'オーバーサイズのアイテムをレイヤードして、カジュアルながらも個性的なコーディネートに。',
                icon: 'layers-outline',
            });
        }
        // 一般的なTips（好みに関わらず表示）
        tips.push({
            title: 'トーンを揃える',
            description: '似た色調のアイテムを組み合わせると、統一感のあるコーディネートになります。',
            icon: 'color-palette-outline',
        });
        return tips.slice(0, 3); // 最大3つまで表示
    }, [userPreference.topTags]);
    // コンパクト表示の場合
    if (compact) {
        return (<react_native_1.View className="mb-4">
        <react_native_1.Text className="text-lg font-bold mb-2">スタイリングTips</react_native_1.Text>
        {styleTips.map(function (tip, index) { return (<react_native_1.View key={index} className="flex-row items-start mb-2">
            <vector_icons_1.Ionicons name={tip.icon} size={16} color="#4B5563" style={{ marginTop: 2, marginRight: 8 }}/>
            <react_native_1.Text className="text-sm text-gray-700 flex-1">{tip.title}</react_native_1.Text>
          </react_native_1.View>); })}
      </react_native_1.View>);
    }
    // 通常表示の場合
    return (<react_native_1.View className="mb-6">
      <react_native_1.Text className="text-lg font-bold mb-3 px-4">あなたにぴったりなスタイリングTips</react_native_1.Text>
      <react_native_1.View className="px-4">
        {styleTips.map(function (tip, index) { return (<react_native_1.View key={index} className="bg-white border border-gray-100 rounded-lg p-4 mb-3 shadow-sm">
            <react_native_1.View className="flex-row items-center mb-2">
              <react_native_1.View className="bg-blue-100 p-2 rounded-full mr-3">
                <vector_icons_1.Ionicons name={tip.icon} size={20} color="#3B82F6"/>
              </react_native_1.View>
              <react_native_1.Text className="text-base font-bold text-gray-800">{tip.title}</react_native_1.Text>
            </react_native_1.View>
            <react_native_1.Text className="text-sm text-gray-600">{tip.description}</react_native_1.Text>
          </react_native_1.View>); })}
      </react_native_1.View>
    </react_native_1.View>);
};
exports.default = StyleTips;
