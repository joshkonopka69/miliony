import { useDialog } from '../contexts/DialogContext';
import { DialogButton } from '../components/ui/CustomDialog';

interface AlertButton {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertOptions {
  cancelable?: boolean;
}

/**
 * Drop-in replacement for React Native Alert.alert
 * Uses custom dialog system for consistent styling
 * 
 * Usage:
 * const alert = useAlert();
 * alert('Title', 'Message'); // Simple alert
 * alert('Title', 'Message', [{ text: 'OK' }]); // With buttons
 * alert('Confirm', 'Are you sure?', [
 *   { text: 'Cancel', style: 'cancel' },
 *   { text: 'Delete', style: 'destructive', onPress: handleDelete }
 * ]); // With multiple buttons
 */
export function useAlert() {
  const { showDialog, showSuccess, showError, showConfirm } = useDialog();

  const alert = (
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: AlertOptions
  ) => {
    // Determine dialog type based on title/buttons
    const isSuccess = title.toLowerCase().includes('success') || 
                     title.toLowerCase().includes('sukces');
    const isError = title.toLowerCase().includes('error') || 
                   title.toLowerCase().includes('błąd');
    const hasDestructive = buttons?.some(b => b.style === 'destructive');
    const hasMultipleButtons = buttons && buttons.length > 1;

    // Convert Alert buttons to Dialog buttons
    const dialogButtons: DialogButton[] = buttons?.map(b => ({
      text: b.text || 'OK',
      onPress: b.onPress,
      style: b.style || 'default',
    })) || [{ text: 'OK', style: 'default' as const }];

    // Choose appropriate dialog type
    if (hasDestructive || hasMultipleButtons) {
      showDialog({
        type: hasDestructive ? 'warning' : 'confirm',
        title,
        message: message || '',
        buttons: dialogButtons,
        autoHide: false,
      });
    } else if (isSuccess) {
      showSuccess(title, message || '');
    } else if (isError) {
      showError(title, message || '');
    } else {
      showDialog({
        type: 'info',
        title,
        message: message || '',
        buttons: dialogButtons,
        autoHide: true,
      });
    }
  };

  return alert;
}

export default useAlert;
