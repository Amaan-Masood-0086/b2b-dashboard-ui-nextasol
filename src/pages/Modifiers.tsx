import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { ModifierGroup } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface OptionForm { name: string; priceAdjustment: string; sortOrder: string; }

export default function ModifiersPage() {
  const { selectedBranchId } = useAuthStore();
  const branchId = selectedBranchId;
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<ModifierGroup | null>(null);
  const [name, setName] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [maxSelect, setMaxSelect] = useState('1');
  const [options, setOptions] = useState<OptionForm[]>([]);

  const { data: modifiers } = useQuery({
    queryKey: ['modifiers', branchId],
    queryFn: () => api.get(`/branches/${branchId}/modifiers`).then((r) => r.data),
    enabled: !!branchId,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post(`/branches/${branchId}/modifiers`, data),
    onSuccess: () => { toast.success('Created'); queryClient.invalidateQueries({ queryKey: ['modifiers'] }); setDialogOpen(false); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.patch(`/branches/${branchId}/modifiers/${id}`, data),
    onSuccess: () => { toast.success('Updated'); queryClient.invalidateQueries({ queryKey: ['modifiers'] }); setDialogOpen(false); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/branches/${branchId}/modifiers/${id}`),
    onSuccess: () => { toast.success('Deleted'); queryClient.invalidateQueries({ queryKey: ['modifiers'] }); },
  });

  const list: ModifierGroup[] = Array.isArray(modifiers) ? modifiers : modifiers?.data ?? [];

  const openCreate = () => {
    setEditGroup(null); setName(''); setIsRequired(false); setMaxSelect('1'); setOptions([{ name: '', priceAdjustment: '0', sortOrder: '0' }]);
    setDialogOpen(true);
  };

  const openEdit = (g: ModifierGroup) => {
    setEditGroup(g); setName(g.name); setIsRequired(g.isRequired); setMaxSelect(String(g.maxSelect));
    setOptions(g.options.map((o) => ({ name: o.name, priceAdjustment: String(o.priceAdjustment), sortOrder: String(o.sortOrder) })));
    setDialogOpen(true);
  };

  const addOption = () => setOptions([...options, { name: '', priceAdjustment: '0', sortOrder: String(options.length) }]);
  const removeOption = (i: number) => setOptions(options.filter((_, idx) => idx !== i));
  const updateOption = (i: number, field: keyof OptionForm, val: string) => {
    const next = [...options]; next[i] = { ...next[i], [field]: val }; setOptions(next);
  };

  const handleSubmit = () => {
    const data = {
      name, isRequired, maxSelect: parseInt(maxSelect),
      options: options.filter((o) => o.name).map((o) => ({ name: o.name, priceAdjustment: parseFloat(o.priceAdjustment), sortOrder: parseInt(o.sortOrder) })),
    };
    if (editGroup) updateMutation.mutate({ id: editGroup.id, data });
    else createMutation.mutate(data);
  };

  if (!branchId) return <div className="flex items-center justify-center h-[60vh]"><p className="text-muted-foreground">Please select a branch.</p></div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Modifiers</h1>
        <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Add Modifier Group</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Required</TableHead><TableHead>Max Select</TableHead><TableHead>Options</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {list.map((g) => (
                <TableRow key={g.id}>
                  <TableCell className="font-medium">{g.name}</TableCell>
                  <TableCell>{g.isRequired ? <Badge className="bg-primary/10 text-primary border-primary/30" variant="outline">Yes</Badge> : 'No'}</TableCell>
                  <TableCell>{g.maxSelect}</TableCell>
                  <TableCell>{g.options?.length ?? 0}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(g)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteMutation.mutate(g.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {list.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No modifier groups</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editGroup ? 'Edit Modifier Group' : 'New Modifier Group'}</DialogTitle></DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-1.5"><Label>Group Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2"><Switch checked={isRequired} onCheckedChange={setIsRequired} /><Label>Required</Label></div>
              <div className="space-y-1.5"><Label>Max Select</Label><Input type="number" className="w-20" value={maxSelect} onChange={(e) => setMaxSelect(e.target.value)} /></div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2"><Label>Options</Label><Button size="sm" variant="outline" onClick={addOption}><Plus className="h-3 w-3 mr-1" />Add</Button></div>
              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input placeholder="Name" value={opt.name} onChange={(e) => updateOption(i, 'name', e.target.value)} className="flex-1" />
                    <Input placeholder="Price" type="number" value={opt.priceAdjustment} onChange={(e) => updateOption(i, 'priceAdjustment', e.target.value)} className="w-20" />
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => removeOption(i)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!name || options.filter((o) => o.name).length === 0}>{editGroup ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
