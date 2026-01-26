import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error | unknown;
  resetErrorBoundary: () => void;
}

/**
 * Error fallback component displayed when an error is caught
 */
const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  const errorObj = error instanceof Error ? error : new Error(String(error));
  return (
    <div
      role="alert"
      className="min-h-screen bg-gray-50 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8 max-w-md w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-100 rounded-full p-3">
            <AlertCircle className="text-red-600" size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            Something went wrong
          </h2>
        </div>

        <p className="text-gray-700 mb-4">
          An unexpected error occurred. Please try refreshing the page or
          contact support if the problem persists.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <details className="mb-4">
            <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800 mb-2">
              Error details (development only)
            </summary>
            <pre className="text-xs bg-gray-100 p-3 rounded border border-gray-300 overflow-auto">
              {errorObj.message}
              {'\n\n'}
              {errorObj.stack}
            </pre>
          </details>
        )}

        <button
          onClick={resetErrorBoundary}
          className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
        >
          <RefreshCw size={18} />
          Try again
        </button>
      </div>
    </div>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

/**
 * Error boundary wrapper component
 * 
 * Catches errors in child components and displays a fallback UI
 */
export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
  const handleError = (error: unknown) => {
    // Log to error reporting service (e.g., Sentry)
    console.error('Error caught by boundary:', error);
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={handleError}
      onReset={() => {
        // Reset application state if needed
        window.location.href = '/';
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
};
