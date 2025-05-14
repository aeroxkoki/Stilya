// src/__tests__/components/Button.test.tsx
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';

// Simple Button component for testing
const Button = ({ onPress, title }: { onPress: () => void; title: string }) => (
  <TouchableOpacity onPress={onPress} testID="button">
    <Text>{title}</Text>
  </TouchableOpacity>
);

describe('Button Component', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Button onPress={() => {}} title="Test Button" />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(<Button onPress={onPressMock} title="Test Button" />);
    fireEvent.press(getByTestId('button'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});
