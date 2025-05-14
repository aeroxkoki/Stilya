import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
  Animated,
  Easing,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps {
  onPress: () => void;
  title?: string;
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  isLoading?: boolean; // 互換性のため
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
  isFullWidth?: boolean; // 互換性のため
  className?: string; // NativeWindとの互換性
  testID?: string;
}

const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  isLoading,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = false,
  isFullWidth,
  className,
  testID,
}) => {
  // isFullWidthをfullWidthに統合（互換性のため）
  const useFullWidth = fullWidth || isFullWidth;
  // isLoadingをloadingに統合（互換性のため）
  const isButtonLoading = loading || isLoading;
  const { theme, isDarkMode } = useTheme();
  
  // アニメーション用の値
  const scaleAnimation = useRef(new Animated.Value(1)).current;

  // タッチアニメーション
  const handlePressIn = () => {
    Animated.timing(scaleAnimation, {
      toValue: 0.97,
      duration: 150,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnimation, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // サイズに基づくスタイル
  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: theme.spacing.xs,
          paddingHorizontal: theme.spacing.m,
          borderRadius: theme.radius.s,
        };
      case 'large':
        return {
          paddingVertical: theme.spacing.m,
          paddingHorizontal: theme.spacing.xl,
          borderRadius: theme.radius.m,
        };
      case 'medium':
      default:
        return {
          paddingVertical: theme.spacing.s,
          paddingHorizontal: theme.spacing.l,
          borderRadius: theme.radius.m,
        };
    }
  };

  // バリアントに基づくスタイル
  const getVariantStyle = (): ViewStyle => {
    if (disabled) {
      return {
        backgroundColor: theme.colors.button.disabled,
        borderWidth: 0,
      };
    }

    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: theme.colors.secondary,
          borderWidth: 0,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.primary,
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
      case 'primary':
      default:
        return {
          backgroundColor: theme.colors.primary,
          borderWidth: 0,
        };
    }
  };

  // テキストスタイル
  const getTextStyle = (): TextStyle => {
    if (disabled) {
      return {
        color: isDarkMode ? theme.colors.text.secondary : theme.colors.text.hint,
        fontSize: getFontSize(),
        fontWeight: theme.fontWeights.medium as any,
      };
    }

    switch (variant) {
      case 'outline':
        return {
          color: theme.colors.primary,
          fontSize: getFontSize(),
          fontWeight: theme.fontWeights.medium as any,
        };
      case 'text':
        return {
          color: theme.colors.primary,
          fontSize: getFontSize(),
          fontWeight: theme.fontWeights.medium as any,
        };
      case 'primary':
      case 'secondary':
      default:
        return {
          color: theme.colors.text.inverse,
          fontSize: getFontSize(),
          fontWeight: theme.fontWeights.medium as any,
        };
    }
  };

  // フォントサイズを取得
  const getFontSize = (): number => {
    switch (size) {
      case 'small':
        return theme.fontSizes.s;
      case 'large':
        return theme.fontSizes.l;
      case 'medium':
      default:
        return theme.fontSizes.m;
    }
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnimation }],
          width: useFullWidth ? '100%' : 'auto',
        },
        className && { className } // NativeWindとの互換性
      ]}
      testID={testID}
    >
      <TouchableOpacity
        onPress={disabled || isButtonLoading ? undefined : onPress}
        disabled={disabled || isButtonLoading}
        style={[
          styles.button,
          getVariantStyle(),
          getSizeStyle(),
          style,
        ]}
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {isButtonLoading ? (
          <ActivityIndicator
            color={variant === 'outline' || variant === 'text' ? theme.colors.primary : theme.colors.text.inverse}
            size="small"
          />
        ) : (
          <>
            {icon && iconPosition === 'left' && <>{icon}</>}
            <Text 
              style={[
                getTextStyle(), 
                iconPosition === 'left' && icon && styles.textWithLeftIcon, 
                iconPosition === 'right' && icon && styles.textWithRightIcon, 
                textStyle
              ]}
            >
              {children || title}
            </Text>
            {icon && iconPosition === 'right' && <>{icon}</>}
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWithLeftIcon: {
    marginLeft: 8,
  },
  textWithRightIcon: {
    marginRight: 8,
  },
});

export default Button;
