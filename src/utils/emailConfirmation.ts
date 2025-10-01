// Email confirmation handling utilities

import { supabase } from '../config/supabase';

export class EmailConfirmationHandler {
  // Handle email confirmation from deep link
  static async handleEmailConfirmation(url: string): Promise<{
    success: boolean;
    message: string;
    user?: any;
  }> {
    try {
      // Extract token from URL
      const urlObj = new URL(url);
      const tokenHash = urlObj.searchParams.get('token_hash');
      const type = urlObj.searchParams.get('type');

      if (!tokenHash || type !== 'email') {
        return {
          success: false,
          message: 'Invalid confirmation link',
        };
      }

      // Verify the email confirmation
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: 'email',
      });

      if (error) {
        console.error('Email confirmation error:', error);
        return {
          success: false,
          message: error.message,
        };
      }

      if (data.user) {
        return {
          success: true,
          message: 'Email confirmed successfully!',
          user: data.user,
        };
      }

      return {
        success: false,
        message: 'Email confirmation failed',
      };
    } catch (error) {
      console.error('Email confirmation error:', error);
      return {
        success: false,
        message: 'An error occurred during email confirmation',
      };
    }
  }

  // Resend confirmation email
  static async resendConfirmationEmail(email: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        return {
          success: false,
          message: error.message,
        };
      }

      return {
        success: true,
        message: 'Confirmation email sent successfully',
      };
    } catch (error) {
      console.error('Resend confirmation error:', error);
      return {
        success: false,
        message: 'Failed to resend confirmation email',
      };
    }
  }

  // Check if user email is confirmed
  static async isEmailConfirmed(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.email_confirmed_at !== null;
    } catch (error) {
      console.error('Check email confirmation error:', error);
      return false;
    }
  }
}

export const emailConfirmationHandler = EmailConfirmationHandler;


