import React from 'react';
import { render } from '@testing-library/react-native';
import { Image as RNImage, View, ActivityIndicator, Text } from 'react-native';
import CachedImage from '../../components/common/CachedImage';

describe('CachedImage Component', () => {
  it('renders an image component', () => {
    const { getByTestId } = render(
      <CachedImage 
        source={{ uri: 'https://example.com/image.jpg' }}
        testID="test-image"
      />
    );
    
    expect(getByTestId('test-image')).toBeTruthy();
  });

  it('applies custom styles', () => {
    const { getByTestId } = render(
      <CachedImage 
        source={{ uri: 'https://example.com/image.jpg' }}
        style={{ width: 100, height: 100 }}
        testID="test-image"
      />
    );
    
    const imageComponent = getByTestId('test-image');
    expect(imageComponent.props.style).toEqual(
      expect.objectContaining({ width: 100, height: 100 })
    );
  });

  it('passes source prop correctly', () => {
    const source = { uri: 'https://example.com/image.jpg' };
    const { getByTestId } = render(
      <CachedImage 
        source={source}
        testID="test-image"
      />
    );
    
    const imageComponent = getByTestId('test-image');
    expect(imageComponent.props.source).toEqual(source);
  });
});
