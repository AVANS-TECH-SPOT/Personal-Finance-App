import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert, Platform, Switch, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useLocalQuery, useLocalMutation } from '../hooks/useLocalQuery';
import { exportAll, importAll, clearAll } from '../utils/storage';
import {
  BG, CARD, CARD2, PRIMARY, DANGER, WARNING, INFO, TEXT, TEXT2, BORDER,
  TAB_MENU_HEIGHT, SCROLL_EXTRA_PADDING, WEB_TAB_MENU_PADDING, HEADER_HEIGHT
} from '../utils/constants';
import { fmtCurrency } from '../utils/formatters';
import { CATS_BY_ID } from '../utils/constants';

const SettingsScreen = () => {
  const { theme } = useTheme();
  const app = useApp();
  const insets = useSafeAreaInsets();

  const { data: accounts, refetch: refetchAccs } = useLocalQuery('accounts');
  const { data: allTx } = useLocalQuery('transactions');
  const { mutate: insertAcc } = useLocalMutation('accounts', 'insert');
  const { mutate: deleteAcc } = useLocalMutation('accounts', 'delete');

  const [showPINModal, setShowPINModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportCSV, setExportCSV] = useState('');
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupJson, setBackupJson] = useState('');

  const accs = accounts || [];
  const txList = allTx || [];

  const handleSeedData = async () => {
    const msg = 'Add sample accounts and data to get started?';
    const doSeed = async () => {
      try {
        await insertAcc({ id: 'acc-seed-001', name: 'BSP Bank', type: 'bank', balance: 5420.50, currency: 'PGK', is_primary: true });
        await insertAcc({ id: 'acc-seed-002', name: 'Cash Wallet', type: 'cash', balance: 350.00, currency: 'PGK', is_primary: false });
        refetchAccs();
        Platform.OS === 'web' ? alert('Sample data added!') : Alert.alert('Done', 'Sample data added successfully!');
      } catch (err) {
        Platform.OS === 'web' ? alert(err.message) : Alert.alert('Error', err.message);
      }
    };
    Platform.OS === 'web'
      ? (window.confirm(msg) ? doSeed() : null)
      : Alert.alert('Load Sample Data', msg, [{ text: 'Cancel' }, { text: 'Load', onPress: doSeed }]);
  };

  const handleExportCSV = () => {
    const lines = ['Date,Type,Category,Amount,Account,Description'];
    txList.forEach(t => {
      const cat = t.category_id ? CATS_BY_ID[t.category_id] : null;
      const accName = accs.find(a => a.id === t.account_id)?.name || '';
      lines.push(
        `${t.transaction_date || ''},${t.type || ''},${cat ? cat.name : ''},${t.amount || 0},${accName},"${(t.description || '').replace(/"/g, '""')}"`
      );
    });
    setExportCSV(lines.join('\n'));
    setShowExportModal(true);
  };

  const handleExportBackup = async () => {
    const data = await exportAll();
    setBackupJson(JSON.stringify(data, null, 2));
    setShowBackupModal(true);
  };

  const handleDeleteAccount = (acc) => {
    const msg = `Delete "${acc.name}"? All transactions will be removed.`;
    const doDelete = async () => {
      try {
        await deleteAcc({ id: acc.id });
        refetchAccs();
      } catch (err) {
        Platform.OS === 'web' ? alert(err.message) : Alert.alert('Error', err.message);
      }
    };
    Platform.OS === 'web'
      ? (window.confirm(msg) ? doDelete() : null)
      : Alert.alert('Delete Account', msg, [{ text: 'Cancel' }, { text: 'Delete', onPress: doDelete, style: 'destructive' }]);
  };

  const handleSavePIN = () => {
    if (pinInput.length !== 4) {
      Platform.OS === 'web' ? alert('PIN must be 4 digits') : Alert.alert('Error', 'PIN must be 4 digits');
      return;
    }
    if (pinInput !== pinConfirm) {
      Platform.OS === 'web' ? alert('PINs do not match') : Alert.alert('Error', 'PINs do not match');
      return;
    }
    app.setPinCode(pinInput);
    app.setPinEnabled(true);
    setShowPINModal(false);
    setPinInput('');
    setPinConfirm('');
    Platform.OS === 'web' ? alert('PIN set successfully') : Alert.alert('Success', 'PIN lock enabled!');
  };

  const renderRow = (icon, label, desc, onPress, color, right) => (
    <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: BORDER }}>
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: (color || PRIMARY) + '22', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
        <MaterialIcons name={icon} size={18} color={color || PRIMARY} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: TEXT, fontSize: 14, fontWeight: '500' }}>{label}</Text>
        {desc && <Text style={{ color: TEXT2, fontSize: 12, marginTop: 2 }}>{desc}</Text>}
      </View>
      {right || <MaterialIcons name="chevron-right" size={20} color={TEXT2} />}
    </TouchableOpacity>
  );

  const scrollBottomPadding = Platform.OS === 'web' ? WEB_TAB_MENU_PADDING : (TAB_MENU_HEIGHT + insets.bottom + SCROLL_EXTRA_PADDING);
  const scrollH = Dimensions.get('window').height - HEADER_HEIGHT - insets.top;

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <View style={{ height: HEADER_HEIGHT + insets.top, paddingTop: insets.top, backgroundColor: CARD, justifyContent: 'flex-end', paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: BORDER }}>
        <Text style={{ color: TEXT, fontSize: 20, fontWeight: 'bold' }}>Settings</Text>
      </View>

      <ScrollView
        style={Platform.OS === 'web' ? { height: scrollH, overflow: 'auto' } : { flex: 1 }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: scrollBottomPadding }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20 }}>
          {/* Accounts */}
          <Text style={{ color: TEXT2, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Accounts</Text>
          <View style={{ backgroundColor: CARD, borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
            {accs.length === 0 ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: TEXT2, fontSize: 13 }}>No accounts yet</Text>
              </View>
            ) : (
              accs.map((acc, idx) => {
                const isLast = idx === accs.length - 1;
                return (
                  <View key={acc.id} style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: isLast ? 0 : 1, borderBottomColor: BORDER }}>
                    <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: PRIMARY + '22', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                      <MaterialIcons name={acc.type === 'bank' ? 'account-balance' : 'account-balance-wallet'} size={18} color={PRIMARY} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: TEXT, fontSize: 14, fontWeight: '500' }}>{acc.name}</Text>
                      <Text style={{ color: TEXT2, fontSize: 12 }}>{fmtCurrency(acc.balance, acc.currency)}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteAccount(acc)} style={{ padding: 8 }}>
                      <MaterialIcons name="delete-outline" size={18} color={DANGER + '80'} />
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </View>

          {/* Security */}
          <Text style={{ color: TEXT2, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Security</Text>
          <View style={{ backgroundColor: CARD, borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
            {renderRow('visibility-off', 'Hide Balance', app.hideBalance ? 'On — balances are masked' : 'Tap to hide balances in public', () => app.setHideBalance(!app.hideBalance), PRIMARY,
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: app.hideBalance ? PRIMARY : TEXT2, fontSize: 12, marginRight: 8 }}>{app.hideBalance ? 'On' : 'Off'}</Text>
                <Switch value={app.hideBalance} onValueChange={val => app.setHideBalance(val)} trackColor={{ false: TEXT2 + '40', true: PRIMARY + '40' }} thumbColor={app.hideBalance ? PRIMARY : TEXT2} />
              </View>
            )}
            {renderRow('lock', 'PIN Lock', app.pinEnabled ? 'Enabled — tap to change' : 'Protect your data with a PIN', () => setShowPINModal(true), PRIMARY,
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: app.pinEnabled ? PRIMARY : TEXT2, fontSize: 12, marginRight: 4 }}>{app.pinEnabled ? 'On' : 'Off'}</Text>
                {app.pinEnabled ? (
                  <TouchableOpacity onPress={() => { app.setPinEnabled(false); app.setPinCode(''); }} style={{ marginLeft: 8, padding: 4, backgroundColor: DANGER + '22', borderRadius: 6 }}>
                    <Text style={{ color: DANGER, fontSize: 11 }}>Disable</Text>
                  </TouchableOpacity>
                ) : (
                  <MaterialIcons name="chevron-right" size={20} color={TEXT2} />
                )}
              </View>
            )}
          </View>

          {/* Data */}
          <Text style={{ color: TEXT2, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Data</Text>
          <View style={{ backgroundColor: CARD, borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
            {renderRow('file-download', 'Export to CSV', `${txList.length} transactions · tap to export`, handleExportCSV, INFO)}
            {renderRow('backup', 'Backup Data', 'Export all data as JSON', handleExportBackup, PRIMARY)}
            {renderRow('data-usage', 'Load Sample Data', 'Add demo accounts to get started', handleSeedData, PRIMARY)}
          </View>

          {/* About */}
          <View style={{ backgroundColor: CARD, borderRadius: 16, padding: 16, marginBottom: 16, alignItems: 'center' }}>
            <Text style={{ color: TEXT, fontSize: 16, fontWeight: 'bold' }}>FinanceFlow</Text>
            <Text style={{ color: TEXT2, fontSize: 12, marginTop: 4 }}>v1.0 · Offline Finance Tracker · PGK</Text>
            <Text style={{ color: TEXT2, fontSize: 11, marginTop: 4 }}>100% Offline · No Cloud · Your Data, Your Device</Text>
          </View>
        </View>
      </ScrollView>

      {/* PIN Modal */}
      <Modal visible={showPINModal} animationType="slide" transparent onRequestClose={() => setShowPINModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end', marginTop: insets.top }}>
          <View style={{ backgroundColor: CARD, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: insets.bottom + 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <Text style={{ color: TEXT, fontSize: 18, fontWeight: 'bold' }}>Set PIN</Text>
              <TouchableOpacity onPress={() => setShowPINModal(false)}>
                <MaterialIcons name="close" size={24} color={TEXT2} />
              </TouchableOpacity>
            </View>
            <Text style={{ color: TEXT2, fontSize: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>New PIN (4 digits)</Text>
            <TextInput
              value={pinInput}
              onChangeText={t => setPinInput(t.replace(/[^0-9]/g, '').slice(0, 4))}
              placeholder="····"
              placeholderTextColor={TEXT2}
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
              style={{ backgroundColor: CARD2, borderRadius: 10, padding: 14, color: TEXT, fontSize: 22, letterSpacing: 8, marginBottom: 16, textAlign: 'center' }}
            />
            <Text style={{ color: TEXT2, fontSize: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Confirm PIN</Text>
            <TextInput
              value={pinConfirm}
              onChangeText={t => setPinConfirm(t.replace(/[^0-9]/g, '').slice(0, 4))}
              placeholder="····"
              placeholderTextColor={TEXT2}
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
              style={{ backgroundColor: CARD2, borderRadius: 10, padding: 14, color: TEXT, fontSize: 22, letterSpacing: 8, marginBottom: 24, textAlign: 'center' }}
            />
            <TouchableOpacity onPress={handleSavePIN} style={{ backgroundColor: PRIMARY, borderRadius: 14, paddingVertical: 16, alignItems: 'center' }}>
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>Enable PIN Lock</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Export CSV Modal */}
      <Modal visible={showExportModal} animationType="slide" transparent onRequestClose={() => setShowExportModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end', marginTop: insets.top }}>
          <View style={{ backgroundColor: CARD, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%', paddingBottom: insets.bottom + 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: BORDER }}>
              <Text style={{ color: TEXT, fontSize: 18, fontWeight: 'bold' }}>Export CSV</Text>
              <TouchableOpacity onPress={() => setShowExportModal(false)}>
                <MaterialIcons name="close" size={24} color={TEXT2} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ flex: 1, padding: 20 }}>
              <Text style={{ color: TEXT2, fontSize: 11, marginBottom: 12 }}>Your transaction data as CSV. Copy and save to a spreadsheet app.</Text>
              <TextInput
                value={exportCSV}
                multiline
                editable={false}
                style={{ backgroundColor: CARD2, borderRadius: 10, padding: 12, color: TEXT2, fontSize: 11, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', minHeight: 200 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Backup Modal */}
      <Modal visible={showBackupModal} animationType="slide" transparent onRequestClose={() => setShowBackupModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end', marginTop: insets.top }}>
          <View style={{ backgroundColor: CARD, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%', paddingBottom: insets.bottom + 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: BORDER }}>
              <Text style={{ color: TEXT, fontSize: 18, fontWeight: 'bold' }}>Backup Data</Text>
              <TouchableOpacity onPress={() => setShowBackupModal(false)}>
                <MaterialIcons name="close" size={24} color={TEXT2} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ flex: 1, padding: 20 }}>
              <Text style={{ color: TEXT2, fontSize: 11, marginBottom: 12 }}>Copy this JSON and save it securely. You can restore your data later.</Text>
              <TextInput
                value={backupJson}
                multiline
                editable={false}
                style={{ backgroundColor: CARD2, borderRadius: 10, padding: 12, color: TEXT2, fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', minHeight: 200 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SettingsScreen;
