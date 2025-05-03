import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div className="w-full flex flex-col items-center justify-center py-12 animate-fade-in">
      <div className="p-4 bg-error-100 dark:bg-error-900/30 rounded-full text-error-600 dark:text-error-400 mb-6">
        <AlertTriangle size={32} />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
        Analysis Error
      </h3>
      
      <p className="text-gray-600 dark:text-gray-300 text-center max-w-md mb-6">
        {message || 'There was a problem analyzing your data. Please try again.'}
      </p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;