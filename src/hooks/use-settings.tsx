
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SettingsContextType {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
        const storedValue = localStorage.getItem('soundEnabled');
        return storedValue ? JSON.parse(storedValue) : true;
    }
    return true;
  });

  useEffect(() => {
    // This effect ensures state is loaded from localStorage only on the client
    const storedValue = localStorage.getItem('soundEnabled');
    if (storedValue !== null) {
      setSoundEnabledState(JSON.parse(storedValue));
    }
  }, []);

  const setSoundEnabled = (enabled: boolean) => {
    localStorage.setItem('soundEnabled', JSON.stringify(enabled));
    setSoundEnabledState(enabled);
  };

  const value = { soundEnabled, setSoundEnabled };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
