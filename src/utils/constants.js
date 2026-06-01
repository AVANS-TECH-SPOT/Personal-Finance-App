// Theme Colors
export const BG = '#0F172A';
export const CARD = '#1E293B';
export const CARD2 = '#263548';
export const PRIMARY = '#10B981';
export const ACCENT = '#059669';
export const DANGER = '#EF4444';
export const WARNING = '#F59E0B';
export const INFO = '#3B82F6';
export const TEXT = '#F1F5F9';
export const TEXT2 = '#94A3B8';
export const BORDER = '#334155';

// Categories
export const CATEGORIES = [
  { id: 'cat-001', name: 'Food & Dining', icon: 'restaurant', color: '#F59E0B', type: 'expense' },
  { id: 'cat-002', name: 'Transport', icon: 'directions-car', color: '#3B82F6', type: 'expense' },
  { id: 'cat-003', name: 'Bills & Utilities', icon: 'receipt', color: '#EF4444', type: 'expense' },
  { id: 'cat-004', name: 'Shopping', icon: 'shopping-bag', color: '#8B5CF6', type: 'expense' },
  { id: 'cat-005', name: 'Health', icon: 'favorite', color: '#EC4899', type: 'expense' },
  { id: 'cat-006', name: 'Entertainment', icon: 'movie', color: '#F97316', type: 'expense' },
  { id: 'cat-007', name: 'Education', icon: 'school', color: '#0EA5E9', type: 'expense' },
  { id: 'cat-008', name: 'Other Expense', icon: 'category', color: '#6B7280', type: 'expense' },
  { id: 'cat-009', name: 'Salary', icon: 'work', color: '#10B981', type: 'income' },
  { id: 'cat-010', name: 'Freelance', icon: 'computer', color: '#06B6D4', type: 'income' },
  { id: 'cat-011', name: 'Investment', icon: 'trending-up', color: '#8B5CF6', type: 'income' },
  { id: 'cat-012', name: 'Other Income', icon: 'attach-money', color: '#10B981', type: 'income' },
  { id: 'cat-013', name: 'Transfer', icon: 'swap-horiz', color: '#64748B', type: 'transfer' },
  { id: 'cat-014', name: 'Savings', icon: 'savings', color: '#10B981', type: 'income' }
];

export const CATS_BY_ID = {};
CATEGORIES.forEach(c => { CATS_BY_ID[c.id] = c; });

export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export const MONTHS_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export const NOW = new Date();
export const CURRENT_MONTH = NOW.getFullYear() + '-' + (NOW.getMonth() < 9 ? '0' : '') + (NOW.getMonth() + 1);

export const SAMPLE_ACCOUNTS = [
  { id: 'acc-sample-001', name: 'BSP Bank', type: 'bank', balance: 5420.50, currency: 'PGK', is_primary: true },
  { id: 'acc-sample-002', name: 'Cash Wallet', type: 'cash', balance: 350.00, currency: 'PGK', is_primary: false }
];

export const TODAY_STR = NOW.getFullYear() + '-' + (NOW.getMonth() < 9 ? '0' : '') + (NOW.getMonth() + 1) + '-' + (NOW.getDate() < 10 ? '0' : '') + NOW.getDate();

// Layout
import { Platform } from 'react-native';
export const TAB_MENU_HEIGHT = Platform.OS === 'web' ? 56 : 49;
export const SCROLL_EXTRA_PADDING = 16;
export const WEB_TAB_MENU_PADDING = 90;
export const FAB_SPACING = 16;
export const HEADER_HEIGHT = 60;
