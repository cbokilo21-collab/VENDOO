import React, { createContext, useContext, useState, ReactNode } from 'react';
import VendooDialog from '../components/VendooDialog';

type DialogType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface DialogOptions {
  type?: DialogType;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface DialogContextType {
  showDialog: (options: DialogOptions) => void;
  hideDialog: () => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<DialogOptions>({});

  const showDialog = (newOptions: DialogOptions) => {
    setOptions(newOptions);
    setVisible(true);
  };

  const hideDialog = () => {
    setVisible(false);
  };

  const showSuccess = (message: string, title = 'Succès') => {
    showDialog({ type: 'success', title, message, confirmText: 'OK' });
  };

  const showError = (message: string, title = 'Erreur') => {
    showDialog({ type: 'error', title, message, confirmText: 'OK' });
  };

  const showWarning = (message: string, title = 'Attention') => {
    showDialog({ type: 'warning', title, message, confirmText: 'OK' });
  };

  const showInfo = (message: string, title = 'Information') => {
    showDialog({ type: 'info', title, message, confirmText: 'OK' });
  };

  const showLoading = (message = 'Chargement...') => {
    showDialog({ type: 'loading', title: message });
  };

  const hideLoading = () => {
    hideDialog();
  };

  const handleConfirm = () => {
    options.onConfirm?.();
    hideDialog();
  };

  const handleCancel = () => {
    options.onCancel?.();
    hideDialog();
  };

  return (
    <DialogContext.Provider
      value={{
        showDialog,
        hideDialog,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showLoading,
        hideLoading,
      }}
    >
      {children}
      <VendooDialog
        visible={visible}
        type={options.type}
        title={options.title}
        message={options.message}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        onClose={hideDialog}
      />
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};
