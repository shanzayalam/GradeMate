import React from 'react';

/**
 * Card component for displaying content in a consistent, contained format
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.title - Card title
 * @param {string} props.className - Additional CSS classes
 * @param {function} props.onClick - Click handler function
 * @param {boolean} props.hoverable - Whether the card should have hover effects
 * @param {React.ReactNode} props.footer - Footer content
 * @param {React.ReactNode} props.icon - Icon to display in the title
 * @param {string} props.headerStyle - Style for header: 'default', 'blue', 'green', 'gradient-blue-green'
 */
const Card = ({
  children,
  title,
  className = '',
  onClick,
  hoverable = false,
  footer,
  icon,
  headerStyle = 'default',
  ...rest
}) => {
  // Base styles - more minimal with softer shadows
  const baseClasses = 'bg-white rounded-lg shadow-soft border border-neutral-100 flex flex-col';
  
  // Hover styles
  const hoverClasses = hoverable ? 'hover:shadow-medium transition-shadow duration-200 cursor-pointer' : '';
  
  // Combine classes
  const cardClasses = `${baseClasses} ${hoverClasses} ${className}`;
  
  // Header style classes
  const headerStyleClasses = {
    'default': 'bg-white text-neutral-800 border-b border-neutral-100',
    'blue': 'bg-primary-600 text-white border-b border-primary-700',
    'green': 'bg-success-600 text-white border-b border-success-700',
    'gradient-blue-green': 'bg-gradient-blue-green text-white'
  };
  
  const headerClass = headerStyleClasses[headerStyle] || headerStyleClasses.default;
  
  return (
    <div
      className={cardClasses}
      onClick={onClick}
      {...rest}
    >
      {title && (
        <div className={`px-4 py-3 flex items-center justify-between flex-shrink-0 ${headerClass}`}>
          <div className="flex items-center space-x-2">
            {icon && <span className={headerStyle === 'default' ? 'text-neutral-500' : 'text-white'}>{icon}</span>}
            <h3 className="text-lg font-medium">{title}</h3>
          </div>
        </div>
      )}
      <div className="p-4 overflow-auto flex-1">
        {children}
      </div>
      {footer && (
        <div className="px-4 py-3 border-t border-neutral-100 bg-neutral-50 flex-shrink-0">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;