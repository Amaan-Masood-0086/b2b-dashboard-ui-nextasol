import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, ChefHat, CheckCircle2, Timer, AlertTriangle, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import api from '@/lib/api';
import { useSound } from '@/hooks/use-sound';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

type KDSStatus = 'new' | 'preparing' | 'ready';

interface KDSOrder {
  id: string;
  orderNumber: string;
  orderType: string;
  items: { id: string; product?: { name: string }; quantity: number; notes?: string }[];
  createdAt: string;
  kdsStatus: KDSStatus;
}

const STATUS_CONFIG: Record<KDSStatus, { label: string; color: string; icon: React.ElementType }> = {
  new: { label: 'New', color: 'bg-destructive/15 text-destructive border-destructive/30', icon: AlertTriangle },
  preparing: { label: 'Preparing', color: 'bg-warning/15 text-warning border-warning/30', icon: ChefHat },
  ready: { label: 'Ready', color: 'bg-success/15 text-success border-success/30', icon: CheckCircle2 },
};

export default function KitchenPage() {
  const [orders, setOrders] = useState<KDSOrder[]>([]);
  const [filter, setFilter] = useState<KDSStatus | 'all'>('all');
  const { playChime, isSoundEnabled, setSoundEnabled } = useSound();
  const [muted, setMuted] = useState(!isSoundEnabled());
  const prevCountRef = useRef(0);

  const toggleMute = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    setSoundEnabled(!newMuted);
  };

  const { data, refetch } = useQuery({
    queryKey: ['kds-orders'],
    queryFn: () => api.get('/orders').then((r: any) => r.data),
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (!data) return;
    const rawOrders = data.data || data;
    const mapped: KDSOrder[] = (Array.isArray(rawOrders) ? rawOrders : [])
      .filter((o: any) => o.status === 'pending' || o.status === 'completed')
      .map((o: any) => ({
        ...o,
        kdsStatus: o.status === 'completed' ? 'ready' as KDSStatus : 'new' as KDSStatus,
      }));
    setOrders((prev) => {
      // Preserve any user-set kdsStatus
      const prevMap = new Map(prev.map((p) => [p.id, p]));
      return mapped.map((o) => prevMap.has(o.id) ? { ...o, kdsStatus: prevMap.get(o.id)!.kdsStatus } : o);
    });
  }, [data]);

  // Simulate new incoming orders
  useEffect(() => {
    const interval = setInterval(() => {
      const num = Math.floor(Math.random() * 9000 + 1000);
      const items = [
        { id: `ki-${Date.now()}`, product: { name: ['Classic Burger', 'Chicken Burger', 'Veggie Burger', 'French Fries', 'Onion Rings'][Math.floor(Math.random() * 5)] }, quantity: Math.floor(Math.random() * 3) + 1, notes: Math.random() > 0.7 ? 'No onions' : '' },
        ...(Math.random() > 0.5 ? [{ id: `ki2-${Date.now()}`, product: { name: ['Cola', 'Orange Juice', 'Chocolate Cake'][Math.floor(Math.random() * 3)] }, quantity: 1, notes: '' }] : []),
      ];
      const newOrder: KDSOrder = {
        id: `kds-${Date.now()}`,
        orderNumber: `ORD-${num}`,
        orderType: ['dine_in', 'takeaway', 'delivery'][Math.floor(Math.random() * 3)],
        items,
        createdAt: new Date().toISOString(),
        kdsStatus: 'new',
      };
      setOrders((prev) => {
        const next = [newOrder, ...prev].slice(0, 20);
        return next;
      });
      playChime();
    }, 20000);
    return () => clearInterval(interval);
  }, [playChime]);

  const updateStatus = useCallback((id: string, status: KDSStatus) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, kdsStatus: status } : o));
  }, []);

  const dismiss = useCallback((id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.kdsStatus === filter);
  const counts = { new: orders.filter((o) => o.kdsStatus === 'new').length, preparing: orders.filter((o) => o.kdsStatus === 'preparing').length, ready: orders.filter((o) => o.kdsStatus === 'ready').length };

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <ChefHat className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Kitchen Display</h1>
            <p className="text-sm text-muted-foreground">Real-time order queue for kitchen staff</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={toggleMute} title={muted ? 'Unmute' : 'Mute'}>
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2">
        <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>
          All ({orders.length})
        </Button>
        {(['new', 'preparing', 'ready'] as KDSStatus[]).map((s) => {
          const cfg = STATUS_CONFIG[s];
          return (
            <Button key={s} variant={filter === s ? 'default' : 'outline'} size="sm" onClick={() => setFilter(s)}>
              <cfg.icon className="h-3.5 w-3.5 mr-1" /> {cfg.label} ({counts[s]})
            </Button>
          );
        })}
      </div>

      {/* Order cards grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <ChefHat className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-lg font-medium">No orders in queue</p>
          <p className="text-sm">New orders will appear here automatically</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 [&_button]:min-h-[44px]">
          {filtered.map((order) => {
            const cfg = STATUS_CONFIG[order.kdsStatus];
            const StatusIcon = cfg.icon;
            return (
              <Card key={order.id} className={`relative border-2 transition-all ${order.kdsStatus === 'new' ? 'border-destructive/40 animate-pulse-once' : order.kdsStatus === 'preparing' ? 'border-warning/40' : 'border-success/40'}`}>
                <CardHeader className="pb-2 space-y-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold">{order.orderNumber}</CardTitle>
                    <Badge variant="outline" className={cfg.color}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {cfg.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Timer className="h-3 w-3" />
                      {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                    </span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {order.orderType.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-1.5">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex items-start justify-between text-sm">
                        <div>
                          <span className="font-medium">{item.quantity}× </span>
                          <span>{item.product?.name}</span>
                          {item.notes && <p className="text-xs text-muted-foreground italic ml-4">→ {item.notes}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-1">
                    {order.kdsStatus === 'new' && (
                      <Button size="sm" className="flex-1 bg-warning text-warning-foreground hover:bg-warning/90" onClick={() => updateStatus(order.id, 'preparing')}>
                        <ChefHat className="h-3.5 w-3.5 mr-1" /> Start
                      </Button>
                    )}
                    {order.kdsStatus === 'preparing' && (
                      <Button size="sm" className="flex-1 bg-success text-success-foreground hover:bg-success/90" onClick={() => updateStatus(order.id, 'ready')}>
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Ready
                      </Button>
                    )}
                    {order.kdsStatus === 'ready' && (
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => dismiss(order.id)}>
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Dismiss
                      </Button>
                    )}
                    {order.kdsStatus !== 'new' && order.kdsStatus !== 'ready' && (
                      <Button size="sm" variant="ghost" className="px-2" onClick={() => updateStatus(order.id, 'new')}>
                        <Clock className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
