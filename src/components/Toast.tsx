import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../styles/theme';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

type ToastKind = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastKind, React.ComponentType<any>> = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
};

const ACCENTS: Record<ToastKind, string> = {
  success: COLORS.success,
  error: COLORS.heart,
  info: COLORS.accentNeon,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, kind: ToastKind = 'info') => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, kind, message }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View style={styles.stack} pointerEvents="box-none">
        {toasts.map((toast) => {
          const Icon = ICONS[toast.kind];
          return (
            <View
              key={toast.id}
              style={[styles.toast, { borderLeftColor: ACCENTS[toast.kind] }]}
            >
              <Icon size={18} color={ACCENTS[toast.kind]} />
              <Text style={styles.message}>{toast.message}</Text>
              <TouchableOpacity
                onPress={() => dismiss(toast.id)}
                style={styles.close}
              >
                <X size={14} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

const styles: any = StyleSheet.create({
  stack: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    zIndex: 999,
    alignItems: 'stretch',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1b223c',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 3,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
  },
  message: {
    flex: 1,
    marginLeft: 10,
    color: COLORS.textPrimary,
    fontFamily: 'Outfit',
    fontSize: 13,
    lineHeight: 18,
  },
  close: {
    marginLeft: 8,
    padding: 4,
    cursor: 'pointer',
  },
});
