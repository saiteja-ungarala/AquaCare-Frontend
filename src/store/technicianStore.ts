import { create } from 'zustand';
import { Alert } from 'react-native';
import {
    TechnicianJob,
    TechnicianJobsMeta,
    TechnicianKycDocument,
    TechnicianMePayload,
    TechnicianProfile,
} from '../models/types';
import { technicianService } from '../services/technicianService';
import { getCurrentLocation } from '../utils/location';

interface TechnicianLoadingState {
    me: boolean;
    jobs: boolean;
    kyc: boolean;
    online: boolean;
    action: boolean;
}

interface TechnicianState {
    me: TechnicianProfile | null;
    kycStatus: string | null;
    latestKycDocument: TechnicianKycDocument | null;
    isOnline: boolean;
    jobs: TechnicianJob[];
    jobsMeta: TechnicianJobsMeta | null;
    loading: TechnicianLoadingState;
    error: string | null;
}

interface TechnicianActions {
    fetchMe: () => Promise<TechnicianMePayload | null>;
    uploadKyc: (formData: FormData) => Promise<boolean>;
    toggleOnline: (isOnline: boolean) => Promise<boolean>;
    fetchJobs: () => Promise<void>;
    accept: (bookingId: string) => Promise<boolean>;
    reject: (bookingId: string) => Promise<boolean>;
    updateStatus: (bookingId: string, status: 'in_progress' | 'completed') => Promise<boolean>;
    acceptJob: (bookingId: string) => Promise<boolean>;
    rejectJob: (bookingId: string) => Promise<boolean>;
    updateJobStatus: (bookingId: string, status: 'in_progress' | 'completed') => Promise<boolean>;
    clearError: () => void;
    reset: () => void;
}

type TechnicianStore = TechnicianState & TechnicianActions;

const initialLoadingState: TechnicianLoadingState = {
    me: false,
    jobs: false,
    kyc: false,
    online: false,
    action: false,
};

const extractErrorMessage = (error: any, fallback: string): string => {
    return technicianService.getApiErrorMessage(error, fallback);
};

const mergeJobs = (incomingJobs: TechnicianJob[], existingJobs: TechnicianJob[]): TechnicianJob[] => {
    const jobMap = new Map<string, TechnicianJob>();

    // Keep jobs already accepted by this technician in local state so status actions remain available.
    existingJobs
        .filter((job) => ['assigned', 'in_progress', 'completed'].includes(job.status))
        .forEach((job) => {
            jobMap.set(job.id, job);
        });

    incomingJobs.forEach((job) => {
        const existing = jobMap.get(job.id);
        jobMap.set(job.id, existing ? { ...existing, ...job } : job);
    });

    return Array.from(jobMap.values()).sort((a, b) => {
        const aDate = new Date(a.created_at || 0).getTime();
        const bDate = new Date(b.created_at || 0).getTime();
        return bDate - aDate;
    });
};

