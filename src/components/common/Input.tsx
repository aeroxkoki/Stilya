import React, { useState } from 'react';
import { TextInput, View, Text, TextInputProps, TouchableOpacity } from 'react-native';
import { twMerge } from 'tailwind-merge';
import { Ionicons } from '@expo/vector-icons';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'outlined' | 'filled';
  isFullWidth?: boolean;
  isPassword?: boolean;
  containerClassName?: string;
  inputClassName?: string;
  labelClassName?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  variant = 'outlined',
  isFullWidth = true,
  isPassword = false,
  containerClassName,
  inputClassName,
  labelClassName,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!isPassword);

  // コンテナのスタイル
  const baseContainerStyle = `mb-4 ${isFullWidth ? 'w-full' : 'w-auto'}`;
  const finalContainerStyle = twMerge(baseContainerStyle, containerClassName);

  // 入力フィールドのスタイル
  const baseInputStyle = `rounded-md px-3 py-2.5 text-base ${leftIcon ? 'pl-10' : ''} ${
    rightIcon || isPassword ? 'pr-10' : ''
  }`;

  // バリアントに基づくスタイル
  const variantStyles = {
    outlined: `border ${
      error ? 'border-red-500' : isFocused ? 'border-primary' : 'border-gray-300'
    } bg-white`,
    filled: `${
      error
        ? 'bg-red-50 border-red-500'
        : isFocused
        ? 'bg-blue-50 border-primary'
        : 'bg-gray-100 border-transparent'
    }`,
  };

  const finalInputStyle = twMerge(baseInputStyle, variantStyles[variant], inputClassName);

  // ラベルのスタイル
  const baseLabelStyle = 'text-sm font-medium mb-1';
  const labelVariantStyles = error ? 'text-red-500' : 'text-gray-700';
  const finalLabelStyle = twMerge(baseLabelStyle, labelVariantStyles, labelClassName);

  // エラーテキストのスタイル
  const errorTextStyle = 'text-red-500 text-xs mt-1';

  // ヘルパーテキストのスタイル
  const helperTextStyle = 'text-gray-500 text-xs mt-1';

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View className={finalContainerStyle}>
      {label && <Text className={finalLabelStyle}>{label}</Text>}
      <View className="relative">
        {leftIcon && <View className="absolute left-3 top-2.5 z-10">{leftIcon}</View>}
        
        <TextInput
          className={finalInputStyle}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !isPasswordVisible}
          {...rest}
        />
        
        {isPassword ? (
          <TouchableOpacity
            className="absolute right-3 top-2.5 z-10"
            onPress={togglePasswordVisibility}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>
        ) : (
          rightIcon && <View className="absolute right-3 top-2.5 z-10">{rightIcon}</View>
        )}
      </View>
      
      {error ? (
        <Text className={errorTextStyle}>{error}</Text>
      ) : helperText ? (
        <Text className={helperTextStyle}>{helperText}</Text>
      ) : null}
    </View>
  );
};

export default Input;
