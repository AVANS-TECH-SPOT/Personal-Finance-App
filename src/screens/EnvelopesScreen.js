import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useEnvelopes } from '../context/EnvelopeContext';
import { useLocalQuery } from '../hooks/useLocalQuery';
import EditEnvelopeModal from '../components/EditEnvelopeModal';
import {
  BG, CARD, CARD2, PRIMARY, DANGER, WARNING, TEXT, TEXT2, BORDER,
  TAB_MENU_HEIGHT, SCROLL_EXTRA_PADDING, WEB_TAB_MENU_PADDING, HEADER_HEIGHT, CURRENT_MONTH
} from '../utils/constants';
import { CATS_BY_ID } from '../utils/constants';

const EnvelopesScreen = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const envelopes = useEnvelopes();

  const { data: allTx } = useLocalQuery('transactions');
  const txList = allTx || [];

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const monthTx = useMemo(() => {
    return txList.filter(t => t.transaction_date?.indexOf(CURRENT_MONTH) === 0 && t.type === 'expense');
  }, [txList]);

  const spentByEnvelope = useMemo(() => {
    const map = {};
    monthTx.forEach(t => {
      if (t.category_id) {
        const env = envelopes.envelopes.find(e => e.categoryId === t.category_id);
        if (env) {
          map[env.id] = (map[env.id] || 0) + t.amount;
        }
      }
    });
    return map;
  }, [monthTx, envelopes.envelopes]);

  const totalAllocated = useMemo(() => envelopes.envelopes.reduce((sum, e) => sum + e.allocated, 0), [envelopes.envelopes]);
  const totalSpent = useMemo(() => Object.values(spentByEnvelope).reduce((sum, v) => sum + v, 0), [spentByEnvelope]);

  const handleDeleteEnvelope = (env) => {
    const msg = `Delete "${env.name}" envelope?`;
    const doDelete = () => envelopes.deleteEnvelope(env.id);
    Platform.OS === 'web'
      ? (window.confirm(msg) ? doDelete() : null)
      : Alert.alert('Delete Envelope', msg, [{ text: 'Cancel' }, { text: 'Delete', onPress: doDelete, style: 'destructive' }]);
  };

  const scrollBottomPadding = Platform.OS === 'web' ? WEB_TAB_MENU_PADDING : (TAB_MENU_HEIGHT + insets.bottom + SCROLL_EXTRA_PADDING);
  const scrollH = Dimensions.get('window').height - HEADER_HEIGHT - insets.top;

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <View style={{ height: HEADER_HEIGHT + insets.top, paddingTop: insets.top, backgroundColor: CARD, justifyContent: 'flex-end', paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: BORDER, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <Text style={{ color: TEXT, fontSize: 20, fontWeight: 'bold' }}>Envelopes</Text>
        <TouchableOpacity onPress={() => { setEditing(null); setShowModal(true); }} style={{ padding: 8, backgroundColor: PRIMARY + '22', borderRadius: 10 }}>
          <MaterialIcons name="add" size={22} color={PRIMARY} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={Platform.OS === 'web' ? { height: scrollH, overflow: 'auto' } : { flex: 1 }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: scrollBottomPadding }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20 }}>
          {envelopes.envelopes.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <MaterialIcons name="card-giftcard" size={48} color={BORDER} />
              <Text style={{ color: TEXT2, fontSize: 16, marginTop: 16, fontWeight: '600' }}>No Envelopes Yet</Text>
              <Text style={{ color: TEXT2, fontSize: 13, marginTop: 8, textAlign: 'center', lineHeight: 20 }}>Create digital envelopes to allocate cash and track spending by category</Text>
              <TouchableOpacity onPress={() => { setEditing(null); setShowModal(true); }} style={{ backgroundColor: PRIMARY, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, marginTop: 20 }}>
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>+ Create Envelope</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Summary Card */}
              <View style={{ backgroundColor: CARD, borderRadius: 16, padding: 16, marginBottom: 16 }}>
                <Text style={{ color: TEXT2, fontSize: 12, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Monthly Summary</Text>
                <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                  <View style={{ flex: 1, alignItems: 'center', paddingVertical: 12, backgroundColor: PRIMARY + '15', borderRadius: 12, marginRight: 8 }}>
                    <Text style={{ color: TEXT2, fontSize: 11, marginBottom: 4 }}>ALLOCATED</Text>
                    <Text style={{ color: PRIMARY, fontSize: 18, fontWeight: 'bold' }}>K {totalAllocated.toFixed(0)}</Text>
                  </View>
                  <View style={{ flex: 1, alignItems: 'center', paddingVertical: 12, backgroundColor: DANGER + '15', borderRadius: 12 }}>
                    <Text style={{ color: TEXT2, fontSize: 11, marginBottom: 4 }}>SPENT</Text>
                    <Text style={{ color: DANGER, fontSize: 18, fontWeight: 'bold' }}>K {totalSpent.toFixed(0)}</Text>
                  </View>
                </View>
                <View style={{ height: 6, backgroundColor: CARD2, borderRadius: 3, overflow: 'hidden' }}>
                  <View style={{ height: 6, width: totalAllocated > 0 ? `${Math.min((totalSpent / totalAllocated) * 100, 100)}%` : 0, backgroundColor: totalSpent > totalAllocated ? DANGER : PRIMARY, borderRadius: 3 }} />
                </View>
                <Text style={{ color: TEXT2, fontSize: 11, marginTop: 8, textAlign: 'center' }}>K {Math.max(0, totalAllocated - totalSpent).toFixed(0)} remaining</Text>
              </View>

              {/* Envelope Cards */}
              {envelopes.envelopes.map(env => {
                const cat = CATS_BY_ID[env.categoryId];
                if (!cat) return null;
                const spent = spentByEnvelope[env.id] || 0;
                const remaining = env.allocated - spent;
                const pct = env.allocated > 0 ? Math.min(spent / env.allocated, 1) : 0;
                const isOver = spent > env.allocated;
                const barColor = isOver ? DANGER : pct >= 0.8 ? WARNING : PRIMARY;

                return (
                  <View key={env.id} style={{ backgroundColor: CARD, borderRadius: 16, padding: 16, marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: cat.color + '22', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                        <MaterialIcons name={cat.icon} size={20} color={cat.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: TEXT, fontSize: 15, fontWeight: '600' }}>{env.name}</Text>
                        <Text style={{ color: TEXT2, fontSize: 12, marginTop: 2 }}>{cat.name}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ color: remaining >= 0 ? PRIMARY : DANGER, fontSize: 16, fontWeight: 'bold' }}>K {Math.abs(remaining).toFixed(0)}</Text>
                        <Text style={{ color: TEXT2, fontSize: 11, marginTop: 2 }}>{remaining >= 0 ? 'left' : 'over'}</Text>
                      </View>
                    </View>

                    <View style={{ marginBottom: 12 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                        <Text style={{ color: TEXT2, fontSize: 11 }}>Spent</Text>
                        <Text style={{ color: TEXT, fontSize: 11, fontWeight: '600' }}>K {spent.toFixed(0)} / K {env.allocated.toFixed(0)}</Text>
                      </View>
                      <View style={{ height: 8, backgroundColor: CARD2, borderRadius: 4, overflow: 'hidden' }}>
                        <View style={{ height: 8, width: `${pct * 100}%`, backgroundColor: barColor, borderRadius: 4 }} />
                      </View>
                    </View>

                    {isOver && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, backgroundColor: DANGER + '15', borderRadius: 8, marginBottom: 12 }}>
                        <MaterialIcons name="warning" size={14} color={DANGER} />
                        <Text style={{ color: DANGER, fontSize: 11, marginLeft: 6 }}>Over budget by K {Math.abs(remaining).toFixed(0)}</Text>
                      </View>
                    )}
                    {!isOver && pct >= 0.8 && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, backgroundColor: WARNING + '15', borderRadius: 8, marginBottom: 12 }}>
                        <MaterialIcons name="notifications" size={14} color={WARNING} />
                        <Text style={{ color: WARNING, fontSize: 11, marginLeft: 6 }}>{Math.round(pct * 100)}% of budget used</Text>
                      </View>
                    )}

                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                      <TouchableOpacity onPress={() => { setEditing(env); setShowModal(true); }} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: CARD2, marginRight: 8 }}>
                        <MaterialIcons name="edit" size={14} color={TEXT2} />
                        <Text style={{ color: TEXT2, fontSize: 12, marginLeft: 4 }}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteEnvelope(env)} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: DANGER + '15' }}>
                        <MaterialIcons name="delete-outline" size={14} color={DANGER} />
                        <Text style={{ color: DANGER, fontSize: 12, marginLeft: 4 }}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}

              <TouchableOpacity onPress={() => { setEditing(null); setShowModal(true); }} style={{ backgroundColor: PRIMARY + '22', borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: PRIMARY + '44', flexDirection: 'row', justifyContent: 'center', marginTop: 4 }}>
                <MaterialIcons name="add" size={20} color={PRIMARY} />
                <Text style={{ color: PRIMARY, fontSize: 15, fontWeight: '600', marginLeft: 8 }}>Add Envelope</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      <EditEnvelopeModal
        visible={showModal}
        onClose={() => { setShowModal(false); setEditing(null); }}
        existingEnvelope={editing}
        insetsTop={insets.top}
        insetsBottom={insets.bottom}
      />
    </View>
  );
};

export default EnvelopesScreen;
