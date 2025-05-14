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
var width = react_native_1.Dimensions.get('window').width;
var BAR_MAX_WIDTH = width * 0.6; // グラフの最大幅（画面の60%）
var MIN_SCORE_DISPLAY = 0.5; // 表示する最小スコア
var PreferenceTrendsGraph = function (_a) {
    var userPreference = _a.userPreference;
    // ユーザーの好みデータが存在しない場合は表示しない
    if (!userPreference || !userPreference.tagScores) {
        return null;
    }
    // タグスコアを降順にソートして上位7つを取得
    var topTags = (0, react_1.useMemo)(function () {
        return Object.entries(userPreference.tagScores)
            .filter(function (_a) {
            var _ = _a[0], score = _a[1];
            return score >= MIN_SCORE_DISPLAY;
        }) // 最小スコア以上のみ表示
            .sort(function (a, b) { return b[1] - a[1]; }) // スコアの高い順にソート
            .slice(0, 7); // 上位7つのみ取得
    }, [userPreference.tagScores]);
    // 表示するものがない場合
    if (topTags.length === 0) {
        return null;
    }
    // 最大スコアを取得（バーの相対的な幅を計算するため）
    var maxScore = topTags[0][1];
    return (<react_native_1.View className="mb-6">
      <react_native_1.Text className="text-lg font-bold mb-3 px-4">あなたの嗜好傾向</react_native_1.Text>
      <react_native_1.View className="px-4">
        {topTags.map(function (_a, index) {
            var tag = _a[0], score = _a[1];
            // スコアの相対値に基づいて幅を計算
            var relativeScore = score / maxScore;
            var barWidth = BAR_MAX_WIDTH * relativeScore;
            // 交互に異なる色を適用
            var isEven = index % 2 === 0;
            var barColor = isEven ? 'bg-blue-500' : 'bg-indigo-500';
            return (<react_native_1.View key={tag} className="mb-3">
              <react_native_1.View className="flex-row justify-between mb-1">
                <react_native_1.Text className="text-sm text-gray-700">{tag}</react_native_1.Text>
                <react_native_1.Text className="text-xs text-gray-500">
                  {score.toFixed(1)}
                </react_native_1.Text>
              </react_native_1.View>
              <react_native_1.View className="h-4 w-full bg-gray-100 rounded-full overflow-hidden">
                <react_native_1.View className={"h-full ".concat(barColor, " rounded-full")} style={{ width: barWidth }}/>
              </react_native_1.View>
            </react_native_1.View>);
        })}
      </react_native_1.View>
      <react_native_1.Text className="text-xs text-gray-500 mt-2 px-4">
        ※ スワイプの履歴からあなたの好みを分析しています
      </react_native_1.Text>
    </react_native_1.View>);
};
exports.default = PreferenceTrendsGraph;
