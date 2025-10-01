import { errorHandler, AppError } from '../utils/errorHandler';
import { Alert } from 'react-native';

// Mock Alert
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

describe('ErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    errorHandler.clearErrorLog();
  });

  describe('Error Handling', () => {
    it('should handle network errors', () => {
      const networkError = new Error('Network request failed');
      const appError = errorHandler.handleError(networkError, 'API');

      expect(appError.code).toBe('NETWORK_ERROR');
      expect(appError.message).toBe('Network request failed');
      expect(appError.context).toBe('API');
    });

    it('should handle timeout errors', () => {
      const timeoutError = new Error('Request timeout');
      const appError = errorHandler.handleError(timeoutError, 'API');

      expect(appError.code).toBe('TIMEOUT_ERROR');
      expect(appError.message).toBe('Request timeout');
    });

    it('should handle permission errors', () => {
      const permissionError = new Error('Permission denied');
      const appError = errorHandler.handleError(permissionError, 'Location');

      expect(appError.code).toBe('PERMISSION_ERROR');
      expect(appError.message).toBe('Permission denied');
    });

    it('should handle unknown errors', () => {
      const unknownError = new Error('Something went wrong');
      const appError = errorHandler.handleError(unknownError);

      expect(appError.code).toBe('UNKNOWN_ERROR');
      expect(appError.message).toBe('Something went wrong');
    });
  });

  describe('User-Friendly Messages', () => {
    it('should show user-friendly error messages', () => {
      const appError: AppError = {
        code: 'NETWORK_ERROR',
        message: 'Network request failed',
        timestamp: new Date(),
      };

      errorHandler.showUserFriendlyError(appError, 'Search');

      expect(Alert.alert).toHaveBeenCalledWith(
        'Something went wrong',
        'Please check your internet connection and try again. (Search)',
        [
          { text: 'OK', style: 'default' },
          { text: 'Retry', onPress: expect.any(Function) }
        ]
      );
    });

    it('should show specific error messages for different error types', () => {
      const timeoutError: AppError = {
        code: 'TIMEOUT_ERROR',
        message: 'Request timeout',
        timestamp: new Date(),
      };

      errorHandler.showUserFriendlyError(timeoutError);

      expect(Alert.alert).toHaveBeenCalledWith(
        'Something went wrong',
        'The request took too long. Please try again.',
        expect.any(Array)
      );
    });
  });

  describe('Error Logging', () => {
    it('should log errors to error log', () => {
      const error = new Error('Test error');
      errorHandler.handleError(error, 'Test');

      const errorLog = errorHandler.getErrorLog();
      expect(errorLog).toHaveLength(1);
      expect(errorLog[0].message).toBe('Test error');
      expect(errorLog[0].context).toBe('Test');
    });

    it('should clear error log', () => {
      const error = new Error('Test error');
      errorHandler.handleError(error);
      
      expect(errorHandler.getErrorLog()).toHaveLength(1);
      
      errorHandler.clearErrorLog();
      expect(errorHandler.getErrorLog()).toHaveLength(0);
    });
  });

  describe('Network Error Handling', () => {
    it('should retry network requests on failure', async () => {
      const mockRetryFunction = jest.fn()
        .mockRejectedValueOnce(new Error('Network Error'))
        .mockRejectedValueOnce(new Error('Network Error'))
        .mockResolvedValueOnce('Success');

      const result = await errorHandler.handleNetworkError(
        new Error('Network Error'),
        mockRetryFunction,
        3
      );

      expect(result).toBe('Success');
      expect(mockRetryFunction).toHaveBeenCalledTimes(3);
    });

    it('should fail after max retries', async () => {
      const mockRetryFunction = jest.fn().mockRejectedValue(new Error('Network Error'));

      await expect(
        errorHandler.handleNetworkError(
          new Error('Network Error'),
          mockRetryFunction,
          2
        )
      ).rejects.toThrow();
    });
  });

  describe('Location Error Handling', () => {
    it('should handle location services disabled', () => {
      const locationError = {
        code: 'E_LOCATION_SERVICES_DISABLED',
        message: 'Location services are disabled',
      };

      const appError = errorHandler.handleLocationError(locationError);

      expect(appError.message).toBe('Location services are disabled. Please enable them in settings.');
    });

    it('should handle location unavailable', () => {
      const locationError = {
        code: 'E_LOCATION_UNAVAILABLE',
        message: 'Location is unavailable',
      };

      const appError = errorHandler.handleLocationError(locationError);

      expect(appError.message).toBe('Location is unavailable. Please try again.');
    });

    it('should handle location timeout', () => {
      const locationError = {
        code: 'E_LOCATION_TIMEOUT',
        message: 'Location request timed out',
      };

      const appError = errorHandler.handleLocationError(locationError);

      expect(appError.message).toBe('Location request timed out. Please try again.');
    });
  });

  describe('API Error Handling', () => {
    it('should handle 429 rate limit error', () => {
      const apiError = {
        response: { status: 429 },
        message: 'Too many requests',
      };

      const appError = errorHandler.handleApiError(apiError, 'searchPlaces');

      expect(appError.message).toBe('Too many requests. Please wait a moment and try again.');
    });

    it('should handle 403 forbidden error', () => {
      const apiError = {
        response: { status: 403 },
        message: 'Access denied',
      };

      const appError = errorHandler.handleApiError(apiError, 'searchPlaces');

      expect(appError.message).toBe('Access denied. Please check your API key.');
    });

    it('should handle 500 server error', () => {
      const apiError = {
        response: { status: 500 },
        message: 'Internal server error',
      };

      const appError = errorHandler.handleApiError(apiError, 'searchPlaces');

      expect(appError.message).toBe('Server error. Please try again later.');
    });
  });

  describe('Offline Detection', () => {
    it('should detect offline errors', () => {
      const offlineError = new Error('Network request failed');
      expect(errorHandler.isOfflineError(offlineError)).toBe(true);
    });

    it('should detect network errors', () => {
      const networkError = { code: 'NETWORK_ERROR' };
      expect(errorHandler.isOfflineError(networkError)).toBe(true);
    });

    it('should not detect non-network errors as offline', () => {
      const otherError = new Error('Something else');
      expect(errorHandler.isOfflineError(otherError)).toBe(false);
    });
  });
});


