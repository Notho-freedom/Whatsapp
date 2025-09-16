"use client";

import { useCallback, useMemo, useState } from 'react';

export const useNotification = () => {
  const [permission, setPermission] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'default');
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({ sound: true, vibration: true });
  const [isLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return 'denied';
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (e) {
      setError(e.message);
      return 'denied';
    }
  }, []);

  const addNotification = useCallback((data) => {
    const n = { id: `${Date.now()}`, ...data, created_at: new Date() };
    setNotifications(prev => [n, ...prev]);
    return n;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const updateSettings = useCallback((updates) => setSettings(prev => ({ ...prev, ...updates })), []);
  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(() => ({ notifications, settings, permission, isLoading, error }), [notifications, settings, permission, isLoading, error]);

  return {
    ...value,
    requestPermission,
    addNotification,
    removeNotification,
    updateSettings,
    clearError
  };
};
