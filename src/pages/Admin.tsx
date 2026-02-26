import { useQuery } from '@tanstack/react-query';
import { Building2, Users, CreditCard, DollarSign } from 'lucide-react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AdminDashboard() {
  const { data } = useQuery({ queryKey: ['admin-dashboard'], queryFn: () => api.get('/admin/dashboard').then(r => r.data) });
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm text-muted-foreground">Merchants</CardTitle><Building2 className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><p className="text-2xl font-bold">{data?.totalMerchants ?? 0}</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm text-muted-foreground">Subscriptions</CardTitle><CreditCard className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><p className="text-2xl font-bold">{data?.activeSubscriptions ?? 0}</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm text-muted-foreground">Revenue</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><p className="text-2xl font-bold">${Number(data?.totalRevenue ?? 0).toFixed(2)}</p></CardContent></Card>
      </div>
    </div>
  );
}

export function AdminMerchants() {
  const { data } = useQuery({ queryKey: ['admin-merchants'], queryFn: () => api.get('/admin/merchants').then(r => r.data) });
  const list = Array.isArray(data) ? data : data?.data ?? [];
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Merchants</h1>
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>Business</TableHead><TableHead>Plan</TableHead><TableHead>Branches</TableHead><TableHead>Status</TableHead><TableHead>Created</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {list.map((m: any) => <TableRow key={m.id}>
              <TableCell className="font-medium">{m.businessName}</TableCell>
              <TableCell>{m.planName || m.currency}</TableCell>
              <TableCell>{m.branchCount ?? '—'}</TableCell>
              <TableCell><Badge variant={m.status === 'active' ? 'default' : 'destructive'} className="capitalize">{m.status || 'active'}</Badge></TableCell>
              <TableCell className="text-muted-foreground text-sm">{m.createdAt?.slice(0,10)}</TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="outline" onClick={() => window.location.href = `/admin/merchants/${m.id}`}>View Details</Button>
              </TableCell>
            </TableRow>)}
            {list.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No merchants</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}

export function AdminSubscriptions() {
  const queryClient = useQueryClient();
  const [planDialog, setPlanDialog] = useState(false);
  const [planForm, setPlanForm] = useState({ name: '', pricePerBranch: '' });

  const { data: subs } = useQuery({ queryKey: ['admin-subs'], queryFn: () => api.get('/admin/subscriptions').then(r => r.data) });
  const { data: plans } = useQuery({ queryKey: ['sub-plans'], queryFn: () => api.get('/subscription-plans').then(r => r.data) });

  const activate = useMutation({ mutationFn: (id: string) => api.post(`/admin/subscriptions/${id}/activate`), onSuccess: () => { toast.success('Activated'); queryClient.invalidateQueries({ queryKey: ['admin-subs'] }); } });
  const suspend = useMutation({ mutationFn: (id: string) => api.post(`/admin/subscriptions/${id}/suspend`), onSuccess: () => { toast.success('Suspended'); queryClient.invalidateQueries({ queryKey: ['admin-subs'] }); } });
  const createPlan = useMutation({ mutationFn: (d: any) => api.post('/admin/subscription-plans', d), onSuccess: () => { toast.success('Plan created'); queryClient.invalidateQueries({ queryKey: ['sub-plans'] }); setPlanDialog(false); } });

  const subList = Array.isArray(subs) ? subs : subs?.data ?? [];
  const planList = Array.isArray(plans) ? plans : plans?.data ?? [];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Subscriptions</h1>
      <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Plans</h2><Button size="sm" onClick={() => { setPlanForm({ name: '', pricePerBranch: '' }); setPlanDialog(true); }}>Create Plan</Button></div>
      <div className="grid gap-3 md:grid-cols-3">
        {planList.map((p: any) => <Card key={p.id}><CardContent className="pt-6"><p className="font-semibold">{p.name}</p><p className="text-2xl font-bold mt-1">${p.pricePerBranch}<span className="text-sm text-muted-foreground">/branch</span></p></CardContent></Card>)}
      </div>
      <h2 className="text-lg font-semibold">Active Subscriptions</h2>
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>Merchant</TableHead><TableHead>Plan</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {subList.map((s: any) => <TableRow key={s.id}>
              <TableCell className="font-medium">{s.merchant?.businessName || '—'}</TableCell>
              <TableCell>{s.plan?.name || '—'}</TableCell>
              <TableCell><Badge variant="outline" className="capitalize">{s.status}</Badge></TableCell>
              <TableCell className="text-right space-x-1">
                <Button size="sm" variant="outline" onClick={() => activate.mutate(s.id)}>Activate</Button>
                <Button size="sm" variant="outline" className="text-destructive" onClick={() => suspend.mutate(s.id)}>Suspend</Button>
              </TableCell>
            </TableRow>)}
          </TableBody>
        </Table>
      </CardContent></Card>
      <Dialog open={planDialog} onOpenChange={setPlanDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Plan</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Name</Label><Input value={planForm.name} onChange={e => setPlanForm({...planForm, name: e.target.value})} /></div>
            <div className="space-y-1.5"><Label>Price Per Branch</Label><Input type="number" value={planForm.pricePerBranch} onChange={e => setPlanForm({...planForm, pricePerBranch: e.target.value})} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setPlanDialog(false)}>Cancel</Button><Button onClick={() => createPlan.mutate({ name: planForm.name, pricePerBranch: parseFloat(planForm.pricePerBranch) })}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
