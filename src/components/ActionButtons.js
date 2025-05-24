"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var react_native_1 = require("react-native");
var vector_icons_1 = require("@expo/vector-icons");
var ActionButtons = function (_a) {
    var onPressNo = _a.onPressNo, onPressYes = _a.onPressYes;
    return (<react_native_1.View style={styles.container}>
      <react_native_1.TouchableOpacity style={[styles.button, styles.noButton]} onPress={onPressNo}>
        <vector_icons_1.Feather name="x" size={30} color="#F44336"/>
      </react_native_1.TouchableOpacity>

      <react_native_1.TouchableOpacity style={[styles.button, styles.yesButton]} onPress={onPressYes}>
        <vector_icons_1.Feather name="check" size={30} color="#4CAF50"/>
      </react_native_1.TouchableOpacity>
    </react_native_1.View>);
};
var styles = react_native_1.StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 20,
        paddingHorizontal: 50,
        width: '100%',
    },
    button: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    noButton: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#F44336',
    },
    yesButton: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#4CAF50',
    },
});
exports.default = ActionButtons;
