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

    // Notify listeners first
    this.listeners.forEach(listener => listener(url));

    // Check if it's an email confirmation link
    if (url.includes('token_hash') && url.includes('type=email')) {
      const result = await emailConfirmationHandler.handleEmailConfirmation(url);

      if (result.success) {
        console.log('Email confirmed successfully');
      } else {
        console.error('Email confirmation failed:', result.message);
      }
    }

    // Check if it's a password recovery link
    if (url.includes('type=recovery') || url.includes('reset-password')) {
      console.log('Password recovery link detected');
      // The session should be automatically set by Supabase when the link is clicked
      // React Navigation will handle navigating to the ResetPassword screen
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


