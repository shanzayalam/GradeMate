import React from 'react';

/**
 * Input Field component for text inputs, file uploads, etc.
 * @param {Object} props
 * @param {string} props.id - Input id (for label association)
 * @param {string} props.name - Input name
 * @param {string} props.label - Input label text
 * @param {string} props.type - Input type (text, file, etc.)
 * @param {string} props.placeholder - Input placeholder
 * @param {function} props.onChange - Change handler function
 * @param {string} props.value - Input value (for controlled inputs)
 * @param {string} props.error - Error message to display
 * @param {boolean} props.touched - Whether the input has been touched (for validation)
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.required - Whether the input is required
 * @param {string} props.helperText - Additional helper text to display below the input
 * @param {string} props.accent - Accent color for focus state: 'primary', 'success' or 'gradient'
 */
const InputField = ({
  id,
  name,
  label,
  type = 'text',
  placeholder,
  onChange,
  onBlur,
  value,
  error,
  touched,
  className = '',
  required = false,
  accept,
  helperText,
  accent = 'primary',
  ...rest
}) => {
  // Define different styles based on type
  const renderInput = () => {
    // Base classes with more subtle borders and focus states
    const baseClasses = 'w-full px-3 py-2 bg-white border rounded-md focus:outline-none focus:ring-1 transition-colors duration-200 text-neutral-800 placeholder-neutral-400';
    
    // Focus accent styles
    const accentClasses = {
      'primary': 'focus:border-primary-500 focus:ring-primary-500',
      'success': 'focus:border-success-500 focus:ring-success-500',
      'gradient': 'focus:border-primary-500 focus:ring-success-500',
    };
    
    const focusClass = accentClasses[accent] || accentClasses.primary;
    const errorClasses = touched && error ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500' : `border-neutral-200 ${focusClass}`;
    const inputClasses = `${baseClasses} ${errorClasses} ${className}`;

    // Label with gradient for gradient accent
    const labelClass = accent === 'gradient' ? 'bg-clip-text text-transparent bg-gradient-blue-green' : '';

    switch (type) {
      case 'file':
        return (
          <div className="mt-1">
            <label 
              htmlFor={id} 
              className={`flex items-center justify-center px-4 py-2 border border-neutral-200 rounded-md cursor-pointer bg-white text-sm font-medium ${
                accent === 'gradient' 
                  ? 'bg-gradient-blue-green text-white hover:opacity-90' 
                  : accent === 'success'
                    ? 'text-success-700 hover:bg-success-50'
                    : 'text-neutral-700 hover:bg-neutral-50'
              } transition-colors duration-150`}
            >
              <span>Upload file</span>
              <input
                id={id}
                name={name}
                type="file"
                className="sr-only"
                onChange={onChange}
                onBlur={onBlur}
                accept={accept}
                required={required}
                {...rest}
              />
            </label>
            {value && <p className="mt-1 text-sm text-neutral-500">{typeof value === 'string' ? value : (value.name || 'File selected')}</p>}
          </div>
        );
      case 'textarea':
        return (
          <textarea
            id={id}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            className={`${inputClasses} min-h-[100px]`}
            required={required}
            {...rest}
          />
        );
      case 'select':
        return (
          <select
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            className={inputClasses}
            required={required}
            {...rest}
          >
            {rest.children}
          </select>
        );
      case 'slider':
        return (
          <div className="pt-1 pb-2">
            <input
              id={id}
              name={name}
              type="range"
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              className={`w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer ${
                accent === 'gradient' 
                  ? 'accent-success-600' 
                  : accent === 'success'
                    ? 'accent-success-600'
                    : 'accent-primary-600'
              }`}
              required={required}
              {...rest}
            />
            {value && <p className="mt-1 text-sm text-neutral-500 text-right">{value}</p>}
          </div>
        );
      default:
        return (
          <input
            id={id}
            name={name}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            className={inputClasses}
            required={required}
            {...rest}
          />
        );
    }
  };

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className={`block mb-2 text-sm font-medium ${
          accent === 'gradient' 
            ? 'bg-clip-text text-transparent bg-gradient-blue-green' 
            : accent === 'success'
              ? 'text-success-700'
              : 'text-neutral-700'
        }`}>
          {label} {required && <span className="text-danger-500">*</span>}
        </label>
      )}
      {renderInput()}
      {touched && error && (
        <p className="mt-1 text-sm text-danger-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-neutral-500">{helperText}</p>
      )}
    </div>
  );
};

export default InputField;