import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert, Platform, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLocalMutation } from '../hooks/useLocalQuery';
import { CATEGORIES, CARD, CARD2, PRIMARY, TEXT, TEXT2, BORDER, WARNING, CURRENT_MONTH } from '../utils/constants';
import { generateId } from '../utils/formatters';

const SetBudgetModal = ({ visible, onClose, onSaved, existingBudget, insetsTop = 0, insetsBottom = 0 }) => {
  const { theme } = useTheme();
  const [selCat, setSelCat] = useState(CATEGORIES.filter(c => c.type === 'expense')[0]?.id || '');
  const [monthlyLimit, setMonthlyLimit] = useState('500');
  const [alertPct, setAlertPct] = useState('80');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const { mutate: insertBudget } = useLocalMutation('budgets', 'insert');
  const { mutate: updateBudget } = useLocalMutation('budgets', 'update');

  useEffect(() => {
    if (visible) {
      if (existingBudget) {
        setSelCat(existingBudget.category_id);
        setMonthlyLimit(String(existingBudget.monthly_limit));
        setAlertPct(String(Math.round((existingBudget.alert_threshold || 0.8) * 100)));
        setNotes(existingBudget.notes || '');
      } else {
        setSelCat(CATEGORIES.filter(c => c.type === 'expense')[0]?.id || '');
        setMonthlyLimit('500');
        setAlertPct('80');
        setNotes('');
      }
      setSaving(false);
    }
  }, [visible, existingBudget]);

  const handleSave = async () => {
    const limit = parseFloat(monthlyLimit);
    if (!limit || limit <= 0) {
      Platform.OS === 'web' ? alert('Please enter a valid budget amount') : Alert.alert('Error', 'Please enter a valid budget amount');
      return;
    }
    const threshold = (parseFloat(alertPct) || 80) / 100;
    setSaving(true);

    try {
      if (existingBudget?.id) {
        await updateBudget({ id: existingBudget.id, data: { monthly_limit: limit, alert_threshold: threshold, notes } });
      } else {
        await insertBudget({
          id: generateId(),
          category_id: selCat,
          monthly_limit: limit,
          alert_threshold: threshold,
          month: CURRENT_MONTH,
          notes
        });
      }
      setSaving(false);
      onSaved?.();
      onClose();
    } catch (err) {
      setSaving(false);
      Platform.OS === 'web' ? alert(err.message) : Alert.alert('Error', err.message);
    }
  };

  const expenseCats = CATEGORIES.filter(c => c.type === 'expense');

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end', marginTop: insetsTop }}>
        <View style={{ backgroundColor: CARD, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: insetsBottom + 16, maxHeight: '85%' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: BORDER }}>
            <Text style={{ color: TEXT, fontSize: 18, fontWeight: 'bold' }}>{existingBudget ? 'Edit Budget' : 'Set Budget'}</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={TEXT2} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
            {!existingBudget && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: TEXT2, fontSize: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Category</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {expenseCats.map(cat => {
                    const active = selCat === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => setSelCat(cat.id)}
                        style={{
                          flexDirection: 'row', alignItems: 'center',
                          paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
                          marginRight: 8, marginBottom: 8,
                          backgroundColor: active ? cat.color + '33' : CARD2,
                          borderWidth: 1, borderColor: active ? cat.color : 'transparent'
                        }}
                      >
                        <MaterialIcons name={cat.icon} size={14} color={active ? cat.color : TEXT2} />
                        <Text style={{ color: active ? cat.color : TEXT2, fontSize: 12, marginLeft: 4 }}>{cat.name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            <Text style={{ color: TEXT2, fontSize: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Monthly Limit (PGK)</Text>
            <TextInput
              value={monthlyLimit}
              onChangeText={t => setMonthlyLimit(t.replace(/[^0-9.]/g, ''))}
              placeholder="0.00"
              placeholderTextColor={TEXT2}
              keyboardType="decimal-pad"
              style={{ backgroundColor: CARD2, borderRadius: 10, padding: 14, color: TEXT, fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}
            />

            <Text style={{ color: TEXT2, fontSize: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Alert at (%)</Text>
            <View style={{ flexDirection: 'row', marginBottom: 16 }}>
              {['60','70','80','90'].map(pct => {
                const active = alertPct === pct;
                return (
                  <TouchableOpacity
                    key={pct}
                    onPress={() => setAlertPct(pct)}
                    style={{
                      flex: 1, paddingVertical: 10, borderRadius: 8,
                      backgroundColor: active ? WARNING + '33' : CARD2,
                      borderWidth: 1, borderColor: active ? WARNING : 'transparent',
                      alignItems: 'center', marginRight: pct !== '90' ? 8 : 0
                    }}
                  >
                    <Text style={{ color: active ? WARNING : TEXT2, fontWeight: active ? 'bold' : 'normal', fontSize: 14 }}>{pct}%</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={{ color: TEXT2, fontSize: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Notes</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Optional notes..."
              placeholderTextColor={TEXT2}
              style={{ backgroundColor: CARD2, borderRadius: 10, padding: 14, color: TEXT, marginBottom: 24 }}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />

            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              style={{ backgroundColor: PRIMARY, borderRadius: 14, paddingVertical: 16, alignItems: 'center', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>Save Budget</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default SetBudgetModal;
