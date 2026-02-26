import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Copy, Tag, Ticket, Truck, Gift, Check } from 'lucide-react';
import api from '@/lib/api';
import { Membership } from '@/lib/types';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const BENEFIT_LABELS: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  percentage_discount: { label: 'Percentage Discount', icon: Tag, color: 'bg-primary/10 text-primary' },
  fixed_discount: { label: 'Fixed Discount', icon: Ticket, color: 'bg-success/10 text-success' },
  free_delivery: { label: 'Free Delivery', icon: Truck, color: 'bg-accent/80 text-accent-foreground' },
  custom_deal: { label: 'Custom Deal', icon: Gift, color: 'bg-warning/10 text-warning' },
};

export default function MembershipsPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMembership, setEditMembership] = useState<Membership | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', code: '', benefitType: 'percentage_discount' as Membership['benefitType'],
    benefitValue: 0, description: '', isActive: true, validFrom: '', validUntil: '',
  });

  const { data: memberships } = useQuery({
    queryKey: ['memberships'],
    queryFn: () => api.get('/memberships').then((r: any) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/memberships', data),
    onSuccess: () => { toast.success('Membership created!'); queryClient.invalidateQueries({ queryKey: ['memberships'] }); setDialogOpen(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.patch(`/memberships/${id}`, data),
    onSuccess: () => { toast.success('Membership updated!'); queryClient.invalidateQueries({ queryKey: ['memberships'] }); setDialogOpen(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/memberships/${id}`),
    onSuccess: () => { toast.success('Membership deleted!'); queryClient.invalidateQueries({ queryKey: ['memberships'] }); setDeleteConfirm(null); },
  });

  const list: Membership[] = Array.isArray(memberships) ? memberships : [];

  const openCreate = () => {
    setEditMembership(null);
    setForm({ name: '', code: '', benefitType: 'percentage_discount', benefitValue: 0, description: '', isActive: true, validFrom: '', validUntil: '' });
    setDialogOpen(true);
  };

  const openEdit = (m: Membership) => {
    setEditMembership(m);
    setForm({
      name: m.name, code: m.code, benefitType: m.benefitType, benefitValue: m.benefitValue,
      description: m.description, isActive: m.isActive, validFrom: m.validFrom || '', validUntil: m.validUntil || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const data = { ...form, benefitValue: Number(form.benefitValue), validFrom: form.validFrom || undefined, validUntil: form.validUntil || undefined };
    if (editMembership) updateMutation.mutate({ id: editMembership.id, data });
    else createMutation.mutate(data);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied!');
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
    setForm({ ...form, code });
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Memberships</h1>
          <p className="text-sm text-muted-foreground">Create custom memberships with discounts, deals, or free delivery for your customers.</p>
        </div>
        <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> New Membership</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{list.length}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-success">{list.filter(m => m.isActive).length}</p><p className="text-xs text-muted-foreground">Active</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{list.filter(m => m.benefitType === 'percentage_discount' || m.benefitType === 'fixed_discount').length}</p><p className="text-xs text-muted-foreground">Discounts</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{list.filter(m => m.benefitType === 'free_delivery' || m.benefitType === 'custom_deal').length}</p><p className="text-xs text-muted-foreground">Deals</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Benefit</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Validity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((m) => {
                const benefit = BENEFIT_LABELS[m.benefitType];
                const Icon = benefit?.icon || Tag;
                return (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{m.code}</code>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyCode(m.code)}><Copy className="h-3 w-3" /></Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={benefit?.color}>
                        <Icon className="h-3 w-3 mr-1" />{benefit?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {m.benefitType === 'percentage_discount' ? `${m.benefitValue}%` :
                       m.benefitType === 'fixed_discount' ? `$${m.benefitValue}` : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={m.isActive ? 'default' : 'secondary'}>{m.isActive ? 'Active' : 'Inactive'}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {m.validFrom && m.validUntil ? `${m.validFrom} → ${m.validUntil}` : m.validFrom ? `From ${m.validFrom}` : '∞'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(m)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteConfirm(m.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {list.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center p-0">
                  <EmptyState icon={Ticket} title="No memberships yet" description="Create memberships to offer discounts and deals to your customers." actionLabel="New Membership" onAction={openCreate} />
                </TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editMembership ? 'Edit Membership' : 'New Membership'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Gold Member" /></div>
            <div className="space-y-1.5">
              <Label>Code *</Label>
              <div className="flex gap-2">
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="GOLD2026" className="font-mono" />
                <Button variant="outline" size="sm" onClick={generateCode} type="button">Generate</Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Benefit Type *</Label>
              <Select value={form.benefitType} onValueChange={(v) => setForm({ ...form, benefitType: v as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage_discount">Percentage Discount (%)</SelectItem>
                  <SelectItem value="fixed_discount">Fixed Discount ($)</SelectItem>
                  <SelectItem value="free_delivery">Free Delivery</SelectItem>
                  <SelectItem value="custom_deal">Custom Deal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(form.benefitType === 'percentage_discount' || form.benefitType === 'fixed_discount') && (
              <div className="space-y-1.5">
                <Label>{form.benefitType === 'percentage_discount' ? 'Discount %' : 'Discount Amount ($)'}</Label>
                <Input type="number" value={form.benefitValue || ''} onChange={(e) => setForm({ ...form, benefitValue: parseFloat(e.target.value) || 0 })} />
              </div>
            )}
            <div className="space-y-1.5"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the membership benefit..." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Valid From</Label><Input type="date" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Valid Until</Label><Input type="date" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} /></div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!form.name || !form.code}>{editMembership ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Membership?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This will remove the membership and unlink it from all customers. This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
