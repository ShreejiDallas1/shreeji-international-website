'use client';

import React from 'react';
import Link from 'next/link';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'white' | 'outline-white';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  href?: string;
  target?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  href,
  target,
  ...props
}) => {
  // Base styles
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm';
  
  // Variant styles
  const variantStyles = {
    primary: 'bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white focus:ring-lime-500 dark:from-lime-600 dark:to-lime-700 dark:hover:from-lime-700 dark:hover:to-lime-800',
    secondary: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white focus:ring-orange-500 dark:from-orange-600 dark:to-orange-700 dark:hover:from-orange-700 dark:hover:to-orange-800',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 focus:ring-lime-500 hover:border-lime-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:border-lime-600',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-800 focus:ring-lime-500 dark:text-gray-200 dark:hover:bg-gray-800',
    white: 'bg-white text-lime-600 hover:bg-gray-100 focus:ring-white dark:bg-gray-200 dark:text-lime-700 dark:hover:bg-gray-300',
    'outline-white': 'border-2 border-white text-white hover:bg-white/10 focus:ring-white dark:border-gray-200 dark:text-gray-200 dark:hover:bg-gray-200/10',
  };
  
  // Size styles
  const sizeStyles = {
    sm: 'text-sm px-3 py-2 rounded',
    md: 'text-base px-5 py-2.5 rounded-md',
    lg: 'text-lg px-6 py-3.5 rounded-lg',
  };
  
  // Width styles
  const widthStyles = fullWidth ? 'w-full' : '';
  
  // Disabled styles
  const disabledStyles = disabled || isLoading
    ? 'opacity-50 cursor-not-allowed'
    : 'cursor-pointer';
  
  const buttonContent = (
    <>
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </>
  );

  const buttonClasses = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${disabledStyles} ${className} active:scale-95 transition-transform`;

  // If href is provided, render a Link component
  if (href) {
    return (
      <Link 
        href={href} 
        className={buttonClasses}
        target={target}
      >
        {buttonContent}
      </Link>
    );
  }

  // Otherwise, render a regular button
  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {buttonContent}
    </button>
  );
};

export default Button;