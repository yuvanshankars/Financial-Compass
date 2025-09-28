import React from 'react';

/**
 * Form input component with label and error message
 * @param {Object} props - Component props
 * @param {string} props.id - Input ID
 * @param {string} props.name - Input name
 * @param {string} props.label - Input label
 * @param {string} props.type - Input type
 * @param {string} [props.value] - Input value
 * @param {Function} props.onChange - Change handler
 * @param {string} [props.placeholder] - Input placeholder
 * @param {string} [props.error] - Error message
 * @param {boolean} [props.required=false] - Whether the input is required
 */
const FormInput = ({ id, name, label, type = 'text', value, onChange, placeholder, error, required, ...rest }) => {
  return (
    <div className="mb-4">
      {label && <label htmlFor={id || name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input
        type={type}
        id={id || name}
        name={name}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`form-input ${error ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500' : ''}`}
        {...rest}
      />
      {error && <p className="mt-1 text-sm text-danger-500">{error}</p>}
    </div>
  );
};

export default FormInput;