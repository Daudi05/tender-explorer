import React from 'react';

export const EmptyState = ({
  title = 'No data available',
  description = 'There are no records to display at this moment.',
  message,
  actionButton,
  action,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 bg-gray-50 border border-dashed rounded-lg max-w-lg mx-auto ${className}`}>
      <div className="bg-blue-50 p-3 rounded-full text-blue-600 mb-4">
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 00-2 2H6a2 2 0 00-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 className="text-md font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-4 max-w-xs">{message || description}</p>
      {(actionButton || action) && <div>{actionButton || action}</div>}
    </div>
  );
};

export default EmptyState;
