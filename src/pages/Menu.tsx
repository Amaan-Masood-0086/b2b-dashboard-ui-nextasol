import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Download, Pencil, Trash2, ShoppingBag } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { Product, Category } from '@/lib/types';
import { formatCurrency } from '@/lib/currency';
import { exportToCSV } from '@/lib/csv-export';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function MenuPage() {
  const { selectedBranchId } = useAuthStore();
  const branchId = selectedBranchId;
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', description: '', categoryId: '', price: '', costPrice: '', stock: '', lowStockThreshold: '', sku: '', imageUrl: '' });

  const { data: productsData } = useQuery({
    queryKey: ['products', branchId, page, search, categoryFilter],
    queryFn: () => api.get(`/branches/${branchId}/products`, {
      params: { page, limit: 20, search: search || undefined, categoryId: categoryFilter === 'all' ? undefined : categoryFilter || undefined },
    }).then((r) => r.data),
    enabled: !!branchId,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories', branchId],
    queryFn: () => api.get(`/branches/${branchId}/categories`).then((r) => r.data),
    enabled: !!branchId,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post(`/branches/${branchId}/products`, data),
    onSuccess: () => { toast.success('Product created'); queryClient.invalidateQueries({ queryKey: ['products'] }); setDialogOpen(false); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.patch(`/branches/${branchId}/products/${id}`, data),
    onSuccess: () => { toast.success('Product updated'); queryClient.invalidateQueries({ queryKey: ['products'] }); setDialogOpen(false); setEditProduct(null); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/branches/${branchId}/products/${id}`),
    onSuccess: () => { toast.success('Product deactivated'); queryClient.invalidateQueries({ queryKey: ['products'] }); },
  });

  const products: Product[] = productsData?.data ?? [];
  const totalPages = productsData?.totalPages ?? 1;
  const categoryList: Category[] = Array.isArray(categories) ? categories : categories?.data ?? [];

  const openCreate = () => {
    setEditProduct(null);
    setForm({ name: '', description: '', categoryId: '', price: '', costPrice: '', stock: '', lowStockThreshold: '', sku: '', imageUrl: '' });
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({
      name: p.name, description: p.description || '', categoryId: p.categoryId || '',
      price: String(p.price), costPrice: String(p.costPrice || ''), stock: String(p.stock),
      lowStockThreshold: String(p.lowStockThreshold || ''), sku: p.sku || '', imageUrl: p.imageUrl || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const data: any = {
      name: form.name, description: form.description || undefined, categoryId: form.categoryId || undefined,
      price: parseFloat(form.price), costPrice: form.costPrice ? parseFloat(form.costPrice) : undefined,
      stock: parseInt(form.stock), lowStockThreshold: form.lowStockThreshold ? parseInt(form.lowStockThreshold) : undefined,
      sku: form.sku || undefined, imageUrl: form.imageUrl || undefined,
    };
    if (editProduct) updateMutation.mutate({ id: editProduct.id, data });
    else createMutation.mutate(data);
  };

  if (!branchId) return <div className="flex items-center justify-center h-[60vh]"><p className="text-muted-foreground">Please select a branch.</p></div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportToCSV(products, [
            { header: 'Name', accessor: (p) => p.name },
            { header: 'Category', accessor: (p) => p.category?.name || '' },
            { header: 'Price', accessor: (p) => Number(p.price).toFixed(2) },
            { header: 'Cost', accessor: (p) => p.costPrice ? Number(p.costPrice).toFixed(2) : '' },
            { header: 'Stock', accessor: (p) => p.stock },
            { header: 'SKU', accessor: (p) => p.sku || '' },
          ], 'products')}>
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
          <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Add Product</Button>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {categoryList.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="w-12 pr-0">
                    <div className="h-9 w-9 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.category?.name || '—'}</TableCell>
                  <TableCell>{formatCurrency(Number(p.price))}</TableCell>
                  <TableCell>{p.costPrice ? formatCurrency(Number(p.costPrice)) : '—'}</TableCell>
                  <TableCell>
                    {p.stock}
                    {p.stock <= (p.lowStockThreshold || 5) && <Badge variant="outline" className="ml-2 text-[10px] text-warning border-warning/30">Low</Badge>}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{p.sku || '—'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteMutation.mutate(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {products.length === 0 && <TableRow><TableCell colSpan={8} className="text-center p-0"><EmptyState icon={ShoppingBag} title="No products yet" description="Add your first product to start building your menu." actionLabel="Add Product" onAction={openCreate} /></TableCell></TableRow>}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editProduct ? 'Edit Product' : 'New Product'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-1.5"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{categoryList.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Price *</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Cost Price</Label><Input type="number" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Stock *</Label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Low Stock Threshold</Label><Input type="number" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })} /></div>
            </div>
            <div className="space-y-1.5"><Label>SKU</Label><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
            <div className="space-y-1.5">
              <Label>Image URL</Label>
              <Input placeholder="https://example.com/image.jpg" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
              {form.imageUrl && (
                <div className="relative w-full h-32 rounded-md overflow-hidden border bg-muted">
                  <img
                    src={form.imageUrl}
                    alt="Product preview"
                    className="w-full h-full object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    onLoad={(e) => { (e.target as HTMLImageElement).style.display = 'block'; }}
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!form.name || !form.price}>
              {editProduct ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
