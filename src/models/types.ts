// Type definitions for the Water Services App

export type UserRole = 'customer' | 'agent' | 'dealer';

export interface User {
    id: string;
    email: string;
    name: string;
    phone: string;
    role: UserRole;
    avatar?: string;
    address?: Address;
    referralCode?: string;
    referredBy?: string;
    createdAt: string;
}

export interface Address {
    id: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
    isDefault: boolean;
}

export interface Service {
    id: string;
    name: string;
    description: string;
    image: string;
    price: number;
    duration: string;
    category: ServiceCategory;
}

export type ServiceCategory =
    | 'water_purifier'
    | 'ro_plant'
    | 'water_softener'
    | 'ionizer';

export interface Product {
    id: string;
    name: string;
    description: string;
    image: string;
    price: number;
    originalPrice?: number;
    rating: number;
    reviewCount: number;
    inStock: boolean;
    category: ProductCategory;
    features: string[];
}

export type ProductCategory =
    | 'water_purifier'
    | 'water_softener'
    | 'water_ionizer';

export interface CartItem {
    id: string;
    product: Product;
    quantity: number;
}

export interface Booking {
    id: string;
    service: Service;
    status: BookingStatus;
    scheduledDate: string;
    scheduledTime: string;
    address: Address;
    agent?: Agent;
    totalAmount: number;
    createdAt: string;
    completedAt?: string;
}

export type BookingStatus =
    | 'pending'
    | 'confirmed'
    | 'agent_assigned'
    | 'on_the_way'
    | 'in_progress'
    | 'completed'
    | 'cancelled';

export interface Agent {
    id: string;
    name: string;
    phone: string;
    avatar?: string;
    rating: number;
    totalJobs: number;
}

export interface ServiceRequest {
    id: string;
    booking: Booking;
    customerName: string;
    customerPhone: string;
    distance: string;
    estimatedEarning: number;
}

export interface WalletTransaction {
    id: string;
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    date: string;
    source: 'referral' | 'booking' | 'refund' | 'withdrawal';
}

export interface Wallet {
    balance: number;
    transactions: WalletTransaction[];
}

export interface Order {
    id: string;
    items: CartItem[];
    status: OrderStatus;
    totalAmount: number;
    address: Address;
    createdAt: string;
    deliveredAt?: string;
}

export type OrderStatus =
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled';

export interface Commission {
    id: string;
    orderId: string;
    amount: number;
    type: 'product_sale' | 'service_referral';
    status: 'pending' | 'paid';
    date: string;
}

// Auth types
export interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    selectedRole: UserRole | null;
}

export interface LoginCredentials {
    email: string;
    password: string;
    role: UserRole;
}

export interface SignupData {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
    referralCode?: string;
}

// Navigation Types
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
    RoleSelection: undefined;
    Login: undefined;
    Signup: undefined;
    CustomerTabs: undefined;
    ServiceDetails: { service: Service };
    ProductDetails: { product: Product };
    Cart: undefined;
    Bookings: undefined;
    Wallet: undefined;
    Profile: undefined;
    AgentDashboard: undefined;
    Earnings: undefined;
    DealerDashboard: undefined;
    Commission: undefined;
    ProductOrders: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;
