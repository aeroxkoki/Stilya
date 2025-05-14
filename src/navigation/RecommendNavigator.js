"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var stack_1 = require("@react-navigation/stack");
var RecommendScreen_1 = __importDefault(require("@/screens/recommend/RecommendScreen"));
var EnhancedRecommendScreen_1 = __importDefault(require("@/screens/recommend/EnhancedRecommendScreen"));
var ProductDetailScreen_1 = __importDefault(require("@/screens/detail/ProductDetailScreen"));
var Stack = (0, stack_1.createStackNavigator)();
var RecommendNavigator = function () {
    // 拡張版レコメンド画面を使用するかどうか
    // 実際のアプリでは設定やフラグなどで切り替える
    var useEnhancedRecommend = true;
    return (<Stack.Navigator screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: 'white' },
        }}>
      {useEnhancedRecommend ? (<Stack.Screen name="RecommendHome" component={EnhancedRecommendScreen_1.default}/>) : (<Stack.Screen name="RecommendHome" component={RecommendScreen_1.default}/>)}
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen_1.default}/>
    </Stack.Navigator>);
};
exports.default = RecommendNavigator;