export const useTechnicianStore = create<TechnicianStore>((set, get) => ({
    me: null,
    kycStatus: null,
    latestKycDocument: null,
    isOnline: false,
    jobs: [],
    jobsMeta: null,
    loading: initialLoadingState,
    error: null,

    fetchMe: async () => {
        set((state) => ({
            loading: { ...state.loading, me: true },
            error: null,
        }));

        try {
            const payload = await technicianService.getMe();
            set((state) => ({
                me: payload.profile,
                kycStatus: payload.profile.verification_status,
                latestKycDocument: payload.kyc.latest_document,
                isOnline: !!payload.profile.is_online,
                loading: { ...state.loading, me: false },
            }));
            return payload;
        } catch (error: any) {
            set((state) => ({
                loading: { ...state.loading, me: false },
                error: extractErrorMessage(error, 'Failed to load technician profile.'),
            }));
            return null;
        }
    },

    uploadKyc: async (formData: FormData) => {
        set((state) => ({
            loading: { ...state.loading, kyc: true },
            error: null,
        }));

        try {
            await technicianService.submitKyc(formData);
            set((state) => ({
                loading: { ...state.loading, kyc: false },
                kycStatus: 'pending',
            }));
            await get().fetchMe();
            return true;
        } catch (error: any) {
            set((state) => ({
                loading: { ...state.loading, kyc: false },
                error: extractErrorMessage(error, 'Failed to upload KYC documents.'),
            }));
            return false;
        }
    },

    toggleOnline: async (isOnline: boolean) => {
        set((state) => ({
            loading: { ...state.loading, online: true },
            error: null,
        }));

        // When going online, get location first and patch it before going online
        if (isOnline) {
            const position = await getCurrentLocation();
            if (!position) {
                set((state) => ({
                    loading: { ...state.loading, online: false },
                }));
                Alert.alert('Location Required', 'Location required to go online. Please enable location in phone settings.');
                return false;
            }
            try {
                await technicianService.updateLocation(position.latitude, position.longitude);
            } catch {
                // location patch failed — proceed anyway, backend will gate if needed
            }
        }

        try {
            await technicianService.setOnline(isOnline);
            set((state) => ({
                isOnline,
                me: state.me ? { ...state.me, is_online: isOnline } : state.me,
                loading: { ...state.loading, online: false },
            }));
            return true;
        } catch (error: any) {
            const code = (error as any)?.response?.data?.code;
            if (code === 'LOCATION_REQUIRED') {
                Alert.alert('Location Required', 'Please enable location in phone settings.');
            }
            set((state) => ({
                loading: { ...state.loading, online: false },
                error: extractErrorMessage(error, 'Failed to update online status.'),
            }));
            return false;
        }
    },

    fetchJobs: async () => {
        set((state) => ({
            loading: { ...state.loading, jobs: true },
            error: null,
        }));

        try {
            const payload = await technicianService.getAvailableJobs();
            set((state) => ({
                jobs: mergeJobs(payload.jobs, state.jobs),
                jobsMeta: payload.meta || null,
                loading: { ...state.loading, jobs: false },
            }));
        } catch (error: any) {
            set((state) => ({
                loading: { ...state.loading, jobs: false },
                error: extractErrorMessage(error, 'Failed to load available jobs.'),
            }));
        }
    },

    acceptJob: async (bookingId: string) => {
        set((state) => ({
            loading: { ...state.loading, action: true },
            error: null,
        }));

        try {
            await technicianService.acceptJob(bookingId);
            set((state) => ({
                jobs: state.jobs.map((job) =>
                    job.id === bookingId ? { ...job, status: 'assigned' } : job
                ),
                loading: { ...state.loading, action: false },
            }));
            return true;
        } catch (error: any) {
            set((state) => ({
                loading: { ...state.loading, action: false },
                error: extractErrorMessage(error, 'Failed to accept job.'),
            }));
            return false;
        }
    },

    rejectJob: async (bookingId: string) => {
        set((state) => ({
            loading: { ...state.loading, action: true },
            error: null,
        }));

        try {
            await technicianService.rejectJob(bookingId);
            set((state) => ({
                jobs: state.jobs.filter((job) => job.id !== bookingId),
                loading: { ...state.loading, action: false },
            }));
            return true;
        } catch (error: any) {
            set((state) => ({
                loading: { ...state.loading, action: false },
                error: extractErrorMessage(error, 'Failed to reject job.'),
            }));
            return false;
        }
    },

    updateJobStatus: async (bookingId: string, status: 'in_progress' | 'completed') => {
        set((state) => ({
            loading: { ...state.loading, action: true },
            error: null,
        }));

        try {
            await technicianService.updateJobStatus(bookingId, status);
            set((state) => ({
                jobs: state.jobs.map((job) => (job.id === bookingId ? { ...job, status } : job)),
                loading: { ...state.loading, action: false },
            }));
            return true;
        } catch (error: any) {
            set((state) => ({
                loading: { ...state.loading, action: false },
                error: extractErrorMessage(error, 'Failed to update job status.'),
            }));
            return false;
        }
    },

    clearError: () => set({ error: null }),

    accept: async (bookingId: string) => get().acceptJob(bookingId),
    reject: async (bookingId: string) => get().rejectJob(bookingId),
    updateStatus: async (bookingId: string, status: 'in_progress' | 'completed') => get().updateJobStatus(bookingId, status),

    reset: () =>
        set({
            me: null,
            kycStatus: null,
            latestKycDocument: null,
            isOnline: false,
            jobs: [],
            jobsMeta: null,
            loading: initialLoadingState,
            error: null,
        }),
}));
