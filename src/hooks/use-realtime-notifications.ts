import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useNotificationStore } from '@/stores/notification-store';
import { toast } from 'sonner';

const SIMULATED_EVENTS = [
  { type: 'order' as const, title: 'New Order Received', message: 'Order #ORD-{num} placed for ${amount}' },
  { type: 'order' as const, title: 'Order Completed', message: 'Order #ORD-{num} has been fulfilled' },
  { type: 'low_stock' as const, title: 'Low Stock Alert', message: '{product} stock is running low ({qty} remaining)' },
  { type: 'shift' as const, title: 'Shift Activity', message: '{user} started a new shift at {branch}' },
  { type: 'system' as const, title: 'Daily Summary', message: "Today's revenue: ${amount} from {count} orders" },
];

const PRODUCTS = ['Classic Burger', 'French Fries', 'Cola', 'Chicken Burger', 'Onion Rings'];
const USERS = ['John Cashier', 'Jane Manager', 'Demo Owner'];
const BRANCHES = ['Main Branch', 'Downtown Branch'];

function generateEvent() {
  const template = SIMULATED_EVENTS[Math.floor(Math.random() * SIMULATED_EVENTS.length)];
  const num = Math.floor(Math.random() * 9000 + 1000);
  const amount = (Math.random() * 50 + 5).toFixed(2);
  const product = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
  const qty = Math.floor(Math.random() * 8 + 2);
  const user = USERS[Math.floor(Math.random() * USERS.length)];
  const branch = BRANCHES[Math.floor(Math.random() * BRANCHES.length)];
  const count = Math.floor(Math.random() * 30 + 5);

  return {
    id: `live-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: template.type,
    title: template.title,
    message: template.message
      .replace('{num}', String(num))
      .replace('{amount}', amount)
      .replace('{product}', product)
      .replace('{qty}', String(qty))
      .replace('{user}', user)
      .replace('{branch}', branch)
      .replace('{count}', String(count)),
    isRead: false,
    createdAt: new Date().toISOString(),
  };
}

export function useRealtimeNotifications(enabled = true) {
  const { addNotification, setUnreadCount } = useNotificationStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll unread count
  useQuery({
    queryKey: ['notifications-unread'],
    queryFn: () => api.get('/notifications/unread-count').then((r: any) => r.data?.count ?? 0),
    refetchInterval: 15000,
    enabled,
  });

  // Simulate new events every 30-60s in demo mode
  useEffect(() => {
    if (!enabled) return;

    const scheduleNext = () => {
      const delay = Math.floor(Math.random() * 30000) + 30000; // 30-60s
      intervalRef.current = setTimeout(() => {
        const event = generateEvent();
        addNotification(event);
        scheduleNext();
      }, delay);
    };

    // First event after 15-25s
    intervalRef.current = setTimeout(() => {
      const event = generateEvent();
      addNotification(event);
      scheduleNext();
    }, Math.floor(Math.random() * 10000) + 15000);

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [enabled, addNotification]);
}
