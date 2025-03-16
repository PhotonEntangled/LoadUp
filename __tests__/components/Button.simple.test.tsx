import { describe, it, expect } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Simple Button component for testing
const Button = ({ 
  onClick, 
  disabled = false, 
  variant = 'primary', 
  children 
}: { 
  onClick: () => void; 
  disabled?: boolean; 
  variant?: 'primary' | 'secondary' | 'danger'; 
  children: React.ReactNode;
}) => {
  const baseClasses = 'px-4 py-2 rounded font-medium focus:outline-none';
  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-500 text-white hover:bg-red-600'
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;
  
  return React.createElement(
    'button',
    {
      className: classes,
      onClick: onClick,
      disabled: disabled,
      'data-testid': 'button'
    },
    children
  );
};

describe('Button Component', () => {
  it('renders correctly with default props', () => {
    const handleClick = jest.fn();
    render(
      React.createElement(Button, { onClick: handleClick, children: 'Click me' })
    );
    
    const button = screen.getByTestId('button') as HTMLButtonElement;
    expect(button).toBeTruthy();
    expect(button.textContent).toBe('Click me');
    expect(button.className).toContain('bg-blue-500'); // primary variant
    expect(button.disabled).toBe(false);
  });
  
  it('applies the correct variant classes', () => {
    const handleClick = jest.fn();
    const { rerender } = render(
      React.createElement(Button, { onClick: handleClick, variant: 'secondary', children: 'Secondary' })
    );
    
    let button = screen.getByTestId('button') as HTMLButtonElement;
    expect(button.className).toContain('bg-gray-200'); // secondary variant
    
    rerender(
      React.createElement(Button, { onClick: handleClick, variant: 'danger', children: 'Danger' })
    );
    
    button = screen.getByTestId('button') as HTMLButtonElement;
    expect(button.className).toContain('bg-red-500'); // danger variant
  });
  
  it('disables the button when disabled prop is true', () => {
    const handleClick = jest.fn();
    render(
      React.createElement(Button, { onClick: handleClick, disabled: true, children: 'Disabled' })
    );
    
    const button = screen.getByTestId('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.className).toContain('opacity-50');
    expect(button.className).toContain('cursor-not-allowed');
  });
  
  it('calls the onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(
      React.createElement(Button, { onClick: handleClick, children: 'Click me' })
    );
    
    const button = screen.getByTestId('button') as HTMLButtonElement;
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('does not call onClick when disabled and clicked', () => {
    const handleClick = jest.fn();
    render(
      React.createElement(Button, { onClick: handleClick, disabled: true, children: 'Click me' })
    );
    
    const button = screen.getByTestId('button') as HTMLButtonElement;
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });
}); 