import api from './api';

export interface Notification {
    id: number;
    user_id: number;
    title: string;
    body: string;
    data: Record<string, any> | null;
    is_read: boolean;
    created_at: string;
}

export const notificationService = {
    async getNotifications(page = 1, pageSize = 20): Promise<{ notifications: Notification[]; page: number; pageSize: number }> {
        const res = await api.get('/notifications', { params: { page, pageSize } });
        return res.data.data;
    },

    async markAsRead(id: number): Promise<void> {
        await api.patch(`/notifications/${id}/read`);
    },

    async markAllAsRead(): Promise<void> {
        await api.patch('/notifications/read-all');
    },

    async getUnreadCount(): Promise<number> {
        const res = await api.get('/notifications/unread-count');
        return res.data.data.count;
    },
};
