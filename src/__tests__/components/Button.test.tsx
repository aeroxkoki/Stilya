// src/__tests__/components/Button.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../../components/common/Button';
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
          secondary: '#6B7280',
          button: {
            disabled: '#9CA3AF',
          },
          text: {
            primary: '#1F2937',
            secondary: '#6B7280',
            inverse: '#FFFFFF',
            hint: '#9CA3AF',
          },
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
        },
        fontSizes: {
          s: 12,
          m: 16,
          l: 20,
        },
        fontWeights: {
          medium: '500',
        }
      },
      isDarkMode: false,
    }),
  };
});

describe('Button component', () => {
  it('renders correctly with default props', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <ThemeProvider>
        <Button onPress={onPressMock}>Test Button</Button>
      </ThemeProvider>
    );
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <ThemeProvider>
        <Button onPress={onPressMock}>Press Me</Button>
      </ThemeProvider>
    );
    
    fireEvent.press(getByText('Press Me'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});
