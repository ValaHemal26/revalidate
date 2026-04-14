// ============================
// Notification Component
// ============================
// Simple toast-style notification that auto-dismisses.

import React, { useState, useEffect, createContext, useContext } from "react";

// Create a context so any component can show notifications
const NotifyContext = createContext();
export const useNotify = () => useContext(NotifyContext);

export function NotifyProvider({ children }) {
  const [notification, setNotification] = useState(null);

  // Show a notification with type ("success" or "error") and message
  const notify = (type, message) => {
    setNotification({ type, message });
  };

  // Auto-dismiss after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <NotifyContext.Provider value={notify}>
      {children}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </NotifyContext.Provider>
  );
}

// Standalone component (used in App.js)
export default function Notification() {
  return null; // Notifications are rendered by NotifyProvider
}
