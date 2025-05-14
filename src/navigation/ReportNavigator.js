"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var native_stack_1 = require("@react-navigation/native-stack");
var ReportScreen_1 = __importDefault(require("../screens/report/ReportScreen"));
var Stack = (0, native_stack_1.createNativeStackNavigator)();
var ReportNavigator = function () {
    return (<Stack.Navigator screenOptions={{
            headerShown: false,
        }}>
      <Stack.Screen name="Report" component={ReportScreen_1.default}/>
      {/* 必要に応じて詳細画面などを追加 */}
    </Stack.Navigator>);
};
exports.default = ReportNavigator;
