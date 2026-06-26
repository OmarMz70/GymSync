import { createContext, useContext, useState } from 'react';

const dark = {
  bg: '#0a0f1e',
  card: '#111929',
  border: '#1e2a4a',
  subtext: '#4a5a8a',
  text: '#ffffff',
  accent: '#172554',
  accentLight: '#93b4ff',
  inputBg: '#0a0f1e',
  inGym: '#172554',
  willGo: '#f4a261',
  alreadyWent: '#2a9d8f',
  wontGo: '#555',
};

const light = {
  bg: '#f5f5f5',
  card: '#ffffff',
  border: '#e0e0e0',
  subtext: '#888888',
  text: '#111111',
  accent: '#172554',
  accentLight: '#2563eb',
  inputBg: '#ebebeb',
  inGym: '#172554',
  willGo: '#e07c1a',
  alreadyWent: '#2a9d8f',
  wontGo: '#aaaaaa',
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);
  return (
    <ThemeContext.Provider value={{ isDark, theme: isDark ? dark : light, toggleTheme: () => setIsDark(d => !d) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
