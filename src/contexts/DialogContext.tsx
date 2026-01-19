import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import CustomDialog, { DialogConfig, DialogType, DialogButton } from '../components/ui/CustomDialog';

interface DialogContextType {
  showDialog: (config: DialogConfig) => void;
  showSuccess: (title: string, message: string, onDismiss?: () => void) => void;
  showError: (title: string, message: string) => void;
  showWarning: (title: string, message: string) => void;
  showInfo: (title: string, message: string) => void;
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => void;
  hideDialog: () => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

interface DialogProviderProps {
  children: ReactNode;
}

export function DialogProvider({ children }: DialogProviderProps) {
  const [visible, setVisible] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<DialogConfig | null>(null);

  const showDialog = useCallback((config: DialogConfig) => {
    setDialogConfig(config);
    setVisible(true);
  }, []);

  const hideDialog = useCallback(() => {
    setVisible(false);
    setDialogConfig(null);
  }, []);

  const showSuccess = useCallback((title: string, message: string, onDismiss?: () => void) => {
    showDialog({
      type: 'success',
      title,
      message,
      buttons: [{ 
        text: 'Awesome!', 
        style: 'default',
        onPress: onDismiss 
      }],
      autoHide: true,
      autoHideDuration: 3000,
    });
  }, [showDialog]);

  const showError = useCallback((title: string, message: string) => {
    showDialog({
      type: 'error',
      title,
      message,
      buttons: [{ text: 'OK', style: 'default' }],
      autoHide: false,
    });
  }, [showDialog]);

  const showWarning = useCallback((title: string, message: string) => {
    showDialog({
      type: 'warning',
      title,
      message,
      buttons: [{ text: 'OK', style: 'default' }],
      autoHide: true,
      autoHideDuration: 4000,
    });
  }, [showDialog]);

  const showInfo = useCallback((title: string, message: string) => {
    showDialog({
      type: 'info',
      title,
      message,
      buttons: [{ text: 'OK', style: 'default' }],
      autoHide: true,
      autoHideDuration: 3000,
    });
  }, [showDialog]);

  const showConfirm = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    showDialog({
      type: 'confirm',
      title,
      message,
      buttons: [
        { text: 'Cancel', style: 'cancel', onPress: onCancel },
        { text: 'Confirm', style: 'default', onPress: onConfirm },
      ],
      autoHide: false,
    });
  }, [showDialog]);

  return (
    <DialogContext.Provider
      value={{
        showDialog,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showConfirm,
        hideDialog,
      }}
    >
      {children}
      <CustomDialog
        visible={visible}
        config={dialogConfig}
        onDismiss={hideDialog}
      />
    </DialogContext.Provider>
  );
}

export function useDialog(): DialogContextType {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
}

export default DialogContext;
