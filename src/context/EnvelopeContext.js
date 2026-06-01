import React, { createContext, useContext, useState, useMemo } from 'react';

const EnvelopeContext = createContext({
  envelopes: [],
  setEnvelopes: () => {},
  addEnvelope: () => {},
  updateEnvelope: () => {},
  deleteEnvelope: () => {},
  spendFromEnvelope: () => {}
});

export const EnvelopeProvider = ({ children }) => {
  const [envelopes, setEnvelopes] = useState([]);

  const addEnvelope = (name, allocatedAmount, categoryId) => {
    const newEnv = {
      id: 'env-' + Date.now() + '-' + Math.floor(Math.random() * 100000),
      name,
      allocated: allocatedAmount,
      spent: 0,
      categoryId,
      createdAt: Date.now()
    };
    setEnvelopes(prev => [...prev, newEnv]);
    return newEnv;
  };

  const updateEnvelope = (id, updates) => {
    setEnvelopes(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteEnvelope = (id) => {
    setEnvelopes(prev => prev.filter(e => e.id !== id));
  };

  const spendFromEnvelope = (id, amount) => {
    setEnvelopes(prev => prev.map(e => {
      if (e.id === id) return { ...e, spent: e.spent + amount };
      return e;
    }));
  };

  const value = useMemo(() => ({
    envelopes,
    setEnvelopes,
    addEnvelope,
    updateEnvelope,
    deleteEnvelope,
    spendFromEnvelope
  }), [envelopes]);

  return (
    <EnvelopeContext.Provider value={value}>
      {children}
    </EnvelopeContext.Provider>
  );
};

export const useEnvelopes = () => useContext(EnvelopeContext);
export default EnvelopeContext;
