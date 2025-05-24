"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var react_native_1 = require("react-native");
var vector_icons_1 = require("@expo/vector-icons");
var EmptyState = function (_a) {
    var message = _a.message, buttonText = _a.buttonText, onButtonPress = _a.onButtonPress;
    return (<react_native_1.View style={styles.container}>
      <vector_icons_1.Feather name="search" size={80} color="#E0E0E0"/>
      <react_native_1.Text style={styles.message}>{message}</react_native_1.Text>
      {buttonText && onButtonPress && (<react_native_1.TouchableOpacity style={styles.button} onPress={onButtonPress}>
          <react_native_1.Text style={styles.buttonText}>{buttonText}</react_native_1.Text>
        </react_native_1.TouchableOpacity>)}
    </react_native_1.View>);
};
var styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    message: {
        fontSize: 18,
        color: '#757575',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    button: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
exports.default = EmptyState;
