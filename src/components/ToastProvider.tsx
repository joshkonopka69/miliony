import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Toast, { ToastType } from './Toast';

interface ToastConfig {
    message: string;
    type: ToastType;
    title?: string;
    duration?: number;
    onPress?: () => void;
}

interface ToastContextType {
    showToast: (config: ToastConfig) => void;
    showSuccess: (message: string, title?: string) => void;
    showError: (message: string, title?: string) => void;
    showWarning: (message: string, title?: string) => void;
    showInfo: (message: string, title?: string) => void;
    hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
    children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
    const [visible, setVisible] = useState(false);
    const [config, setConfig] = useState<ToastConfig>({
        message: '',
        type: 'info',
    });

    const showToast = useCallback((newConfig: ToastConfig) => {
        setConfig(newConfig);
        setVisible(true);
    }, []);

    const showSuccess = useCallback((message: string, title?: string) => {
        showToast({ message, type: 'success', title });
    }, [showToast]);

    const showError = useCallback((message: string, title?: string) => {
        showToast({ message, type: 'error', title });
    }, [showToast]);

    const showWarning = useCallback((message: string, title?: string) => {
        showToast({ message, type: 'warning', title });
    }, [showToast]);

    const showInfo = useCallback((message: string, title?: string) => {
        showToast({ message, type: 'info', title });
    }, [showToast]);

    const hideToast = useCallback(() => {
        setVisible(false);
    }, []);

    return (
        <ToastContext.Provider
            value={{
                showToast,
                showSuccess,
                showError,
                showWarning,
                showInfo,
                hideToast,
            }}
        >
            {children}
            <Toast
                visible={visible}
                message={config.message}
                type={config.type}
                title={config.title}
                duration={config.duration}
                onHide={hideToast}
                onPress={config.onPress}
            />
        </ToastContext.Provider>
    );
}

export function useToast(): ToastContextType {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

// Convenience export for direct import
export { ToastType } from './Toast';
