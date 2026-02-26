import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuthStore } from '@/stores/auth-store';

const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_BEFORE = 5 * 60 * 1000; // 5 minutes warning

export function useSessionTimeout() {
  const { isAuthenticated, logout } = useAuthStore();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(300);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  const resetTimer = useCallback(() => {
    clearTimers();
    setShowWarning(false);

    if (!isAuthenticated) return;

    // Show warning after IDLE_TIMEOUT - WARNING_BEFORE
    idleTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      setSecondsLeft(WARNING_BEFORE / 1000);

      countdownRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) return 0;
          return prev - 1;
        });
      }, 1000);

      // Auto-logout after WARNING_BEFORE
      warningTimerRef.current = setTimeout(() => {
        logout();
        window.location.href = '/login';
      }, WARNING_BEFORE);
    }, IDLE_TIMEOUT - WARNING_BEFORE);
  }, [isAuthenticated, logout, clearTimers]);

  const stayLoggedIn = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    const handler = () => {
      if (!showWarning) resetTimer();
    };

    events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
    resetTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      clearTimers();
    };
  }, [isAuthenticated, showWarning, resetTimer, clearTimers]);

  return { showWarning, secondsLeft, stayLoggedIn, logout };
}
