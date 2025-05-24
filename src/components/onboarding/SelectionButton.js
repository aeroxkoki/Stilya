"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var vector_icons_1 = require("@expo/vector-icons");
var common_1 = require("@/components/common");
var StyledComponents_1 = require("../common/StyledComponents");
var SelectionButton = function (_a) {
    var title = _a.title, subtitle = _a.subtitle, isSelected = _a.isSelected, onPress = _a.onPress, icon = _a.icon;
    return (<StyledComponents_1.TouchableOpacity onPress={onPress} activeOpacity={0.7} className="mb-4">
      <common_1.Card className={"p-6 ".concat(isSelected ? 'border-2 border-primary' : '')}>
        <StyledComponents_1.View className="flex-row items-center justify-between">
          <StyledComponents_1.View className="flex-row items-center">
            {icon && <StyledComponents_1.View className="mr-3">{icon}</StyledComponents_1.View>}
            <StyledComponents_1.View>
              <StyledComponents_1.Text className="text-lg font-medium">{title}</StyledComponents_1.Text>
              {subtitle && (<StyledComponents_1.Text className="text-gray-500">{subtitle}</StyledComponents_1.Text>)}
            </StyledComponents_1.View>
          </StyledComponents_1.View>
          {isSelected && (<vector_icons_1.Ionicons name="checkmark-circle" size={24} color="#3B82F6"/>)}
        </StyledComponents_1.View>
      </common_1.Card>
    </StyledComponents_1.TouchableOpacity>);
};
exports.default = SelectionButton;
