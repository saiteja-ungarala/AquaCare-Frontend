import { create } from 'zustand';
import { DealerKycDocSummary, DealerKycDocument, DealerKycDocType, DealerPricingProduct, DealerProfile } from '../models/types';
import dealerService from '../services/dealerService';

type UploadKycFile = {
    uri: string;
    fileName?: string | null;
    mimeType?: string | null;
};

interface DealerState {
    me: DealerProfile | null;
    verificationStatus: string | null;
    docsSummary: DealerKycDocSummary | null;
    latestDocument: DealerKycDocument | null;
    pricingProducts: DealerPricingProduct[];
    selectedPricingProduct: DealerPricingProduct | null;
    loadingMe: boolean;
    uploadingKyc: boolean;
    loadingPricing: boolean;
    error: string | null;
    pricingErrorStatus: number | null;
}

interface DealerActions {
    fetchMe: () => Promise<DealerProfile | null>;
    uploadKyc: (payload: { doc_type: DealerKycDocType; files: UploadKycFile[] }) => Promise<boolean>;
    updateDealerProfile: (data: {
        business_name?: string;
        gst_number?: string;
        address_text?: string;
        base_lat?: number;
        base_lng?: number;
    }) => Promise<boolean>;
    fetchPricingProducts: () => Promise<boolean>;
    fetchPricingProduct: (productId: number) => Promise<DealerPricingProduct | null>;
    clearError: () => void;
    reset: () => void;
}

type DealerStore = DealerState & DealerActions;

const DOC_TYPE_TO_BACKEND: Record<DealerKycDocType, string> = {
    gst_certificate: 'gst_certificate',
    shop_license: 'shop_license',
    pan: 'pan',
    aadhaar: 'aadhaar',
    bank_proof: 'bank_proof',
    selfie: 'selfie',
    other: 'other',
};

const normalizeStatus = (value: unknown): string => {
    const status = String(value || 'unverified').toLowerCase();
    if (status === 'approved' || status === 'pending' || status === 'rejected' || status === 'unverified') {
        return status;
    }
    return 'unverified';
};

const initialState: DealerState = {
    me: null,
    verificationStatus: null,
    docsSummary: null,
    latestDocument: null,
    pricingProducts: [],
    selectedPricingProduct: null,
    loadingMe: false,
    uploadingKyc: false,
    loadingPricing: false,
    error: null,
    pricingErrorStatus: null,
};

export const useDealerStore = create<DealerStore>((set) => ({
    ...initialState,

    fetchMe: async () => {
        set({ loadingMe: true, error: null });
        try {
            const payload = await dealerService.getMe();
            set({
                me: payload.profile,
                verificationStatus: normalizeStatus(payload.verificationStatus),
                docsSummary: payload.docsSummary,
                latestDocument: payload.latestDocument,
                loadingMe: false,
            });
            return payload.profile;
        } catch (error: any) {
            set({
                loadingMe: false,
                error: dealerService.getApiErrorMessage(error, 'Failed to load dealer profile.'),
            });
            return null;
        }
    },

    uploadKyc: async (payload) => {
        set({ uploadingKyc: true, error: null });
        try {
            const formData = new FormData();
            formData.append('doc_type', DOC_TYPE_TO_BACKEND[payload.doc_type] || 'other');
            payload.files.forEach((file, index) => {
                formData.append('documents', {
                    uri: file.uri,
                    name: file.fileName || `dealer-kyc-${Date.now()}-${index}.jpg`,
                    type: file.mimeType || 'image/jpeg',
                } as any);
            });

            await dealerService.submitKyc(formData);
            const me = await dealerService.getMe();
            set({
                me: me.profile,
                verificationStatus: normalizeStatus(me.verificationStatus),
                docsSummary: me.docsSummary,
                latestDocument: me.latestDocument,
                uploadingKyc: false,
            });
            return true;
        } catch (error: any) {
            set({
                uploadingKyc: false,
                error: dealerService.getApiErrorMessage(error, 'Failed to upload KYC documents.'),
            });
            return false;
        }
    },

    updateDealerProfile: async (data) => {
        set({ loadingMe: true, error: null });
        try {
            const updatedProfile = await dealerService.patchStatus(data);
            set((state) => ({
                me: updatedProfile,
                verificationStatus: normalizeStatus(updatedProfile.verification_status),
                loadingMe: false,
                docsSummary: state.docsSummary,
                latestDocument: state.latestDocument,
            }));
            return true;
        } catch (error: any) {
            set({
                loadingMe: false,
                error: dealerService.getApiErrorMessage(error, 'Failed to update dealer profile.'),
            });
            return false;
        }
    },

    fetchPricingProducts: async () => {
        set({ loadingPricing: true, error: null, pricingErrorStatus: null });
        try {
            const payload = await dealerService.getPricingProducts();
            set({
                pricingProducts: payload.products,
                verificationStatus: normalizeStatus(payload.verification_status),
                loadingPricing: false,
                pricingErrorStatus: null,
            });
            return true;
        } catch (error: any) {
            set({
                loadingPricing: false,
                pricingProducts: [],
                pricingErrorStatus: dealerService.getApiErrorStatus(error),
                error: dealerService.getApiErrorMessage(error, 'Failed to load dealer pricing.'),
            });
            return false;
        }
    },

    fetchPricingProduct: async (productId) => {
        set({ loadingPricing: true, error: null, pricingErrorStatus: null });
        try {
            const payload = await dealerService.getPricingProduct(productId);
            set({
                selectedPricingProduct: payload.pricing,
                verificationStatus: normalizeStatus(payload.verification_status),
                loadingPricing: false,
                pricingErrorStatus: null,
            });
            return payload.pricing;
        } catch (error: any) {
            set({
                loadingPricing: false,
                selectedPricingProduct: null,
                pricingErrorStatus: dealerService.getApiErrorStatus(error),
                error: dealerService.getApiErrorMessage(error, 'Failed to load pricing details.'),
            });
            return null;
        }
    },

    clearError: () => set({ error: null, pricingErrorStatus: null }),
    reset: () => set({ ...initialState }),
}));
