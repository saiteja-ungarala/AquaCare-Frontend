// Wallet store using Zustand

import { create } from 'zustand';
import { WalletTransaction } from '../models/types';
import { mockWalletTransactions } from '../services/mockData';

interface WalletState {
    balance: number;
    transactions: WalletTransaction[];
    isLoading: boolean;
}

interface WalletActions {
    fetchWallet: () => Promise<void>;
    addCredit: (amount: number, description: string, source: WalletTransaction['source']) => void;
    deductBalance: (amount: number, description: string, source: WalletTransaction['source']) => void;
    processReferralBonus: (referredUserName: string) => void;
}

type WalletStore = WalletState & WalletActions;

export const useWalletStore = create<WalletStore>((set, get) => ({
    // Initial state
    balance: 250, // Mock initial balance
    transactions: mockWalletTransactions,
    isLoading: false,

    // Actions
    fetchWallet: async () => {
        set({ isLoading: true });
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        set({ isLoading: false });
    },

    addCredit: (amount: number, description: string, source: WalletTransaction['source']) => {
        set((state) => {
            const newTransaction: WalletTransaction = {
                id: `T${Date.now()}`,
                type: 'credit',
                amount,
                description,
                date: new Date().toISOString().split('T')[0],
                source,
            };

            return {
                balance: state.balance + amount,
                transactions: [newTransaction, ...state.transactions],
            };
        });
    },

    deductBalance: (amount: number, description: string, source: WalletTransaction['source']) => {
        set((state) => {
            if (state.balance < amount) {
                throw new Error('Insufficient balance');
            }

            const newTransaction: WalletTransaction = {
                id: `T${Date.now()}`,
                type: 'debit',
                amount,
                description,
                date: new Date().toISOString().split('T')[0],
                source,
            };

            return {
                balance: state.balance - amount,
                transactions: [newTransaction, ...state.transactions],
            };
        });
    },

    // Referral logic: when someone joins using referral code
    processReferralBonus: (referredUserName: string) => {
        const REFERRAL_JOINING_BONUS = 100; // ₹100 for referrer when someone joins
        get().addCredit(
            REFERRAL_JOINING_BONUS,
            `Referral bonus - ${referredUserName} joined using your code`,
            'referral'
        );
    },
}));

// Referral program constants
export const REFERRAL_CONSTANTS = {
    NEW_USER_FREE_SERVICE: true, // New customer gets free first service
    REFERRER_JOINING_BONUS: 100, // ₹100 when someone joins
    REFERRAL_PURCHASE_REWARD_REFERRER: 50, // ₹50 when referred user makes purchase
    REFERRAL_PURCHASE_REWARD_REFEREE: 25, // ₹25 for the person who was referred
};
