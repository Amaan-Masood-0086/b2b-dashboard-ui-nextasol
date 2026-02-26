import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, TrendingUp, CreditCard, Activity, Download, Search } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { exportToCSV } from '@/lib/csv-export';

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  paid: 'default',
  overdue: 'destructive',
  pending: 'secondary',
};

export default function AdminPaymentsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: revenue } = useQuery({
    queryKey: ['admin-revenue'],
    queryFn: () => api.get('/admin/revenue').then((r: any) => r.data),
  });

  const { data: payments } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: () => api.get('/admin/payments').then((r: any) => r.data),
  });

  const paymentList = Array.isArray(payments) ? payments : [];

  const filtered = paymentList.filter((p: any) => {
    const matchSearch = !search || p.merchantName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleExport = () => {
    exportToCSV(filtered, [
      { header: 'Date', accessor: (r) => r.date },
      { header: 'Merchant', accessor: (r) => r.merchantName },
      { header: 'Plan', accessor: (r) => r.plan },
      { header: 'Amount', accessor: (r) => r.amount },
      { header: 'Status', accessor: (r) => r.status },
    ], 'admin-payments');
  };

  const stats = [
    { title: 'Total Revenue', value: `$${(revenue?.totalRevenue ?? 0).toLocaleString()}`, icon: DollarSign },
    { title: 'Monthly Revenue', value: `$${(revenue?.monthlyRevenue ?? 0).toLocaleString()}`, icon: TrendingUp },
    { title: 'MRR', value: `$${(revenue?.mrr ?? 0).toLocaleString()}`, icon: Activity },
    { title: 'Active Subscriptions', value: revenue?.activeSubscriptions ?? 0, icon: CreditCard },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <DollarSign className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Payments & Revenue</h1>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">{s.title}</CardTitle>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><p className="text-2xl font-bold">{s.value}</p></CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Revenue Trend</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenue?.trend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search merchant..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="text-muted-foreground">{p.date}</TableCell>
                  <TableCell className="font-medium">{p.merchantName}</TableCell>
                  <TableCell>{p.plan}</TableCell>
                  <TableCell className="text-right font-semibold">${p.amount}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[p.status] || 'secondary'} className="capitalize">
                      {p.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No payments found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
