"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var react_native_1 = require("react-native");
var StyledComponents_1 = require("../common/StyledComponents");
var _a = react_native_1.Dimensions.get('window'), width = _a.width, height = _a.height;
var IntroSlide = function (_a) {
    var title = _a.title, description = _a.description, image = _a.image;
    return (<StyledComponents_1.View className="items-center justify-center px-6">
      <StyledComponents_1.Image source={image} style={styles.image} resizeMode="contain"/>
      
      <StyledComponents_1.Text className="text-2xl font-bold text-center mt-8 mb-3">
        {title}
      </StyledComponents_1.Text>
      
      <StyledComponents_1.Text className="text-gray-600 text-center leading-6">
        {description}
      </StyledComponents_1.Text>
    </StyledComponents_1.View>);
};
var styles = react_native_1.StyleSheet.create({
    image: {
        width: width * 0.7,
        height: height * 0.3,
    },
});
exports.default = IntroSlide;
