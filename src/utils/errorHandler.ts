/**
 * Custom error class for API-related errors
 */
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'APIError';
    
    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, APIError);
    }
  }
}

/**
 * Custom error class for CSV parsing errors
 */
export class CSVParseError extends Error {
  constructor(message: string, public lineNumber?: number) {
    super(message);
    this.name = 'CSVParseError';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CSVParseError);
    }
  }
}

/**
 * Fetches a resource with automatic retry logic
 * 
 * @param url - The URL to fetch
 * @param retries - Number of retry attempts (default: 3)
 * @param retryDelay - Base delay between retries in ms (default: 1000)
 * @returns Promise resolving to the Response object
 * 
 * @throws {APIError} When all retry attempts fail
 * 
 * @example
 * const response = await fetchWithRetry('https://api.example.com/data');
 * const data = await response.json();
 */
export const fetchWithRetry = async (
  url: string,
  retries = 3,
  retryDelay = 1000
): Promise<Response> => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        const isServerError = response.status >= 500;
        const isRateLimited = response.status === 429;
        
        throw new APIError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          isServerError || isRateLimited
        );
      }
      
      return response;
    } catch (error) {
      const isLastAttempt = i === retries - 1;
      const shouldRetry = error instanceof APIError && error.retryable;
      
      if (isLastAttempt || !shouldRetry) {
        if (error instanceof APIError) {
          throw error;
        }
        throw new APIError(
          `Failed to fetch: ${error instanceof Error ? error.message : 'Unknown error'}`,
          undefined,
          false
        );
      }
      
      // Exponential backoff
      const delay = retryDelay * Math.pow(2, i);
      console.warn(`Retry attempt ${i + 1}/${retries} after ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  
  throw new APIError('Maximum retries exceeded', undefined, false);
};

/**
 * Type guard to check if error is an APIError
 */
export const isAPIError = (error: unknown): error is APIError => {
  return error instanceof APIError;
};

/**
 * Type guard to check if error is a CSVParseError
 */
export const isCSVParseError = (error: unknown): error is CSVParseError => {
  return error instanceof CSVParseError;
};

/**
 * Formats an error for user-friendly display
 */
export const formatErrorMessage = (error: unknown): string => {
  if (isAPIError(error)) {
    if (error.statusCode === 404) {
      return 'The requested resource was not found. Please try again later.';
    }
    if (error.statusCode === 429) {
      return 'Too many requests. Please wait a moment and try again.';
    }
    if (error.statusCode && error.statusCode >= 500) {
      return 'Server error occurred. Please try again later.';
    }
    return error.message;
  }
  
  if (isCSVParseError(error)) {
    return `CSV parsing error${error.lineNumber ? ` at line ${error.lineNumber}` : ''}: ${error.message}`;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};
