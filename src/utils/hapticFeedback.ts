import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export class HapticFeedback {
  static async light() {
    if (Platform.OS === 'ios') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

  static async medium() {
    if (Platform.OS === 'ios') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }

  static async heavy() {
    if (Platform.OS === 'ios') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }

  static async success() {
    if (Platform.OS === 'ios') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }

  static async error() {
    if (Platform.OS === 'ios') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  static async warning() {
    if (Platform.OS === 'ios') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }

  static async selection() {
    if (Platform.OS === 'ios') {
      await Haptics.selectionAsync();
    }
  }

  // Custom feedback for specific actions
  static async buttonPress() {
    await this.light();
  }

  static async mapPinPlaced() {
    await this.medium();
  }

  static async eventCreated() {
    await this.success();
  }

  static async errorOccurred() {
    await this.error();
  }

  static async placeSelected() {
    await this.selection();
  }

  static async filterApplied() {
    await this.light();
  }
}

export const hapticFeedback = HapticFeedback;


