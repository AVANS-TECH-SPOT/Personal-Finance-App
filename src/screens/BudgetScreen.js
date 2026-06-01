import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLocalQuery, useLocalMutation } from '../hooks/useLocalQuery';
import SetBudgetModal from '../components/SetBudgetModal';
import {
  BG, CARD, CARD2, PRIMARY, DANGER, WARNING, TEXT, TEXT2, BORDER,
  TAB_MENU_HEIGHT, SCROLL_EXTRA_PADDING, WEB_TAB_MENU_PADDING, HEADER_HEIGHT, CURRENT_MONTH
} from '../utils/constants';
import { getMonthLabel } from '../utils/formatters';
import { CATS_BY_ID } from '../utils/constants';

const BudgetScreen = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const { data: budgets, loading: budgetsLoading, refetch: refetchBudgets } = useLocalQuery('budgets');
  const { data: allTx } = useLocalQuery('transactions');
  const { mutate: deleteBudget } = useLocalMutation('budgets', 'delete');

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const currentBudgets = useMemo(() => {
    return (budgets || []).filter(b => b.month === CURRENT_MONTH);
  }, [budgets]);

  const txList = allTx || [];

  const spentByCategory = useMemo(() => {
    const map = {};
    txList.forEach(t => {
      if (t.type === 'expense' && t.category_id && t.transaction_date?.indexOf(CURRENT_MONTH) === 0) {
        map[t.category_id] = (map[t.category_id] || 0) + t.amount;
      }
    });
    return map;
  }, [txList]);

  const handleDeleteBudget = (b) => {
    const msg = 'Remove this budget?';
    const doDelete = async () => {
      try {
        await deleteBudget({ id: b.id });
        refetchBudgets();
      } catch (err) {
        Platform.OS === 'web' ? alert(err.message) : Alert.alert('Error', err.message);
      }
    };
    Platform.OS === 'web'
      ? (window.confirm(msg) ? doDelete() : null)
      : Alert.alert('Remove Budget', msg, [{ text: 'Cancel' }, { text: 'Remove', onPress: doDelete, style: 'destructive' }]);
  };

  const scrollBottomPadding = Platform.OS === 'web' ? WEB_TAB_MENU_PADDING : (TAB_MENU_HEIGHT + insets.bottom + SCROLL_EXTRA_PADDING);
  const scrollH = Dimensions.get('window').height - HEADER_HEIGHT - insets.top;

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <View style={{ height: HEADER_HEIGHT + insets.top, paddingTop: insets.top, backgroundColor: CARD, justifyContent: 'center', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: BORDER, flexDirection: 'row', alignItems: 'flex-end', paddingBottom: 12 }}>
        <Text style={{ color: TEXT, fontSize: 20, fontWeight: 'bold', flex: 1 }}>Budgets</Text>
        <Text style={{ color: TEXT2, fontSize: 12 }}>{getMonthLabel(CURRENT_MONTH)}</Text>
      </View>

      <ScrollView
        style={Platform.OS === 'web' ? { height: scrollH, overflow: 'auto' } : { flex: 1 }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: scrollBottomPadding }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20 }}>
          {budgetsLoading ? (
            <View style={{ alignItems: 'center', padding: 40 }}>
              <Text style={{ color: PRIMARY }}>Loading...</Text>
            </View>
          ) : currentBudgets.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <MaterialIcons name="pie-chart" size={48} color={BORDER} />
              <Text style={{ color: TEXT2, fontSize: 16, marginTop: 16, fontWeight: '600' }}>No Budgets Set</Text>
              <Text style={{ color: TEXT2, fontSize: 13, marginTop: 8, textAlign: 'center' }}>Set monthly budgets to track your spending</Text>
              <TouchableOpacity
                onPress={() => { setEditing(null); setShowModal(true); }}
                style={{ backgroundColor: PRIMARY, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, marginTop: 20 }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>+ Set Budget</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {currentBudgets.map(budget => {
                const cat = CATS_BY_ID[budget.category_id];
                if (!cat) return null;
                const spent = spentByCategory[budget.category_id] || 0;
                const pct = budget.monthly_limit > 0 ? Math.min(spent / budget.monthly_limit, 1) : 0;
                const alertThreshold = budget.alert_threshold || 0.8;
                const isOver = pct >= 1;
                const isAlert = pct >= alertThreshold && !isOver;
                const barColor = isOver ? DANGER : isAlert ? WARNING : PRIMARY;
                const remaining = budget.monthly_limit - spent;

                return (
                  <View key={budget.id} style={{ backgroundColor: CARD, borderRadius: 16, padding: 16, marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: cat.color + '22', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                        <MaterialIcons name={cat.icon} size={20} color={cat.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: TEXT, fontSize: 15, fontWeight: '600' }}>{cat.name}</Text>
                        {isOver ? (
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                            <MaterialIcons name="warning" size={12} color={DANGER} />
                            <Text style={{ color: DANGER, fontSize: 11, marginLeft: 4 }}>Over budget!</Text>
                          </View>
                        ) : isAlert ? (
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                            <MaterialIcons name="notifications" size={12} color={WARNING} />
                            <Text style={{ color: WARNING, fontSize: 11, marginLeft: 4 }}>Near limit ({Math.round(alertThreshold * 100)}% threshold)</Text>
                          </View>
                        ) : null}
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ color: TEXT, fontSize: 14, fontWeight: 'bold' }}>K {spent.toFixed(0)} / K {budget.monthly_limit.toFixed(0)}</Text>
                        <Text style={{ color: remaining >= 0 ? TEXT2 : DANGER, fontSize: 11, marginTop: 2 }}>
                          {remaining >= 0 ? `K ${remaining.toFixed(0)} left` : `K ${Math.abs(remaining).toFixed(0)} over`}
                        </Text>
                      </View>
                    </View>

                    <View style={{ height: 8, backgroundColor: CARD2, borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
                      <View style={{ height: 8, width: `${pct * 100}%`, backgroundColor: barColor, borderRadius: 4 }} />
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                      <TouchableOpacity
                        onPress={() => { setEditing(budget); setShowModal(true); }}
                        style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: CARD2, marginRight: 8 }}
                      >
                        <MaterialIcons name="edit" size={14} color={TEXT2} />
                        <Text style={{ color: TEXT2, fontSize: 12, marginLeft: 4 }}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteBudget(budget)}
                        style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: DANGER + '15' }}
                      >
                        <MaterialIcons name="delete-outline" size={14} color={DANGER} />
                        <Text style={{ color: DANGER, fontSize: 12, marginLeft: 4 }}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}

              <TouchableOpacity
                onPress={() => { setEditing(null); setShowModal(true); }}
                style={{ backgroundColor: PRIMARY + '22', borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: PRIMARY + '44', flexDirection: 'row', justifyContent: 'center', marginTop: 4 }}
              >
                <MaterialIcons name="add" size={20} color={PRIMARY} />
                <Text style={{ color: PRIMARY, fontSize: 15, fontWeight: '600', marginLeft: 8 }}>Add Budget</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      <SetBudgetModal
        visible={showModal}
        onClose={() => { setShowModal(false); setEditing(null); }}
        onSaved={() => refetchBudgets()}
        existingBudget={editing}
        insetsTop={insets.top}
        insetsBottom={insets.bottom}
      />
    </View>
  );
};

export default BudgetScreen;
