import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { useNotificationStore } from '@/stores/notification-store';

export function LiveOrderTicker() {
  const { notifications } = useNotificationStore();
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);

  const orderNotifs = notifications.filter((n) => n.type === 'order').slice(0, 5);

  useEffect(() => {
    if (orderNotifs.length === 0) return;

    const latest = orderNotifs[0];
    setCurrent(latest.message);
    setVisible(true);

    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, [orderNotifs[0]?.id]);

  if (!current) return null;

  return (
    <div
      className={`flex items-center gap-2 px-4 py-1.5 bg-primary/5 border-b text-sm transition-all duration-500 ${
        visible ? 'opacity-100 max-h-10' : 'opacity-0 max-h-0 overflow-hidden'
      }`}
    >
      <Activity className="h-3.5 w-3.5 text-primary animate-pulse" />
      <span className="text-muted-foreground truncate">{current}</span>
    </div>
  );
}
