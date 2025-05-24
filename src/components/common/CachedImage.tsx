import React from 'react';
import { Image, StyleProp, ImageStyle, StyleSheet } from 'react-native';

// 既存のExpo Imageパッケージがインストールされていない場合、ポリフィルを提供
// 実際の実装ではexpo-imageをインストールする必要があります
interface ExpoImageProps {
  source: { uri: string } | number;
  style?: StyleProp<ImageStyle>;
  className?: string;
  contentFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  transition?: number;
  contentPosition?: string;
  placeholder?: object;
  [key: string]: any;
}

// ポリフィル実装（本番環境では実際のexpo-imageをインポートする）
const MockExpoImage: React.FC<ExpoImageProps> = ({ 
  source, 
  style, 
  className, 
  contentFit, 
  ...restProps 
}) => {
  // classNameを使わないスタイル版の実装（temporary fix）
  const resizeMode = 
    contentFit === 'contain' ? 'contain' : 
    contentFit === 'cover' ? 'cover' : 
    contentFit === 'fill' ? 'stretch' : 'cover';
    
  return (
    <Image
      source={source}
      style={style}
      resizeMode={resizeMode}
      {...restProps}
    />
  );
};

export const ExpoImage = MockExpoImage;

export default ExpoImage;
