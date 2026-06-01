import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { PRIMARY, TEXT, TEXT2, BORDER, CARD, CARD2 } from '../utils/constants';

const PINScreen = ({ onUnlock }) => {
  const { theme } = useTheme();
  const app = useApp();
  const [entered, setEntered] = useState('');
  const [error, setError] = useState('');

  // Mock biometrics - in real app, use expo-local-authentication
  const isBioAvail = false;

  useEffect(() => {
    if (entered.length === 4) {
      if (entered === app.pinCode) {
        onUnlock();
      } else {
        setTimeout(() => {
          setEntered('');
          setError('Incorrect PIN. Try again.');
        }, 300);
      }
    }
  }, [entered, app.pinCode, onUnlock]);

  const handlePad = (digit) => {
    if (entered.length >= 4) return;
    setEntered(prev => prev + digit);
    setError('');
  };

  const handleDelete = () => {
    setEntered(prev => prev.slice(0, -1));
    setError('');
  };

  const padKeys = [
    ['1','2','3'],
    ['4','5','6'],
    ['7','8','9'],
    ['bio','0','del']
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary }]}>
        <MaterialIcons name="lock" size={32} color="#FFFFFF" />
      </View>
      <Text style={[styles.title, { color: theme.colors.text }]}>FinanceFlow</Text>
      <Text style={[styles.subtitle, { color: theme.colors.text2 }]}>Enter your PIN to continue</Text>

      <View style={styles.dotsContainer}>
        {[0,1,2,3].map(i => (
          <View key={i} style={[
            styles.dot,
            { backgroundColor: i < entered.length ? theme.colors.primary : theme.colors.border }
          ]} />
        ))}
      </View>

      {error ? <Text style={[styles.error, { color: theme.colors.danger }]}>{error}</Text> : null}

      {padKeys.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map(key => {
            if (key === 'bio') {
              return (
                <TouchableOpacity
                  key={key}
                  onPress={isBioAvail ? () => {} : null}
                  style={[styles.key, { backgroundColor: isBioAvail ? theme.colors.card2 : 'transparent' }]}
                >
                  {isBioAvail && <MaterialIcons name="fingerprint" size={28} color={theme.colors.primary} />}
                </TouchableOpacity>
              );
            }
            if (key === 'del') {
              return (
                <TouchableOpacity
                  key={key}
                  onPress={handleDelete}
                  style={[styles.key, { backgroundColor: theme.colors.card2 }]}
                >
                  <MaterialIcons name="backspace" size={22} color={theme.colors.text2} />
                </TouchableOpacity>
              );
            }
            return (
              <TouchableOpacity
                key={key}
                onPress={() => handlePad(key)}
                style={[styles.key, { backgroundColor: theme.colors.card }]}
              >
                <Text style={[styles.keyText, { color: theme.colors.text }]}>{key}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 40
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 16
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginHorizontal: 8
  },
  error: {
    fontSize: 13,
    marginBottom: 16
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12
  },
  key: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10
  },
  keyText: {
    fontSize: 22,
    fontWeight: '600'
  }
});

export default PINScreen;
