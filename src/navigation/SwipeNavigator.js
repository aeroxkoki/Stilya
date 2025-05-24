"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var stack_1 = require("@react-navigation/stack");
var SwipeScreen_1 = __importDefault(require("@/screens/swipe/SwipeScreen"));
var ProductDetailScreen_1 = __importDefault(require("@/screens/detail/ProductDetailScreen"));
var Stack = (0, stack_1.createStackNavigator)();
var SwipeNavigator = function () {
    return (<Stack.Navigator screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: 'white' },
        }}>
      <Stack.Screen name="SwipeHome" component={SwipeScreen_1.default}/>
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen_1.default}/>
    </Stack.Navigator>);
};
exports.default = SwipeNavigator;
