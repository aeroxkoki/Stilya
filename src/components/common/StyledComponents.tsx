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

// スタイル付きコンポーネントを作成 (className を使うためには nativewind が必要)
export const View = RNView;
export const Text = RNText;
export const TouchableOpacity = RNTouchableOpacity;
export const SafeAreaView = RNSafeAreaView;
export const ScrollView = RNScrollView;
export const Image = RNImage;
export const KeyboardAvoidingView = RNKeyboardAvoidingView;

// 型定義を簡略化するためのヘルパー
export type ViewType = React.ComponentProps<typeof View>;
export type TextType = React.ComponentProps<typeof Text>;
export type TouchableOpacityType = React.ComponentProps<typeof TouchableOpacity>;
export type SafeAreaViewType = React.ComponentProps<typeof SafeAreaView>;
export type ScrollViewType = React.ComponentProps<typeof ScrollView>;
export type ImageType = React.ComponentProps<typeof Image>;
export type KeyboardAvoidingViewType = React.ComponentProps<typeof KeyboardAvoidingView>;
