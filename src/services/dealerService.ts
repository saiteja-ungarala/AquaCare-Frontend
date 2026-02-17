import api from './api';
import { API_BASE_URL } from '../config/constants';
import {
    DealerKycDocSummary,
    DealerKycDocument,
    DealerPricingProduct,
    DealerProfile,
} from '../models/types';

type ApiSuccess<T> = {
    success: boolean;
    message?: string;
    data: T;
};

type DealerMeApiPayload = {
    profile: any;
    kyc?: {
        verification_status?: string;
        latest_document?: any;
        counts?: Record<string, number>;
    };
};

type DealerPricingApiPayload = {
    verification_status?: string;
    fallback_rule?: {
        margin_type?: 'flat' | 'percent' | null;
        margin_value?: number | null;
    } | null;
    products?: any[];
};

const toNumber = (value: unknown, fallback = 0): number => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
};

const toNullableNumber = (value: unknown): number | null => {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
};

const normalizeVerificationStatus = (value: unknown): string => {
    const status = String(value || 'unverified').trim().toLowerCase();
    if (status === 'pending' || status === 'approved' || status === 'rejected' || status === 'unverified') {
        return status;
    }
    return 'unverified';
};

const formatRupees = (value: number): string => `Rs ${Math.round(value).toLocaleString('en-IN')}`;

const normalizeMarginType = (value: unknown): 'flat' | 'percent' | null => {
    const v = String(value || '').toLowerCase();
    if (v === 'flat' || v === 'percent') return v;
    return null;
};

const getUploadsBaseUrl = (): string => {
    return String(API_BASE_URL || '').replace(/\/api\/?$/, '');
};

const toAbsoluteAssetUrl = (value: unknown): string | null => {
    const raw = String(value || '').trim();
    if (!raw) return null;
    if (/^https?:\/\//i.test(raw)) return raw;
    if (!raw.startsWith('/')) return raw;
    const base = getUploadsBaseUrl();
    return base ? `${base}${raw}` : raw;
};

const mapDealerProfile = (profile: any): DealerProfile => ({
    user_id: String(profile?.user_id || ''),
    full_name: profile?.full_name || '',
    phone: profile?.phone || null,
    verification_status: normalizeVerificationStatus(profile?.verification_status),
    business_name: profile?.business_name || null,
    gst_number: profile?.gst_number || null,
    address_text: profile?.address_text || null,
    base_lat: toNullableNumber(profile?.base_lat),
    base_lng: toNullableNumber(profile?.base_lng),
});

const mapDealerKycDocument = (doc: any): DealerKycDocument | null => {
    if (!doc) return null;
    return {
        id: toNumber(doc.id),
        doc_type: String(doc.doc_type || 'other'),
        file_url: toAbsoluteAssetUrl(doc.file_url) || '',
        status: String(doc.status || 'pending'),
        review_notes: doc.review_notes || null,
        reviewed_by: doc.reviewed_by ? String(doc.reviewed_by) : null,
        reviewed_at: doc.reviewed_at || null,
    };
};

const mapDealerKycSummary = (counts: Record<string, number> | undefined, latestDoc: DealerKycDocument | null): DealerKycDocSummary => {
    const pendingCount = toNumber(counts?.pending, 0);
    const approvedCount = toNumber(counts?.approved, 0);
    const rejectedCount = toNumber(counts?.rejected, 0);
    const totalCount = toNumber(counts?.total, pendingCount + approvedCount + rejectedCount);

    return {
        pendingCount,
        approvedCount,
        rejectedCount,
        totalCount,
        lastReviewNotes: latestDoc?.review_notes || null,
    };
};

const mapDealerPricingProduct = (product: any): DealerPricingProduct => {
    const mrpPrice = toNumber(product?.mrp ?? product?.mrp_price ?? product?.retail_price, 0);
    const dealerPrice = toNumber(product?.dealer_price, mrpPrice);
    const marginType = normalizeMarginType(product?.margin_type);
    const marginValue = product?.margin_value === null || product?.margin_value === undefined
        ? null
        : toNumber(product.margin_value);
    const earningPreview = mrpPrice > 0 ? Math.max(0, mrpPrice - dealerPrice) : null;

    let marginDisplay = 'No margin';
    if (marginType === 'percent' && marginValue !== null) {
        marginDisplay = `${marginValue}% margin`;
    } else if (marginType === 'flat' && marginValue !== null) {
        marginDisplay = `${formatRupees(marginValue)} margin`;
    } else if (earningPreview !== null) {
        marginDisplay = `${formatRupees(earningPreview)} margin`;
    }

    return {
        product_id: toNumber(product?.product_id ?? product?.id),
        name: product?.name || 'Product',
        image_url: toAbsoluteAssetUrl(product?.image_url),
        mrp_price: mrpPrice,
        dealer_price: dealerPrice,
        margin_type: marginType,
        margin_value: marginValue,
        is_active: product?.is_active !== false,
        margin_display: marginDisplay,
        earning_preview: earningPreview,
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

const getApiErrorStatus = (error: any): number | null => {
    const status = error?.response?.status;
    return typeof status === 'number' ? status : null;
};

export const dealerService = {
    async getMe(): Promise<{
        profile: DealerProfile;
        verificationStatus: string;
        docsSummary: DealerKycDocSummary;
        latestDocument: DealerKycDocument | null;
    }> {
        const response = await api.get<ApiSuccess<DealerMeApiPayload>>('/dealer/me');
        const payload = response.data.data || ({} as DealerMeApiPayload);
        const profile = mapDealerProfile(payload.profile || {});
        const latestDocument = mapDealerKycDocument(payload.kyc?.latest_document);
        const docsSummary = mapDealerKycSummary(payload.kyc?.counts, latestDocument);

        return {
            profile,
            verificationStatus: normalizeVerificationStatus(payload.kyc?.verification_status || profile.verification_status),
            docsSummary,
            latestDocument,
        };
    },

    async submitKyc(formData: FormData): Promise<{ uploaded: number; verification_status: string }> {
        const response = await api.post<ApiSuccess<{ uploaded: number; verification_status: string }>>('/dealer/kyc', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        const data = response.data.data || { uploaded: 0, verification_status: 'pending' };
        return {
            uploaded: toNumber(data.uploaded, 0),
            verification_status: normalizeVerificationStatus(data.verification_status),
        };
    },

    async patchStatus(data: {
        business_name?: string;
        gst_number?: string;
        address_text?: string;
        base_lat?: number;
        base_lng?: number;
    }): Promise<DealerProfile> {
        const response = await api.patch<ApiSuccess<any>>('/dealer/status', data);
        return mapDealerProfile(response.data.data || {});
    },

    async getPricingProducts(): Promise<{
        verification_status: string;
        products: DealerPricingProduct[];
    }> {
        const response = await api.get<ApiSuccess<DealerPricingApiPayload>>('/dealer/pricing/products');
        const payload = response.data.data || {};
        return {
            verification_status: normalizeVerificationStatus(payload.verification_status),
            products: Array.isArray(payload.products) ? payload.products.map(mapDealerPricingProduct) : [],
        };
    },

    async getPricingProduct(productId: number): Promise<{
        verification_status: string;
        pricing: DealerPricingProduct;
    }> {
        const response = await api.get<ApiSuccess<{ verification_status?: string; pricing?: any }>>(`/dealer/pricing/${productId}`);
        const payload = response.data.data || {};
        return {
            verification_status: normalizeVerificationStatus(payload.verification_status),
            pricing: mapDealerPricingProduct(payload.pricing || {}),
        };
    },

    getApiErrorMessage,
    getApiErrorStatus,
};

export default dealerService;
