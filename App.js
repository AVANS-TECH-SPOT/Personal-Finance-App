import React from 'react';
import { View, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/context/ThemeContext';
import { AppProvider } from './src/context/AppContext';
import { EnvelopeProvider } from './src/context/EnvelopeContext';
import { IOUProvider } from './src/context/IOUContext';
import AppNavigator from './src/navigation/AppNavigator';
import { BG } from './src/utils/constants';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppProvider>
          <EnvelopeProvider>
            <IOUProvider>
              <View style={{ flex: 1, backgroundColor: BG }}>
                <StatusBar barStyle="light-content" backgroundColor={BG} />
                <AppNavigator />
              </View>
            </IOUProvider>
          </EnvelopeProvider>
        </AppProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
