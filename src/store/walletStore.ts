// Wallet store - Backend-authoritative using Zustand

import { create } from 'zustand';
import api from '../services/api';

export interface WalletTransaction {
    id: number;
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    date: string;
    source: 'referral' | 'order' | 'refund' | 'top_up';
}

interface WalletState {
    balance: number;
    transactions: WalletTransaction[];
    isLoading: boolean;
    error: string | null;
}

interface WalletActions {
    fetchWallet: () => Promise<void>;
    fetchTransactions: () => Promise<void>;
}

type WalletStore = WalletState & WalletActions;

export const useWalletStore = create<WalletStore>((set) => ({
    // Initial state
    balance: 0,
    transactions: [],
    isLoading: false,
    error: null,

    // Fetch wallet balance
    fetchWallet: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/wallet');
            const data = response.data.data;
            set({
                balance: data.balance || 0,
                isLoading: false
            });
        } catch (error: any) {
            console.error('[WalletStore] fetchWallet error:', error);
            set({ isLoading: false, error: error.message });
        }
    },

    // Fetch wallet transactions
    fetchTransactions: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/wallet/transactions');
            const data = response.data.data;
            set({
                transactions: data || [],
                isLoading: false
            });
        } catch (error: any) {
            console.error('[WalletStore] fetchTransactions error:', error);
            set({ isLoading: false, error: error.message });
        }
    },
}));

// Referral program constants
export const REFERRAL_CONSTANTS = {
    NEW_USER_FREE_SERVICE: true,
    REFERRER_JOINING_BONUS: 100,
    REFERRAL_PURCHASE_REWARD_REFERRER: 50,
    REFERRAL_PURCHASE_REWARD_REFEREE: 25,
};
