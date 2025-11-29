/**
 * ToastProvider Component
 * Global toast context for showing notifications throughout the app
 * Requirements: 10.4
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Toast, ToastType } from './Toast';

interface ToastState {
    visible: boolean;
    message: string;
    type: ToastType;
}

interface ToastContextValue {
    showToast: (message: string, type?: ToastType) => void;
    showError: (message: string) => void;
    showSuccess: (message: string) => void;
    showInfo: (message: string) => void;
    showWarning: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

interface ToastProviderProps {
    children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const [toast, setToast] = useState<ToastState>({
        visible: false,
        message: '',
        type: 'info',
    });

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        setToast({ visible: true, message, type });
    }, []);

    const showError = useCallback((message: string) => {
        showToast(message, 'error');
    }, [showToast]);

    const showSuccess = useCallback((message: string) => {
        showToast(message, 'success');
    }, [showToast]);

    const showInfo = useCallback((message: string) => {
        showToast(message, 'info');
    }, [showToast]);

    const showWarning = useCallback((message: string) => {
        showToast(message, 'warning');
    }, [showToast]);

    const handleDismiss = useCallback(() => {
        setToast((prev) => ({ ...prev, visible: false }));
    }, []);

    return (
        <ToastContext.Provider
            value={{ showToast, showError, showSuccess, showInfo, showWarning }}
        >
            {children}
            <Toast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                onDismiss={handleDismiss}
            />
        </ToastContext.Provider>
    );
};

export const useToast = (): ToastContextValue => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export default ToastProvider;
