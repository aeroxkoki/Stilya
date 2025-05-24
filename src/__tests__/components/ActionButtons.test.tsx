import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ActionButtons from '../../components/ActionButtons';

describe('ActionButtons Component', () => {
  it('renders No and Yes buttons', () => {
    const { UNSAFE_getByProps } = render(
      <ActionButtons onPressNo={jest.fn()} onPressYes={jest.fn()} />
    );
    
    const noButton = UNSAFE_getByProps({ name: 'x' });
    const yesButton = UNSAFE_getByProps({ name: 'check' });
    
    expect(noButton).toBeTruthy();
    expect(yesButton).toBeTruthy();
  });

  it('calls onPressNo when No button is pressed', () => {
    const onPressNoMock = jest.fn();
    const { UNSAFE_getByProps } = render(
      <ActionButtons onPressNo={onPressNoMock} onPressYes={jest.fn()} />
    );
    
    const noButton = UNSAFE_getByProps({ name: 'x' }).parent.parent;
    fireEvent.press(noButton);
    
    expect(onPressNoMock).toHaveBeenCalledTimes(1);
  });

  it('calls onPressYes when Yes button is pressed', () => {
    const onPressYesMock = jest.fn();
    const { UNSAFE_getByProps } = render(
      <ActionButtons onPressNo={jest.fn()} onPressYes={onPressYesMock} />
    );
    
    const yesButton = UNSAFE_getByProps({ name: 'check' }).parent.parent;
    fireEvent.press(yesButton);
    
    expect(onPressYesMock).toHaveBeenCalledTimes(1);
  });
});
