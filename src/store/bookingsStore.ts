// Bookings store using Zustand

import { create } from 'zustand';
import { Booking, Service, Address } from '../models/types';
import { mockBookings } from '../services/mockData';

interface BookingsState {
    bookings: Booking[];
    isLoading: boolean;
}

interface BookingsActions {
    fetchBookings: () => Promise<void>;
    createBooking: (service: Service, date: string, time: string, address: Address) => Promise<Booking>;
    cancelBooking: (bookingId: string) => Promise<void>;
}

type BookingsStore = BookingsState & BookingsActions;

export const useBookingsStore = create<BookingsStore>((set, get) => ({
    // Initial state
    bookings: mockBookings,
    isLoading: false,

    // Actions
    fetchBookings: async () => {
        set({ isLoading: true });
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        set({ bookings: mockBookings, isLoading: false });
    },

    createBooking: async (service: Service, date: string, time: string, address: Address) => {
        set({ isLoading: true });
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const newBooking: Booking = {
            id: `B${Date.now()}`,
            service,
            status: 'pending',
            scheduledDate: date,
            scheduledTime: time,
            address,
            totalAmount: service.price,
            createdAt: new Date().toISOString(),
        };

        set((state) => ({
            bookings: [newBooking, ...state.bookings],
            isLoading: false,
        }));

        return newBooking;
    },

    cancelBooking: async (bookingId: string) => {
        set({ isLoading: true });
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        set((state) => ({
            bookings: state.bookings.map((b) =>
                b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
            ),
            isLoading: false,
        }));
    },
}));
