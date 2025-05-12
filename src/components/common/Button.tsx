import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  isFullWidth?: boolean;
  children: React.ReactNode;
  textClassName?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  isFullWidth = false,
  children,
  className,
  textClassName,
  disabled,
  ...rest
}) => {
  // サイズに基づくスタイルのマッピング
  const sizeStyles = {
    sm: 'py-1.5 px-3',
    md: 'py-2.5 px-4',
    lg: 'py-3 px-5',
  };

  const textSizeStyles = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  // バリアントに基づくスタイルのマッピング
  const variantStyles = {
    primary: 'bg-primary text-white',
    secondary: 'bg-secondary text-white',
    outline: 'bg-transparent border border-primary',
    ghost: 'bg-transparent',
  };

  const variantTextStyles = {
    primary: 'text-white font-medium',
    secondary: 'text-white font-medium',
    outline: 'text-primary font-medium',
    ghost: 'text-primary font-medium',
  };

  // ボタンの幅スタイル
  const widthStyle = isFullWidth ? 'w-full' : 'w-auto';

  // ボタンのベーススタイル
  const baseButtonStyle = `rounded-md flex-row items-center justify-center ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle}`;
  
  // 無効化されたスタイル
  const disabledStyle = disabled || isLoading ? 'opacity-50' : '';

  // マージされた最終スタイル
  const finalButtonStyle = twMerge(baseButtonStyle, disabledStyle, className);
  
  // テキストスタイル
  const baseTextStyle = `${textSizeStyles[size]} ${variantTextStyles[variant]}`;
  const finalTextStyle = twMerge(baseTextStyle, textClassName);

  return (
    <TouchableOpacity 
      className={finalButtonStyle}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' || variant === 'ghost' ? '#3B82F6' : '#ffffff'} 
        />
      ) : (
        <>
          {icon && <View className="mr-2">{icon}</View>}
          <Text className={finalTextStyle}>{children}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default Button;
