// src/__tests__/utils/testUtils.ts
import { render } from '@testing-library/react-native';
import React from 'react';

export const renderWithProviders = (ui: React.ReactElement) => {
  return render(ui);
};

export const mockProducts = [
  {
    id: '1',
    name: 'Test Product 1',
    image_url: 'https://example.com/image1.jpg',
    price: 1000,
    brand: 'Brand A',
    tags: ['casual', 'men'],
    affiliate_url: 'https://example.com/product1',
  },
  {
    id: '2',
    name: 'Test Product 2',
    image_url: 'https://example.com/image2.jpg',
    price: 2000,
    brand: 'Brand B',
    tags: ['formal', 'women'],
    affiliate_url: 'https://example.com/product2',
  },
];
