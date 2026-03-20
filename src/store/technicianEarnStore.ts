import { create } from 'zustand';
import {
    TechnicianCampaign,
    TechnicianEarnProgress,
    TechnicianEarnSummary,
    TechnicianProductCommissionPreview,
} from '../models/types';
import { technicianEarnService } from '../services/technicianEarnService';

interface TechnicianEarnLoadingState {
    referral: boolean;
    summary: boolean;
    campaigns: boolean;
    products: boolean;
    progress: boolean;
    refresh: boolean;
}

interface TechnicianEarnState {
    referralCode: string;
    summary: TechnicianEarnSummary;
    campaigns: TechnicianCampaign[];
    activeCampaignId: number | null;
    progress: TechnicianEarnProgress | null;
    productsWithCommissionPreview: TechnicianProductCommissionPreview[];
    loading: TechnicianEarnLoadingState;
    error: string | null;
}

interface TechnicianEarnActions {
    fetchReferral: () => Promise<string>;
    fetchSummary: () => Promise<void>;
    fetchCampaigns: () => Promise<void>;
    fetchProducts: () => Promise<void>;
    fetchProgress: (campaignId: number) => Promise<void>;
    refreshAll: () => Promise<void>;
    clearError: () => void;
    reset: () => void;
}

type TechnicianEarnStore = TechnicianEarnState & TechnicianEarnActions;

const emptySummary: TechnicianEarnSummary = {
    totalsPending: 0,
    totalsApproved: 0,
    totalsPaid: 0,
    bonusPending: 0,
    bonusPaid: 0,
};

const initialLoading: TechnicianEarnLoadingState = {
    referral: false,
    summary: false,
    campaigns: false,
    products: false,
    progress: false,
    refresh: false,
};

const getMessage = (error: unknown, fallback: string): string => {
    return technicianEarnService.getApiErrorMessage(error, fallback);
};

const getResolvedCampaignId = (
    campaignIdFromSummary: number | null,
    campaigns: TechnicianCampaign[]
): number | null => {
    if (campaignIdFromSummary && campaigns.some((item) => item.id === campaignIdFromSummary)) {
        return campaignIdFromSummary;
    }

    return campaigns[0]?.id ?? null;
};

export const useTechnicianEarnStore = create<TechnicianEarnStore>((set, get) => ({
    referralCode: '',
    summary: emptySummary,
    campaigns: [],
    activeCampaignId: null,
    progress: null,
    productsWithCommissionPreview: [],
    loading: initialLoading,
    error: null,

    fetchReferral: async () => {
        set((state) => ({
            loading: { ...state.loading, referral: true },
            error: null,
        }));

        try {
            const referralCode = await technicianEarnService.fetchReferral();
            set((state) => ({
                referralCode,
                loading: { ...state.loading, referral: false },
            }));
            return referralCode;
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, referral: false },
                error: getMessage(error, 'Unable to load referral code.'),
            }));
            return '';
        }
    },

    fetchSummary: async () => {
        set((state) => ({
            loading: { ...state.loading, summary: true },
            error: null,
        }));

        try {
            const { summary, progress, campaignId } = await technicianEarnService.fetchSummary();
            set((state) => {
                const activeCampaignId = getResolvedCampaignId(campaignId, state.campaigns);
                return {
                    summary,
                    progress,
                    activeCampaignId,
                    loading: { ...state.loading, summary: false },
                };
            });
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, summary: false },
                error: getMessage(error, 'Unable to load earnings summary.'),
            }));
        }
    },

    fetchCampaigns: async () => {
        set((state) => ({
            loading: { ...state.loading, campaigns: true },
            error: null,
        }));

        try {
            const campaigns = await technicianEarnService.fetchCampaigns();
            set((state) => {
                const activeCampaignId = getResolvedCampaignId(state.activeCampaignId, campaigns);
                return {
                    campaigns,
                    activeCampaignId,
                    loading: { ...state.loading, campaigns: false },
                };
            });
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, campaigns: false },
                error: getMessage(error, 'Unable to load campaigns.'),
            }));
        }
    },

    fetchProducts: async () => {
        set((state) => ({
            loading: { ...state.loading, products: true },
            error: null,
        }));

        try {
            const products = await technicianEarnService.fetchProducts();
            set((state) => ({
                productsWithCommissionPreview: products,
                loading: { ...state.loading, products: false },
            }));
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, products: false },
                error: getMessage(error, 'Unable to load product commissions.'),
            }));
        }
    },

    fetchProgress: async (campaignId: number) => {
        set((state) => ({
            loading: { ...state.loading, progress: true },
            error: null,
        }));

        try {
            const progress = await technicianEarnService.fetchProgress(campaignId);
            set((state) => ({
                progress,
                activeCampaignId: campaignId,
                loading: { ...state.loading, progress: false },
            }));
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, progress: false },
                error: getMessage(error, 'Unable to load campaign progress.'),
            }));
        }
    },

    refreshAll: async () => {
        set((state) => ({
            loading: { ...state.loading, refresh: true },
            error: null,
        }));

        try {
            const [referralCode, campaigns, summaryPayload, products] = await Promise.all([
                technicianEarnService.fetchReferral(),
                technicianEarnService.fetchCampaigns(),
                technicianEarnService.fetchSummary(),
                technicianEarnService.fetchProducts(),
            ]);

            const activeCampaignId = getResolvedCampaignId(summaryPayload.campaignId, campaigns);
            let progress = summaryPayload.progress;

            if (!progress && activeCampaignId) {
                progress = await technicianEarnService.fetchProgress(activeCampaignId);
            }

            set((state) => ({
                referralCode,
                campaigns,
                summary: summaryPayload.summary,
                activeCampaignId,
                progress,
                productsWithCommissionPreview: products,
                loading: { ...state.loading, refresh: false },
            }));
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, refresh: false },
                error: getMessage(error, 'Unable to refresh earn dashboard.'),
            }));
        }
    },

    clearError: () => set({ error: null }),

    reset: () => set({
        referralCode: '',
        summary: emptySummary,
        campaigns: [],
        activeCampaignId: null,
        progress: null,
        productsWithCommissionPreview: [],
        loading: initialLoading,
        error: null,
    }),
}));
