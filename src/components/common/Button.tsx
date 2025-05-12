import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = false,
}) => {
  const { theme } = useTheme();

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
        color: theme.colors.text.hint,
        fontSize: getFontSize(),
        fontWeight: theme.fontWeights.medium,
      };
    }

    switch (variant) {
      case 'outline':
        return {
          color: theme.colors.primary,
          fontSize: getFontSize(),
          fontWeight: theme.fontWeights.medium,
        };
      case 'text':
        return {
          color: theme.colors.primary,
          fontSize: getFontSize(),
          fontWeight: theme.fontWeights.medium,
        };
      case 'primary':
      case 'secondary':
      default:
        return {
          color: theme.colors.text.inverse,
          fontSize: getFontSize(),
          fontWeight: theme.fontWeights.medium,
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
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        getVariantStyle(),
        getSizeStyle(),
        fullWidth && styles.fullWidth,
        style,
      ]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'text' ? theme.colors.primary : theme.colors.text.inverse}
          size="small"
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && <>{icon}</>}
          <Text style={[getTextStyle(), iconPosition === 'left' && icon && styles.textWithLeftIcon, iconPosition === 'right' && icon && styles.textWithRightIcon, textStyle]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && <>{icon}</>}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  textWithLeftIcon: {
    marginLeft: 8,
  },
  textWithRightIcon: {
    marginRight: 8,
  },
});

export default Button;
