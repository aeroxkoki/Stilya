import React from 'react';
import {
  StyleSheet,
  StyleProp,
  ViewStyle,
  Platform,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { View, TouchableOpacity } from './StyledComponents';

export interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevation?: 'none' | 'small' | 'medium' | 'large';
  onPress?: () => void;
  disabled?: boolean;
  variant?: 'filled' | 'outlined' | 'flat' | 'elevated';
  padding?: number | string; // カスタムパディングのサポート
  testID?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  elevation = 'small',
  onPress,
  disabled = false,
  variant = 'filled',
  padding,
  testID,
}) => {
  const { theme, isDarkMode } = useTheme();

  // 影のレベルに基づいたスタイルを取得
  const getElevationStyle = (): ViewStyle => {
    switch (elevation) {
      case 'none':
        return {
          shadowOpacity: 0,
          elevation: 0,
        };
      case 'small':
        return {
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: isDarkMode ? 0.3 : 0.1,
          shadowRadius: 2,
          elevation: 1,
        };
      case 'medium':
        return {
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDarkMode ? 0.4 : 0.15,
          shadowRadius: 3,
          elevation: 3,
        };
      case 'large':
        return {
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDarkMode ? 0.5 : 0.2,
          shadowRadius: 4,
          elevation: 5,
        };
      default:
        return {
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: isDarkMode ? 0.3 : 0.1,
          shadowRadius: 2,
          elevation: 1,
        };
    }
  };

  // バリアントに基づいたスタイルを取得
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.border,
        };
      case 'flat':
        return {
          backgroundColor: theme.colors.card.background,
          borderWidth: 0,
          shadowOpacity: 0,
          elevation: 0,
        };
      case 'elevated':
        return {
          backgroundColor: theme.colors.card.background,
          ...getElevationStyle(),
        };
      case 'filled':
      default:
        return {};
    }
  };

  // pxやremなどの単位を使った場合に対応するため、数値に変換
  const paddingValue = typeof padding === 'string' 
    ? parseInt(padding, 10) || 16 // 数値に変換できない場合はデフォルト値
    : padding;

  const cardStyle = [
    styles.card,
    {
      backgroundColor: theme.colors.card.background,
      borderRadius: theme.radius.m,
      shadowColor: isDarkMode ? '#000' : '#222',
      ...(paddingValue !== undefined && { padding: paddingValue }),
      ...Platform.select({
        ios: {
          ...(variant !== 'flat' ? getElevationStyle() : { shadowOpacity: 0 }),
        },
        android: {
          elevation: variant === 'outlined' || variant === 'flat' ? 0 : getElevationStyle().elevation,
        },
      }),
    },
    getVariantStyle(),
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.8}
        disabled={disabled}
        testID={testID}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle} testID={testID}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    overflow: 'hidden',
  },
});

export default Card;
