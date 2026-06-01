import React, { createContext, useContext, useState, useMemo } from 'react';

const IOUContext = createContext({
  ious: [],
  addIOU: () => {},
  updateIOU: () => {},
  deleteIOU: () => {},
  settleIOU: () => {}
});

export const IOUProvider = ({ children }) => {
  const [ious, setIOUs] = useState([]);

  const addIOU = (personName, amount, type, dueDate, notes) => {
    const newIOU = {
      id: 'iou-' + Date.now() + '-' + Math.floor(Math.random() * 100000),
      personName,
      amount,
      type,
      dueDate,
      notes,
      settled: false,
      createdAt: Date.now()
    };
    setIOUs(prev => [...prev, newIOU]);
    return newIOU;
  };

  const updateIOU = (id, updates) => {
    setIOUs(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const deleteIOU = (id) => {
    setIOUs(prev => prev.filter(i => i.id !== id));
  };

  const settleIOU = (id) => {
    updateIOU(id, { settled: true });
  };

  const value = useMemo(() => ({
    ious,
    addIOU,
    updateIOU,
    deleteIOU,
    settleIOU
  }), [ious]);

  return (
    <IOUContext.Provider value={value}>
      {children}
    </IOUContext.Provider>
  );
};

export const useIOU = () => useContext(IOUContext);
export default IOUContext;
