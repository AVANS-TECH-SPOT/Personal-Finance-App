import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLocalQuery } from '../hooks/useLocalQuery';
import {
  BG, CARD, CARD2, PRIMARY, DANGER, INFO, WARNING, TEXT, TEXT2, BORDER,
  TAB_MENU_HEIGHT, SCROLL_EXTRA_PADDING, WEB_TAB_MENU_PADDING, HEADER_HEIGHT, MONTHS, NOW
} from '../utils/constants';
import { fmtCurrency, fmtDate, fmtShortDate, getMonthLabel } from '../utils/formatters';
import { CATS_BY_ID } from '../utils/constants';

const AnalyticsScreen = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const { data: allTx, loading: txLoading } = useLocalQuery('transactions');
  const { data: accounts } = useLocalQuery('accounts');

  const [monthOffset, setMonthOffset] = useState(0);
  const [detailCat, setDetailCat] = useState(null);

  const targetDate = useMemo(() => {
    const d = new Date(NOW.getFullYear(), NOW.getMonth() + monthOffset, 1);
    return d.getFullYear() + '-' + (d.getMonth() < 9 ? '0' : '') + (d.getMonth() + 1);
  }, [monthOffset]);

  const txList = allTx || [];

  const monthTx = useMemo(() => {
    return txList.filter(t => t.transaction_date?.indexOf(targetDate) === 0);
  }, [txList, targetDate]);

  const { totalIncome, totalExpense } = useMemo(() => {
    let inc = 0, exp = 0;
    monthTx.forEach(t => {
      if (t.type === 'income') inc += t.amount;
      else if (t.type === 'expense') exp += t.amount;
    });
    return { totalIncome: inc, totalExpense: exp };
  }, [monthTx]);

  const net = totalIncome - totalExpense;

  const catBreakdown = useMemo(() => {
    const map = {};
    monthTx.forEach(t => {
      if (t.type === 'expense' && t.category_id) {
        map[t.category_id] = (map[t.category_id] || 0) + t.amount;
      }
    });
    return Object.entries(map)
      .map(([catId, amount]) => ({ catId, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthTx]);

  const accs = accounts || [];
  const totalBalance = accs.reduce((sum, a) => sum + a.balance, 0);

  const last6Months = useMemo(() => {
    const result = [];
    for (let m = -5; m <= 0; m++) {
      const d = new Date(NOW.getFullYear(), NOW.getMonth() + m, 1);
      const mStr = d.getFullYear() + '-' + (d.getMonth() < 9 ? '0' : '') + (d.getMonth() + 1);
      let inc = 0, exp = 0;
      txList.forEach(t => {
        if (t.transaction_date?.indexOf(mStr) === 0) {
          if (t.type === 'income') inc += t.amount;
          else if (t.type === 'expense') exp += t.amount;
        }
      });
      result.push({ month: mStr, label: MONTHS[d.getMonth()], income: inc, expense: exp });
    }
    return result;
  }, [txList]);

  const maxBarVal = useMemo(() => {
    let max = 100;
    last6Months.forEach(m => {
      if (m.income > max) max = m.income;
      if (m.expense > max) max = m.expense;
    });
    return max;
  }, [last6Months]);

  const detailTx = detailCat ? monthTx.filter(t => t.category_id === detailCat) : [];

  const scrollBottomPadding = Platform.OS === 'web' ? WEB_TAB_MENU_PADDING : (TAB_MENU_HEIGHT + insets.bottom + SCROLL_EXTRA_PADDING);
  const scrollH = Dimensions.get('window').height - HEADER_HEIGHT - insets.top;

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <View style={{ height: HEADER_HEIGHT + insets.top, paddingTop: insets.top, backgroundColor: CARD, justifyContent: 'flex-end', paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: BORDER }}>
        <Text style={{ color: TEXT, fontSize: 20, fontWeight: 'bold' }}>Analytics</Text>
      </View>

      <ScrollView
        style={Platform.OS === 'web' ? { height: scrollH, overflow: 'auto' } : { flex: 1 }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: scrollBottomPadding }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20 }}>
          {/* Month Navigator */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: CARD, borderRadius: 12, padding: 8, marginBottom: 16 }}>
            <TouchableOpacity onPress={() => setMonthOffset(monthOffset - 1)} style={{ padding: 8 }}>
              <MaterialIcons name="chevron-left" size={24} color={TEXT2} />
            </TouchableOpacity>
            <Text style={{ color: TEXT, fontWeight: '600', fontSize: 15 }}>{getMonthLabel(targetDate)}</Text>
            <TouchableOpacity onPress={() => setMonthOffset(Math.min(0, monthOffset + 1))} style={{ padding: 8 }}>
              <MaterialIcons name="chevron-right" size={24} color={monthOffset < 0 ? TEXT2 : BORDER} />
            </TouchableOpacity>
          </View>

          {/* Overview */}
          <View style={{ backgroundColor: CARD, borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <Text style={{ color: TEXT2, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Overview</Text>
            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
              <View style={{ flex: 1, alignItems: 'center', paddingVertical: 12, backgroundColor: PRIMARY + '15', borderRadius: 12, marginRight: 8 }}>
                <Text style={{ color: TEXT2, fontSize: 11, marginBottom: 4 }}>INCOME</Text>
                <Text style={{ color: PRIMARY, fontSize: 20, fontWeight: 'bold' }}>K {totalIncome.toFixed(0)}</Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center', paddingVertical: 12, backgroundColor: DANGER + '15', borderRadius: 12 }}>
                <Text style={{ color: TEXT2, fontSize: 11, marginBottom: 4 }}>EXPENSES</Text>
                <Text style={{ color: DANGER, fontSize: 20, fontWeight: 'bold' }}>K {totalExpense.toFixed(0)}</Text>
              </View>
            </View>
            <View style={{ alignItems: 'center', paddingVertical: 12, backgroundColor: (net >= 0 ? INFO : WARNING) + '15', borderRadius: 12 }}>
              <Text style={{ color: TEXT2, fontSize: 11, marginBottom: 4 }}>NET SAVINGS</Text>
              <Text style={{ color: net >= 0 ? INFO : WARNING, fontSize: 24, fontWeight: 'bold' }}>{(net >= 0 ? '+' : '')}K {net.toFixed(0)}</Text>
            </View>
          </View>

          {/* 6-Month Trend */}
          <View style={{ backgroundColor: CARD, borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <Text style={{ color: TEXT2, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 }}>6-Month Trend</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 120 }}>
              {last6Months.map(m => {
                const incH = maxBarVal > 0 ? (m.income / maxBarVal) * 100 : 0;
                const expH = maxBarVal > 0 ? (m.expense / maxBarVal) * 100 : 0;
                const isTarget = m.month === targetDate;
                return (
                  <View key={m.month} style={{ flex: 1, alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 90 }}>
                      <View style={{ width: 8, height: incH > 0 ? `${incH}%` : 4, backgroundColor: PRIMARY, borderRadius: 4, marginRight: 2 }} />
                      <View style={{ width: 8, height: expH > 0 ? `${expH}%` : 4, backgroundColor: DANGER, borderRadius: 4, marginLeft: 2 }} />
                    </View>
                    <Text style={{ color: isTarget ? PRIMARY : TEXT2, fontSize: 10, marginTop: 6, fontWeight: isTarget ? 'bold' : 'normal' }}>{m.label}</Text>
                  </View>
                );
              })}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
                <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: PRIMARY, marginRight: 6 }} />
                <Text style={{ color: TEXT2, fontSize: 11 }}>Income</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: DANGER, marginRight: 6 }} />
                <Text style={{ color: TEXT2, fontSize: 11 }}>Expenses</Text>
              </View>
            </View>
          </View>

          {/* Spending by Category */}
          {catBreakdown.length > 0 ? (
            <View style={{ backgroundColor: CARD, borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <Text style={{ color: TEXT2, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 }}>Spending by Category</Text>
              {catBreakdown.map(item => {
                const cat = CATS_BY_ID[item.catId];
                if (!cat) return null;
                const pct = totalExpense > 0 ? item.amount / totalExpense : 0;
                const isSelected = detailCat === item.catId;
                return (
                  <View key={item.catId}>
                    <TouchableOpacity onPress={() => setDetailCat(isSelected ? null : item.catId)} style={{ marginBottom: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                        <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: cat.color + '22', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                          <MaterialIcons name={cat.icon} size={14} color={cat.color} />
                        </View>
                        <Text style={{ flex: 1, color: TEXT, fontSize: 13 }}>{cat.name}</Text>
                        <Text style={{ color: TEXT2, fontSize: 11, marginRight: 8 }}>{Math.round(pct * 100)}%</Text>
                        <Text style={{ color: DANGER, fontSize: 13, fontWeight: '600' }}>K {item.amount.toFixed(0)}</Text>
                        <MaterialIcons name={isSelected ? 'expand-less' : 'expand-more'} size={16} color={TEXT2} />
                      </View>
                      <View style={{ height: 6, backgroundColor: CARD2, borderRadius: 3, overflow: 'hidden' }}>
                        <View style={{ height: 6, width: `${pct * 100}%`, backgroundColor: cat.color, borderRadius: 3 }} />
                      </View>
                    </TouchableOpacity>

                    {isSelected && (
                      <View style={{ backgroundColor: CARD2, borderRadius: 12, padding: 12, marginBottom: 12 }}>
                        {detailTx.map((tx, idx) => (
                          <View key={tx.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: idx < detailTx.length - 1 ? 1 : 0, borderBottomColor: BORDER }}>
                            <Text style={{ flex: 1, color: TEXT, fontSize: 13 }}>{tx.description || fmtDate(tx.transaction_date)}</Text>
                            <Text style={{ color: TEXT2, fontSize: 11, marginRight: 8 }}>{fmtShortDate(tx.transaction_date)}</Text>
                            <Text style={{ color: DANGER, fontSize: 13, fontWeight: '600' }}>K {tx.amount.toFixed(2)}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={{ backgroundColor: CARD, borderRadius: 16, padding: 40, alignItems: 'center', marginBottom: 16 }}>
              <MaterialIcons name="donut-large" size={40} color={BORDER} />
              <Text style={{ color: TEXT2, marginTop: 12 }}>No expenses this month</Text>
            </View>
          )}

          {/* Total Portfolio */}
          <View style={{ backgroundColor: CARD, borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <Text style={{ color: TEXT2, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Total Portfolio</Text>
            <Text style={{ color: TEXT, fontSize: 30, fontWeight: 'bold', marginBottom: 8 }}>{fmtCurrency(totalBalance, 'PGK')}</Text>
            {accs.map(acc => {
              const pct = totalBalance > 0 ? acc.balance / totalBalance : 0;
              return (
                <View key={acc.id} style={{ marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <MaterialIcons name={acc.type === 'bank' ? 'account-balance' : 'account-balance-wallet'} size={14} color={PRIMARY} />
                    <Text style={{ flex: 1, color: TEXT2, fontSize: 12, marginLeft: 6 }}>{acc.name}</Text>
                    <Text style={{ color: TEXT, fontSize: 13, fontWeight: '600' }}>{fmtCurrency(acc.balance, acc.currency)}</Text>
                  </View>
                  <View style={{ height: 4, backgroundColor: CARD2, borderRadius: 2, overflow: 'hidden' }}>
                    <View style={{ height: 4, width: `${Math.max(0, pct * 100)}%`, backgroundColor: PRIMARY, borderRadius: 2 }} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default AnalyticsScreen;
