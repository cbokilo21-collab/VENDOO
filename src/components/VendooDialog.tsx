import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator,
  Platform, KeyboardAvoidingView, ScrollView,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

const C = {
  bg: 'rgba(0, 0, 0, 0.5)',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  accent: '#FF6B35',
  accentSoft: 'rgba(255, 107, 53, 0.1)',
  text: '#111827',
  textMid: '#374151',
  textLight: '#6B7280',
  success: '#10B981',
  successSoft: 'rgba(16, 185, 129, 0.1)',
  error: '#EF4444',
  errorSoft: 'rgba(239, 68, 68, 0.1)',
  warning: '#F59E0B',
  warningSoft: 'rgba(245, 158, 11, 0.1)',
};

type DialogType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface VendooDialogProps {
  visible: boolean;
  type?: DialogType;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
}

const Ico = ({ d, s = 24, c = C.textMid }: { d: string; s?: number; c?: string }) => (
  <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d={d} />
  </Svg>
);

const getIconForType = (type: DialogType) => {
  switch (type) {
    case 'success':
      return 'M9 12l2 2 4-4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z';
    case 'error':
      return 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M7 7l10 10M17 7L7 17';
    case 'warning':
      return 'M12 9v2m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z';
    case 'loading':
      return null;
    default:
      return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z';
  }
};

const getColorForType = (type: DialogType) => {
  switch (type) {
    case 'success':
      return { bg: C.successSoft, icon: C.success, border: C.success };
    case 'error':
      return { bg: C.errorSoft, icon: C.error, border: C.error };
    case 'warning':
      return { bg: C.warningSoft, icon: C.warning, border: C.warning };
    case 'loading':
      return { bg: C.accentSoft, icon: C.accent, border: C.accent };
    default:
      return { bg: C.accentSoft, icon: C.accent, border: C.accent };
  }
};

const VendooDialog: React.FC<VendooDialogProps> = ({
  visible,
  type = 'info',
  title,
  message,
  confirmText = 'OK',
  cancelText,
  onConfirm,
  onCancel,
  onClose,
}) => {
  const colors = getColorForType(type);
  const iconPath = getIconForType(type);

  const handleConfirm = () => {
    onConfirm?.();
    onClose?.();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.overlay}
      >
        <View style={s.overlay}>
          <View style={s.container}>
            {/* Icon */}
            {type === 'loading' ? (
              <View style={[s.iconContainer, { backgroundColor: colors.bg }]}>
                <ActivityIndicator size="large" color={colors.icon} />
              </View>
            ) : iconPath ? (
              <View style={[s.iconContainer, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                <Ico d={iconPath} s={32} c={colors.icon} />
              </View>
            ) : null}

            {/* Content */}
            <ScrollView style={s.content} contentContainerStyle={s.contentContainer}>
              {title && <Text style={s.title}>{title}</Text>}
              {message && <Text style={s.message}>{message}</Text>}
            </ScrollView>

            {/* Actions */}
            {type !== 'loading' && (
              <View style={s.actions}>
                {cancelText && (
                  <TouchableOpacity
                    style={[s.button, s.buttonCancel]}
                    onPress={handleCancel}
                    activeOpacity={0.7}
                  >
                    <Text style={s.buttonTextCancel}>{cancelText}</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[s.button, s.buttonConfirm, { backgroundColor: colors.border }]}
                  onPress={handleConfirm}
                  activeOpacity={0.7}
                >
                  <Text style={s.buttonTextConfirm}>{confirmText}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: C.bg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: C.surface,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
    borderWidth: 2,
  },
  content: {
    maxHeight: 300,
  },
  contentContainer: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: C.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: C.textMid,
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonCancel: {
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
  },
  buttonConfirm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonTextCancel: {
    fontSize: 15,
    fontWeight: '600',
    color: C.textMid,
  },
  buttonTextConfirm: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default VendooDialog;
