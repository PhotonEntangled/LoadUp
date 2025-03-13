import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils.js';

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({ 
  trigger, 
  children, 
  align = 'left', 
  className 
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      {isOpen && (
        <div 
          className={cn(
            'absolute z-10 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
            {
              'left-0': align === 'left',
              'right-0': align === 'right',
            },
            className
          )}
        >
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function DropdownItem({ 
  children, 
  onClick, 
  className,
  disabled = false 
}: DropdownItemProps) {
  return (
    <button
      className={cn(
        'block w-full px-4 py-2 text-left text-sm',
        {
          'text-gray-700 hover:bg-gray-100 hover:text-gray-900': !disabled,
          'text-gray-400 cursor-not-allowed': disabled
        },
        className
      )}
      onClick={disabled ? undefined : onClick}
      role="menuitem"
      disabled={disabled}
    >
      {children}
    </button>
  );
} 