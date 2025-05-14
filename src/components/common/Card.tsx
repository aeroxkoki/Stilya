import React from 'react';
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevation?: 'none' | 'small' | 'medium' | 'large';
  onPress?: () => void;
  disabled?: boolean;
  variant?: 'filled' | 'outlined';
  className?: string; // NativeWindとの互換性用
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
  className,
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

  // アウトライン表示の場合のスタイル
  const variantStyle: ViewStyle = variant === 'outlined' 
    ? {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.border.light,
      }
    : {};

  const cardStyle = [
    styles.card,
    {
      backgroundColor: variant === 'outlined' 
        ? 'transparent'
        : theme.colors.background.card,
      borderRadius: theme.radius.m,
      shadowColor: isDarkMode ? '#000' : '#222',
      ...(padding !== undefined && { padding }),
      ...Platform.select({
        ios: {
          ...getElevationStyle(),
        },
        android: {
          elevation: variant === 'outlined' ? 0 : getElevationStyle().elevation,
        },
      }),
    },
    variantStyle,
    style,
    className && { className },
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
