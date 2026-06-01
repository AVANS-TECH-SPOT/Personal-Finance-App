import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Modal, TextInput,
  Alert, Platform, ActivityIndicator, Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useLocalMutation } from '../hooks/useLocalQuery';
import NumberPad from './NumberPad';
import {
  CATEGORIES, CATS_BY_ID, CURRENT_MONTH, TODAY_STR,
  BG, CARD, CARD2, PRIMARY, DANGER, INFO, TEXT, TEXT2, BORDER
} from '../utils/constants';
import { fmtDate, generateId } from '../utils/formatters';

const { height: SCREEN_H } = Dimensions.get('window');

const AddTransactionModal = ({ visible, onClose, onSaved, accounts = [], insetsTop = 0, insetsBottom = 0 }) => {
  const { theme } = useTheme();
  const app = useApp();

  const [txType, setTxType] = useState('expense');
  const [amount, setAmount] = useState('0');
  const [selectedCat, setSelectedCat] = useState(CATEGORIES[0].id);
  const [desc, setDesc] = useState('');
  const [txDate, setTxDate] = useState(TODAY_STR);
  const [selectedAcc, setSelectedAcc] = useState(accounts[0]?.id || '');
  const [toAcc, setToAcc] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [saving, setSaving] = useState(false);

  const { mutate: insertTx } = useLocalMutation('transactions', 'insert');
  const { mutate: updateAcc } = useLocalMutation('accounts', 'update');

  useEffect(() => {
    if (visible) {
      setTxType('expense');
      setAmount('0');
      setSelectedCat(CATEGORIES[0].id);
      setDesc('');
      setTxDate(TODAY_STR);
      setSelectedAcc(accounts[0]?.id || '');
      setToAcc(accounts[1]?.id || '');
      setIsRecurring(false);
      setSaving(false);
    }
  }, [visible, accounts]);

  useEffect(() => {
    if (accounts.length > 0 && !selectedAcc) {
      setSelectedAcc(accounts[0].id);
    }
  }, [accounts, selectedAcc]);

  const filteredCats = useMemo(() => {
    return CATEGORIES.filter(c => c.type === txType || (txType === 'transfer' && c.type === 'transfer'));
  }, [txType]);

  const handleSave = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      Platform.OS === 'web' ? alert('Please enter a valid amount') : Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    if (!selectedAcc) {
      Platform.OS === 'web' ? alert('Please select an account') : Alert.alert('Error', 'Please select an account');
      return;
    }

    setSaving(true);
    const srcAcc = accounts.find(a => a.id === selectedAcc);
    const catToUse = txType === 'transfer' ? 'cat-013' : selectedCat;

    try {
      await insertTx({
        id: generateId(),
        account_id: selectedAcc,
        category_id: catToUse,
        type: txType,
        amount: amt,
        description: txType === 'transfer'
          ? `Transfer to ${toAcc || 'account'}${desc ? ' - ' + desc : ''}`
          : desc,
        transaction_date: txDate,
        is_recurring: isRecurring,
        recurring_frequency: isRecurring ? 'monthly' : null
      });

      if (srcAcc) {
        const newBal = txType === 'income' ? srcAcc.balance + amt : srcAcc.balance - amt;
        await updateAcc({ id: selectedAcc, data: { balance: newBal } });
      }

      if (txType === 'transfer' && toAcc) {
        const dstAcc = accounts.find(a => a.id === toAcc);
        if (dstAcc) {
          await updateAcc({ id: toAcc, data: { balance: dstAcc.balance + amt } });
        }
      }

      setSaving(false);
      onSaved?.();
      onClose();
    } catch (err) {
      setSaving(false);
      Platform.OS === 'web'
        ? alert('Failed to save: ' + err.message)
        : Alert.alert('Error', 'Failed to save transaction');
    }
  };

  const typeOptions = [
    { key: 'expense', label: 'Expense', icon: 'arrow-upward', color: DANGER },
    { key: 'income', label: 'Income', icon: 'arrow-downward', color: PRIMARY },
    { key: 'transfer', label: 'Transfer', icon: 'swap-horiz', color: INFO }
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end', marginTop: insetsTop }}>
        <View style={{ backgroundColor: CARD, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: insetsBottom + 16, maxHeight: SCREEN_H * 0.92 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: BORDER }}>
            <Text style={{ color: TEXT, fontSize: 18, fontWeight: 'bold' }}>Add Transaction</Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <MaterialIcons name="close" size={24} color={TEXT2} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
              {/* Type Selector */}
              <View style={{ flexDirection: 'row', backgroundColor: CARD2, borderRadius: 12, padding: 4, marginBottom: 20 }}>
                {typeOptions.map(t => {
                  const active = txType === t.key;
                  return (
                    <TouchableOpacity
                      key={t.key}
                      onPress={() => {
                        setTxType(t.key);
                        const firstCat = CATEGORIES.find(c => c.type === t.key || (t.key === 'transfer' && c.type === 'transfer'));
                        setSelectedCat(firstCat?.id || CATEGORIES[0].id);
                      }}
                      style={{
                        flex: 1, paddingVertical: 10, borderRadius: 10,
                        backgroundColor: active ? t.color : 'transparent',
                        alignItems: 'center', flexDirection: 'row', justifyContent: 'center'
                      }}
                    >
                      <MaterialIcons name={t.icon} size={16} color={active ? '#FFFFFF' : TEXT2} />
                      <Text style={{ color: active ? '#FFFFFF' : TEXT2, fontSize: 13, fontWeight: active ? '700' : '400', marginLeft: 4 }}>{t.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Amount Display */}
              <View style={{ alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ color: TEXT2, fontSize: 13, marginBottom: 4 }}>Amount (PGK)</Text>
                <Text style={{
                  color: txType === 'income' ? PRIMARY : txType === 'expense' ? DANGER : INFO,
                  fontSize: 44, fontWeight: 'bold', letterSpacing: -1
                }}>K {amount}</Text>
              </View>

              <View style={{ marginBottom: 20 }}>
                <NumberPad value={amount} onChange={setAmount} />
              </View>

              {/* Account Selector */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: TEXT2, fontSize: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Account</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
                  {accounts.map(acc => {
                    const active = selectedAcc === acc.id;
                    return (
                      <TouchableOpacity
                        key={acc.id}
                        onPress={() => setSelectedAcc(acc.id)}
                        style={{
                          paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10,
                          backgroundColor: active ? PRIMARY : CARD2, marginRight: 8,
                          flexDirection: 'row', alignItems: 'center'
                        }}
                      >
                        <MaterialIcons
                          name={acc.type === 'bank' ? 'account-balance' : 'account-balance-wallet'}
                          size={16} color={active ? '#FFFFFF' : TEXT2}
                        />
                        <Text style={{ color: active ? '#FFFFFF' : TEXT2, fontSize: 13, marginLeft: 6, fontWeight: active ? '700' : '400' }}>{acc.name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* To Account (transfer only) */}
              {txType === 'transfer' && (
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ color: TEXT2, fontSize: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>To Account</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
                    {accounts.filter(a => a.id !== selectedAcc).map(acc => {
                      const active = toAcc === acc.id;
                      return (
                        <TouchableOpacity
                          key={acc.id}
                          onPress={() => setToAcc(acc.id)}
                          style={{
                            paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10,
                            backgroundColor: active ? INFO : CARD2, marginRight: 8,
                            flexDirection: 'row', alignItems: 'center'
                          }}
                        >
                          <MaterialIcons
                            name={acc.type === 'bank' ? 'account-balance' : 'account-balance-wallet'}
                            size={16} color={active ? '#FFFFFF' : TEXT2}
                          />
                          <Text style={{ color: active ? '#FFFFFF' : TEXT2, fontSize: 13, marginLeft: 6, fontWeight: active ? '700' : '400' }}>{acc.name}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              {/* Category Selector */}
              {txType !== 'transfer' && (
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ color: TEXT2, fontSize: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Category</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {filteredCats.map(cat => {
                      const active = selectedCat === cat.id;
                      return (
                        <TouchableOpacity
                          key={cat.id}
                          onPress={() => setSelectedCat(cat.id)}
                          style={{
                            flexDirection: 'row', alignItems: 'center',
                            paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
                            marginRight: 8, marginBottom: 8,
                            backgroundColor: active ? cat.color + '33' : CARD2,
                            borderWidth: 1, borderColor: active ? cat.color : 'transparent'
                          }}
                        >
                          <MaterialIcons name={cat.icon} size={14} color={active ? cat.color : TEXT2} />
                          <Text style={{ color: active ? cat.color : TEXT2, fontSize: 12, marginLeft: 4, fontWeight: active ? '700' : '400' }}>{cat.name}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Date */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: TEXT2, fontSize: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Date</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: CARD2, borderRadius: 10, padding: 14 }}>
                  <MaterialIcons name="event" size={18} color={TEXT2} />
                  <Text style={{ color: TEXT, marginLeft: 10, fontSize: 15 }}>{fmtDate(txDate)}</Text>
                </View>
              </View>

              {/* Notes */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: TEXT2, fontSize: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Notes (Optional)</Text>
                <TextInput
                  value={desc}
                  onChangeText={setDesc}
                  placeholder="Add a note..."
                  placeholderTextColor={TEXT2}
                  style={{ backgroundColor: CARD2, borderRadius: 10, padding: 14, color: TEXT, fontSize: 15, minHeight: 48 }}
                  multiline
                  numberOfLines={2}
                  textAlignVertical="top"
                />
              </View>

              {/* Recurring */}
              <View style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 24, backgroundColor: CARD2, borderRadius: 10, padding: 14
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialIcons name="repeat" size={18} color={TEXT2} />
                  <Text style={{ color: TEXT, fontSize: 14, marginLeft: 10 }}>Recurring (Monthly)</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsRecurring(!isRecurring)}
                  style={{
                    width: 50, height: 28, borderRadius: 14,
                    backgroundColor: isRecurring ? PRIMARY + '80' : BORDER,
                    justifyContent: 'center',
                    paddingHorizontal: 2
                  }}
                >
                  <View style={{
                    width: 24, height: 24, borderRadius: 12,
                    backgroundColor: isRecurring ? PRIMARY : TEXT2,
                    alignSelf: isRecurring ? 'flex-end' : 'flex-start'
                  }} />
                </TouchableOpacity>
              </View>

              {/* Save Button */}
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                style={{
                  backgroundColor: PRIMARY, borderRadius: 14, paddingVertical: 16,
                  alignItems: 'center', marginBottom: 8, opacity: saving ? 0.7 : 1
                }}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>Save Transaction</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default AddTransactionModal;
