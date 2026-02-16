import { create } from 'zustand';
import {
    AgentCampaign,
    AgentEarnProgress,
    AgentEarnSummary,
    AgentProductCommissionPreview,
} from '../models/types';
import { agentEarnService } from '../services/agentEarnService';

interface AgentEarnLoadingState {
    referral: boolean;
    summary: boolean;
    campaigns: boolean;
    products: boolean;
    progress: boolean;
    refresh: boolean;
}

interface AgentEarnState {
    referralCode: string;
    summary: AgentEarnSummary;
    campaigns: AgentCampaign[];
    activeCampaignId: number | null;
    progress: AgentEarnProgress | null;
    productsWithCommissionPreview: AgentProductCommissionPreview[];
    loading: AgentEarnLoadingState;
    error: string | null;
}

interface AgentEarnActions {
    fetchReferral: () => Promise<string>;
    fetchSummary: () => Promise<void>;
    fetchCampaigns: () => Promise<void>;
    fetchProducts: () => Promise<void>;
    fetchProgress: (campaignId: number) => Promise<void>;
    refreshAll: () => Promise<void>;
    clearError: () => void;
    reset: () => void;
}

type AgentEarnStore = AgentEarnState & AgentEarnActions;

const emptySummary: AgentEarnSummary = {
    totalsPending: 0,
    totalsApproved: 0,
    totalsPaid: 0,
    bonusPending: 0,
    bonusPaid: 0,
};

const initialLoading: AgentEarnLoadingState = {
    referral: false,
    summary: false,
    campaigns: false,
    products: false,
    progress: false,
    refresh: false,
};

const getMessage = (error: unknown, fallback: string): string => {
    return agentEarnService.getApiErrorMessage(error, fallback);
};

const getResolvedCampaignId = (
    campaignIdFromSummary: number | null,
    campaigns: AgentCampaign[]
): number | null => {
    if (campaignIdFromSummary && campaigns.some((item) => item.id === campaignIdFromSummary)) {
        return campaignIdFromSummary;
    }

    return campaigns[0]?.id ?? null;
};

export const useAgentEarnStore = create<AgentEarnStore>((set, get) => ({
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
            const referralCode = await agentEarnService.fetchReferral();
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
            const { summary, progress, campaignId } = await agentEarnService.fetchSummary();
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
            const campaigns = await agentEarnService.fetchCampaigns();
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
            const products = await agentEarnService.fetchProducts();
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
            const progress = await agentEarnService.fetchProgress(campaignId);
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
                agentEarnService.fetchReferral(),
                agentEarnService.fetchCampaigns(),
                agentEarnService.fetchSummary(),
                agentEarnService.fetchProducts(),
            ]);

            const activeCampaignId = getResolvedCampaignId(summaryPayload.campaignId, campaigns);
            let progress = summaryPayload.progress;

            if (!progress && activeCampaignId) {
                progress = await agentEarnService.fetchProgress(activeCampaignId);
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
