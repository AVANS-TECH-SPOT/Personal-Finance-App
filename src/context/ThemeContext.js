import React, { createContext, useContext, useMemo } from 'react';
import { BG, CARD, CARD2, PRIMARY, ACCENT, DANGER, WARNING, INFO, TEXT, TEXT2, BORDER } from '../utils/constants';

const ThemeContext = createContext({
  theme: {
    colors: {
      primary: PRIMARY,
      accent: ACCENT,
      bg: BG,
      card: CARD,
      card2: CARD2,
      text: TEXT,
      text2: TEXT2,
      border: BORDER,
      danger: DANGER,
      warning: WARNING,
      info: INFO
    }
  }
});

export const ThemeProvider = ({ children }) => {
  const value = useMemo(() => ({
    theme: {
      colors: {
        primary: PRIMARY,
        accent: ACCENT,
        bg: BG,
        card: CARD,
        card2: CARD2,
        text: TEXT,
        text2: TEXT2,
        border: BORDER,
        danger: DANGER,
        warning: WARNING,
        info: INFO
      }
    }
  }), []);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
export default ThemeContext;
