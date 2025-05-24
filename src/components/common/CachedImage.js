"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpoImage = void 0;
var react_1 = __importDefault(require("react"));
var react_native_1 = require("react-native");
// ポリフィル実装（本番環境では実際のexpo-imageをインポートする）
var MockExpoImage = function (_a) {
    var source = _a.source, style = _a.style, className = _a.className, contentFit = _a.contentFit, restProps = __rest(_a, ["source", "style", "className", "contentFit"]);
    // classNameを使わないスタイル版の実装（temporary fix）
    var resizeMode = contentFit === 'contain' ? 'contain' :
        contentFit === 'cover' ? 'cover' :
            contentFit === 'fill' ? 'stretch' : 'cover';
    return (<react_native_1.Image source={source} style={style} resizeMode={resizeMode} {...restProps}/>);
};
exports.ExpoImage = MockExpoImage;
exports.default = exports.ExpoImage;
