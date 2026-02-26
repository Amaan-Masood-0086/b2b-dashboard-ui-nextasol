import { useQuery } from '@tanstack/react-query';
import { DollarSign, ShoppingCart, TrendingUp, UtensilsCrossed } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = ['hsl(220,70%,50%)', 'hsl(160,60%,45%)', 'hsl(30,80%,55%)', 'hsl(280,65%,60%)', 'hsl(340,75%,55%)'];

export default function DashboardPage() {
  const { selectedBranchId } = useAuthStore();
  const branchId = selectedBranchId;

  const { data: daily, isLoading: loadingDaily } = useQuery({
    queryKey: ['reports-daily', branchId],
    queryFn: () => api.get(`/branches/${branchId}/reports/daily`).then((r) => r.data),
    enabled: !!branchId,
  });

  const { data: weeklySales, isLoading: loadingWeekly } = useQuery({
    queryKey: ['reports-weekly', branchId],
    queryFn: () => api.get(`/branches/${branchId}/reports/weekly-sales`).then((r) => r.data),
    enabled: !!branchId,
  });

  const { data: paymentBreakdown } = useQuery({
    queryKey: ['reports-payment', branchId],
    queryFn: () => api.get(`/branches/${branchId}/reports/payment-breakdown`).then((r) => r.data),
    enabled: !!branchId,
  });

  const { data: orderTypes } = useQuery({
    queryKey: ['reports-order-types', branchId],
    queryFn: () => api.get(`/branches/${branchId}/reports/order-types`).then((r) => r.data),
    enabled: !!branchId,
  });

  const { data: topProducts } = useQuery({
    queryKey: ['reports-top-products', branchId],
    queryFn: () => api.get(`/branches/${branchId}/reports/top-products?limit=5`).then((r) => r.data),
    enabled: !!branchId,
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

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

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
                  {stat.format === 'currency' ? `$${Number(stat.value).toLocaleString('en', { minimumFractionDigits: 2 })}` : stat.value}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weekly Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingWeekly ? (
              <Skeleton className="h-[250px]" />
            ) : (
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
          <CardHeader>
            <CardTitle className="text-base">Payment Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={paymentBreakdown || []}
                  dataKey="total"
                  nameKey="paymentMethod"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ paymentMethod, percent }) => `${paymentMethod} ${(percent * 100).toFixed(0)}%`}
                >
                  {(paymentBreakdown || []).map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={orderTypes || []}
                  dataKey="count"
                  nameKey="orderType"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ orderType, percent }) => `${orderType?.replace('_', ' ')} ${(percent * 100).toFixed(0)}%`}
                >
                  {(orderTypes || []).map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Selling Products</CardTitle>
          </CardHeader>
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
    </div>
  );
}
