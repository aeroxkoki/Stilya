"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var native_stack_1 = require("@react-navigation/native-stack");
var WelcomeScreen_1 = __importDefault(require("@/screens/onboarding/WelcomeScreen"));
var AppIntroScreen_1 = __importDefault(require("@/screens/onboarding/AppIntroScreen"));
var GenderScreen_1 = __importDefault(require("@/screens/onboarding/GenderScreen"));
var StyleScreen_1 = __importDefault(require("@/screens/onboarding/StyleScreen"));
var AgeGroupScreen_1 = __importDefault(require("@/screens/onboarding/AgeGroupScreen"));
var CompleteScreen_1 = __importDefault(require("@/screens/onboarding/CompleteScreen"));
var Stack = (0, native_stack_1.createNativeStackNavigator)();
var OnboardingNavigator = function () {
    return (<Stack.Navigator initialRouteName="Welcome" screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: 'white' },
        }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen_1.default}/>
      <Stack.Screen name="AppIntro" component={AppIntroScreen_1.default}/>
      <Stack.Screen name="Gender" component={GenderScreen_1.default}/>
      <Stack.Screen name="Style" component={StyleScreen_1.default}/>
      <Stack.Screen name="AgeGroup" component={AgeGroupScreen_1.default}/>
      <Stack.Screen name="Complete" component={CompleteScreen_1.default}/>
    </Stack.Navigator>);
};
exports.default = OnboardingNavigator;
