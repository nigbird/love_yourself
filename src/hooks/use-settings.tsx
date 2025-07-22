
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type TextSize = 'text-sm' | 'text-base' | 'text-lg';
type Font = 'font-alegreya' | 'font-inter' | 'font-roboto' | 'font-lora';

interface SettingsContextType {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  darkMode: boolean;
  setDarkMode: (enabled: boolean) => void;
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  font: Font;
  setFont: (font: Font) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const getLocalStorageItem = (key: string, defaultValue: any) => {
    if (typeof window === 'undefined') return defaultValue;
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : defaultValue;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => getLocalStorageItem('soundEnabled', true));
  const [darkMode, setDarkModeState] = useState<boolean>(() => getLocalStorageItem('darkMode', true));
  const [textSize, setTextSizeState] = useState<TextSize>(() => getLocalStorageItem('textSize', 'text-base'));
  const [font, setFontState] = useState<Font>(() => getLocalStorageItem('font', 'font-alegreya'));


  useEffect(() => {
    // This effect ensures state is loaded from localStorage only on the client
    setSoundEnabledState(getLocalStorageItem('soundEnabled', true));
    setDarkModeState(getLocalStorageItem('darkMode', true));
    setTextSizeState(getLocalStorageItem('textSize', 'text-base'));
    setFontState(getLocalStorageItem('font', 'font-alegreya'));
  }, []);

  const setSoundEnabled = (enabled: boolean) => {
    localStorage.setItem('soundEnabled', JSON.stringify(enabled));
    setSoundEnabledState(enabled);
  };

  const setDarkMode = (enabled: boolean) => {
    localStorage.setItem('darkMode', JSON.stringify(enabled));
    setDarkModeState(enabled);
  };

  const setTextSize = (size: TextSize) => {
    localStorage.setItem('textSize', JSON.stringify(size));
    setTextSizeState(size);
  }

  const setFont = (font: Font) => {
    localStorage.setItem('font', JSON.stringify(font));
    setFontState(font);
  }

  const value = { 
      soundEnabled, setSoundEnabled,
      darkMode, setDarkMode,
      textSize, setTextSize,
      font, setFont
    };

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
