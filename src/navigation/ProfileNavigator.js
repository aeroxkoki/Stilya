"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var stack_1 = require("@react-navigation/stack");
var ProfileScreen_1 = __importDefault(require("@/screens/profile/ProfileScreen"));
var SettingsScreen_1 = __importDefault(require("@/screens/profile/SettingsScreen"));
var FavoritesScreen_1 = __importDefault(require("@/screens/profile/FavoritesScreen"));
var SwipeHistoryScreen_1 = __importDefault(require("@/screens/profile/SwipeHistoryScreen"));
var Stack = (0, stack_1.createStackNavigator)();
var ProfileNavigator = function () {
    return (<Stack.Navigator screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: 'white' },
        }}>
      <Stack.Screen name="ProfileHome" component={ProfileScreen_1.default}/>
      <Stack.Screen name="Settings" component={SettingsScreen_1.default}/>
      <Stack.Screen name="Favorites" component={FavoritesScreen_1.default}/>
      <Stack.Screen name="SwipeHistory" component={SwipeHistoryScreen_1.default}/>
    </Stack.Navigator>);
};
exports.default = ProfileNavigator;
