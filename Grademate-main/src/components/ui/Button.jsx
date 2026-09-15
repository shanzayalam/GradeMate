import React from 'react';

/**
 * Button component with primary, secondary, and disabled states
 * @param {Object} props
 * @param {string} props.variant - 'primary', 'secondary', 'outline', 'ghost', 'gradient-blue', 'gradient-green', or 'gradient-blue-green'
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {function} props.onClick - Click handler function
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.size - 'sm', 'md', or 'lg'
 */
const Button = ({ 
  variant = 'primary', 
  disabled = false, 
  onClick, 
  children, 
  className = '',
  type = 'button',
  size = 'md',
  ...rest 
}) => {
  // Base styles for all buttons
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-md';
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base'
  };
  
  // Variant-specific styles (using the new color palette)
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm',
    secondary: 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300 focus:ring-neutral-500',
    outline: 'bg-white text-primary-700 border border-primary-300 hover:bg-primary-50 focus:ring-primary-500',
    ghost: 'bg-transparent text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
    danger: 'bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500 shadow-sm',
    success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500 shadow-sm',
    'gradient-blue': 'bg-gradient-blue text-white hover:opacity-90 focus:ring-primary-500 shadow-sm',
    'gradient-green': 'bg-gradient-green text-white hover:opacity-90 focus:ring-success-500 shadow-sm',
    'gradient-blue-green': 'bg-gradient-blue-green text-white hover:opacity-90 focus:ring-primary-500 shadow-sm',
  };
  
  // Disabled styles
  const disabledClasses = 'opacity-50 cursor-not-allowed pointer-events-none';
  
  // Combine classes based on props
  const buttonClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${disabled ? disabledClasses : ''}
    ${className}
  `;
  
  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;