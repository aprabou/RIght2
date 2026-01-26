import { APIError, CSVParseError, fetchWithRetry, formatErrorMessage, isAPIError, isCSVParseError } from '../errorHandler';

// Mock fetch
global.fetch = jest.fn();

describe('errorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('APIError', () => {
    it('should create an APIError with message and status code', () => {
      const error = new APIError('Not found', 404, false);
      expect(error.message).toBe('Not found');
      expect(error.statusCode).toBe(404);
      expect(error.retryable).toBe(false);
      expect(error.name).toBe('APIError');
    });

    it('should default retryable to false', () => {
      const error = new APIError('Error');
      expect(error.retryable).toBe(false);
    });
  });

  describe('CSVParseError', () => {
    it('should create a CSVParseError with line number', () => {
      const error = new CSVParseError('Invalid format', 10);
      expect(error.message).toBe('Invalid format');
      expect(error.lineNumber).toBe(10);
      expect(error.name).toBe('CSVParseError');
    });
  });

  describe('fetchWithRetry', () => {
    it('should succeed on first attempt', async () => {
      const mockResponse = { ok: true, json: async () => ({ data: 'test' }) };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const response = await fetchWithRetry('https://api.example.com/data');
      expect(response).toBe(mockResponse);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should throw APIError for non-retryable errors', async () => {
      const mockResponse = { ok: false, status: 404, statusText: 'Not Found' };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      await expect(fetchWithRetry('https://api.example.com/data', 3)).rejects.toThrow(
        APIError
      );
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should retry on server errors', async () => {
      const errorResponse = { ok: false, status: 500, statusText: 'Server Error' };
      const successResponse = { ok: true, json: async () => ({ data: 'test' }) };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(errorResponse)
        .mockResolvedValueOnce(successResponse);

      const response = await fetchWithRetry('https://api.example.com/data', 3, 10);
      expect(response).toBe(successResponse);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should throw after max retries', async () => {
      const errorResponse = { ok: false, status: 500, statusText: 'Server Error' };
      (global.fetch as jest.Mock).mockResolvedValue(errorResponse);

      await expect(fetchWithRetry('https://api.example.com/data', 3, 10)).rejects.toThrow(
        APIError
      );
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('isAPIError', () => {
    it('should return true for APIError instances', () => {
      const error = new APIError('Test error');
      expect(isAPIError(error)).toBe(true);
    });

    it('should return false for regular errors', () => {
      const error = new Error('Test error');
      expect(isAPIError(error)).toBe(false);
    });
  });

  describe('isCSVParseError', () => {
    it('should return true for CSVParseError instances', () => {
      const error = new CSVParseError('Test error');
      expect(isCSVParseError(error)).toBe(true);
    });

    it('should return false for regular errors', () => {
      const error = new Error('Test error');
      expect(isCSVParseError(error)).toBe(false);
    });
  });

  describe('formatErrorMessage', () => {
    it('should format APIError with 404 status', () => {
      const error = new APIError('Not found', 404);
      expect(formatErrorMessage(error)).toBe(
        'The requested resource was not found. Please try again later.'
      );
    });

    it('should format APIError with 429 status', () => {
      const error = new APIError('Rate limited', 429);
      expect(formatErrorMessage(error)).toBe(
        'Too many requests. Please wait a moment and try again.'
      );
    });

    it('should format APIError with 500 status', () => {
      const error = new APIError('Server error', 500);
      expect(formatErrorMessage(error)).toBe('Server error occurred. Please try again later.');
    });

    it('should format CSVParseError with line number', () => {
      const error = new CSVParseError('Invalid CSV', 15);
      expect(formatErrorMessage(error)).toBe('CSV parsing error at line 15: Invalid CSV');
    });

    it('should format regular errors', () => {
      const error = new Error('Something went wrong');
      expect(formatErrorMessage(error)).toBe('Something went wrong');
    });

    it('should handle unknown errors', () => {
      expect(formatErrorMessage('string error')).toBe(
        'An unexpected error occurred. Please try again.'
      );
    });
  });
});
