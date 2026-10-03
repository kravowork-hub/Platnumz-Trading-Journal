// Native Android Haptics Engine (Capacitor native APK + Web Vibration fallback)
import { Haptics as CapHaptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

const isNative = typeof window !== 'undefined' && Capacitor.isNativePlatform();

export const Haptics = {
  // Light tick (tab changes, segment selection, checkboxes)
  light: async () => {
    if (isNative) {
      try {
        await CapHaptics.impact({ style: ImpactStyle.Light });
        return;
      } catch {}
    }
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch {}
    }
  },

  // Medium feedback (button taps, fast entry actions)
  medium: async () => {
    if (isNative) {
      try {
        await CapHaptics.impact({ style: ImpactStyle.Medium });
        return;
      } catch {}
    }
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(20);
      } catch {}
    }
  },

  // Success double pulse (trade logged, profile saved, backup export)
  success: async () => {
    if (isNative) {
      try {
        await CapHaptics.notification({ type: NotificationType.Success });
        return;
      } catch {}
    }
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([15, 30, 25]);
      } catch {}
    }
  },

  // Warning pulse (over risk limit, PIN mismatch, delete action)
  warning: async () => {
    if (isNative) {
      try {
        await CapHaptics.notification({ type: NotificationType.Warning });
        return;
      } catch {}
    }
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([35, 40, 35]);
      } catch {}
    }
  },

  // Keypad tick for biometric PIN entry
  keypad: async () => {
    if (isNative) {
      try {
        await CapHaptics.impact({ style: ImpactStyle.Light });
        return;
      } catch {}
    }
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(12);
      } catch {}
    }
  },
};
