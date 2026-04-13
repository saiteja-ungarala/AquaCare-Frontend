// ReferralScreen — redirects to WalletScreen (referral tab)
// All referral functionality lives in WalletScreen

import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../models/types';

export const ReferralScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    useEffect(() => {
        // Replace this screen with Wallet so back button works correctly
        navigation.replace('Wallet');
    }, [navigation]);

    return null;
};
