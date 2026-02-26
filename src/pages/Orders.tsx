import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Download, Eye, Search, XCircle, RotateCcw } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { Order } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/30',
  completed: 'bg-success/10 text-success border-success/30',
  voided: 'bg-destructive/10 text-destructive border-destructive/30',
  refunded: 'bg-info/10 text-info border-info/30',
};

export default function OrdersPage() {
  const { selectedBranchId, user } = useAuthStore();
  const branchId = selectedBranchId;
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionDialog, setActionDialog] = useState<{ type: 'void' | 'refund'; orderId: string } | null>(null);
  const [reason, setReason] = useState('');

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['orders', branchId, page, status],
    queryFn: () => api.get(`/branches/${branchId}/orders`, {
      params: { page, limit: 20, status: status === 'all' ? undefined : status || undefined },
    }).then((r) => r.data),
    enabled: !!branchId,
  });

  const orderDetail = useQuery({
    queryKey: ['order-detail', selectedOrder?.id],
    queryFn: () => api.get(`/orders/${selectedOrder!.id}`).then((r) => r.data),
    enabled: !!selectedOrder,
  });

  const voidOrder = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => api.post(`/orders/${id}/void`, { reason }),
    onSuccess: () => {
      toast.success('Order voided');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setActionDialog(null);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const refundOrder = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => api.post(`/orders/${id}/refund`, { reason }),
    onSuccess: () => {
      toast.success('Order refunded');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setActionDialog(null);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const handleExport = () => {
    window.open(`http://localhost:3000/api/v1/branches/${branchId}/export/orders`, '_blank');
  };

  const orders: Order[] = ordersData?.data ?? [];
  const totalPages = ordersData?.totalPages ?? 1;
  const canManage = user?.role === 'root_owner' || user?.role === 'branch_manager';

  if (!branchId) return <div className="flex items-center justify-center h-[60vh]"><p className="text-muted-foreground">Please select a branch.</p></div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-1" /> Export CSV
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search orders..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="voided">Voided</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell className="capitalize">{order.orderType?.replace('_', ' ')}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[order.status] || ''}>{order.status}</Badge>
                  </TableCell>
                  <TableCell>{order.items?.length ?? 0}</TableCell>
                  <TableCell className="font-medium">${Number(order.total).toFixed(2)}</TableCell>
                  <TableCell className="capitalize">{order.paymentMethod || '—'}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{format(new Date(order.createdAt), 'MMM dd, HH:mm')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedOrder(order)}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      {canManage && order.status === 'pending' && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { setActionDialog({ type: 'void', orderId: order.id }); setReason(''); }}>
                          <XCircle className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {canManage && order.status === 'completed' && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-warning" onClick={() => { setActionDialog({ type: 'refund', orderId: order.id }); setReason(''); }}>
                          <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No orders found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground self-center">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.orderNumber}</DialogTitle>
          </DialogHeader>
          {orderDetail.data && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Type:</span> {orderDetail.data.orderType?.replace('_', ' ')}</div>
                <div><span className="text-muted-foreground">Status:</span> {orderDetail.data.status}</div>
                <div><span className="text-muted-foreground">Payment:</span> {orderDetail.data.paymentMethod || '—'}</div>
                <div><span className="text-muted-foreground">Date:</span> {format(new Date(orderDetail.data.createdAt), 'PPp')}</div>
              </div>
              <div className="border rounded-lg divide-y">
                {orderDetail.data.items?.map((item: any, i: number) => (
                  <div key={i} className="p-2 flex justify-between">
                    <div>
                      <p className="font-medium">{item.product?.name || 'Product'} × {item.quantity}</p>
                      {item.notes && <p className="text-xs text-muted-foreground">{item.notes}</p>}
                    </div>
                    <p className="font-medium">${(item.unitPrice * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="text-right space-y-1">
                <p>Subtotal: ${Number(orderDetail.data.subtotal).toFixed(2)}</p>
                {orderDetail.data.discountAmount > 0 && <p className="text-destructive">Discount: -${Number(orderDetail.data.discountAmount).toFixed(2)}</p>}
                <p className="font-bold text-base">Total: ${Number(orderDetail.data.total).toFixed(2)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Void/Refund Dialog */}
      <Dialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionDialog?.type === 'void' ? 'Void Order' : 'Refund Order'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Reason</Label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Enter reason..." />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={!reason.trim()}
              onClick={() => {
                if (!actionDialog) return;
                if (actionDialog.type === 'void') voidOrder.mutate({ id: actionDialog.orderId, reason });
                else refundOrder.mutate({ id: actionDialog.orderId, reason });
              }}
            >
              {actionDialog?.type === 'void' ? 'Void Order' : 'Refund Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
