import React from 'react';
import { View, ViewProps } from 'react-native';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  children,
  className,
  ...rest
}) => {
  // バリアントに基づくスタイル
  const variantStyles = {
    elevated: 'bg-white rounded-lg shadow-md border border-gray-100',
    outlined: 'bg-white rounded-lg border border-gray-200',
    filled: 'bg-gray-50 rounded-lg',
  };

  // ベースのカードスタイル
  const baseCardStyle = 'p-4 overflow-hidden';
  
  // 最終的なスタイル
  const finalCardStyle = twMerge(baseCardStyle, variantStyles[variant], className);

  return (
    <View className={finalCardStyle} {...rest}>
      {children}
    </View>
  );
};

export default Card;
