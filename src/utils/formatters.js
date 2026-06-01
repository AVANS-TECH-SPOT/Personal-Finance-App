import { MONTHS, MONTHS_FULL, CATS_BY_ID } from './constants';

export const fmtCurrency = (amount, currency = 'PGK') => {
  const abs = Math.abs(amount);
  const parts = abs.toFixed(2).split('.');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return currency + ' ' + intPart + '.' + parts[1];
};

export const fmtDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
};

export const fmtShortDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return MONTHS[d.getMonth()] + ' ' + d.getDate();
};

export const getMonthLabel = (monthStr) => {
  if (!monthStr) return '';
  const parts = monthStr.split('-');
  return MONTHS_FULL[parseInt(parts[1], 10) - 1] + ' ' + parts[0];
};

export const generateId = () => {
  return 'id-' + Date.now() + '-' + Math.floor(Math.random() * 100000);
};

export const getCategoryById = (id) => CATS_BY_ID[id] || null;
