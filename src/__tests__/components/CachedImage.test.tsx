import React from 'react';
import { render } from '@testing-library/react-native';
import { Image as RNImage, View, ActivityIndicator } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import CachedImage from '../../components/common/CachedImage';

// Mock Expo Image component
jest.mock('expo-image', () => {
  const { View } = require('react-native');
  return {
    Image: jest.fn().mockImplementation((props) => {
      return <View testID="expo-image" {...props} />;
    }),
  };
});

describe('CachedImage Component', () => {
  it('renders local image with RN Image component', () => {
    const localImageSource = 1; // Simulate require('./image.png')
    const { UNSAFE_getByType } = render(
      <CachedImage source={localImageSource} />
    );
    
    expect(UNSAFE_getByType(RNImage)).toBeTruthy();
  });

  it('renders remote image with Expo Image component', () => {
    const remoteImageSource = { uri: 'https://example.com/image.jpg' };
    const { getByTestId } = render(
      <CachedImage source={remoteImageSource} />
    );
    
    expect(getByTestId('expo-image')).toBeTruthy();
  });

  it('shows loading indicator while loading', () => {
    const remoteImageSource = { uri: 'https://example.com/image.jpg' };
    const { UNSAFE_getByType } = render(
      <CachedImage source={remoteImageSource} showLoader={true} />
    );
    
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('does not show loading indicator when disabled', () => {
    const remoteImageSource = { uri: 'https://example.com/image.jpg' };
    const { UNSAFE_queryByType } = render(
      <CachedImage source={remoteImageSource} showLoader={false} />
    );
    
    expect(UNSAFE_queryByType(ActivityIndicator)).toBeNull();
  });

  it('applies custom container style', () => {
    const containerStyle = { borderRadius: 10, overflow: 'hidden' };
    const { UNSAFE_getByType } = render(
      <CachedImage 
        source={{ uri: 'https://example.com/image.jpg' }} 
        containerStyle={containerStyle}
      />
    );
    
    const container = UNSAFE_getByType(View);
    expect(container.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining(containerStyle),
      ])
    );
  });

  it('passes correct props to Expo Image', () => {
    const remoteImageSource = { uri: 'https://example.com/image.jpg' };
    const { getByTestId } = render(
      <CachedImage
        source={remoteImageSource}
        resizeMode="contain"
        blurRadius={5}
        priority="high"
      />
    );
    
    const expoImage = getByTestId('expo-image');
    expect(expoImage.props.contentFit).toBe('contain');
    expect(expoImage.props.blurRadius).toBe(5);
    expect(expoImage.props.priority).toBe('high');
  });

  it('handles onLoad callback', () => {
    const onLoadMock = jest.fn();
    const { getByTestId } = render(
      <CachedImage
        source={{ uri: 'https://example.com/image.jpg' }}
        onLoad={onLoadMock}
      />
    );
    
    const expoImage = getByTestId('expo-image');
    expoImage.props.onLoad({ nativeEvent: { width: 100, height: 100 } });
    
    expect(onLoadMock).toHaveBeenCalled();
  });
});
