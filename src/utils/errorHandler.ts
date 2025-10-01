import { Alert } from 'react-native';

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: AppError[] = [];

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  handleError(error: any, context?: string): AppError {
    const appError: AppError = {
      code: this.getErrorCode(error),
      message: this.getErrorMessage(error),
      details: error,
      timestamp: new Date(),
    };

    this.errorLog.push(appError);
    console.error(`[${context || 'Unknown'}] Error:`, appError);

    return appError;
  }

  showUserFriendlyError(error: AppError, context?: string) {
    const userMessage = this.getUserFriendlyMessage(error.code);
    Alert.alert(
      'Something went wrong',
      `${userMessage}${context ? ` (${context})` : ''}`,
      [
        { text: 'OK', style: 'default' },
        { text: 'Retry', onPress: () => this.retryLastAction() }
      ]
    );
  }

  private getErrorCode(error: any): string {
    if (error?.code) return error.code;
    if (error?.status) return `HTTP_${error.status}`;
    if (error?.message?.includes('network')) return 'NETWORK_ERROR';
    if (error?.message?.includes('timeout')) return 'TIMEOUT_ERROR';
    if (error?.message?.includes('permission')) return 'PERMISSION_ERROR';
    return 'UNKNOWN_ERROR';
  }

  private getErrorMessage(error: any): string {
    return error?.message || error?.toString() || 'Unknown error occurred';
  }

  private getUserFriendlyMessage(code: string): string {
    const messages: { [key: string]: string } = {
      'NETWORK_ERROR': 'Please check your internet connection and try again.',
      'TIMEOUT_ERROR': 'The request took too long. Please try again.',
      'PERMISSION_ERROR': 'Permission denied. Please check your app settings.',
      'HTTP_404': 'The requested resource was not found.',
      'HTTP_500': 'Server error. Please try again later.',
      'PLACE_NOT_FOUND': 'Place information could not be found.',
      'EVENT_CREATION_FAILED': 'Failed to create event. Please try again.',
      'LOCATION_ERROR': 'Unable to get your location. Please check permissions.',
      'UNKNOWN_ERROR': 'An unexpected error occurred. Please try again.',
    };

    return messages[code] || messages['UNKNOWN_ERROR'];
  }

  private retryLastAction() {
    // This would be implemented based on the specific action that failed
    console.log('Retrying last action...');
  }

  getErrorLog(): AppError[] {
    return [...this.errorLog];
  }

  clearErrorLog() {
    this.errorLog = [];
  }

  // Network error handling
  async handleNetworkError(error: any, retryFunction: () => Promise<any>, maxRetries: number = 3): Promise<any> {
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        return await retryFunction();
      } catch (retryError) {
        retries++;
        if (retries >= maxRetries) {
          throw this.handleError(retryError, 'Network retry failed');
        }
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
      }
    }
  }

  // Offline mode detection
  isOfflineError(error: any): boolean {
    return error?.code === 'NETWORK_ERROR' || 
           error?.message?.includes('network') ||
           error?.message?.includes('offline');
  }

  // Location error handling
  handleLocationError(error: any): AppError {
    const appError = this.handleError(error, 'Location');
    
    if (error?.code === 'E_LOCATION_SERVICES_DISABLED') {
      appError.message = 'Location services are disabled. Please enable them in settings.';
    } else if (error?.code === 'E_LOCATION_UNAVAILABLE') {
      appError.message = 'Location is unavailable. Please try again.';
    } else if (error?.code === 'E_LOCATION_TIMEOUT') {
      appError.message = 'Location request timed out. Please try again.';
    }

    return appError;
  }

  // API error handling
  handleApiError(error: any, endpoint: string): AppError {
    const appError = this.handleError(error, `API: ${endpoint}`);
    
    if (error?.response?.status === 429) {
      appError.message = 'Too many requests. Please wait a moment and try again.';
    } else if (error?.response?.status === 403) {
      appError.message = 'Access denied. Please check your API key.';
    } else if (error?.response?.status >= 500) {
      appError.message = 'Server error. Please try again later.';
    }

    return appError;
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();
