import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Search, Eye } from 'lucide-react';
import api from '@/lib/api';
import { Customer, Order } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function CustomersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [detailCustomer, setDetailCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });

  const { data: customers } = useQuery({
    queryKey: ['customers', search],
    queryFn: () => api.get('/customers', { params: { search: search || undefined } }).then((r) => r.data),
  });

  const customerDetail = useQuery({
    queryKey: ['customer-detail', detailCustomer?.id],
    queryFn: () => api.get(`/customers/${detailCustomer!.id}`).then((r) => r.data),
    enabled: !!detailCustomer,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/customers', data),
    onSuccess: () => { toast.success('Customer created'); queryClient.invalidateQueries({ queryKey: ['customers'] }); setDialogOpen(false); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.patch(`/customers/${id}`, data),
    onSuccess: () => { toast.success('Updated'); queryClient.invalidateQueries({ queryKey: ['customers'] }); setDialogOpen(false); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const list: Customer[] = Array.isArray(customers) ? customers : customers?.data ?? [];

  const openCreate = () => { setEditCustomer(null); setForm({ name: '', email: '', phone: '', notes: '' }); setDialogOpen(true); };
  const openEdit = (c: Customer) => { setEditCustomer(c); setForm({ name: c.name, email: c.email || '', phone: c.phone || '', notes: c.notes || '' }); setDialogOpen(true); };
  const handleSubmit = () => {
    const data = { name: form.name, email: form.email || undefined, phone: form.phone || undefined, notes: form.notes || undefined };
    if (editCustomer) updateMutation.mutate({ id: editCustomer.id, data });
    else createMutation.mutate(data);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Add Customer</Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search customers..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead>Orders</TableHead><TableHead>Total Spent</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {list.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">{c.email || '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{c.phone || '—'}</TableCell>
                  <TableCell>{c.totalOrders ?? 0}</TableCell>
                  <TableCell>${Number(c.totalSpent ?? 0).toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailCustomer(c)}><Eye className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {list.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No customers</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editCustomer ? 'Edit Customer' : 'New Customer'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!form.name}>{editCustomer ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detailCustomer} onOpenChange={() => setDetailCustomer(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{detailCustomer?.name}</DialogTitle></DialogHeader>
          {customerDetail.data && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Email:</span> {customerDetail.data.email || '—'}</div>
                <div><span className="text-muted-foreground">Phone:</span> {customerDetail.data.phone || '—'}</div>
              </div>
              {customerDetail.data.notes && <p className="text-muted-foreground">{customerDetail.data.notes}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
