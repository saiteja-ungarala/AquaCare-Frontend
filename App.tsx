import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { RoleSelectionScreen, LoginScreen, SignupScreen, ForgotPasswordScreen } from './src/screens/auth';
import { CustomerHomeScreen, ServiceDetailsScreen, ProductDetailsScreen, WalletScreen, ServicesScreen } from './src/screens/customer';
import { SearchScreen } from './src/screens/customer/SearchScreen';
import { CartScreen } from './src/screens/customer/CartScreen';
import { BookingsScreen } from './src/screens/customer/BookingsScreen';
import { ProfileScreen } from './src/screens/customer/ProfileScreen';
import { EditProfileScreen } from './src/screens/customer/EditProfileScreen';
import { AddressesScreen } from './src/screens/customer/AddressesScreen';
import { AddEditAddressScreen } from './src/screens/customer/AddEditAddressScreen';
import { PaymentMethodsScreen } from './src/screens/customer/PaymentMethodsScreen';
import { NotificationsScreen } from './src/screens/customer/NotificationsScreen';
import { HelpFAQScreen } from './src/screens/customer/HelpFAQScreen';
import { ContactUsScreen } from './src/screens/customer/ContactUsScreen';
import { TermsScreen } from './src/screens/customer/TermsScreen';
import { PrivacyScreen } from './src/screens/customer/PrivacyScreen';

import { StoreHomeScreen, ProductListingScreen } from './src/screens/store';
import {
    AgentActiveJobScreen,
    AgentEarnScreen,
    AgentEntryScreen,
    AgentHistoryScreen,
    AgentJobsScreen,
    AgentKycPendingScreen,
    AgentKycUploadScreen,
    AgentProfileScreen,
    CampaignMilestonesScreen,
} from './src/screens/agent';

import { useAuthStore } from './src/store';

import { RootStackParamList } from './src/models/types';
import { borderRadius, colors, spacing, typography } from './src/theme/theme';
import { customerColors } from './src/theme/customerTheme';
import { agentTheme } from './src/theme/agentTheme';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

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
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
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
            <Tab.Screen
                name="Wallet"
                component={WalletScreen}
                options={{
                    tabBarLabel: '',
                    tabBarIcon: ({ color }) => (
                        <View
                            style={{
                                top: -20,
                                width: 60,
                                height: 60,
                                borderRadius: 30,
                                backgroundColor: customerColors.primary,
                                justifyContent: 'center',
                                alignItems: 'center',
                                shadowColor: customerColors.primary,
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 4,
                                elevation: 6,
                            }}
                        >
                            <Ionicons name="wallet" size={28} color={customerColors.textOnPrimary} />
                        </View>
                    ),
                }}
            />
            <Tab.Screen name="Store" component={StoreStack} />
            <Tab.Screen name="Bookings" component={BookingsScreen} />
        </Tab.Navigator>
    );
}

function AgentTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: agentTheme.colors.agentPrimary,
                tabBarInactiveTintColor: '#8F9DAC',
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '700',
                },
                tabBarStyle: {
                    backgroundColor: agentTheme.colors.agentDark,
                    height: 64,
                    borderTopWidth: 0,
                    paddingTop: 6,
                },
                tabBarIcon: ({ color, size, focused }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'briefcase-outline';

                    if (route.name === 'AgentJobs') {
                        iconName = focused ? 'briefcase' : 'briefcase-outline';
                    } else if (route.name === 'AgentActiveJob') {
                        iconName = focused ? 'flash' : 'flash-outline';
                    } else if (route.name === 'AgentEarn') {
                        iconName = focused ? 'cash' : 'cash-outline';
                    } else if (route.name === 'AgentHistory') {
                        iconName = focused ? 'time' : 'time-outline';
                    } else if (route.name === 'AgentProfile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="AgentJobs" component={AgentJobsScreen} options={{ title: 'Jobs' }} />
            <Tab.Screen name="AgentActiveJob" component={AgentActiveJobScreen} options={{ title: 'Active Job' }} />
            <Tab.Screen name="AgentEarn" component={AgentEarnScreen} options={{ title: 'Earn' }} />
            <Tab.Screen name="AgentHistory" component={AgentHistoryScreen} options={{ title: 'History' }} />
            <Tab.Screen name="AgentProfile" component={AgentProfileScreen} options={{ title: 'Profile' }} />
        </Tab.Navigator>
    );
}

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

function CustomerStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="CustomerTabs" component={CustomerTabs} />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="ServiceDetails" component={ServiceDetailsScreen} />
            <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
            <Stack.Screen name="Wallet" component={WalletScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="OrderHistory" component={BookingsScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="Addresses" component={AddressesScreen} />
            <Stack.Screen name="AddEditAddress" component={AddEditAddressScreen} />
            <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="HelpFAQ" component={HelpFAQScreen} />
            <Stack.Screen name="ContactUs" component={ContactUsScreen} />
            <Stack.Screen name="Terms" component={TermsScreen} />
            <Stack.Screen name="Privacy" component={PrivacyScreen} />
        </Stack.Navigator>
    );
}

function AgentGateStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="AgentEntry" component={AgentEntryScreen} />
            <Stack.Screen name="AgentKycUpload" component={AgentKycUploadScreen} />
            <Stack.Screen name="AgentKycPending" component={AgentKycPendingScreen} />
            <Stack.Screen name="AgentTabs" component={AgentTabs} />
            <Stack.Screen name="AgentCampaignMilestones" component={CampaignMilestonesScreen} />
        </Stack.Navigator>
    );
}

function DealerComingSoonScreen() {
    return (
        <View style={styles.dealerContainer}>
            <View style={styles.dealerCard}>
                <Ionicons name="storefront-outline" size={44} color="#2E3A46" />
                <Text style={styles.dealerTitle}>Dealer Portal</Text>
                <Text style={styles.dealerSubtitle}>Coming soon in a dedicated release.</Text>
            </View>
        </View>
    );
}

function DealerStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="DealerComingSoon" component={DealerComingSoonScreen} />
        </Stack.Navigator>
    );
}

export default function App() {
    const { isAuthenticated, user, checkAuth } = useAuthStore();
    const [isReady, setIsReady] = React.useState(false);

    React.useEffect(() => {
        const init = async () => {
            try {
                await checkAuth();
            } catch (error) {
                console.log('Auth check error:', error);
            } finally {
                setIsReady(true);
            }
        };
        init();
    }, [checkAuth]);

    if (!isReady) {
        return null;
    }

    const renderStack = () => {
        if (!isAuthenticated) {
            return <AuthStack />;
        }

        if (user?.role === 'agent') {
            return <AgentGateStack />;
        }

        if (user?.role === 'dealer') {
            return <DealerStack />;
        }

        if (user?.role === 'customer') {
            return <CustomerStack />;
        }

        return <AuthStack />;
    };

    const navigatorKey = isAuthenticated ? user?.role || 'auth' : 'auth';

    return (
        <SafeAreaProvider>
            <NavigationContainer key={navigatorKey}>{renderStack()}</NavigationContainer>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    dealerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ECEFF2',
        padding: 20,
    },
    dealerCard: {
        width: '100%',
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D2D8DE',
        padding: 24,
        alignItems: 'center',
    },
    dealerTitle: {
        ...typography.h2,
        color: '#1F2933',
        marginTop: 12,
    },
    dealerSubtitle: {
        ...typography.bodySmall,
        color: '#5B6773',
        marginTop: 4,
    },
});
