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
          secondary: '#6366F1',
          button: {
            primary: '#3B82F6',
            secondary: '#6B7280',
            disabled: '#D1D5DB',
          },
          text: {
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
        fontSizes: {
          s: 14,
          m: 16,
          l: 18,
        },
        fontWeights: {
          medium: '500',
        },
        radius: {
          s: 8,
          m: 12,
        },
      },
      isDarkMode: false,
    }),
  };
});

describe('Button Component', () => {
  const onPressMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    const { getByText } = render(
      <ThemeProvider>
        <Button title="Test Button" onPress={onPressMock} />
      </ThemeProvider>
    );

    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByText } = render(
      <ThemeProvider>
        <Button title="Test Button" onPress={onPressMock} />
      </ThemeProvider>
    );

    fireEvent.press(getByText('Test Button'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const { getByText } = render(
      <ThemeProvider>
        <Button title="Test Button" onPress={onPressMock} disabled />
      </ThemeProvider>
    );

    fireEvent.press(getByText('Test Button'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('shows loading indicator when loading', () => {
    const { queryByText, UNSAFE_getByType } = render(
      <ThemeProvider>
        <Button title="Test Button" onPress={onPressMock} loading />
      </ThemeProvider>
    );

    expect(queryByText('Test Button')).toBeNull();
    expect(UNSAFE_getByType('ActivityIndicator')).toBeTruthy();
  });

  it('applies different styles based on variant prop', () => {
    const { getByText, rerender } = render(
      <ThemeProvider>
        <Button title="Primary Button" onPress={onPressMock} variant="primary" />
      </ThemeProvider>
    );

    // Primary button
    let button = getByText('Primary Button').parent;
    expect(button?.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: '#3B82F6',
        }),
      ])
    );

    // Secondary button
    rerender(
      <ThemeProvider>
        <Button title="Secondary Button" onPress={onPressMock} variant="secondary" />
      </ThemeProvider>
    );
    button = getByText('Secondary Button').parent;
    expect(button?.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: '#6366F1',
        }),
      ])
    );

    // Outline button
    rerender(
      <ThemeProvider>
        <Button title="Outline Button" onPress={onPressMock} variant="outline" />
      </ThemeProvider>
    );
    button = getByText('Outline Button').parent;
    expect(button?.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: 'transparent',
          borderWidth: 1,
        }),
      ])
    );
  });

  it('applies different styles based on size prop', () => {
    const { getByText, rerender } = render(
      <ThemeProvider>
        <Button title="Small Button" onPress={onPressMock} size="small" />
      </ThemeProvider>
    );

    // Small button
    let button = getByText('Small Button').parent;
    expect(button?.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          paddingVertical: 4,
          paddingHorizontal: 16,
        }),
      ])
    );

    // Medium button
    rerender(
      <ThemeProvider>
        <Button title="Medium Button" onPress={onPressMock} size="medium" />
      </ThemeProvider>
    );
    button = getByText('Medium Button').parent;
    expect(button?.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          paddingVertical: 8,
          paddingHorizontal: 24,
        }),
      ])
    );

    // Large button
    rerender(
      <ThemeProvider>
        <Button title="Large Button" onPress={onPressMock} size="large" />
      </ThemeProvider>
    );
    button = getByText('Large Button').parent;
    expect(button?.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          paddingVertical: 16,
          paddingHorizontal: 32,
        }),
      ])
    );
  });
});
