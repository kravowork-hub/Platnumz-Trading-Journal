import { useEffect, useRef } from 'react';
import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Haptics } from '../utils/haptics';

interface BackButtonHandlers {
  hasOpenModal: boolean;
  closeTopModal: () => void;
  canGoBackView: boolean;
  goBackView: () => void;
  onExitNotice?: () => void;
}

export function useAndroidBackButton({
  hasOpenModal,
  closeTopModal,
  canGoBackView,
  goBackView,
  onExitNotice,
}: BackButtonHandlers) {
  const lastBackPressTime = useRef<number>(0);
  const handlersRef = useRef({ hasOpenModal, closeTopModal, canGoBackView, goBackView, onExitNotice });

  useEffect(() => {
    handlersRef.current = { hasOpenModal, closeTopModal, canGoBackView, goBackView, onExitNotice };
  }, [hasOpenModal, closeTopModal, canGoBackView, goBackView, onExitNotice]);

  useEffect(() => {
    // 1. Capacitor Native Android Back Button Listener
    let capListenerHandle: { remove: () => void } | null = null;

    if (Capacitor.isNativePlatform()) {
      CapApp.addListener('backButton', ({ canGoBack }) => {
        const { hasOpenModal, closeTopModal, canGoBackView, goBackView, onExitNotice } = handlersRef.current;
        Haptics.light();

        if (hasOpenModal) {
          closeTopModal();
          return;
        }

        if (canGoBackView) {
          goBackView();
          return;
        }

        // On main dashboard screen
        const now = Date.now();
        if (now - lastBackPressTime.current < 2000) {
          CapApp.exitApp();
        } else {
          lastBackPressTime.current = now;
          if (onExitNotice) {
            onExitNotice();
          }
        }
      }).then(handle => {
        capListenerHandle = handle;
      });
    }

    // 2. Web / PWA History Popstate listener
    const handlePopState = (e: PopStateEvent) => {
      const { hasOpenModal, closeTopModal, canGoBackView, goBackView, onExitNotice } = handlersRef.current;
      Haptics.light();

      if (hasOpenModal) {
        e.preventDefault();
        closeTopModal();
        return;
      }

      if (canGoBackView) {
        e.preventDefault();
        goBackView();
        return;
      }

      const now = Date.now();
      if (now - lastBackPressTime.current > 2000) {
        lastBackPressTime.current = now;
        if (onExitNotice) {
          onExitNotice();
        }
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (capListenerHandle) {
        capListenerHandle.remove();
      }
    };
  }, []);
}
