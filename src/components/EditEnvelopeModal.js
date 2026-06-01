import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Alert, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useEnvelopes } from '../context/EnvelopeContext';
import { CATEGORIES, CARD, CARD2, PRIMARY, TEXT, TEXT2, BORDER } from '../utils/constants';

const EditEnvelopeModal = ({ visible, onClose, existingEnvelope, insetsTop = 0, insetsBottom = 0 }) => {
  const { theme } = useTheme();
  const envelopes = useEnvelopes();

  const [envName, setEnvName] = useState('');
  const [envAmount, setEnvAmount] = useState('0');
  const [selectedCat, setSelectedCat] = useState(CATEGORIES.filter(c => c.type === 'expense')[0]?.id || '');

  useEffect(() => {
    if (visible) {
      if (existingEnvelope) {
        setEnvName(existingEnvelope.name);
        setEnvAmount(String(existingEnvelope.allocated));
        setSelectedCat(existingEnvelope.categoryId);
      } else {
        setEnvName('');
        setEnvAmount('0');
        setSelectedCat(CATEGORIES.filter(c => c.type === 'expense')[0]?.id || '');
      }
    }
  }, [visible, existingEnvelope]);

  const handleSave = () => {
    if (!envName.trim()) {
      Platform.OS === 'web' ? alert('Please enter envelope name') : Alert.alert('Error', 'Please enter envelope name');
      return;
    }
    const amt = parseFloat(envAmount);
    if (!amt || amt <= 0) {
      Platform.OS === 'web' ? alert('Please enter valid amount') : Alert.alert('Error', 'Please enter valid amount');
      return;
    }
    if (existingEnvelope) {
      envelopes.updateEnvelope(existingEnvelope.id, { name: envName.trim(), allocated: amt, categoryId: selectedCat });
    } else {
      envelopes.addEnvelope(envName.trim(), amt, selectedCat);
    }
    onClose();
  };

  const expenseCats = CATEGORIES.filter(c => c.type === 'expense');

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end', marginTop: insetsTop }}>
        <View style={{ backgroundColor: CARD, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: insetsBottom + 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: BORDER }}>
            <Text style={{ color: TEXT, fontSize: 18, fontWeight: 'bold' }}>{existingEnvelope ? 'Edit Envelope' : 'Create Envelope'}</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={TEXT2} />
            </TouchableOpacity>
          </View>

          <View style={{ padding: 20 }}>
            <Text style={{ color: TEXT2, fontSize: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Envelope Name</Text>
            <TextInput
              value={envName}
              onChangeText={setEnvName}
              placeholder="e.g. Food, Transport..."
              placeholderTextColor={TEXT2}
              style={{ backgroundColor: CARD2, borderRadius: 10, padding: 14, color: TEXT, fontSize: 15, marginBottom: 16 }}
            />

            <Text style={{ color: TEXT2, fontSize: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Allocated Amount (PGK)</Text>
            <TextInput
              value={envAmount}
              onChangeText={t => setEnvAmount(t.replace(/[^0-9.]/g, ''))}
              placeholder="0.00"
              placeholderTextColor={TEXT2}
              keyboardType="decimal-pad"
              style={{ backgroundColor: CARD2, borderRadius: 10, padding: 14, color: TEXT, fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}
            />

            {!existingEnvelope && (
              <View style={{ marginBottom: 24 }}>
                <Text style={{ color: TEXT2, fontSize: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Category</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {expenseCats.map(cat => {
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
                        <Text style={{ color: active ? cat.color : TEXT2, fontSize: 12, marginLeft: 4 }}>{cat.name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            <TouchableOpacity onPress={handleSave} style={{ backgroundColor: PRIMARY, borderRadius: 14, paddingVertical: 16, alignItems: 'center' }}>
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>{existingEnvelope ? 'Update Envelope' : 'Create Envelope'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EditEnvelopeModal;
