"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var native_stack_1 = require("@react-navigation/native-stack");
var LoginScreen_1 = __importDefault(require("@/screens/auth/LoginScreen"));
var RegisterScreen_1 = __importDefault(require("@/screens/auth/RegisterScreen"));
var ForgotPasswordScreen_1 = __importDefault(require("@/screens/auth/ForgotPasswordScreen"));
var Stack = (0, native_stack_1.createNativeStackNavigator)();
var AuthNavigator = function () {
    return (<Stack.Navigator initialRouteName="Login" screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: 'white' },
        }}>
      <Stack.Screen name="Login" component={LoginScreen_1.default}/>
      <Stack.Screen name="Register" component={RegisterScreen_1.default}/>
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen_1.default}/>
    </Stack.Navigator>);
};
exports.default = AuthNavigator;
