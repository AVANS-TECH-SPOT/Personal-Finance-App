import { useState, useEffect, useCallback } from 'react';
import { getTable, setTable } from '../utils/storage';

export const useLocalQuery = (table) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const items = await getTable(table);
    setData(items);
    setLoading(false);
  }, [table]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const refetch = useCallback(() => {
    fetch();
  }, [fetch]);

  return { data, loading, refetch };
};

export const useLocalMutation = (table, operation) => {
  const [loading, setLoading] = useState(false);

  const mutate = useCallback(async (payload) => {
    setLoading(true);
    const items = await getTable(table);
    let result;

    if (operation === 'insert') {
      items.push(payload);
      result = payload;
    } else if (operation === 'update') {
      const idx = items.findIndex(i => i.id === payload.id);
      if (idx >= 0) {
        items[idx] = { ...items[idx], ...payload.data };
        result = items[idx];
      }
    } else if (operation === 'delete') {
      const filtered = items.filter(i => i.id !== payload.id);
      await setTable(table, filtered);
      setLoading(false);
      return { success: true };
    }

    await setTable(table, items);
    setLoading(false);
    return result;
  }, [table, operation]);

  return { mutate, loading };
};
