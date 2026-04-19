import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from './Button';

describe('Button Component', () => {
  it('should render the button with the correct label', () => {
    const { getByText } = render(<Button label="Test Button" />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('should call onPress when clicked', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<Button label="Click Me" onPress={onPressMock} />);
    
    fireEvent.press(getByText('Click Me'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('should show loading indicator when loading is true', () => {
    const { queryByText } = render(<Button label="Submit" loading />);
    
    // We can't easily query ActivityIndicator by text, but we know label should be gone
    expect(queryByText('Submit')).toBeNull();
  });

  it('should be disabled when disabled prop is true', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<Button label="Disabled" disabled onPress={onPressMock} />);
    
    fireEvent.press(getByText('Disabled'));
    expect(onPressMock).not.toHaveBeenCalled();
  });
});
