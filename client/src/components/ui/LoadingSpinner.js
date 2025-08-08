import React from 'react';

/**
 * Loading spinner component
 * @param {Object} props - Component props
 * @param {string} [props.size='md'] - Spinner size (sm, md, lg)
 * @param {string} [props.color='primary'] - Spinner color (primary, secondary, success, danger, warning)
 * @param {string} [props.className] - Additional CSS classes
 */
const LoadingSpinner = ({ size = 'md', color = 'primary', className = '', ...rest }) => {
  // Size classes
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-4'
  };
  
  // Color classes
  const colorClasses = {
    primary: 'border-primary-600',
    secondary: 'border-secondary-600',
    success: 'border-success-600',
    danger: 'border-danger-600',
    warning: 'border-warning-600'
  };
  
  return (
    <div
      className={`animate-spin rounded-full ${sizeClasses[size]} border-t-transparent ${colorClasses[color]} ${className}`}
      {...rest}
    ></div>
  );
};

export default LoadingSpinner;