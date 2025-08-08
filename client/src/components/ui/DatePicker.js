import React from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

/**
 * DatePicker component for selecting dates
 * 
 * @param {Object} props - Component props
 * @param {Date|null} props.selected - Selected date
 * @param {Function} props.onChange - Change handler function
 * @param {string} props.label - Input label
 * @param {string} [props.error] - Error message
 * @param {boolean} [props.required] - Whether the field is required
 * @param {string} [props.id] - Input ID
 * @param {string} [props.name] - Input name
 * @param {string} [props.placeholder] - Input placeholder
 * @param {string} [props.dateFormat] - Date format (default: 'yyyy-MM-dd')
 * @param {boolean} [props.showTimeSelect] - Whether to show time select
 * @param {boolean} [props.disabled] - Whether the input is disabled
 * @param {Object} [props.customInputProps] - Additional props for the custom input
 */
const DatePicker = ({
  selected,
  onChange,
  label,
  error,
  required = false,
  id,
  name,
  placeholder = 'Select date',
  dateFormat = 'yyyy-MM-dd',
  showTimeSelect = false,
  disabled = false,
  customInputProps = {},
  ...rest
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <ReactDatePicker
        selected={selected}
        onChange={onChange}
        id={id}
        name={name}
        dateFormat={dateFormat}
        showTimeSelect={showTimeSelect}
        disabled={disabled}
        placeholderText={placeholder}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        {...customInputProps}
        {...rest}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default DatePicker;