import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useLocalQuery, useLocalMutation } from '../hooks/useLocalQuery';
import AddTransactionModal from '../components/AddTransactionModal';
import {
  BG, CARD, CARD2, PRIMARY, DANGER, INFO, TEXT, TEXT2, BORDER,
  TAB_MENU_HEIGHT, WEB_TAB_MENU_PADDING, FAB_SPACING, HEADER_HEIGHT
} from '../utils/constants';
import { fmtShortDate } from '../utils/formatters';
import { CATS_BY_ID } from '../utils/constants';

const TransactionsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const app = useApp();
  const insets = useSafeAreaInsets();

  const { data: accounts, refetch: refetchAccs } = useLocalQuery('accounts');
  const { data: allTx, loading: txLoading, refetch: refetchTx } = useLocalQuery('transactions');
  const { mutate: deleteTx } = useLocalMutation('transactions', 'delete');
  const { mutate: updateAcc } = useLocalMutation('accounts', 'update');

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showTxModal, setShowTxModal] = useState(false);
  const [selAccFilter, setSelAccFilter] = useState('all');

  const accs = accounts || [];
  const txList = allTx || [];

  const filtered = useMemo(() => {
    let result = txList.filter(t => {
      if (filter !== 'all' && t.type !== filter) return false;
      if (selAccFilter !== 'all' && t.account_id !== selAccFilter) return false;
      if (search.trim()) {
        const cat = t.category_id ? CATS_BY_ID[t.category_id] : null;
        const catName = cat ? cat.name.toLowerCase() : '';
        const desc = (t.description || '').toLowerCase();
        const q = search.toLowerCase();
        if (!catName.includes(q) && !desc.includes(q)) return false;
      }
      return true;
    });
    result.sort((a, b) => b.transaction_date > a.transaction_date ? 1 : -1);
    return result;
  }, [txList, filter, search, selAccFilter]);

  const handleDelete = (tx) => {
    const msg = 'Delete this transaction?';
    const doDelete = async () => {
      try {
        await deleteTx({ id: tx.id });
        const srcAcc = accs.find(a => a.id === tx.account_id);
        if (srcAcc) {
          const revert = tx.type === 'income' ? srcAcc.balance - tx.amount : srcAcc.balance + tx.amount;
          await updateAcc({ id: tx.account_id, data: { balance: revert } });
        }
        refetchTx();
        refetchAccs();
      } catch (err) {
        Platform.OS === 'web' ? alert(err.message) : Alert.alert('Error', err.message);
      }
    };
    Platform.OS === 'web'
      ? (window.confirm(msg) ? doDelete() : null)
      : Alert.alert('Delete', msg, [{ text: 'Cancel' }, { text: 'Delete', onPress: doDelete, style: 'destructive' }]);
  };

  const fabBottom = Platform.OS === 'web' ? WEB_TAB_MENU_PADDING : (TAB_MENU_HEIGHT + insets.bottom + FAB_SPACING);
  const scrollBottomPadding = Platform.OS === 'web' ? WEB_TAB_MENU_PADDING + 80 : (TAB_MENU_HEIGHT + insets.bottom + 80);
  const scrollH = Dimensions.get('window').height - HEADER_HEIGHT - insets.top;

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <View style={{ height: HEADER_HEIGHT + insets.top, paddingTop: insets.top, backgroundColor: CARD, justifyContent: 'center', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: BORDER }}>
        <Text style={{ color: TEXT, fontSize: 20, fontWeight: 'bold' }}>Transactions</Text>
      </View>

      <ScrollView
        style={Platform.OS === 'web' ? { height: scrollH, overflow: 'auto' } : { flex: 1 }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: scrollBottomPadding }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
          {/* Search */}
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: 12, paddingHorizontal: 12, marginBottom: 12 }}>
            <MaterialIcons name="search" size={20} color={TEXT2} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search transactions..."
              placeholderTextColor={TEXT2}
              style={{ flex: 1, color: TEXT, padding: 12, fontSize: 15 }}
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>

          {/* Type Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginBottom: 8 }}>
            {[{ key: 'all', label: 'All' }, { key: 'income', label: 'Income' }, { key: 'expense', label: 'Expense' }, { key: 'transfer', label: 'Transfer' }].map(f => {
              const active = filter === f.key;
              return (
                <TouchableOpacity
                  key={f.key}
                  onPress={() => setFilter(f.key)}
                  style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: active ? PRIMARY : CARD, marginRight: 8 }}
                >
                  <Text style={{ color: active ? '#FFFFFF' : TEXT2, fontSize: 13, fontWeight: active ? '700' : '400' }}>{f.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Account Filter */}
          {accs.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
              <TouchableOpacity
                onPress={() => setSelAccFilter('all')}
                style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: selAccFilter === 'all' ? CARD2 : 'transparent', borderWidth: 1, borderColor: selAccFilter === 'all' ? TEXT2 : BORDER, marginRight: 8 }}
              >
                <Text style={{ color: selAccFilter === 'all' ? TEXT : TEXT2, fontSize: 12 }}>All Accounts</Text>
              </TouchableOpacity>
              {accs.map(acc => {
                const active = selAccFilter === acc.id;
                return (
                  <TouchableOpacity
                    key={acc.id}
                    onPress={() => setSelAccFilter(acc.id)}
                    style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: active ? CARD2 : 'transparent', borderWidth: 1, borderColor: active ? TEXT2 : BORDER, marginRight: 8 }}
                  >
                    <Text style={{ color: active ? TEXT : TEXT2, fontSize: 12 }}>{acc.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Transaction List */}
        {txLoading ? (
          <View style={{ alignItems: 'center', padding: 40 }}>
            <Text style={{ color: PRIMARY }}>Loading...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={{ alignItems: 'center', padding: 60 }}>
            <MaterialIcons name="receipt-long" size={48} color={BORDER} />
            <Text style={{ color: TEXT2, marginTop: 16, fontSize: 14 }}>{search ? 'No results found' : 'No transactions yet'}</Text>
          </View>
        ) : (
          <View style={{ marginHorizontal: 20, backgroundColor: CARD, borderRadius: 16, overflow: 'hidden' }}>
            {filtered.map((tx, idx) => {
              const cat = tx.category_id ? CATS_BY_ID[tx.category_id] : null;
              const isLast = idx === filtered.length - 1;
              const accForTx = accs.find(a => a.id === tx.account_id);
              return (
                <View key={tx.id}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14 }}>
                    <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: cat ? cat.color + '22' : CARD2, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                      <MaterialIcons name={cat ? cat.icon : 'attach-money'} size={20} color={cat ? cat.color : TEXT2} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: TEXT, fontSize: 14, fontWeight: '600' }}>{cat ? cat.name : tx.type}</Text>
                      <Text style={{ color: TEXT2, fontSize: 11, marginTop: 1 }}>{(accForTx ? accForTx.name + ' · ' : '') + fmtShortDate(tx.transaction_date)}</Text>
                      {tx.description && <Text style={{ color: TEXT2, fontSize: 11, marginTop: 1 }}>{tx.description.substring(0, 40) + (tx.description.length > 40 ? '...' : '')}</Text>}
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ color: tx.type === 'income' ? PRIMARY : tx.type === 'expense' ? DANGER : INFO, fontSize: 15, fontWeight: 'bold' }}>
                        {(tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : '')}K {tx.amount.toFixed(2)}
                      </Text>
                      {tx.is_recurring && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                          <MaterialIcons name="repeat" size={11} color={INFO} />
                          <Text style={{ color: INFO, fontSize: 10, marginLeft: 2 }}>recurring</Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity onPress={() => handleDelete(tx)} style={{ padding: 8, marginLeft: 4 }}>
                      <MaterialIcons name="delete-outline" size={18} color={DANGER + '80'} />
                    </TouchableOpacity>
                  </View>
                  {!isLast && <View style={{ height: 1, backgroundColor: BORDER, marginLeft: 68 }} />}
                </View>
              );
            })}
          </View>
        )}
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
        onSaved={() => { refetchTx(); refetchAccs(); }}
        accounts={accs}
        insetsTop={insets.top}
        insetsBottom={insets.bottom}
      />
    </View>
  );
};

const styles = {
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
};

export default TransactionsScreen;
