// Main App component with Navigation

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from './src/theme/theme';
import { useAuthStore } from './src/store';
import { RootStackParamList } from './src/models/types';

// Auth Screens
import { RoleSelectionScreen, LoginScreen, SignupScreen } from './src/screens/auth';

// Customer Screens
import {
  CustomerHomeScreen,
  ServiceDetailsScreen,
  ProductDetailsScreen,
  CartScreen,
  BookingsScreen,
  WalletScreen,
  ProfileScreen,
} from './src/screens/customer';

// Agent Screens
import { AgentDashboardScreen, EarningsScreen } from './src/screens/agent';

// Dealer Screens
import { DealerDashboardScreen, CommissionScreen } from './src/screens/dealer';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Customer Tab Navigator
const CustomerTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap = 'home';

        if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
        else if (route.name === 'Bookings') iconName = focused ? 'calendar' : 'calendar-outline';
        else if (route.name === 'Wallet') iconName = focused ? 'wallet' : 'wallet-outline';
        else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textLight,
      headerShown: false,
    })}
  >
    <Tab.Screen name="Home" component={CustomerHomeScreen} />
    <Tab.Screen name="Bookings" component={BookingsScreen} />
    <Tab.Screen name="Wallet" component={WalletScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export default function App() {
  const { isAuthenticated, user, checkAuth } = useAuthStore();

  React.useEffect(() => {
    checkAuth();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isAuthenticated ? (
            // Auth Stack
            <>
              <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Signup" component={SignupScreen} />
            </>
          ) : (
            // App Stack based on Role
            <>
              {user?.role === 'customer' && (
                <>
                  <Stack.Screen name="CustomerTabs" component={CustomerTabs} />
                  <Stack.Screen name="ServiceDetails" component={ServiceDetailsScreen} />
                  <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
                  <Stack.Screen name="Cart" component={CartScreen} />
                </>
              )}

              {user?.role === 'agent' && (
                <>
                  <Stack.Screen name="AgentDashboard" component={AgentDashboardScreen} />
                  <Stack.Screen name="Earnings" component={EarningsScreen} />
                </>
              )}

              {user?.role === 'dealer' && (
                <>
                  <Stack.Screen name="DealerDashboard" component={DealerDashboardScreen} />
                  <Stack.Screen name="Commission" component={CommissionScreen} />
                  <Stack.Screen name="ProductOrders" component={CartScreen} />
                  {/* Reusing CartScreen just as placeholder for ProductOrders for now */}
                </>
              )}
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
