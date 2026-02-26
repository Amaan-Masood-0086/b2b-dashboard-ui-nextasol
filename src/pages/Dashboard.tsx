import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns';
import { DollarSign, ShoppingCart, TrendingUp, CalendarIcon, ShoppingBag, UtensilsCrossed, BarChart3, Users, ArrowRight, Activity } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { LiveOrderTicker } from '@/components/LiveOrderTicker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const COLORS = ['hsl(220,70%,50%)', 'hsl(160,60%,45%)', 'hsl(30,80%,55%)', 'hsl(280,65%,60%)', 'hsl(340,75%,55%)'];

const ACTION_ICONS: Record<string, string> = {
  login: '🔑',
  checkout: '💳',
  product_update: '📝',
  void_order: '❌',
  stock_adjust: '📦',
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { selectedBranchId } = useAuthStore();
  const branchId = selectedBranchId;
  const [date, setDate] = useState<Date>(new Date());

  const dateParam = format(date, 'yyyy-MM-dd');

  const { data: daily, isLoading: loadingDaily } = useQuery({
    queryKey: ['reports-daily', branchId, dateParam],
    queryFn: () => api.get(`/branches/${branchId}/reports/daily`, { params: { date: dateParam } }).then((r) => r.data),
    enabled: !!branchId,
  });

  const { data: weeklySales, isLoading: loadingWeekly } = useQuery({
    queryKey: ['reports-weekly', branchId, dateParam],
    queryFn: () => api.get(`/branches/${branchId}/reports/weekly-sales`, { params: { date: dateParam } }).then((r) => r.data),
    enabled: !!branchId,
  });

  const { data: paymentBreakdown } = useQuery({
    queryKey: ['reports-payment', branchId, dateParam],
    queryFn: () => api.get(`/branches/${branchId}/reports/payment-breakdown`, { params: { date: dateParam } }).then((r) => r.data),
    enabled: !!branchId,
  });

  const { data: orderTypes } = useQuery({
    queryKey: ['reports-order-types', branchId, dateParam],
    queryFn: () => api.get(`/branches/${branchId}/reports/order-types`, { params: { date: dateParam } }).then((r) => r.data),
    enabled: !!branchId,
  });

  const { data: topProducts } = useQuery({
    queryKey: ['reports-top-products', branchId, dateParam],
    queryFn: () => api.get(`/branches/${branchId}/reports/top-products?limit=5`, { params: { date: dateParam } }).then((r) => r.data),
    enabled: !!branchId,
  });

  const { data: auditLogs } = useQuery({
    queryKey: ['audit-logs-recent'],
    queryFn: () => api.get('/audit-logs').then((r: any) => r.data),
  });

  if (!branchId) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-muted-foreground">Please select a branch to view the dashboard.</p>
      </div>
    );
  }

  const stats = [
    { title: "Today's Revenue", value: daily?.totalRevenue ?? 0, icon: DollarSign, format: 'currency' },
    { title: 'Total Orders', value: daily?.totalOrders ?? 0, icon: ShoppingCart, format: 'number' },
    { title: 'Avg Order Value', value: daily?.avgOrderValue ?? 0, icon: TrendingUp, format: 'currency' },
  ];

  const quickActions = [
    { label: 'New Order', icon: ShoppingBag, path: '/pos', color: 'bg-primary/10 text-primary' },
    { label: 'Add Product', icon: UtensilsCrossed, path: '/menu', color: 'bg-success/10 text-success' },
    { label: 'View Reports', icon: BarChart3, path: '/reports', color: 'bg-info/10 text-info' },
    { label: 'Manage Staff', icon: Users, path: '/users', color: 'bg-warning/10 text-warning' },
  ];

  const recentLogs = Array.isArray(auditLogs) ? auditLogs.slice(0, 5) : (auditLogs?.data ?? []).slice(0, 5);

  return (
    <div className="flex flex-col">
      <LiveOrderTicker />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("justify-start text-left font-normal", !date && "text-muted-foreground")}>
                <CalendarIcon className="h-4 w-4 mr-2" />
                {format(date, 'PPP')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                disabled={(d) => d > new Date()}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 [&_button]:min-h-[44px]">
          {quickActions.map((action) => (
            <Card
              key={action.label}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(action.path)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${action.color}`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <span className="font-medium text-sm">{action.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loadingDaily ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <p className="text-2xl font-bold">
                    {stat.format === 'currency' ? formatCurrency(Number(stat.value)) : stat.value}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Weekly Sales Trend</CardTitle></CardHeader>
            <CardContent>
              {loadingWeekly ? <Skeleton className="h-[250px]" /> : (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={weeklySales || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(220,70%,50%)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Payment Breakdown</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={paymentBreakdown || []} dataKey="total" nameKey="paymentMethod" cx="50%" cy="50%" outerRadius={80}
                    label={({ paymentMethod, percent }) => `${paymentMethod} ${(percent * 100).toFixed(0)}%`}>
                    {(paymentBreakdown || []).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Order Types</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={orderTypes || []} dataKey="count" nameKey="orderType" cx="50%" cy="50%" outerRadius={80}
                    label={({ orderType, percent }) => `${orderType?.replace('_', ' ')} ${(percent * 100).toFixed(0)}%`}>
                    {(orderTypes || []).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Top Selling Products</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topProducts || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} />
                  <Tooltip />
                  <Bar dataKey="totalSold" fill="hsl(220,70%,50%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" /> Recent Activity
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => navigate('/audit-logs')}>
              View All <ArrowRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recentLogs.map((log: any) => (
                  <div key={log.id} className="flex items-start gap-3">
                    <span className="text-lg mt-0.5">{ACTION_ICONS[log.action] || '📋'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium capitalize">{log.action?.replace('_', ' ')}</p>
                      <p className="text-xs text-muted-foreground truncate">{log.details}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">
                        {log.user?.firstName} {log.user?.lastName?.[0]}.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
