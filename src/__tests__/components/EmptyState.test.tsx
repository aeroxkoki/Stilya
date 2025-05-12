import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import EmptyState from '../../components/EmptyState';

describe('EmptyState Component', () => {
  it('renders message correctly', () => {
    const message = 'No items found';
    const { getByText } = render(
      <EmptyState message={message} />
    );
    
    expect(getByText(message)).toBeTruthy();
  });

  it('renders icon', () => {
    const { UNSAFE_getByProps } = render(
      <EmptyState message="Test message" />
    );
    
    const icon = UNSAFE_getByProps({ name: 'search' });
    expect(icon).toBeTruthy();
  });

  it('renders button when buttonText is provided', () => {
    const buttonText = 'Try Again';
    const { getByText } = render(
      <EmptyState 
        message="Error occurred" 
        buttonText={buttonText} 
        onButtonPress={jest.fn()} 
      />
    );
    
    expect(getByText(buttonText)).toBeTruthy();
  });

  it('does not render button when buttonText is not provided', () => {
    const buttonText = 'Try Again';
    const { queryByText } = render(
      <EmptyState 
        message="Error occurred" 
        onButtonPress={jest.fn()} 
      />
    );
    
    expect(queryByText(buttonText)).toBeNull();
  });

  it('calls onButtonPress when button is pressed', () => {
    const onButtonPressMock = jest.fn();
    const buttonText = 'Try Again';
    const { getByText } = render(
      <EmptyState 
        message="Error occurred" 
        buttonText={buttonText} 
        onButtonPress={onButtonPressMock} 
      />
    );
    
    fireEvent.press(getByText(buttonText));
    expect(onButtonPressMock).toHaveBeenCalledTimes(1);
  });
});
