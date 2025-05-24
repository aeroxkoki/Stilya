import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../../App';

// NavigationContainerのモック
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
}));

describe('App', () => {
  test('renders without crashing', () => {
    const { getByText } = render(<App />);
    expect(getByText('認証画面')).toBeTruthy();
  });
});
