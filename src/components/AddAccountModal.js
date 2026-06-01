import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Alert, Platform, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLocalMutation } from '../hooks/useLocalQuery';
import { CARD, CARD2, PRIMARY, TEXT, TEXT2, BORDER } from '../utils/constants';
import { generateId } from '../utils/formatters';

const AddAccountModal = ({ visible, onClose, onSaved, insetsTop = 0, insetsBottom = 0 }) => {
  const { theme } = useTheme();
  const [accName, setAccName] = useState('');
  const [accType, setAccType] = useState('bank');
  const [initBal, setInitBal] = useState('0');
  const [saving, setSaving] = useState(false);

  const { mutate: insertAcc } = useLocalMutation('accounts', 'insert');

  useEffect(() => {
    if (visible) {
      setAccName('');
      setAccType('bank');
      setInitBal('0');
      setSaving(false);
    }
  }, [visible]);

  const handleSave = async () => {
    if (!accName.trim()) {
      Platform.OS === 'web' ? alert('Please enter an account name') : Alert.alert('Error', 'Please enter an account name');
      return;
    }
    setSaving(true);
    try {
      await insertAcc({
        id: generateId(),
        name: accName.trim(),
        type: accType,
        balance: parseFloat(initBal) || 0,
        currency: 'PGK',
        is_primary: false
      });
      setSaving(false);
      onSaved?.();
      onClose();
    } catch (err) {
      setSaving(false);
      Platform.OS === 'web' ? alert(err.message) : Alert.alert('Error', err.message);
    }
  };

  const typeOptions = [
    { key: 'bank', label: 'Bank Account', icon: 'account-balance' },
    { key: 'cash', label: 'Cash Wallet', icon: 'account-balance-wallet' }
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end', marginTop: insetsTop }}>
        <View style={{ backgroundColor: CARD, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: insetsBottom + 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <Text style={{ color: TEXT, fontSize: 18, fontWeight: 'bold' }}>New Account</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={TEXT2} />
            </TouchableOpacity>
          </View>

          <Text style={{ color: TEXT2, fontSize: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Account Name</Text>
          <TextInput
            value={accName}
            onChangeText={setAccName}
            placeholder="e.g. BSP Bank, Savings..."
            placeholderTextColor={TEXT2}
            style={{ backgroundColor: CARD2, borderRadius: 10, padding: 14, color: TEXT, fontSize: 15, marginBottom: 16 }}
            autoCapitalize="words"
          />

          <Text style={{ color: TEXT2, fontSize: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Account Type</Text>
          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            {typeOptions.map(t => {
              const active = accType === t.key;
              return (
                <TouchableOpacity
                  key={t.key}
                  onPress={() => setAccType(t.key)}
                  style={{
                    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                    paddingVertical: 12, borderRadius: 10,
                    backgroundColor: active ? PRIMARY : CARD2,
                    marginRight: t.key === 'bank' ? 8 : 0
                  }}
                >
                  <MaterialIcons name={t.icon} size={18} color={active ? '#FFFFFF' : TEXT2} />
                  <Text style={{ color: active ? '#FFFFFF' : TEXT2, fontSize: 13, marginLeft: 6, fontWeight: active ? '700' : '400' }}>{t.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={{ color: TEXT2, fontSize: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Opening Balance (PGK)</Text>
          <TextInput
            value={initBal}
            onChangeText={t => setInitBal(t.replace(/[^0-9.]/g, ''))}
            placeholder="0.00"
            placeholderTextColor={TEXT2}
            keyboardType="decimal-pad"
            style={{ backgroundColor: CARD2, borderRadius: 10, padding: 14, color: TEXT, fontSize: 15, marginBottom: 24 }}
          />

          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={{ backgroundColor: PRIMARY, borderRadius: 14, paddingVertical: 16, alignItems: 'center', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>Add Account</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AddAccountModal;
