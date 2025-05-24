"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var react_native_1 = require("react-native");
var vector_icons_1 = require("@expo/vector-icons");
var RecommendReason = function (_a) {
    var product = _a.product, userPreference = _a.userPreference, _b = _a.compact, compact = _b === void 0 ? false : _b;
    // ユーザー好みが存在しない場合
    if (!userPreference || !userPreference.tagScores || !product.tags) {
        return null;
    }
    // 商品の各タグがユーザーの好みとどれだけ一致しているか計算
    var matchingTags = product.tags
        .filter(function (tag) { return userPreference.tagScores[tag] && userPreference.tagScores[tag] > 0; })
        .sort(function (a, b) { return userPreference.tagScores[b] - userPreference.tagScores[a]; })
        .slice(0, 3); // 上位3つのタグのみ
    // マッチしたタグがない場合
    if (matchingTags.length === 0) {
        return null;
    }
    // スタイルに合わせた理由メッセージの生成
    var reasonMessage = '';
    if (matchingTags.length === 1) {
        reasonMessage = "\u3042\u306A\u305F\u304C\u597D\u304D\u306A\u300C".concat(matchingTags[0], "\u300D\u30B9\u30BF\u30A4\u30EB\u306B\u5408\u3063\u3066\u3044\u307E\u3059");
    }
    else {
        var lastTag = matchingTags.pop();
        reasonMessage = "\u3042\u306A\u305F\u304C\u597D\u304D\u306A\u300C".concat(matchingTags.join('」「'), "\u300D\u3068\u300C").concat(lastTag, "\u300D\u306E\u8981\u7D20\u304C\u3042\u308A\u307E\u3059");
    }
    // コンパクト表示の場合（リスト内など）
    if (compact) {
        return (<react_native_1.View className="mt-1 mb-2 flex-row items-center">
        <vector_icons_1.Ionicons name="checkmark-circle" size={14} color="#4CAF50"/>
        <react_native_1.Text className="text-xs text-green-700 ml-1" numberOfLines={1}>
          {reasonMessage}
        </react_native_1.Text>
      </react_native_1.View>);
    }
    // 詳細表示の場合（商品詳細画面など）
    return (<react_native_1.View className="bg-green-50 p-3 rounded-lg mb-4">
      <react_native_1.Text className="text-sm font-bold text-green-800 mb-1">
        あなたにおすすめの理由
      </react_native_1.Text>
      <react_native_1.Text className="text-sm text-green-700">
        {reasonMessage}
      </react_native_1.Text>
      {matchingTags.length > 0 && (<react_native_1.View className="flex-row flex-wrap mt-2">
          {matchingTags.map(function (tag) { return (<react_native_1.View key={tag} className="bg-green-100 rounded-full px-2 py-1 mr-2 mb-1">
              <react_native_1.Text className="text-xs text-green-800">
                {tag}
              </react_native_1.Text>
            </react_native_1.View>); })}
        </react_native_1.View>)}
    </react_native_1.View>);
};
var styles = react_native_1.StyleSheet.create({
// 必要に応じてスタイルを追加
});
exports.default = RecommendReason;
