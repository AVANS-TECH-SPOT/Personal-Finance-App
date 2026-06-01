import React, { createContext, useContext, useState, useMemo } from 'react';

const AppContext = createContext({
  selectedAccountId: null,
  setSelectedAccountId: () => {},
  pinEnabled: false,
  setPinEnabled: () => {},
  pinCode: '',
  setPinCode: () => {},
  unlocked: true,
  setUnlocked: () => {},
  hideBalance: false,
  setHideBalance: () => {}
});

export const AppProvider = ({ children }) => {
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [pinEnabled, setPinEnabled] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [unlocked, setUnlocked] = useState(true);
  const [hideBalance, setHideBalance] = useState(false);

  const value = useMemo(() => ({
    selectedAccountId,
    setSelectedAccountId,
    pinEnabled,
    setPinEnabled,
    pinCode,
    setPinCode,
    unlocked,
    setUnlocked,
    hideBalance,
    setHideBalance
  }), [selectedAccountId, pinEnabled, pinCode, unlocked, hideBalance]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
export default AppContext;
