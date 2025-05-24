"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var native_stack_1 = require("@react-navigation/native-stack");
var RecommendationTestScreen_1 = __importDefault(require("@/screens/dev/RecommendationTestScreen"));
var Stack = (0, native_stack_1.createNativeStackNavigator)();
/**
 * 開発者向けツール画面のナビゲーター
 */
var DevNavigator = function () {
    return (<Stack.Navigator>
      <Stack.Screen name="RecommendationTest" component={RecommendationTestScreen_1.default} options={{
            title: 'レコメンド機能テスト',
            headerLargeTitle: true
        }}/>
    </Stack.Navigator>);
};
exports.default = DevNavigator;
