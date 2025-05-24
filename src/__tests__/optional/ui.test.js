/**
 * オプションのUIテスト
 * React Native UIコンポーネントの基本的なテストサンプル
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { View, Text } from 'react-native';

// 簡単なコンポーネントをテスト用に作成
const SimpleButton = ({ label }) => (
  <View testID="button-container">
    <Text testID="button-label">{label}</Text>
  </View>
);

describe('Optional UI Tests', () => {
  it('renders button with correct label', () => {
    const label = 'Click Me';
    const { getByTestId } = render(<SimpleButton label={label} />);
    
    // ボタンのコンテナが存在することを確認
    const container = getByTestId('button-container');
    expect(container).toBeTruthy();
    
    // ラベルが正しく表示されていることを確認
    const buttonLabel = getByTestId('button-label');
    expect(buttonLabel.props.children).toBe(label);
  });
});
