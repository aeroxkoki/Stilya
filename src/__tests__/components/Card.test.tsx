import React from 'react';
import { render } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import Card from '../../components/common/Card';

describe('Card Component', () => {
  it('renders correctly with children', () => {
    const { getByText } = render(
      <Card>
        <Text>Card Content</Text>
      </Card>
    );
    
    expect(getByText('Card Content')).toBeTruthy();
  });

  it('renders with default variant', () => {
    const { UNSAFE_getByType } = render(
      <Card>
        <Text>Default Card</Text>
      </Card>
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
      <Card variant="flat">
        <Text>Flat Card</Text>
      </Card>
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
      <Card variant="elevated">
        <Text>Elevated Card</Text>
      </Card>
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
      <Card padding={20}>
        <Text>Custom Padding</Text>
      </Card>
    );
    
    const cardElement = UNSAFE_getByType(View);
    expect(cardElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ padding: 20 }),
      ])
    );
  });

  it('applies named padding from theme', () => {
    const { UNSAFE_getByType } = render(
      <Card padding="lg">
        <Text>Theme Padding</Text>
      </Card>
    );
    
    const cardElement = UNSAFE_getByType(View);
    expect(cardElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ padding: expect.any(Number) }),
      ])
    );
  });

  it('applies custom style', () => {
    const customStyle = { backgroundColor: 'red', height: 100 };
    const { UNSAFE_getByType } = render(
      <Card style={customStyle}>
        <Text>Custom Style</Text>
      </Card>
    );
    
    const cardElement = UNSAFE_getByType(View);
    expect(cardElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining(customStyle),
      ])
    );
  });
});
