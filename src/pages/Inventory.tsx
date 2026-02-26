import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UpgradeGate } from '@/components/UpgradeGate';
import { AlertCircle, Download, Plus, Search, Package } from 'lucide-react';
import { format } from 'date-fns';
import { exportToCSV } from '@/lib/csv-export';
import { EmptyState } from '@/components/EmptyState';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function InventoryPage() {
  const { selectedBranchId } = useAuthStore();
  const branchId = selectedBranchId;
  const queryClient = useQueryClient();
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [form, setForm] = useState({ productId: '', quantity: '', type: 'manual_add', reason: '' });
  const [page, setPage] = useState(1);

  const { data: lowStock } = useQuery({
    queryKey: ['low-stock', branchId],
    queryFn: () => api.get(`/branches/${branchId}/inventory/low-stock`).then((r) => r.data),
    enabled: !!branchId,
  });

  const { data: logs } = useQuery({
    queryKey: ['inventory-logs', branchId, page],
    queryFn: () => api.get(`/branches/${branchId}/inventory/logs`, { params: { page, limit: 20 } }).then((r) => r.data),
    enabled: !!branchId,
  });

  const { data: products } = useQuery({
    queryKey: ['products-list', branchId],
    queryFn: () => api.get(`/branches/${branchId}/products`, { params: { limit: 100 } }).then((r) => r.data),
    enabled: !!branchId,
  });

  const adjustMutation = useMutation({
    mutationFn: (data: any) => api.post(`/branches/${branchId}/inventory/adjust`, data),
    onSuccess: () => {
      toast.success('Stock adjusted');
      queryClient.invalidateQueries({ queryKey: ['inventory-logs'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock'] });
      setAdjustOpen(false);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const lowStockList: Product[] = Array.isArray(lowStock) ? lowStock : lowStock?.data ?? [];
  const logList = Array.isArray(logs) ? logs : logs?.data ?? [];
  const productList: Product[] = Array.isArray(products) ? products : products?.data ?? [];

  if (!branchId) return <div className="flex items-center justify-center h-[60vh]"><p className="text-muted-foreground">Please select a branch.</p></div>;

  return (
    <UpgradeGate requiredPlan="Pro" featureName="Inventory Management">
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Inventory</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => exportToCSV(logList, [
              { header: 'Product', accessor: (l: any) => l.product?.name || '' },
              { header: 'Type', accessor: (l: any) => l.type?.replace('_', ' ') || '' },
              { header: 'Quantity', accessor: (l: any) => l.quantity },
              { header: 'Reason', accessor: (l: any) => l.reason || '' },
              { header: 'Date', accessor: (l: any) => format(new Date(l.createdAt), 'yyyy-MM-dd HH:mm') },
            ], 'inventory-logs')}>
              <Download className="h-4 w-4 mr-1" /> Export
            </Button>
            <Button size="sm" onClick={() => { setForm({ productId: '', quantity: '', type: 'manual_add', reason: '' }); setAdjustOpen(true); }}>
              <Plus className="h-4 w-4 mr-1" /> Adjust Stock
            </Button>
          </div>
        </div>

        {lowStockList.length > 0 && (
          <Card className="border-warning/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-warning"><AlertCircle className="h-4 w-4" /> Low Stock Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {lowStockList.map((p) => (
                  <Badge key={p.id} variant="outline" className="text-warning border-warning/30">{p.name} ({p.stock})</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle className="text-base">Stock Logs</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logList.map((log: any) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.product?.name || '—'}</TableCell>
                    <TableCell className="capitalize">{log.type?.replace('_', ' ')}</TableCell>
                    <TableCell>{log.quantity}</TableCell>
                    <TableCell className="text-muted-foreground">{log.reason || '—'}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{format(new Date(log.createdAt), 'MMM dd, HH:mm')}</TableCell>
                  </TableRow>
                ))}
                {logList.length === 0 && <TableRow><TableCell colSpan={5} className="text-center p-0"><EmptyState icon={Package} title="No inventory logs" description="Stock adjustments and sales will be tracked here." /></TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Adjust Stock</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Product</Label>
                <Select value={form.productId} onValueChange={(v) => setForm({ ...form, productId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                  <SelectContent>{productList.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual_add">Add</SelectItem>
                    <SelectItem value="manual_subtract">Subtract</SelectItem>
                    <SelectItem value="adjustment">Adjustment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Reason</Label><Textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAdjustOpen(false)}>Cancel</Button>
              <Button
                onClick={() => adjustMutation.mutate({ productId: form.productId, quantity: parseInt(form.quantity), type: form.type, reason: form.reason })}
                disabled={!form.productId || !form.quantity}
              >
                Adjust
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </UpgradeGate>
  );
}
