import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Clock, DollarSign, ArrowUp, ArrowDown } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { Shift } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ShiftsPage() {
  const { selectedBranchId } = useAuthStore();
  const branchId = selectedBranchId;
  const queryClient = useQueryClient();

  const [openShiftDialog, setOpenShiftDialog] = useState(false);
  const [closeShiftDialog, setCloseShiftDialog] = useState(false);
  const [cashMovementDialog, setCashMovementDialog] = useState(false);
  const [openingBalance, setOpeningBalance] = useState('');
  const [closingBalance, setClosingBalance] = useState('');
  const [movementType, setMovementType] = useState<'cash_in' | 'cash_out'>('cash_in');
  const [movementAmount, setMovementAmount] = useState('');
  const [movementReason, setMovementReason] = useState('');

  const { data: currentShift } = useQuery({
    queryKey: ['current-shift', branchId],
    queryFn: () => api.get(`/branches/${branchId}/shifts/current`).then((r) => r.data).catch(() => null),
    enabled: !!branchId,
  });

  const { data: history } = useQuery({
    queryKey: ['shift-history', branchId],
    queryFn: () => api.get(`/branches/${branchId}/shifts/history`).then((r) => r.data),
    enabled: !!branchId,
  });

  const openShift = useMutation({
    mutationFn: (data: any) => api.post(`/branches/${branchId}/shifts/open`, data),
    onSuccess: () => { toast.success('Shift opened'); queryClient.invalidateQueries({ queryKey: ['current-shift'] }); setOpenShiftDialog(false); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const closeShift = useMutation({
    mutationFn: (data: any) => api.post(`/branches/${branchId}/shifts/close`, data),
    onSuccess: () => { toast.success('Shift closed'); queryClient.invalidateQueries({ queryKey: ['current-shift'] }); queryClient.invalidateQueries({ queryKey: ['shift-history'] }); setCloseShiftDialog(false); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const cashMovement = useMutation({
    mutationFn: (data: any) => api.post(`/branches/${branchId}/shifts/cash-movement`, data),
    onSuccess: () => { toast.success('Recorded'); queryClient.invalidateQueries({ queryKey: ['current-shift'] }); setCashMovementDialog(false); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const historyList: Shift[] = Array.isArray(history) ? history : history?.data ?? [];

  if (!branchId) return <div className="flex items-center justify-center h-[60vh]"><p className="text-muted-foreground">Please select a branch.</p></div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Shifts</h1>
        <div className="flex gap-2">
          {currentShift ? (
            <>
              <Button size="sm" variant="outline" onClick={() => setCashMovementDialog(true)}>Cash Movement</Button>
              <Button size="sm" variant="destructive" onClick={() => { setClosingBalance(''); setCloseShiftDialog(true); }}>Close Shift</Button>
            </>
          ) : (
            <Button size="sm" onClick={() => { setOpeningBalance(''); setOpenShiftDialog(true); }}>Open Shift</Button>
          )}
        </div>
      </div>

      {currentShift && (
        <Card className="border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" /> Current Shift</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><span className="text-muted-foreground">Opened:</span><br />{format(new Date(currentShift.openedAt), 'PPp')}</div>
              <div><span className="text-muted-foreground">Opening Balance:</span><br />{formatCurrency(Number(currentShift.openingBalance))}</div>
              <div><span className="text-muted-foreground">Expected Balance:</span><br />{formatCurrency(Number(currentShift.expectedBalance ?? 0))}</div>
              <div><span className="text-muted-foreground">Total Sales:</span><br />{formatCurrency(Number(currentShift.totalSales ?? 0))}</div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Shift History</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Opened</TableHead>
                <TableHead>Closed</TableHead>
                <TableHead>Opening</TableHead>
                <TableHead>Closing</TableHead>
                <TableHead>Expected</TableHead>
                <TableHead>Variance</TableHead>
                <TableHead>Sales</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyList.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="text-sm">{format(new Date(s.openedAt), 'MMM dd, HH:mm')}</TableCell>
                  <TableCell className="text-sm">{s.closedAt ? format(new Date(s.closedAt), 'MMM dd, HH:mm') : '—'}</TableCell>
                  <TableCell>{formatCurrency(Number(s.openingBalance))}</TableCell>
                  <TableCell>{s.closingBalance != null ? formatCurrency(Number(s.closingBalance)) : '—'}</TableCell>
                  <TableCell>{s.expectedBalance != null ? formatCurrency(Number(s.expectedBalance)) : '—'}</TableCell>
                  <TableCell>
                    {s.variance != null ? (
                      <span className={Number(s.variance) >= 0 ? 'text-success' : 'text-destructive'}>
                        {formatCurrency(Number(s.variance))}
                      </span>
                    ) : '—'}
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(Number(s.totalSales ?? 0))}</TableCell>
                </TableRow>
              ))}
              {historyList.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No shift history</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={openShiftDialog} onOpenChange={setOpenShiftDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Open Shift</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Label>Opening Balance</Label>
            <Input type="number" value={openingBalance} onChange={(e) => setOpeningBalance(e.target.value)} placeholder="0.00" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenShiftDialog(false)}>Cancel</Button>
            <Button onClick={() => openShift.mutate({ openingBalance: parseFloat(openingBalance) })} disabled={!openingBalance}>Open</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={closeShiftDialog} onOpenChange={setCloseShiftDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Close Shift</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Label>Closing Balance</Label>
            <Input type="number" value={closingBalance} onChange={(e) => setClosingBalance(e.target.value)} placeholder="0.00" />
            {currentShift && closingBalance && (
              <p className="text-sm">
                Variance: <span className={Number(closingBalance) - Number(currentShift.expectedBalance ?? 0) >= 0 ? 'text-success' : 'text-destructive'}>
                  ${(Number(closingBalance) - Number(currentShift.expectedBalance ?? 0)).toFixed(2)}
                </span>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloseShiftDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => closeShift.mutate({ closingBalance: parseFloat(closingBalance) })} disabled={!closingBalance}>Close Shift</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cashMovementDialog} onOpenChange={setCashMovementDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cash Movement</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={movementType} onValueChange={(v: any) => setMovementType(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash_in">Cash In</SelectItem>
                  <SelectItem value="cash_out">Cash Out</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Amount</Label><Input type="number" value={movementAmount} onChange={(e) => setMovementAmount(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Reason</Label><Input value={movementReason} onChange={(e) => setMovementReason(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCashMovementDialog(false)}>Cancel</Button>
            <Button onClick={() => cashMovement.mutate({ type: movementType, amount: parseFloat(movementAmount), reason: movementReason })} disabled={!movementAmount}>Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
