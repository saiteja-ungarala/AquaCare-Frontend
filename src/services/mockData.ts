// Mock data for the Water Services App

import { Service, Product, Booking, ServiceRequest, WalletTransaction, Order, Commission } from '../models/types';

export const mockServices: Service[] = [
    {
        id: '1',
        name: 'Water Purifier Service',
        description: 'Complete maintenance and servicing of your water purifier including filter cleaning, UV lamp check, and water quality testing.',
        image: 'https://images.unsplash.com/photo-1624958723474-a6e0e9d4e4b0?w=400',
        price: 499,
        duration: '45-60 mins',
        category: 'water_purifier',
    },
    {
        id: '2',
        name: 'RO Plant Service',
        description: 'Professional RO plant servicing including membrane cleaning, TDS adjustment, and complete system check.',
        image: 'https://images.unsplash.com/photo-1585687433141-694f9956d?w=400',
        price: 799,
        duration: '60-90 mins',
        category: 'ro_plant',
    },
    {
        id: '3',
        name: 'Water Softener Service',
        description: 'Water softener maintenance including resin bed cleaning, salt level check, and regeneration cycle optimization.',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        price: 599,
        duration: '45-60 mins',
        category: 'water_softener',
    },
    {
        id: '4',
        name: 'Ionizer Service',
        description: 'Complete ionizer servicing including electrode cleaning, pH calibration, and performance testing.',
        image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400',
        price: 899,
        duration: '60-90 mins',
        category: 'ionizer',
    },
];

export const mockProducts: Product[] = [
    {
        id: '1',
        name: 'AquaPure RO Water Purifier',
        description: 'Advanced 7-stage RO+UV+UF water purifier with TDS controller and mineral cartridge. 12L storage capacity.',
        image: 'https://images.unsplash.com/photo-1624958723474-a6e0e9d4e4b0?w=400',
        price: 15999,
        originalPrice: 19999,
        rating: 4.5,
        reviewCount: 2340,
        inStock: true,
        category: 'water_purifier',
        features: [
            '7-Stage Purification',
            'RO + UV + UF Technology',
            '12L Storage Tank',
            'TDS Controller',
            '1 Year Warranty',
        ],
    },
    {
        id: '2',
        name: 'SoftFlow Water Softener',
        description: 'Automatic water softener with smart regeneration and salt-efficient technology. Suitable for 3-4 bathrooms.',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        price: 24999,
        originalPrice: 29999,
        rating: 4.3,
        reviewCount: 856,
        inStock: true,
        category: 'water_softener',
        features: [
            'Auto Regeneration',
            'Salt Efficient',
            'Digital Display',
            'Bypass Valve',
            '2 Year Warranty',
        ],
    },
    {
        id: '3',
        name: 'IonLife Alkaline Ionizer',
        description: 'Premium alkaline water ionizer with 9 platinum-coated titanium plates. Produces pH 3.5-11.5 water.',
        image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400',
        price: 89999,
        originalPrice: 99999,
        rating: 4.8,
        reviewCount: 445,
        inStock: true,
        category: 'water_ionizer',
        features: [
            '9 Platinum Plates',
            'pH Range 3.5-11.5',
            'ORP -850mV',
            'Self Cleaning',
            '5 Year Warranty',
        ],
    },
];

export const mockBookings: Booking[] = [
    {
        id: 'B001',
        service: mockServices[0],
        status: 'confirmed',
        scheduledDate: '2026-02-01',
        scheduledTime: '10:00 AM',
        address: {
            id: 'A1',
            line1: '123 Main Street, Apartment 4B',
            city: 'Mumbai',
            state: 'Maharashtra',
            postal_code: '400001',
            is_default: true,
        },
        totalAmount: 499,
        createdAt: '2026-01-30T10:00:00Z',
    },
    {
        id: 'B002',
        service: mockServices[1],
        status: 'completed',
        scheduledDate: '2026-01-28',
        scheduledTime: '2:00 PM',
        address: {
            id: 'A1',
            line1: '123 Main Street, Apartment 4B',
            city: 'Mumbai',
            state: 'Maharashtra',
            postal_code: '400001',
            is_default: true,
        },
        agent: {
            id: 'AG1',
            name: 'Rajesh Kumar',
            phone: '+91 98765 43210',
            rating: 4.8,
            totalJobs: 342,
        },
        totalAmount: 799,
        createdAt: '2026-01-25T09:00:00Z',
        completedAt: '2026-01-28T15:30:00Z',
    },
];

export const mockServiceRequests: ServiceRequest[] = [
    {
        id: 'SR001',
        booking: mockBookings[0],
        customerName: 'Amit Sharma',
        customerPhone: '+91 99887 76655',
        distance: '2.5 km',
        estimatedEarning: 350,
    },
    {
        id: 'SR002',
        booking: {
            ...mockBookings[0],
            id: 'B003',
            service: mockServices[2],
            scheduledTime: '3:00 PM',
        },
        customerName: 'Priya Patel',
        customerPhone: '+91 88776 65544',
        distance: '4.2 km',
        estimatedEarning: 420,
    },
];

export const mockWalletTransactions: WalletTransaction[] = [
    {
        id: 'T001',
        type: 'credit',
        amount: 100,
        description: 'Referral bonus - Amit joined using your code',
        date: '2026-01-29',
        source: 'referral',
    },
    {
        id: 'T002',
        type: 'credit',
        amount: 50,
        description: 'Referral purchase reward',
        date: '2026-01-28',
        source: 'referral',
    },
    {
        id: 'T003',
        type: 'debit',
        amount: 100,
        description: 'Service booking discount applied',
        date: '2026-01-27',
        source: 'booking',
    },
];

export const mockOrders: Order[] = [
    {
        id: 'ORD001',
        items: [
            {
                id: 'CI1',
                type: 'product',
                product: mockProducts[0],
                quantity: 1,
            },
        ],
        status: 'delivered',
        totalAmount: 15999,
        address: {
            id: 'A1',
            line1: '123 Main Street, Apartment 4B',
            city: 'Mumbai',
            state: 'Maharashtra',
            postal_code: '400001',
            is_default: true,
        },
        createdAt: '2026-01-20T10:00:00Z',
        deliveredAt: '2026-01-25T14:00:00Z',
    },
];

export const mockCommissions: Commission[] = [
    {
        id: 'C001',
        orderId: 'ORD001',
        amount: 1599,
        type: 'product_sale',
        status: 'paid',
        date: '2026-01-26',
    },
    {
        id: 'C002',
        orderId: 'ORD002',
        amount: 500,
        type: 'service_referral',
        status: 'pending',
        date: '2026-01-29',
    },
];

export const mockBanners = [
    {
        id: '1',
        image: 'https://images.unsplash.com/photo-1624958723474-a6e0e9d4e4b0?w=800',
        title: 'Get 20% OFF on RO Service',
        subtitle: 'Use code: WATER20',
    },
    {
        id: '2',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        title: 'Free Installation',
        subtitle: 'On all water purifiers',
    },
    {
        id: '3',
        image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800',
        title: 'Refer & Earn Rs100',
        subtitle: 'Share with friends',
    },
];
