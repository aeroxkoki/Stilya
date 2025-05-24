import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Feather } from '@expo/vector-icons';
import Input from '../../components/common/Input';

describe('Input Component', () => {
  it('renders correctly with default props', () => {
    const { getByPlaceholderText } = render(
      <Input placeholder="Enter text" />
    );
    
    expect(getByPlaceholderText('Enter text')).toBeTruthy();
  });

  it('renders with label', () => {
    const { getByText } = render(
      <Input label="Email" placeholder="Enter email" />
    );
    
    expect(getByText('Email')).toBeTruthy();
  });

  it('renders with error message', () => {
    const { getByText } = render(
      <Input 
        label="Password" 
        placeholder="Enter password" 
        error="Password is required" 
      />
    );
    
    expect(getByText('Password is required')).toBeTruthy();
  });

  it('handles text input correctly', () => {
    const onChangeMock = jest.fn();
    const { getByPlaceholderText } = render(
      <Input placeholder="Enter text" onChangeText={onChangeMock} />
    );
    
    const input = getByPlaceholderText('Enter text');
    fireEvent.changeText(input, 'Hello World');
    
    expect(onChangeMock).toHaveBeenCalledWith('Hello World');
  });

  it('handles focus and blur correctly', () => {
    const onFocusMock = jest.fn();
    const onBlurMock = jest.fn();
    
    const { getByPlaceholderText } = render(
      <Input 
        placeholder="Enter text" 
        onFocus={onFocusMock} 
        onBlur={onBlurMock} 
      />
    );
    
    const input = getByPlaceholderText('Enter text');
    fireEvent(input, 'focus');
    expect(onFocusMock).toHaveBeenCalled();
    
    fireEvent(input, 'blur');
    expect(onBlurMock).toHaveBeenCalled();
  });

  it('renders with left icon', () => {
    const { UNSAFE_getByType } = render(
      <Input 
        placeholder="Search" 
        leftIcon={<Feather name="search" size={20} color="#9E9E9E" />}
      />
    );
    
    expect(UNSAFE_getByType(Feather)).toBeTruthy();
  });

  it('renders with password toggle functionality', () => {
    const { getByPlaceholderText, UNSAFE_getByType } = render(
      <Input 
        placeholder="Password" 
        isPassword={true}
      />
    );
    
    const passwordInput = getByPlaceholderText('Password');
    expect(passwordInput.props.secureTextEntry).toBe(true);
    
    // Find the eye icon button and press it
    const eyeIcon = UNSAFE_getByType(Feather);
    const toggleButton = eyeIcon.parent.parent;
    fireEvent.press(toggleButton);
    
    // Check if secureTextEntry is toggled
    expect(passwordInput.props.secureTextEntry).toBe(false);
  });

  it('applies custom styles', () => {
    const containerStyle = { marginBottom: 20 };
    const inputStyle = { fontSize: 18 };
    
    const { UNSAFE_getByType } = render(
      <Input 
        placeholder="Styled Input" 
        containerStyle={containerStyle}
        inputStyle={inputStyle}
      />
    );
    
    const input = UNSAFE_getByType('TextInput');
    expect(input.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining(inputStyle),
      ])
    );
  });
});
