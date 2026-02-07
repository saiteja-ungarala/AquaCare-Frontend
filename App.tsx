// Full App.tsx - Fixed navigation structure
// React Navigation doesn't handle fragments well, using proper screen arrays

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Auth screens
import { RoleSelectionScreen, LoginScreen, SignupScreen, ForgotPasswordScreen } from './src/screens/auth';

// Customer screens
import { CustomerHomeScreen, ServiceDetailsScreen, ProductDetailsScreen, WalletScreen, ServicesScreen } from './src/screens/customer';
import { CartScreen } from './src/screens/customer/CartScreen';
import { BookingsScreen } from './src/screens/customer/BookingsScreen';
import { ProfileScreen } from './src/screens/customer/ProfileScreen';

// Store screens
import { StoreHomeScreen, ProductListingScreen } from './src/screens/store';

// Agent screens
import { AgentDashboardScreen, EarningsScreen } from './src/screens/agent';

// Dealer screens
import { DealerDashboardScreen, CommissionScreen } from './src/screens/dealer';

// Store
import { useAuthStore } from './src/store';

// Types
import { RootStackParamList } from './src/models/types';
import { colors } from './src/theme/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Store Stack Navigator
function StoreStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StoreHome" component={StoreHomeScreen} />
      <Stack.Screen name="ProductListing" component={ProductListingScreen} />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
    </Stack.Navigator>
  );
}

// Customer bottom tabs
function CustomerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Services') {
            iconName = focused ? 'construct' : 'construct-outline';
          } else if (route.name === 'Bookings') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Store') {
            iconName = focused ? 'storefront' : 'storefront-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={26} color={color} />;
        },
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          paddingBottom: 8,
          paddingTop: 8,
          height: 62,
          borderTopWidth: 1,
          borderTopColor: colors.tabBarBorder,
        },
      })}
    >
      <Tab.Screen name="Home" component={CustomerHomeScreen} />
      <Tab.Screen name="Services" component={ServicesScreen} />
      <Tab.Screen name="Bookings" component={BookingsScreen} />
      <Tab.Screen name="Store" component={StoreStack} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Auth Stack Navigator
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

// Customer Stack Navigator
function CustomerStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CustomerTabs" component={CustomerTabs} />
      <Stack.Screen name="ServiceDetails" component={ServiceDetailsScreen} />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
      <Stack.Screen name="Wallet" component={WalletScreen} />
    </Stack.Navigator>
  );
}

// Agent Stack Navigator
function AgentStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AgentDashboard" component={AgentDashboardScreen} />
      <Stack.Screen name="Earnings" component={EarningsScreen} />
    </Stack.Navigator>
  );
}

// Dealer Stack Navigator
function DealerStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DealerDashboard" component={DealerDashboardScreen} />
      <Stack.Screen name="Commission" component={CommissionScreen} />
      <Stack.Screen name="ProductOrders" component={CartScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const { isAuthenticated, user, checkAuth } = useAuthStore();
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    const init = async () => {
      try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Auth check timeout')), 3000)
        );
        await Promise.race([checkAuth(), timeoutPromise]);
      } catch (error) {
        console.log('Auth check error or timeout:', error);
      } finally {
        setIsReady(true);
      }
    };
    init();
  }, []);

  // Block navigation until auth is resolved
  if (!isReady) {
    return null;
  }

  // Determine which stack to render
  const renderStack = () => {
    if (!isAuthenticated) {
      return <AuthStack />;
    }

    switch (user?.role) {
      case 'customer':
        return <CustomerStack />;
      case 'agent':
        return <AgentStack />;
      case 'dealer':
        return <DealerStack />;
      default:
        return <AuthStack />;
    }
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {renderStack()}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
