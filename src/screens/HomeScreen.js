import React, { useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useLocalQuery } from '../hooks/useLocalQuery';
import AddTransactionModal from '../components/AddTransactionModal';
import AddAccountModal from '../components/AddAccountModal';
import {
  BG, CARD, CARD2, PRIMARY, DANGER, INFO, WARNING, TEXT, TEXT2, BORDER,
  TAB_MENU_HEIGHT, WEB_TAB_MENU_PADDING, FAB_SPACING, CURRENT_MONTH
} from '../utils/constants';
import { fmtCurrency, fmtShortDate, getMonthLabel, generateId } from '../utils/formatters';
import { CATS_BY_ID } from '../utils/constants';

const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const app = useApp();
  const insets = useSafeAreaInsets();

  const { data: accounts, loading: accsLoading, refetch: refetchAccs } = useLocalQuery('accounts');
  const { data: transactions, loading: txLoading, refetch: refetchTx } = useLocalQuery('transactions');

  const [showTxModal, setShowTxModal] = React.useState(false);
  const [showAccModal, setShowAccModal] = React.useState(false);

  const fabBottom = Platform.OS === 'web' ? WEB_TAB_MENU_PADDING : (TAB_MENU_HEIGHT + insets.bottom + FAB_SPACING);
  const scrollBottomPadding = Platform.OS === 'web' ? WEB_TAB_MENU_PADDING + 80 : (TAB_MENU_HEIGHT + insets.bottom + 80);

  const accs = accounts || [];
  const selectedAcc = accs.find(a => a.id === app.selectedAccountId) || accs[0];

  useEffect(() => {
    if (!app.selectedAccountId && accs.length > 0) {
      app.setSelectedAccountId(accs[0].id);
    }
  }, [accs.length, app]);

  const allTx = transactions || [];
  const currentMonth = CURRENT_MONTH;

  const monthTx = useMemo(() => allTx.filter(t => t.transaction_date?.indexOf(currentMonth) === 0), [allTx, currentMonth]);

  const { monthIncome, monthExpense } = useMemo(() => {
    let inc = 0, exp = 0;
    monthTx.forEach(t => {
      if (t.type === 'income') inc += t.amount;
      else if (t.type === 'expense') exp += t.amount;
    });
    return { monthIncome: inc, monthExpense: exp };
  }, [monthTx]);

  const netSavings = monthIncome - monthExpense;

  const recentTx = useMemo(() => {
    const accTx = selectedAcc ? allTx.filter(t => t.account_id === selectedAcc.id) : [];
    return accTx.sort((a, b) => b.transaction_date > a.transaction_date ? 1 : -1).slice(0, 10);
  }, [allTx, selectedAcc]);

  const onTxSaved = () => { refetchAccs(); refetchTx(); };

  if (accsLoading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: PRIMARY }}>Loading...</Text>
      </View>
    );
  }

  if (accs.length === 0) {
    return (
      <View style={styles.container}>
        <View style={{ padding: 20, paddingTop: 32, alignItems: 'center', flex: 1, justifyContent: 'center' }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: PRIMARY + '22', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <MaterialIcons name="account-balance-wallet" size={40} color={PRIMARY} />
          </View>
          <Text style={{ color: TEXT, fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }}>Welcome to FinanceFlow</Text>
          <Text style={{ color: TEXT2, fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 32 }}>Start by adding your first account to track your finances</Text>
          <TouchableOpacity
            onPress={() => setShowAccModal(true)}
            style={{ backgroundColor: PRIMARY, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 40, alignItems: 'center' }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>+ Add Account</Text>
          </TouchableOpacity>
        </View>
        <AddAccountModal visible={showAccModal} onClose={() => setShowAccModal(false)} onSaved={() => refetchAccs()} insetsTop={insets.top} insetsBottom={insets.bottom} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: scrollBottomPadding }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ color: TEXT, fontSize: 20, fontWeight: 'bold' }}>FinanceFlow</Text>
            <TouchableOpacity onPress={() => setShowAccModal(true)} style={{ padding: 8, backgroundColor: CARD, borderRadius: 10 }}>
              <MaterialIcons name="add-circle-outline" size={22} color={PRIMARY} />
            </TouchableOpacity>
          </View>
          <Text style={{ color: TEXT2, fontSize: 13 }}>{getMonthLabel(currentMonth)}</Text>
        </View>

        {/* Account Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginBottom: 16 }} contentContainerStyle={{ paddingHorizontal: 20 }}>
          {accs.map(acc => {
            const active = selectedAcc?.id === acc.id;
            return (
              <TouchableOpacity
                key={acc.id}
                onPress={() => app.setSelectedAccountId(acc.id)}
                style={[styles.accountCard, active && styles.accountCardActive]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: active ? 'rgba(255,255,255,0.2)' : PRIMARY + '22', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                    <MaterialIcons name={acc.type === 'bank' ? 'account-balance' : 'account-balance-wallet'} size={18} color={active ? '#FFFFFF' : PRIMARY} />
                  </View>
                  <View>
                    <Text style={{ color: active ? 'rgba(255,255,255,0.8)' : TEXT2, fontSize: 11 }}>{acc.type === 'bank' ? 'Bank Account' : 'Cash Wallet'}</Text>
                    <Text style={{ color: active ? '#FFFFFF' : TEXT, fontSize: 14, fontWeight: '600' }}>{acc.name}</Text>
                  </View>
                </View>
                <Text style={{ color: active ? '#FFFFFF' : TEXT, fontSize: 22, fontWeight: 'bold', letterSpacing: -0.5 }}>
                  {app.hideBalance ? '****' : fmtCurrency(acc.balance, acc.currency)}
                </Text>
                {active && (
                  <View style={{ position: 'absolute', bottom: 12, right: 12 }}>
                    <MaterialIcons name="check-circle" size={18} color="rgba(255,255,255,0.6)" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            onPress={() => setShowAccModal(true)}
            style={{ width: 160, height: 130, borderRadius: 16, borderWidth: 2, borderColor: BORDER, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}
          >
            <MaterialIcons name="add" size={28} color={TEXT2} />
            <Text style={{ color: TEXT2, fontSize: 13, marginTop: 4 }}>Add Account</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Monthly Summary */}
        <View style={{ marginHorizontal: 20, marginBottom: 16 }}>
          <View style={{ backgroundColor: CARD, borderRadius: 16, padding: 16 }}>
            <Text style={{ color: TEXT2, fontSize: 12, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Monthly Summary</Text>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1, alignItems: 'center', paddingVertical: 12, backgroundColor: PRIMARY + '15', borderRadius: 12, marginRight: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <MaterialIcons name="arrow-downward" size={14} color={PRIMARY} />
                  <Text style={{ color: TEXT2, fontSize: 11, marginLeft: 4 }}>Income</Text>
                </View>
                <Text style={{ color: PRIMARY, fontSize: 16, fontWeight: 'bold' }}>K {monthIncome.toFixed(0)}</Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center', paddingVertical: 12, backgroundColor: DANGER + '15', borderRadius: 12, marginRight: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <MaterialIcons name="arrow-upward" size={14} color={DANGER} />
                  <Text style={{ color: TEXT2, fontSize: 11, marginLeft: 4 }}>Expenses</Text>
                </View>
                <Text style={{ color: DANGER, fontSize: 16, fontWeight: 'bold' }}>K {monthExpense.toFixed(0)}</Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center', paddingVertical: 12, backgroundColor: (netSavings >= 0 ? INFO : WARNING) + '15', borderRadius: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <MaterialIcons name="savings" size={14} color={netSavings >= 0 ? INFO : WARNING} />
                  <Text style={{ color: TEXT2, fontSize: 11, marginLeft: 4 }}>Net</Text>
                </View>
                <Text style={{ color: netSavings >= 0 ? INFO : WARNING, fontSize: 16, fontWeight: 'bold' }}>
                  {(netSavings >= 0 ? '+' : '')}K {netSavings.toFixed(0)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={{ marginHorizontal: 20, marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ color: TEXT, fontSize: 16, fontWeight: 'bold' }}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
              <Text style={{ color: PRIMARY, fontSize: 13 }}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentTx.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 40, backgroundColor: CARD, borderRadius: 16 }}>
              <MaterialIcons name="receipt-long" size={40} color={BORDER} />
              <Text style={{ color: TEXT2, marginTop: 12, fontSize: 14 }}>No transactions yet</Text>
              <Text style={{ color: TEXT2, fontSize: 12, marginTop: 4 }}>Tap + to add your first transaction</Text>
            </View>
          ) : (
            <View style={{ backgroundColor: CARD, borderRadius: 16, overflow: 'hidden' }}>
              {recentTx.map((tx, idx) => {
                const cat = tx.category_id ? CATS_BY_ID[tx.category_id] : null;
                const isLast = idx === recentTx.length - 1;
                return (
                  <View key={tx.id}>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
                      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: cat ? cat.color + '22' : CARD2, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                        <MaterialIcons name={cat ? cat.icon : 'attach-money'} size={20} color={cat ? cat.color : TEXT2} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: TEXT, fontSize: 14, fontWeight: '600' }}>{cat ? cat.name : tx.type}</Text>
                        <Text style={{ color: TEXT2, fontSize: 12, marginTop: 2 }}>
                          {tx.description ? tx.description.substring(0, 30) + (tx.description.length > 30 ? '...' : '') : fmtShortDate(tx.transaction_date)}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ color: tx.type === 'income' ? PRIMARY : tx.type === 'expense' ? DANGER : INFO, fontSize: 15, fontWeight: 'bold' }}>
                          {(tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : '')}K {tx.amount.toFixed(2)}
                        </Text>
                        <Text style={{ color: TEXT2, fontSize: 11, marginTop: 2 }}>{fmtShortDate(tx.transaction_date)}</Text>
                      </View>
                    </TouchableOpacity>
                    {!isLast && <View style={{ height: 1, backgroundColor: BORDER, marginLeft: 68 }} />}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => setShowTxModal(true)}
        style={[styles.fab, { bottom: fabBottom }]}
      >
        <MaterialIcons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <AddTransactionModal
        visible={showTxModal}
        onClose={() => setShowTxModal(false)}
        onSaved={onTxSaved}
        accounts={accs}
        insetsTop={insets.top}
        insetsBottom={insets.bottom}
      />
      <AddAccountModal
        visible={showAccModal}
        onClose={() => setShowAccModal(false)}
        onSaved={() => refetchAccs()}
        insetsTop={insets.top}
        insetsBottom={insets.bottom}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG
  },
  accountCard: {
    width: 180,
    height: 130,
    borderRadius: 16,
    backgroundColor: CARD,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: BORDER,
    justifyContent: 'space-between',
    position: 'relative'
  },
  accountCardActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8
  }
});

export default HomeScreen;
