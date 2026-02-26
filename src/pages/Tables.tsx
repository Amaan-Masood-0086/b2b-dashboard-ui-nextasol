import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, LayoutGrid } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { Table as TableType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  available: 'bg-success/10 text-success border-success/30',
  occupied: 'bg-destructive/10 text-destructive border-destructive/30',
  reserved: 'bg-warning/10 text-warning border-warning/30',
};

export default function TablesPage() {
  const { selectedBranchId } = useAuthStore();
  const branchId = selectedBranchId;
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ tableNumber: '', capacity: '4' });

  const { data: tables } = useQuery({
    queryKey: ['tables', branchId],
    queryFn: () => api.get(`/branches/${branchId}/tables`).then((r) => r.data),
    enabled: !!branchId,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post(`/branches/${branchId}/tables`, data),
    onSuccess: () => { toast.success('Table created'); queryClient.invalidateQueries({ queryKey: ['tables'] }); setDialogOpen(false); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.patch(`/branches/${branchId}/tables/${id}/status`, { status }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tables'] }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/branches/${branchId}/tables/${id}`),
    onSuccess: () => { toast.success('Table deleted'); queryClient.invalidateQueries({ queryKey: ['tables'] }); },
  });

  const list: TableType[] = Array.isArray(tables) ? tables : tables?.data ?? [];

  if (!branchId) return <div className="flex items-center justify-center h-[60vh]"><p className="text-muted-foreground">Please select a branch.</p></div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tables</h1>
        <Button size="sm" onClick={() => { setForm({ tableNumber: '', capacity: '4' }); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Add Table
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {list.map((table) => (
          <Card key={table.id} className="relative">
            <CardContent className="p-4 text-center space-y-2">
              <p className="font-bold text-lg">{table.tableNumber}</p>
              <p className="text-xs text-muted-foreground">Capacity: {table.capacity}</p>
              <Badge variant="outline" className={`capitalize ${statusColors[table.status] || ''}`}>{table.status}</Badge>
              <div className="pt-2 space-y-2">
                <Select value={table.status} onValueChange={(v) => updateStatus.mutate({ id: table.id, status: v })}>
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="sm" className="w-full h-7 text-xs text-destructive" onClick={() => deleteMutation.mutate(table.id)}>
                  <Trash2 className="h-3 w-3 mr-1" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {list.length === 0 && <div className="col-span-full"><EmptyState icon={LayoutGrid} title="No tables yet" description="Add tables for dine-in orders." actionLabel="Add Table" onAction={() => { setForm({ tableNumber: '', capacity: '4' }); setDialogOpen(true); }} /></div>}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Table</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Table Number</Label><Input value={form.tableNumber} onChange={(e) => setForm({ ...form, tableNumber: e.target.value })} placeholder="T-01" /></div>
            <div className="space-y-1.5"><Label>Capacity</Label><Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate({ tableNumber: form.tableNumber, capacity: parseInt(form.capacity) })} disabled={!form.tableNumber}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
