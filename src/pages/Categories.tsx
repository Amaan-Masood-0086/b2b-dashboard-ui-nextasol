import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function CategoriesPage() {
  const { selectedBranchId } = useAuthStore();
  const branchId = selectedBranchId;
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', sortOrder: '0' });

  const { data: categories } = useQuery({
    queryKey: ['categories', branchId],
    queryFn: () => api.get(`/branches/${branchId}/categories`).then((r) => r.data),
    enabled: !!branchId,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post(`/branches/${branchId}/categories`, data),
    onSuccess: () => { toast.success('Created'); queryClient.invalidateQueries({ queryKey: ['categories'] }); setDialogOpen(false); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.patch(`/branches/${branchId}/categories/${id}`, data),
    onSuccess: () => { toast.success('Updated'); queryClient.invalidateQueries({ queryKey: ['categories'] }); setDialogOpen(false); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/branches/${branchId}/categories/${id}`),
    onSuccess: () => { toast.success('Deleted'); queryClient.invalidateQueries({ queryKey: ['categories'] }); },
  });

  const list: Category[] = Array.isArray(categories) ? categories : categories?.data ?? [];

  const openCreate = () => { setEditCat(null); setForm({ name: '', sortOrder: '0' }); setDialogOpen(true); };
  const openEdit = (c: Category) => { setEditCat(c); setForm({ name: c.name, sortOrder: String(c.sortOrder) }); setDialogOpen(true); };
  const handleSubmit = () => {
    const data = { name: form.name, sortOrder: parseInt(form.sortOrder) };
    if (editCat) updateMutation.mutate({ id: editCat.id, data });
    else createMutation.mutate(data);
  };

  if (!branchId) return <div className="flex items-center justify-center h-[60vh]"><p className="text-muted-foreground">Please select a branch.</p></div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Add Category</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Sort Order</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {list.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.sortOrder}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteMutation.mutate(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {list.length === 0 && <TableRow><TableCell colSpan={3} className="text-center p-0"><EmptyState icon={Tag} title="No categories yet" description="Create categories to organize your menu products." actionLabel="Create Category" onAction={openCreate} /></TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editCat ? 'Edit Category' : 'New Category'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Sort Order</Label><Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!form.name}>{editCat ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
