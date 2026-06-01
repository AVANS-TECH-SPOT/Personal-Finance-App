import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const NumberPad = ({ value = '0', onChange }) => {
  const { theme } = useTheme();

  const handleKey = (key) => {
    if (key === 'del') {
      const next = value.length > 1 ? value.slice(0, -1) : '0';
      onChange(next);
      return;
    }
    if (key === '.') {
      if (value.indexOf('.') !== -1) return;
      onChange(value + '.');
      return;
    }
    if (value === '0') {
      onChange(key);
    } else {
      if (value.indexOf('.') !== -1) {
        const dec = value.split('.')[1];
        if (dec && dec.length >= 2) return;
      }
      if (value.length >= 10) return;
      onChange(value + key);
    }
  };

  const rows = [['1','2','3'],['4','5','6'],['7','8','9'],['.','0','del']];

  return (
    <View style={styles.container}>
      {rows.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map(k => {
            const isSpecial = k === 'del' || k === '.';
            return (
              <TouchableOpacity
                key={k}
                onPress={() => handleKey(k)}
                style={[styles.key, {
                  backgroundColor: isSpecial ? theme.colors.card2 : theme.colors.card
                }]}
              >
                {k === 'del' ? (
                  <MaterialIcons name="backspace" size={20} color={theme.colors.text2} />
                ) : (
                  <Text style={[styles.keyText, { color: theme.colors.text }]}>{k}</Text>
                )}
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
    paddingHorizontal: 8
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8
  },
  key: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4
  },
  keyText: {
    fontSize: 20,
    fontWeight: '600'
  }
});

export default NumberPad;
