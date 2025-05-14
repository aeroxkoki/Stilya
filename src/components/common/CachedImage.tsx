import React from 'react';
import { StyleProp, ImageStyle } from 'react-native';
import { styled } from 'nativewind';

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
const MockExpoImage: React.FC<ExpoImageProps> = (props) => {
  // classNameを使わないスタイル版の実装（temporary fix）
  return (
    <styled.Image
      source={props.source}
      style={props.style}
      className={props.className}
      resizeMode={props.contentFit === 'contain' ? 'contain' : 
                 props.contentFit === 'cover' ? 'cover' : 
                 props.contentFit === 'stretch' ? 'stretch' : 'cover'}
      {...props}
    />
  );
};

export const ExpoImage = styled(MockExpoImage);

export default ExpoImage;
