import { TechnicianVerificationStatus } from '../models/types';

export type TechnicianKycRouteTarget = 'TechnicianTabs' | 'TechnicianKycPending' | 'TechnicianKycUpload';

const KNOWN_KYC_STATUSES: TechnicianVerificationStatus[] = [
    'unverified',
    'pending',
    'approved',
    'rejected',
    'suspended',
];

export const normalizeTechnicianKycStatus = (status?: string | null): TechnicianVerificationStatus => {
    if (!status) return 'unverified';
    return KNOWN_KYC_STATUSES.includes(status as TechnicianVerificationStatus)
        ? (status as TechnicianVerificationStatus)
        : 'unverified';
};

export const isTechnicianKycApproved = (status?: string | null): boolean =>
    normalizeTechnicianKycStatus(status) === 'approved';

export const getTechnicianKycGateRoute = (status?: string | null): TechnicianKycRouteTarget => {
    const normalized = normalizeTechnicianKycStatus(status);

    if (normalized === 'approved') {
        return 'TechnicianTabs';
    }

    if (normalized === 'pending' || normalized === 'rejected' || normalized === 'suspended') {
        return 'TechnicianKycPending';
    }

    return 'TechnicianKycUpload';
};
