import React from 'react';
import { render } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import Card from '../../components/common/Card';
import { ThemeProvider } from '../../contexts/ThemeContext';

// ThemeContextをモック
jest.mock('../../contexts/ThemeContext', () => {
  const originalModule = jest.requireActual('../../contexts/ThemeContext');
  
  return {
    ...originalModule,
    useTheme: () => ({
      theme: {
        colors: {
          primary: '#3B82F6',
          text: {
            primary: '#1F2937',
            secondary: '#6B7280',
            inverse: '#FFFFFF',
          },
          border: {
            light: '#E5E7EB',
          },
          background: {
            card: '#FFFFFF',
          }
        },
        spacing: {
          xs: 4,
          s: 8,
          m: 16,
          l: 24, 
          xl: 32,
        },
        radius: {
          s: 4,
          m: 8,
          l: 16,
        },
      },
      isDarkMode: false,
    }),
  };
});

describe('Card Component', () => {
  it('renders correctly with children', () => {
    const { getByText } = render(
      <ThemeProvider>
        <Card>
          <Text>Card Content</Text>
        </Card>
      </ThemeProvider>
    );
    
    expect(getByText('Card Content')).toBeTruthy();
  });

  it('renders with default variant', () => {
    const { UNSAFE_getByType } = render(
      <ThemeProvider>
        <Card>
          <Text>Default Card</Text>
        </Card>
      </ThemeProvider>
    );
    
    const cardElement = UNSAFE_getByType(View);
    expect(cardElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ borderRadius: expect.any(Number) }),
      ])
    );
  });

  it('renders with flat variant', () => {
    const { UNSAFE_getByType } = render(
      <ThemeProvider>
        <Card variant="flat">
          <Text>Flat Card</Text>
        </Card>
      </ThemeProvider>
    );
    
    const cardElement = UNSAFE_getByType(View);
    expect(cardElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ borderWidth: 0 }),
      ])
    );
  });

  it('renders with elevated variant', () => {
    const { UNSAFE_getByType } = render(
      <ThemeProvider>
        <Card variant="elevated">
          <Text>Elevated Card</Text>
        </Card>
      </ThemeProvider>
    );
    
    const cardElement = UNSAFE_getByType(View);
    expect(cardElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ 
          shadowColor: expect.any(String),
          shadowOffset: expect.any(Object),
        }),
      ])
    );
  });

  it('applies custom padding', () => {
    const { UNSAFE_getByType } = render(
      <ThemeProvider>
        <Card padding={20}>
          <Text>Custom Padding</Text>
        </Card>
      </ThemeProvider>
    );
    
    const cardElement = UNSAFE_getByType(View);
    expect(cardElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ padding: 20 }),
      ])
    );
  });

  it('applies custom style', () => {
    const customStyle = { backgroundColor: 'red', height: 100 };
    const { UNSAFE_getByType } = render(
      <ThemeProvider>
        <Card style={customStyle}>
          <Text>Custom Style</Text>
        </Card>
      </ThemeProvider>
    );
    
    const cardElement = UNSAFE_getByType(View);
    expect(cardElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining(customStyle),
      ])
    );
  });
});
