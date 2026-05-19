import React from 'react';

export const Textarea = React.forwardRef(({
  label,
  error,
  helperText,
  id,
  rows = 4,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`w-full flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <textarea
        id={id}
        ref={ref}
        rows={rows}
        className={`w-full px-3 py-2 border rounded-md transition-colors duration-200 outline-none focus:ring-2 resize-y
          ${error 
            ? 'border-red-500 focus:ring-red-200 focus:border-red-500' 
            : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
          } ${props.disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}`}
        {...props}
      />
      {error && <span className="text-xs font-medium text-red-600">{error}</span>}
      {!error && helperText && <span className="text-xs text-gray-500">{helperText}</span>}
    </div>
  );
});

Textarea.displayName = 'Textarea';
