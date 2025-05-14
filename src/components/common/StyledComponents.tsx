import React from 'react';
import { 
  View as RNView, 
  Text as RNText, 
  TouchableOpacity as RNTouchableOpacity,
  SafeAreaView as RNSafeAreaView,
  ScrollView as RNScrollView,
  Image as RNImage,
  KeyboardAvoidingView as RNKeyboardAvoidingView,
  ViewProps, 
  TextProps, 
  TouchableOpacityProps,
  ScrollViewProps,
  ImageProps,
  KeyboardAvoidingViewProps
} from 'react-native';
import { styled } from 'nativewind/styled';

// スタイル付きコンポーネントを作成
export const View = styled(RNView);
export const Text = styled(RNText);
export const TouchableOpacity = styled(RNTouchableOpacity);
export const SafeAreaView = styled(RNSafeAreaView);
export const ScrollView = styled(RNScrollView);
export const Image = styled(RNImage);
export const KeyboardAvoidingView = styled(RNKeyboardAvoidingView);

// 型定義を簡略化するためのヘルパー
export type ViewType = React.ComponentProps<typeof View>;
export type TextType = React.ComponentProps<typeof Text>;
export type TouchableOpacityType = React.ComponentProps<typeof TouchableOpacity>;
export type SafeAreaViewType = React.ComponentProps<typeof SafeAreaView>;
export type ScrollViewType = React.ComponentProps<typeof ScrollView>;
export type ImageType = React.ComponentProps<typeof Image>;
export type KeyboardAvoidingViewType = React.ComponentProps<typeof KeyboardAvoidingView>;
