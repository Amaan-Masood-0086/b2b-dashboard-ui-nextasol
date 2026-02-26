import { create } from 'zustand';
import { toast } from 'sonner';

export interface LiveNotification {
  id: string;
  type: 'order' | 'low_stock' | 'shift' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: LiveNotification[];
  unreadCount: number;
  lastCheckedCount: number;
  addNotification: (n: LiveNotification) => void;
  setNotifications: (list: LiveNotification[]) => void;
  setUnreadCount: (count: number) => void;
  setLastCheckedCount: (count: number) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  lastCheckedCount: 0,

  addNotification: (n) => {
    set((s) => ({
      notifications: [n, ...s.notifications].slice(0, 50),
      unreadCount: s.unreadCount + 1,
    }));
    toast.info(n.title, { description: n.message });
  },

  setNotifications: (list) => set({ notifications: list }),
  setUnreadCount: (count) => set({ unreadCount: count }),
  setLastCheckedCount: (count) => set({ lastCheckedCount: count }),

  markRead: (id) => set((s) => ({
    notifications: s.notifications.map((n) => n.id === id ? { ...n, isRead: true } : n),
    unreadCount: Math.max(0, s.unreadCount - 1),
  })),

  markAllRead: () => set((s) => ({
    notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
    unreadCount: 0,
  })),
}));
