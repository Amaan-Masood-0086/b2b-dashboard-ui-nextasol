import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const COLORS = ['hsl(220,70%,50%)', 'hsl(160,60%,45%)', 'hsl(30,80%,55%)', 'hsl(280,65%,60%)', 'hsl(340,75%,55%)'];

export default function ReportsPage() {
  const { selectedBranchId } = useAuthStore();
  const branchId = selectedBranchId;

  const { data: daily } = useQuery({ queryKey: ['r-daily', branchId], queryFn: () => api.get(`/branches/${branchId}/reports/daily`).then(r => r.data), enabled: !!branchId });
  const { data: weekly } = useQuery({ queryKey: ['r-weekly', branchId], queryFn: () => api.get(`/branches/${branchId}/reports/weekly-sales`).then(r => r.data), enabled: !!branchId });
  const { data: payment } = useQuery({ queryKey: ['r-payment', branchId], queryFn: () => api.get(`/branches/${branchId}/reports/payment-breakdown`).then(r => r.data), enabled: !!branchId });
  const { data: orderTypes } = useQuery({ queryKey: ['r-types', branchId], queryFn: () => api.get(`/branches/${branchId}/reports/order-types`).then(r => r.data), enabled: !!branchId });
  const { data: top } = useQuery({ queryKey: ['r-top', branchId], queryFn: () => api.get(`/branches/${branchId}/reports/top-products?limit=10`).then(r => r.data), enabled: !!branchId });

  if (!branchId) return <div className="flex items-center justify-center h-[60vh]"><p className="text-muted-foreground">Please select a branch.</p></div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {[{ t: 'Revenue', v: daily?.totalRevenue }, { t: 'Orders', v: daily?.totalOrders }, { t: 'Avg Value', v: daily?.avgOrderValue }].map(s => (
          <Card key={s.t}><CardContent className="pt-6"><p className="text-sm text-muted-foreground">{s.t}</p><p className="text-2xl font-bold">{s.t !== 'Orders' ? `$${Number(s.v ?? 0).toFixed(2)}` : s.v ?? 0}</p></CardContent></Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-base">Weekly Sales</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={250}><LineChart data={weekly||[]}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" tick={{fontSize:12}}/><YAxis tick={{fontSize:12}}/><Tooltip/><Line type="monotone" dataKey="revenue" stroke="hsl(220,70%,50%)" strokeWidth={2}/></LineChart></ResponsiveContainer></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Payment Methods</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={250}><PieChart><Pie data={payment||[]} dataKey="total" nameKey="paymentMethod" cx="50%" cy="50%" outerRadius={80} label>{(payment||[]).map((_:any,i:number)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Order Types</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={250}><PieChart><Pie data={orderTypes||[]} dataKey="count" nameKey="orderType" cx="50%" cy="50%" outerRadius={80} label>{(orderTypes||[]).map((_:any,i:number)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Top Products</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={250}><BarChart data={top||[]} layout="vertical"><CartesianGrid strokeDasharray="3 3"/><XAxis type="number" tick={{fontSize:12}}/><YAxis type="category" dataKey="name" tick={{fontSize:12}} width={100}/><Tooltip/><Bar dataKey="totalSold" fill="hsl(220,70%,50%)" radius={[0,4,4,0]}/></BarChart></ResponsiveContainer></CardContent></Card>
      </div>
    </div>
  );
}
