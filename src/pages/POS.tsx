import { useState, useEffect, useRef } from 'react';
import { LiveOrderTicker } from '@/components/LiveOrderTicker';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Minus, Trash2, ShoppingBag, X, PanelRightOpen, PanelRightClose } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { useCartStore, CartModifier } from '@/stores/cart-store';
import { Product, Category, Table, ModifierGroup, Customer } from '@/lib/types';
import { formatCurrency } from '@/lib/currency';
import { ReceiptDialog } from '@/components/pos/ReceiptDialog';
import { KeyboardShortcutsDialog } from '@/components/KeyboardShortcutsDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function POSPage() {
  const { selectedBranchId } = useAuthStore();
  const branchId = selectedBranchId;
  const queryClient = useQueryClient();
  const searchRef = useRef<HTMLInputElement>(null);

  const cart = useCartStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [modifierProduct, setModifierProduct] = useState<Product | null>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<CartModifier[]>([]);
  const [cartOpen, setCartOpen] = useState(true);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'split'>('cash');
  const [amountReceived, setAmountReceived] = useState('');
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      if (e.key === 'F2') {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (e.key === 'Escape') {
        if (checkoutOpen) setCheckoutOpen(false);
        else if (modifierProduct) setModifierProduct(null);
        else if (search) setSearch('');
        return;
      }
      if (isInput) return;
      if (e.key === 'Enter' && cart.items.length > 0 && !checkoutOpen && !modifierProduct) {
        e.preventDefault();
        setCheckoutOpen(true);
      }
      if (e.key === 'Delete' && cart.items.length > 0 && !checkoutOpen) {
        if (confirm('Clear cart?')) cart.clearCart();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [checkoutOpen, modifierProduct, search, cart.items.length]);

  const { data: categories } = useQuery({
    queryKey: ['categories', branchId],
    queryFn: () => api.get(`/branches/${branchId}/categories`).then((r) => r.data),
    enabled: !!branchId,
  });

  const { data: productsData } = useQuery({
    queryKey: ['products', branchId, search, selectedCategory],
    queryFn: () => api.get(`/branches/${branchId}/products`, {
      params: { search: search || undefined, categoryId: selectedCategory || undefined, limit: 100 },
    }).then((r) => r.data),
    enabled: !!branchId,
  });

  const { data: tables } = useQuery({
    queryKey: ['tables', branchId],
    queryFn: () => api.get(`/branches/${branchId}/tables`).then((r) => r.data),
    enabled: !!branchId,
  });

  const { data: customersData } = useQuery({
    queryKey: ['customers'],
    queryFn: () => api.get('/customers').then((r) => r.data),
  });

  const { data: currentShift } = useQuery({
    queryKey: ['current-shift', branchId],
    queryFn: () => api.get(`/branches/${branchId}/shifts/current`).then((r) => r.data).catch(() => null),
    enabled: !!branchId,
  });

  const createOrder = useMutation({
    mutationFn: (data: any) => api.post(`/branches/${branchId}/orders`, data),
  });

  const checkoutOrder = useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: any }) =>
      api.post(`/orders/${orderId}/checkout`, data),
  });

  const products: Product[] = Array.isArray(productsData) ? productsData : productsData?.data ?? [];
  const categoryList: Category[] = Array.isArray(categories) ? categories : categories?.data ?? [];
  const tableList: Table[] = Array.isArray(tables) ? tables : tables?.data ?? [];
  const customerList: Customer[] = Array.isArray(customersData) ? customersData : customersData?.data ?? [];

  const handleAddProduct = (product: Product) => {
    if (product.modifierGroups && product.modifierGroups.length > 0) {
      setModifierProduct(product);
      setSelectedModifiers([]);
    } else {
      cart.addItem({ productId: product.id, name: product.name, price: product.price, quantity: 1, notes: '', modifiers: [], imageUrl: product.imageUrl });
    }
  };

  const handleConfirmModifiers = () => {
    if (!modifierProduct) return;
    cart.addItem({
      productId: modifierProduct.id,
      name: modifierProduct.name,
      price: modifierProduct.price,
      quantity: 1,
      notes: '',
      modifiers: selectedModifiers,
      imageUrl: modifierProduct.imageUrl,
    });
    setModifierProduct(null);
    setSelectedModifiers([]);
  };

  const toggleModifier = (group: ModifierGroup, option: { id: string; name: string; priceAdjustment: number }) => {
    setSelectedModifiers((prev) => {
      const existing = prev.find((m) => m.optionId === option.id);
      if (existing) return prev.filter((m) => m.optionId !== option.id);

      const groupSelections = prev.filter((m) => m.groupId === group.id);
      if (group.maxSelect && groupSelections.length >= group.maxSelect) {
        if (group.maxSelect === 1) {
          return [...prev.filter((m) => m.groupId !== group.id), { groupId: group.id, groupName: group.name, optionId: option.id, optionName: option.name, priceAdjustment: option.priceAdjustment }];
        }
        return prev;
      }
      return [...prev, { groupId: group.id, groupName: group.name, optionId: option.id, optionName: option.name, priceAdjustment: option.priceAdjustment }];
    });
  };

  const handleCheckout = async () => {
    if (cart.items.length === 0) return;

    try {
      const orderData = {
        orderType: cart.orderType,
        tableId: cart.orderType === 'dine_in' ? cart.tableId : undefined,
        items: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          notes: item.notes || undefined,
          modifiers: item.modifiers.map((m) => ({ groupId: m.groupId, optionId: m.optionId })),
        })),
        discountType: cart.discountType || undefined,
        discountAmount: cart.discountAmount || undefined,
        notes: cart.notes || undefined,
        customerId: cart.customerId || undefined,
      };

      const orderRes: any = await createOrder.mutateAsync(orderData);
      const orderId = orderRes.data.id;
      const orderNumber = orderRes.data.orderNumber;

      await checkoutOrder.mutateAsync({
        orderId,
        data: {
          paymentMethod,
          amountReceived: paymentMethod === 'cash' ? parseFloat(amountReceived) : undefined,
        },
      });

      const receiptInfo = {
        orderNumber,
        items: [...cart.items],
        subtotal,
        discount,
        total,
        paymentMethod,
        amountReceived: paymentMethod === 'cash' ? parseFloat(amountReceived) : undefined,
        change: paymentMethod === 'cash' ? parseFloat(amountReceived) - total : undefined,
        orderType: cart.orderType,
      };

      toast.success(`Order #${orderNumber} completed!`);
      cart.clearCart();
      setCheckoutOpen(false);
      setAmountReceived('');
      setReceiptData(receiptInfo);
      setReceiptOpen(true);
      queryClient.invalidateQueries({ queryKey: ['products', branchId] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    }
  };

  if (!branchId) {
    return <div className="flex items-center justify-center h-[60vh]"><p className="text-muted-foreground">Please select a branch.</p></div>;
  }

  const subtotal = cart.getSubtotal();
  const discount = cart.getDiscountValue();
  const total = cart.getTotal();
  const change = paymentMethod === 'cash' && amountReceived ? parseFloat(amountReceived) - total : 0;

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <LiveOrderTicker />
      <div className="flex flex-1 relative min-h-0">
      {/* Product area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Shift bar */}
        <div className="flex items-center gap-3 px-4 py-2 border-b bg-muted/30 text-sm">
          <span className="font-medium">Shift:</span>
          {currentShift ? (
            <Badge variant="outline" className="bg-success/10 text-success border-success/30">Open</Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">No active shift</Badge>
          )}
        </div>

        {/* Search + categories */}
        <div className="px-4 py-3 space-y-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input ref={searchRef} placeholder="Search products... (F2)" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
            <Button size="sm" variant={!selectedCategory ? 'default' : 'outline'} onClick={() => setSelectedCategory(null)}>
              All
            </Button>
            {categoryList.map((c) => (
              <Button key={c.id} size="sm" variant={selectedCategory === c.id ? 'default' : 'outline'} onClick={() => setSelectedCategory(c.id)}>
                {c.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Product grid */}
        <ScrollArea className="flex-1 p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {products.map((product) => (
              <Card
                key={product.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleAddProduct(product)}
              >
                <CardContent className="p-3 min-h-[4.5rem] flex flex-col justify-center">
                  {product.imageUrl && (
                    <div className="aspect-square rounded-md bg-muted mb-2 overflow-hidden">
                      <img src={product.imageUrl.startsWith('/') ? `http://localhost:3000${product.imageUrl}` : product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <p className="font-medium text-sm truncate">{product.name}</p>
                  <p className="text-sm text-primary font-semibold">{formatCurrency(product.price)}</p>
                  {product.stock <= (product.lowStockThreshold || 5) && (
                    <Badge variant="outline" className="text-warning border-warning/30 text-[10px] mt-1">Low stock</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {/* Floating cart toggle for tablet */}
        {!cartOpen && (
          <Button
            className="absolute right-4 bottom-4 h-14 w-14 rounded-full shadow-lg md:hidden z-10"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBag className="h-5 w-5" />
            {cart.items.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cart.items.length}
              </span>
            )}
          </Button>
        )}
      </div>

      {/* Cart sidebar */}
      <div className={`${cartOpen ? 'w-[300px] lg:w-[340px]' : 'w-0 overflow-hidden'} border-l flex flex-col bg-card transition-all duration-200 max-md:absolute max-md:right-0 max-md:top-0 max-md:bottom-0 max-md:z-20 max-md:shadow-xl ${cartOpen ? 'max-md:w-[320px]' : ''}`}>
        <div className="px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" /> Cart
              <Badge variant="secondary" className="text-xs">{cart.items.length}</Badge>
            </h3>
            <div className="flex items-center gap-1">
              {cart.items.length > 0 && (
                <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={cart.clearCart}>Clear</Button>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7 md:hidden" onClick={() => setCartOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-2 mt-2">
            {(['dine_in', 'takeaway', 'delivery'] as const).map((t) => (
              <Button key={t} size="sm" variant={cart.orderType === t ? 'default' : 'outline'} className="text-xs flex-1" onClick={() => cart.setOrderType(t)}>
                {t.replace('_', ' ')}
              </Button>
            ))}
          </div>

          {cart.orderType === 'dine_in' && (
            <Select value={cart.tableId || ''} onValueChange={cart.setTableId}>
              <SelectTrigger className="mt-2 h-8 text-xs">
                <SelectValue placeholder="Select table" />
              </SelectTrigger>
              <SelectContent>
                {tableList.filter((t) => t.status === 'available').map((t) => (
                  <SelectItem key={t.id} value={t.id}>Table {t.tableNumber}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={cart.customerId || 'none'} onValueChange={(v) => cart.setCustomerId(v === 'none' ? null : v)}>
            <SelectTrigger className="mt-2 h-8 text-xs">
              <SelectValue placeholder="Customer (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No customer</SelectItem>
              {customerList.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ScrollArea className="flex-1">
          {cart.items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">Cart is empty</p>
          ) : (
            <div className="p-3 space-y-2">
              {cart.items.map((item) => {
                const modTotal = item.modifiers.reduce((s, m) => s + m.priceAdjustment, 0);
                return (
                  <div key={item.id} className="rounded-lg border p-2.5 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium flex-1">{item.name}</p>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => cart.removeItem(item.id)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    {item.modifiers.length > 0 && (
                      <p className="text-[11px] text-muted-foreground">{item.modifiers.map((m) => m.optionName).join(', ')}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm w-6 text-center">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm font-medium">{formatCurrency((item.price + modTotal) * item.quantity)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {cart.items.length > 0 && (
          <div className="border-t p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Select value={cart.discountType || ''} onValueChange={(v) => cart.setDiscount(v as any, cart.discountAmount)}>
                <SelectTrigger className="h-8 text-xs w-28">
                  <SelectValue placeholder="Discount" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">%</SelectItem>
                  <SelectItem value="fixed">Fixed</SelectItem>
                </SelectContent>
              </Select>
              {cart.discountType && (
                <Input
                  type="number"
                  placeholder="0"
                  className="h-8 text-xs w-20"
                  value={cart.discountAmount || ''}
                  onChange={(e) => cart.setDiscount(cart.discountType, parseFloat(e.target.value) || 0)}
                />
              )}
            </div>
            <Separator />
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-destructive"><span>Discount</span><span>-{formatCurrency(discount)}</span></div>}
              <div className="flex justify-between font-bold text-base"><span>Total</span><span>{formatCurrency(total)}</span></div>
            </div>
            <Button className="w-full" onClick={() => setCheckoutOpen(true)}>
              Checkout · {formatCurrency(total)}
            </Button>
            <p className="text-[10px] text-muted-foreground text-center">Press Enter to checkout</p>
          </div>
        )}
      </div>

      {/* Modifier dialog */}
      <Dialog open={!!modifierProduct} onOpenChange={() => setModifierProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modifierProduct?.name} — Select Options</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {modifierProduct?.modifierGroups?.map((group) => (
              <div key={group.id}>
                <div className="flex items-center gap-2 mb-2">
                  <Label className="font-medium">{group.name}</Label>
                  {group.isRequired && <Badge variant="outline" className="text-[10px]">Required</Badge>}
                  {group.maxSelect && <span className="text-xs text-muted-foreground">Max: {group.maxSelect}</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.options.map((opt) => {
                    const isSelected = selectedModifiers.some((m) => m.optionId === opt.id);
                    return (
                      <Button key={opt.id} size="sm" variant={isSelected ? 'default' : 'outline'} onClick={() => toggleModifier(group, opt)}>
                        {opt.name} {opt.priceAdjustment > 0 && `+${formatCurrency(opt.priceAdjustment)}`}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={handleConfirmModifiers}>Add to Cart</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Checkout dialog */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Checkout — {formatCurrency(total)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <div className="flex gap-2">
                {(['cash', 'card', 'split'] as const).map((m) => (
                  <Button key={m} variant={paymentMethod === m ? 'default' : 'outline'} className="flex-1 capitalize" onClick={() => setPaymentMethod(m)}>
                    {m}
                  </Button>
                ))}
              </div>
            </div>
            {paymentMethod === 'cash' && (
              <div className="space-y-2">
                <Label>Amount Received</Label>
                <Input type="number" value={amountReceived} onChange={(e) => setAmountReceived(e.target.value)} placeholder="0.00" />
                {parseFloat(amountReceived) >= total && (
                  <p className="text-sm font-medium text-success">Change: {formatCurrency(change)}</p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckoutOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCheckout}
              disabled={createOrder.isPending || checkoutOrder.isPending || (paymentMethod === 'cash' && parseFloat(amountReceived) < total)}
            >
              Complete Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt dialog */}
      <ReceiptDialog
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
        receipt={receiptData}
        businessName="CloudPOS Demo Restaurant"
        branchName="Main Branch"
      />

      {/* Keyboard shortcuts help */}
      <KeyboardShortcutsDialog />
      </div>
    </div>
  );
}
