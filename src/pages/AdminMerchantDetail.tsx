import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Building2, CreditCard, Users, MapPin, Phone, Globe, Calendar, StickyNote, ShoppingBag, Send } from 'lucide-react';
import api from '@/lib/api';
import { DEMO_ADMIN_USERS, DEMO_BILLING_PLANS } from '@/lib/demo-data';
import { formatCurrency } from '@/lib/currency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function AdminMerchantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [noteText, setNoteText] = useState('');
  const [changePlanOpen, setChangePlanOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');

  const { data: merchant } = useQuery({
    queryKey: ['admin-merchant', id],
    queryFn: () => api.get(`/admin/merchants/${id}`).then((r: any) => r.data),
  });

  const { data: branches } = useQuery({
    queryKey: ['admin-merchant-branches', id],
    queryFn: () => api.get(`/admin/merchants/${id}/branches`).then((r: any) => r.data),
  });

  const { data: recentOrders } = useQuery({
    queryKey: ['admin-merchant-orders', id],
    queryFn: () => api.get(`/admin/merchants/${id}/orders`).then((r: any) => r.data),
  });

  const { data: notes } = useQuery({
    queryKey: ['admin-merchant-notes', id],
    queryFn: () => api.get(`/admin/merchants/${id}/notes`).then((r: any) => r.data),
  });

  const merchantUsers = DEMO_ADMIN_USERS.filter((u) => u.merchantId === id);

  const addNoteMut = useMutation({
    mutationFn: () => api.post(`/admin/merchants/${id}/notes`, { text: noteText }),
    onSuccess: () => {
      toast.success('Note added');
      setNoteText('');
      queryClient.invalidateQueries({ queryKey: ['admin-merchant-notes', id] });
    },
  });

  const changePlanMut = useMutation({
    mutationFn: () => api.patch(`/admin/merchants/${id}/plan`, { planId: selectedPlan }),
    onSuccess: () => {
      toast.success('Plan updated');
      setChangePlanOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-merchant', id] });
    },
  });

  if (!merchant) return <div className="p-6 text-muted-foreground">Loading...</div>;

  const handleSuspend = () => toast.success(`${merchant.businessName} ${merchant.status === 'suspended' ? 'reactivated' : 'suspended'}`);

  const subStatusColor = merchant.subscriptionStatus === 'active' ? 'default' : merchant.subscriptionStatus === 'trialing' ? 'secondary' : 'destructive';
  const ordersArray = Array.isArray(recentOrders) ? recentOrders : [];
  const totalRevenue = ordersArray.filter((o: any) => o.status === 'completed').reduce((s: number, o: any) => s + o.total, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/merchants')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{merchant.businessName}</h1>
          <p className="text-sm text-muted-foreground">
            {merchant.businessType} · Merchant ID: {merchant.id}
          </p>
        </div>
        <Badge variant={merchant.status === 'active' ? 'default' : 'destructive'} className="capitalize text-sm">
          {merchant.status}
        </Badge>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Plan</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{merchant.planName}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Branches</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{merchant.branchCount}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{merchant.userCount}</p></CardContent>
        </Card>
      </div>

      {/* Subscription Details */}
      <Card>
        <CardHeader><CardTitle className="text-base">Subscription Details</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge variant={subStatusColor} className="capitalize mt-1">{merchant.subscriptionStatus?.replace('_', ' ')}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Price</p>
              <p className="font-semibold mt-1">{formatCurrency(merchant.planPrice)}/branch/mo</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Next Billing</p>
              <p className="font-semibold mt-1 flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{merchant.nextBillingDate ? new Date(merchant.nextBillingDate).toLocaleDateString() : '—'}</p>
            </div>
            {merchant.trialEnd && (
              <div>
                <p className="text-xs text-muted-foreground">Trial Ends</p>
                <p className="font-semibold mt-1 text-warning">{new Date(merchant.trialEnd).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Business Information */}
      <Card>
        <CardHeader><CardTitle className="text-base">Business Information</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" /> {merchant.address}</div>
          <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" /> {merchant.phone}</div>
          <div className="flex items-center gap-2 text-sm"><Globe className="h-4 w-4 text-muted-foreground" /> {merchant.currency} · {merchant.timezone}</div>
          <Separator />
          <p className="text-xs text-muted-foreground">Created: {merchant.createdAt}</p>
        </CardContent>
      </Card>

      {/* Branches Table */}
      <Card>
        <CardHeader><CardTitle className="text-base">Branches ({(Array.isArray(branches) ? branches : []).length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(Array.isArray(branches) ? branches : []).map((b: any) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.name}</TableCell>
                  <TableCell className="text-muted-foreground">{b.address}</TableCell>
                  <TableCell className="text-muted-foreground">{b.phone}</TableCell>
                  <TableCell><Badge variant={b.status === 'active' ? 'default' : 'secondary'} className="capitalize">{b.status}</Badge></TableCell>
                </TableRow>
              ))}
              {(!Array.isArray(branches) || branches.length === 0) && (
                <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No branches</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><ShoppingBag className="h-4 w-4" /> Recent Orders</CardTitle>
            <p className="text-sm text-muted-foreground">Revenue: <span className="font-semibold text-foreground">{formatCurrency(totalRevenue)}</span></p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordersArray.map((o: any) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.orderNumber}</TableCell>
                  <TableCell>{formatCurrency(o.total)}</TableCell>
                  <TableCell><Badge variant={o.status === 'completed' ? 'default' : o.status === 'pending' ? 'secondary' : 'destructive'} className="capitalize">{o.status}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{new Date(o.date).toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {ordersArray.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No recent orders</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Staff */}
      <Card>
        <CardHeader><CardTitle className="text-base">Staff ({merchantUsers.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {merchantUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.firstName} {u.lastName}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{u.role.replace('_', ' ')}</Badge></TableCell>
                  <TableCell><Badge variant={u.isActive ? 'default' : 'secondary'}>{u.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                </TableRow>
              ))}
              {merchantUsers.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No users found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Admin Notes */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><StickyNote className="h-4 w-4" /> Admin Notes</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {(Array.isArray(notes) ? notes : []).length > 0 && (
            <div className="space-y-3">
              {(Array.isArray(notes) ? notes : []).map((n: any) => (
                <div key={n.id} className="rounded-lg border p-3">
                  <p className="text-sm">{n.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">{n.author} · {new Date(n.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Textarea placeholder="Add a note..." value={noteText} onChange={(e) => setNoteText(e.target.value)} className="min-h-[60px]" />
            <Button size="icon" onClick={() => addNoteMut.mutate()} disabled={!noteText.trim() || addNoteMut.isPending}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant={merchant.status === 'suspended' ? 'default' : 'destructive'} onClick={handleSuspend}>
          {merchant.status === 'suspended' ? 'Reactivate Merchant' : 'Suspend Merchant'}
        </Button>
        <Dialog open={changePlanOpen} onOpenChange={setChangePlanOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Change Plan</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Change Plan for {merchant.businessName}</DialogTitle></DialogHeader>
            <div className="py-4">
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger><SelectValue placeholder="Select a plan" /></SelectTrigger>
                <SelectContent>
                  {DEMO_BILLING_PLANS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} — {formatCurrency(p.pricePerBranch)}/branch/mo</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setChangePlanOpen(false)}>Cancel</Button>
              <Button onClick={() => changePlanMut.mutate()} disabled={!selectedPlan || changePlanMut.isPending}>Update Plan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
