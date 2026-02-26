import { create } from 'zustand';

export interface CartModifier {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  priceAdjustment: number;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  notes: string;
  modifiers: CartModifier[];
  imageUrl?: string;
}

interface CartState {
  items: CartItem[];
  orderType: 'dine_in' | 'takeaway' | 'delivery';
  tableId: string | null;
  customerId: string | null;
  discountType: 'percentage' | 'fixed' | null;
  discountAmount: number;
  notes: string;

  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateNotes: (id: string, notes: string) => void;
  setOrderType: (type: 'dine_in' | 'takeaway' | 'delivery') => void;
  setTableId: (id: string | null) => void;
  setCustomerId: (id: string | null) => void;
  setDiscount: (type: 'percentage' | 'fixed' | null, amount: number) => void;
  setNotes: (notes: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getDiscountValue: () => number;
  getTotal: () => number;
}

let itemCounter = 0;

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  orderType: 'dine_in',
  tableId: null,
  customerId: null,
  discountType: null,
  discountAmount: 0,
  notes: '',

  addItem: (item) => {
    const id = `cart-${++itemCounter}`;
    set((s) => ({ items: [...s.items, { ...item, id }] }));
  },

  removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),

  updateQuantity: (id, quantity) =>
    set((s) => ({
      items: quantity <= 0
        ? s.items.filter((i) => i.id !== id)
        : s.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
    })),

  updateNotes: (id, notes) =>
    set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, notes } : i)) })),

  setOrderType: (orderType) => set({ orderType }),
  setTableId: (tableId) => set({ tableId }),
  setCustomerId: (customerId) => set({ customerId }),
  setDiscount: (discountType, discountAmount) => set({ discountType, discountAmount }),
  setNotes: (notes) => set({ notes }),

  clearCart: () =>
    set({
      items: [],
      orderType: 'dine_in',
      tableId: null,
      customerId: null,
      discountType: null,
      discountAmount: 0,
      notes: '',
    }),

  getSubtotal: () => {
    return get().items.reduce((sum, item) => {
      const modifierTotal = item.modifiers.reduce((m, mod) => m + mod.priceAdjustment, 0);
      return sum + (item.price + modifierTotal) * item.quantity;
    }, 0);
  },

  getDiscountValue: () => {
    const { discountType, discountAmount } = get();
    const subtotal = get().getSubtotal();
    if (!discountType) return 0;
    if (discountType === 'percentage') return (subtotal * discountAmount) / 100;
    return discountAmount;
  },

  getTotal: () => {
    return get().getSubtotal() - get().getDiscountValue();
  },
}));
