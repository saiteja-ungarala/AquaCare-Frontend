import api from './api';
import {
    AgentCampaign,
    AgentEarnProgress,
    AgentEarnSummary,
    AgentProductCommissionPreview,
} from '../models/types';

type ApiSuccess<T> = {
    success: boolean;
    message?: string;
    data: T;
};

type SummaryApiPayload = {
    totals?: {
        commissions?: { pending?: number; approved?: number; paid?: number };
        bonuses?: { pending?: number; approved?: number; paid?: number };
        combined?: { pending?: number; approved?: number; paid?: number };
    };
    campaign_progress?: {
        campaign_id?: number;
        sold_qty?: number;
        next_threshold?: number | null;
        bonuses_earned?: number;
        remaining_to_next_threshold?: number;
        tiers_reached?: Array<{ threshold_qty: number; bonus_amount: number }>;
    } | null;
};

const toNumber = (value: unknown): number => {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
};

const mapSummary = (payload: SummaryApiPayload): AgentEarnSummary => {
    const combined = payload.totals?.combined || {};
    const bonuses = payload.totals?.bonuses || {};

    return {
        totalsPending: toNumber(combined.pending),
        totalsApproved: toNumber(combined.approved),
        totalsPaid: toNumber(combined.paid),
        bonusPending: toNumber(bonuses.pending),
        bonusPaid: toNumber(bonuses.paid),
    };
};

const mapProgress = (payload?: SummaryApiPayload['campaign_progress'] | null): AgentEarnProgress | null => {
    if (!payload) {
        return null;
    }

    const soldQty = toNumber(payload.sold_qty);
    const nextThreshold = payload.next_threshold === null || payload.next_threshold === undefined
        ? null
        : toNumber(payload.next_threshold);

    return {
        soldQty,
        nextThreshold,
        remainingToNextThreshold: payload.remaining_to_next_threshold !== undefined
            ? Math.max(0, toNumber(payload.remaining_to_next_threshold))
            : (nextThreshold !== null ? Math.max(0, nextThreshold - soldQty) : 0),
        bonusesEarned: toNumber(payload.bonuses_earned),
        tiersReached: Array.isArray(payload.tiers_reached)
            ? payload.tiers_reached.map((tier) => ({
                thresholdQty: toNumber(tier.threshold_qty),
                bonusAmount: toNumber(tier.bonus_amount),
            }))
            : [],
    };
};

const mapCampaign = (campaign: any): AgentCampaign => ({
    id: toNumber(campaign.id),
    name: campaign.name || 'Campaign',
    description: campaign.description || '',
    startAt: campaign.start_at || campaign.startAt || '',
    endAt: campaign.end_at || campaign.endAt || '',
    tiers: Array.isArray(campaign.tiers)
        ? campaign.tiers.map((tier: any) => ({
            thresholdQty: toNumber(tier.threshold_qty ?? tier.thresholdQty),
            bonusAmount: toNumber(tier.bonus_amount ?? tier.bonusAmount),
        }))
        : [],
});

const mapProduct = (product: any): AgentProductCommissionPreview => {
    const preview = product.commission_preview || null;

    return {
        id: toNumber(product.id),
        name: product.name || 'Product',
        price: toNumber(product.price),
        commissionType: preview?.type === 'flat' || preview?.type === 'percent' ? preview.type : null,
        commissionValue: preview ? toNumber(preview.value) : null,
        commissionAmount: preview ? toNumber(preview.amount) : null,
        campaignId: preview?.campaign_id !== undefined && preview?.campaign_id !== null
            ? toNumber(preview.campaign_id)
            : null,
    };
};

const getApiErrorMessage = (error: any, fallback: string): string => {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        fallback
    );
};

export const agentEarnService = {
    async fetchReferral(): Promise<string> {
        const response = await api.get<ApiSuccess<{ referral_code?: string }>>('/agent/earn/referral');
        return String(response.data.data?.referral_code || '');
    },

    async fetchSummary(): Promise<{ summary: AgentEarnSummary; progress: AgentEarnProgress | null; campaignId: number | null }> {
        const response = await api.get<ApiSuccess<SummaryApiPayload>>('/agent/earn/summary');
        const payload = response.data.data || {};

        const progress = mapProgress(payload.campaign_progress);
        const campaignId = payload.campaign_progress?.campaign_id !== undefined && payload.campaign_progress?.campaign_id !== null
            ? toNumber(payload.campaign_progress.campaign_id)
            : null;

        return {
            summary: mapSummary(payload),
            progress,
            campaignId,
        };
    },

    async fetchCampaigns(): Promise<AgentCampaign[]> {
        const response = await api.get<ApiSuccess<any[]>>('/agent/earn/campaigns');
        const list = Array.isArray(response.data.data) ? response.data.data : [];
        return list.map(mapCampaign);
    },

    async fetchProducts(): Promise<AgentProductCommissionPreview[]> {
        const response = await api.get<ApiSuccess<any[]>>('/agent/earn/products');
        const list = Array.isArray(response.data.data) ? response.data.data : [];
        return list.map(mapProduct);
    },

    async fetchProgress(campaignId: number): Promise<AgentEarnProgress> {
        const response = await api.get<ApiSuccess<any>>(`/agent/earn/progress/${campaignId}`);
        const payload = response.data.data || {};

        return {
            soldQty: toNumber(payload.sold_qty),
            nextThreshold: payload.next_threshold === null || payload.next_threshold === undefined
                ? null
                : toNumber(payload.next_threshold),
            remainingToNextThreshold: Math.max(0, toNumber(payload.remaining_to_next_threshold)),
            bonusesEarned: toNumber(payload.bonuses_earned),
            tiersReached: Array.isArray(payload.tiers_reached)
                ? payload.tiers_reached.map((tier: any) => ({
                    thresholdQty: toNumber(tier.threshold_qty),
                    bonusAmount: toNumber(tier.bonus_amount),
                }))
                : [],
        };
    },

    getApiErrorMessage,
};
