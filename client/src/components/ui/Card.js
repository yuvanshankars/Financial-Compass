import React from 'react';

/**
 * Card component for containing content
 * @param {Object} props - Component props
 * @param {string} [props.title] - Card title
 * @param {React.ReactNode} props.children - Card content
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.noPadding=false] - Whether to remove padding
 */
const Card = ({ title, children, className = '', noPadding = false, ...rest }) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-card ${noPadding ? '' : 'p-6'} ${className}`}
      {...rest}
    >
      {title && <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>}
      {children}
    </div>
  );
};

export default Card;