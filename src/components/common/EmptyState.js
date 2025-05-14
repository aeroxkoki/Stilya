"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var react_native_1 = require("react-native");
var vector_icons_1 = require("@expo/vector-icons");
var EmptyState = function (_a) {
    var title = _a.title, message = _a.message, buttonText = _a.buttonText, onButtonPress = _a.onButtonPress, _b = _a.icon, icon = _b === void 0 ? 'information-circle-outline' : _b, _c = _a.iconColor, iconColor = _c === void 0 ? '#3B82F6' : _c;
    return (<react_native_1.View style={styles.container}>
      <vector_icons_1.Ionicons name={icon} size={64} color={iconColor}/>
      
      {title && <react_native_1.Text style={styles.title}>{title}</react_native_1.Text>}
      
      <react_native_1.Text style={styles.message}>{message}</react_native_1.Text>
      
      {buttonText && onButtonPress && (<react_native_1.TouchableOpacity style={styles.button} onPress={onButtonPress} activeOpacity={0.7}>
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
        backgroundColor: '#F5F5F5',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
        maxWidth: '80%',
    },
    button: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
exports.default = EmptyState;
