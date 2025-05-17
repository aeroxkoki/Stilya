"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
var react_1 = __importDefault(require("react"));
var expo_status_bar_1 = require("expo-status-bar");
var react_native_safe_area_context_1 = require("react-native-safe-area-context");
var react_native_toast_message_1 = __importDefault(require("react-native-toast-message"));
var AppNavigator_1 = __importDefault(require("./src/navigation/AppNavigator"));
var AuthContext_1 = require("./src/contexts/AuthContext");
var ThemeContext_1 = require("./src/contexts/ThemeContext");
var NetworkContext_1 = require("./src/contexts/NetworkContext");
var react_native_gesture_handler_1 = require("react-native-gesture-handler");
function App() {
    return (<react_native_gesture_handler_1.GestureHandlerRootView style={{ flex: 1 }}>
      <react_native_safe_area_context_1.SafeAreaProvider>
        <NetworkContext_1.NetworkProvider>
          <ThemeContext_1.ThemeProvider>
            <AuthContext_1.AuthProvider>
              <expo_status_bar_1.StatusBar style="auto"/>
              <AppNavigator_1.default />
              <react_native_toast_message_1.default />
            </AuthContext_1.AuthProvider>
          </ThemeContext_1.ThemeProvider>
        </NetworkContext_1.NetworkProvider>
      </react_native_safe_area_context_1.SafeAreaProvider>
    </react_native_gesture_handler_1.GestureHandlerRootView>);
}
