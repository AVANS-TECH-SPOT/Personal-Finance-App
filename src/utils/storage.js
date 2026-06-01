import AsyncStorage from '@react-native-async-storage/async-storage';

const TABLES = {
  accounts: 'ff_accounts',
  transactions: 'ff_transactions',
  budgets: 'ff_budgets',
  envelopes: 'ff_envelopes',
  ious: 'ff_ious',
  settings: 'ff_settings'
};

export const getTable = async (table) => {
  try {
    const key = TABLES[table] || `ff_${table}`;
    const json = await AsyncStorage.getItem(key);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.error('[Storage] getTable error:', e.message);
    return [];
  }
};

export const setTable = async (table, data) => {
  try {
    const key = TABLES[table] || `ff_${table}`;
    await AsyncStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('[Storage] setTable error:', e.message);
    return false;
  }
};

export const insertItem = async (table, item) => {
  const data = await getTable(table);
  data.push(item);
  await setTable(table, data);
  return item;
};

export const updateItem = async (table, id, updates) => {
  const data = await getTable(table);
  const idx = data.findIndex(d => d.id === id);
  if (idx >= 0) {
    data[idx] = { ...data[idx], ...updates };
    await setTable(table, data);
    return data[idx];
  }
  return null;
};

export const deleteItem = async (table, id) => {
  const data = await getTable(table);
  const filtered = data.filter(d => d.id !== id);
  await setTable(table, filtered);
  return filtered;
};

export const clearAll = async () => {
  try {
    const keys = Object.values(TABLES);
    await AsyncStorage.multiRemove(keys);
    return true;
  } catch (e) {
    console.error('[Storage] clearAll error:', e.message);
    return false;
  }
};

export const exportAll = async () => {
  const result = {};
  for (const [name, key] of Object.entries(TABLES)) {
    result[name] = await getTable(name);
  }
  return result;
};

export const importAll = async (data) => {
  for (const [name, items] of Object.entries(data)) {
    if (TABLES[name]) {
      await setTable(name, items);
    }
  }
  return true;
};
