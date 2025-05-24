"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toastConfig = void 0;
var react_1 = __importDefault(require("react"));
var react_native_1 = require("react-native");
var react_native_toast_message_1 = require("react-native-toast-message");
var vector_icons_1 = require("@expo/vector-icons");
/**
 * Toastのカスタムスタイル設定
 */
exports.toastConfig = {
    success: function (props) { return (<react_native_toast_message_1.BaseToast {...props} style={{
            borderLeftColor: '#22C55E',
            backgroundColor: '#F0FDF4',
            width: '90%',
            height: 'auto',
            minHeight: 60,
            paddingVertical: 8,
            borderRadius: 8,
        }} contentContainerStyle={{ paddingHorizontal: 15 }} text1Style={{
            fontSize: 14,
            fontWeight: '600',
            color: '#166534',
        }} text2Style={{
            fontSize: 12,
            color: '#166534',
        }} text1NumberOfLines={2} text2NumberOfLines={2} renderLeadingIcon={function () { return (<react_native_1.View style={styles.iconContainer}>
          <vector_icons_1.Ionicons name="checkmark-circle" size={24} color="#22C55E"/>
        </react_native_1.View>); }}/>); },
    error: function (props) { return (<react_native_toast_message_1.ErrorToast {...props} style={{
            borderLeftColor: '#EF4444',
            backgroundColor: '#FEF2F2',
            width: '90%',
            height: 'auto',
            minHeight: 60,
            paddingVertical: 8,
            borderRadius: 8,
        }} contentContainerStyle={{ paddingHorizontal: 15 }} text1Style={{
            fontSize: 14,
            fontWeight: '600',
            color: '#991B1B',
        }} text2Style={{
            fontSize: 12,
            color: '#991B1B',
        }} text1NumberOfLines={2} text2NumberOfLines={3} renderLeadingIcon={function () { return (<react_native_1.View style={styles.iconContainer}>
          <vector_icons_1.Ionicons name="alert-circle" size={24} color="#EF4444"/>
        </react_native_1.View>); }}/>); },
    info: function (props) { return (<react_native_toast_message_1.BaseToast {...props} style={{
            borderLeftColor: '#3B82F6',
            backgroundColor: '#EFF6FF',
            width: '90%',
            height: 'auto',
            minHeight: 60,
            paddingVertical: 8,
            borderRadius: 8,
        }} contentContainerStyle={{ paddingHorizontal: 15 }} text1Style={{
            fontSize: 14,
            fontWeight: '600',
            color: '#1E40AF',
        }} text2Style={{
            fontSize: 12,
            color: '#1E40AF',
        }} text1NumberOfLines={2} text2NumberOfLines={2} renderLeadingIcon={function () { return (<react_native_1.View style={styles.iconContainer}>
          <vector_icons_1.Ionicons name="information-circle" size={24} color="#3B82F6"/>
        </react_native_1.View>); }}/>); },
    warning: function (props) { return (<react_native_toast_message_1.BaseToast {...props} style={{
            borderLeftColor: '#F59E0B',
            backgroundColor: '#FFFBEB',
            width: '90%',
            height: 'auto',
            minHeight: 60,
            paddingVertical: 8,
            borderRadius: 8,
        }} contentContainerStyle={{ paddingHorizontal: 15 }} text1Style={{
            fontSize: 14,
            fontWeight: '600',
            color: '#92400E',
        }} text2Style={{
            fontSize: 12,
            color: '#92400E',
        }} text1NumberOfLines={2} text2NumberOfLines={2} renderLeadingIcon={function () { return (<react_native_1.View style={styles.iconContainer}>
          <vector_icons_1.Ionicons name="warning" size={24} color="#F59E0B"/>
        </react_native_1.View>); }}/>); },
};
var styles = react_native_1.StyleSheet.create({
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
});
exports.default = exports.toastConfig;
