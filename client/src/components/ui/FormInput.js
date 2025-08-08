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
const FormInput = ({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  ...rest
}) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="form-label">
        {label}
        {required && <span className="text-danger-600 ml-1">*</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`form-input ${error ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500' : ''}`}
        required={required}
        {...rest}
      />
      {error && <p className="form-error">{error}</p>}
    </div>
  );
};

export default FormInput;