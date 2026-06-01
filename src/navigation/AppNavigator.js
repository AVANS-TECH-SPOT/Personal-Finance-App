import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { CARD, PRIMARY, TEXT2, BORDER, TAB_MENU_HEIGHT } from '../utils/constants';

// Screens
import HomeScreen from '../screens/HomeScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import BudgetScreen from '../screens/BudgetScreen';
import EnvelopesScreen from '../screens/EnvelopesScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: 0,
            height: Platform.OS === 'web' ? TAB_MENU_HEIGHT : TAB_MENU_HEIGHT + insets.bottom,
            paddingBottom: 0,
            borderTopWidth: 1,
            borderTopColor: BORDER,
            backgroundColor: CARD
          },
          tabBarItemStyle: { padding: 0 },
          tabBarActiveTintColor: PRIMARY,
          tabBarInactiveTintColor: TEXT2
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ color }) => <MaterialIcons name="home" size={24} color={color} />
          }}
        />
        <Tab.Screen
          name="Transactions"
          component={TransactionsScreen}
          options={{
            tabBarLabel: 'Transactions',
            tabBarIcon: ({ color }) => <MaterialIcons name="receipt-long" size={24} color={color} />
          }}
        />
        <Tab.Screen
          name="Budget"
          component={BudgetScreen}
          options={{
            tabBarLabel: 'Budget',
            tabBarIcon: ({ color }) => <MaterialIcons name="pie-chart" size={24} color={color} />
          }}
        />
        <Tab.Screen
          name="Envelopes"
          component={EnvelopesScreen}
          options={{
            tabBarLabel: 'Envelopes',
            tabBarIcon: ({ color }) => <MaterialIcons name="card-giftcard" size={24} color={color} />
          }}
        />
        <Tab.Screen
          name="Analytics"
          component={AnalyticsScreen}
          options={{
            tabBarLabel: 'Analytics',
            tabBarIcon: ({ color }) => <MaterialIcons name="bar-chart" size={24} color={color} />
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarLabel: 'Settings',
            tabBarIcon: ({ color }) => <MaterialIcons name="settings" size={24} color={color} />
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
