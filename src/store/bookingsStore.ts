// Bookings store using Zustand — real API integration

import { create } from 'zustand';
import { Booking } from '../models/types';
import { bookingService } from '../services/bookingService';

interface BookingsState {
    bookings: Booking[];
    isLoading: boolean;
}

interface BookingsActions {
    fetchBookings: (status?: string) => Promise<void>;
    createBooking: (payload: {
        service_id: number;
        address_id: number;
        scheduled_date: string;
        scheduled_time: string;
        notes?: string;
    }) => Promise<Booking>;
    cancelBooking: (bookingId: string) => Promise<void>;
}

type BookingsStore = BookingsState & BookingsActions;

export const useBookingsStore = create<BookingsStore>((set, get) => ({
    bookings: [],
    isLoading: false,

    fetchBookings: async (status?: string) => {
        set({ isLoading: true });
        try {
            const bookings = await bookingService.getBookings(status);
            set({ bookings, isLoading: false });
        } catch {
            set({ isLoading: false });
        }
    },

    createBooking: async (payload) => {
        set({ isLoading: true });
        try {
            const newBooking = await bookingService.createBooking(payload);
            if (!newBooking) throw new Error('Booking creation failed');
            set((state) => ({
                bookings: [newBooking, ...state.bookings],
                isLoading: false,
            }));
            return newBooking;
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    cancelBooking: async (bookingId: string) => {
        set({ isLoading: true });
        try {
            await bookingService.cancelBooking(bookingId);
            set((state) => ({
                bookings: state.bookings.map((b) =>
                    b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
                ),
                isLoading: false,
            }));
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },
}));
