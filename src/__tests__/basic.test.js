/**
 * Basic component test for Stilya app
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, View } from 'react-native';

// 単純なコンポーネントのテスト
describe('Basic Component Tests', () => {
  it('renders text correctly', () => {
    const { getByText } = render(<Text>Stilya App</Text>);
    expect(getByText('Stilya App')).toBeTruthy();
  });

  it('renders nested components', () => {
    const { getByText } = render(
      <View>
        <Text>Swipe Right if you like</Text>
        <Text>Swipe Left if you don't</Text>
      </View>
    );
    
    expect(getByText('Swipe Right if you like')).toBeTruthy();
    expect(getByText("Swipe Left if you don't")).toBeTruthy();
  });
});

// モックデータのテスト
describe('Data Structure Tests', () => {
  it('handles product data structure', () => {
    const sampleProduct = {
      id: '1',
      name: 'Sample T-shirt',
      price: 3000,
      brand: 'Test Brand',
      imageUrl: 'https://example.com/image.jpg',
      tags: ['casual', 'summer', 'cotton']
    };
    
    expect(sampleProduct).toHaveProperty('id');
    expect(sampleProduct).toHaveProperty('name');
    expect(sampleProduct).toHaveProperty('price');
    expect(sampleProduct.tags).toHaveLength(3);
    expect(sampleProduct.tags).toContain('casual');
  });
});
