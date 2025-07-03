import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface NotificationContextType {
  notifications: boolean;
  toggleNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationContextProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState(() => localStorage.getItem('notifications') !== 'off');

  useEffect(() => {
    localStorage.setItem('notifications', notifications ? 'on' : 'off');
  }, [notifications]);

  const toggleNotifications = () => setNotifications((prev) => !prev);

  return (
    <NotificationContext.Provider value={{ notifications, toggleNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotificationContext must be used within NotificationContextProvider');
  return ctx;
}; 