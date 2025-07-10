import React from 'react';

const FeedbackMessage = ({ message, type, onRetry }) => {
  let className = '';

  switch (type) {
    case 'success':
      className = 'bg-green-100 text-green-700';
      break;
    case 'error':
      className = 'bg-red-100 text-red-700';
      break;
    default:
      className = 'bg-gray-100 text-gray-700';
  }

  return (
    <div
      className={`p-4 mx-auto md:w-max mb-4 rounded ${className} text-sm flex flex-col md:flex-row md:gap-2 md:text-lg items-center`}
      role="alert"
    >
      {message}
      {type === 'error' && (
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={onRetry}
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default FeedbackMessage;

