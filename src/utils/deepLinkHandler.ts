// Deep link handling for email confirmations

import { Linking } from 'react-native';
import { emailConfirmationHandler } from './emailConfirmation';

export class DeepLinkHandler {
  private static instance: DeepLinkHandler;
  private listeners: ((url: string) => void)[] = [];

  static getInstance(): DeepLinkHandler {
    if (!DeepLinkHandler.instance) {
      DeepLinkHandler.instance = new DeepLinkHandler();
    }
    return DeepLinkHandler.instance;
  }

  // Initialize deep link handling
  initialize(): void {
    // Handle app opened from deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        this.handleDeepLink(url);
      }
    });

    // Handle app opened while running
    Linking.addEventListener('url', (event) => {
      this.handleDeepLink(event.url);
    });
  }

  // Handle deep link
  private async handleDeepLink(url: string): Promise<void> {
    console.log('Deep link received:', url);

    // Check if it's an email confirmation link
    if (url.includes('token_hash') && url.includes('type=email')) {
      const result = await emailConfirmationHandler.handleEmailConfirmation(url);
      
      // Notify listeners
      this.listeners.forEach(listener => listener(url));
      
      if (result.success) {
        console.log('Email confirmed successfully');
        // Navigate to main app or show success message
      } else {
        console.error('Email confirmation failed:', result.message);
        // Show error message
      }
    }
  }

  // Add listener for deep link events
  addListener(callback: (url: string) => void): void {
    this.listeners.push(callback);
  }

  // Remove listener
  removeListener(callback: (url: string) => void): void {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }
}

export const deepLinkHandler = DeepLinkHandler.getInstance();


