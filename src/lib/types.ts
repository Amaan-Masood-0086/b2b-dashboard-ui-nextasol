// Shared types for CloudPOS

export interface Branch {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  taxRate: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  sortOrder: number;
}

export interface ModifierOption {
  id: string;
  name: string;
  priceAdjustment: number;
  sortOrder: number;
}

export interface ModifierGroup {
  id: string;
  name: string;
  isRequired: boolean;
  maxSelect: number;
  options: ModifierOption[];
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  categoryId?: string;
  category?: Category;
  price: number;
  costPrice?: number;
  stock: number;
  lowStockThreshold?: number;
  sku?: string;
  imageUrl?: string;
  isActive: boolean;
  modifierGroups?: ModifierGroup[];
}

export interface OrderItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  notes?: string;
  modifiers?: { groupId: string; optionId: string; optionName?: string; priceAdjustment?: number }[];
}

export interface Order {
  id: string;
  orderNumber: string;
  orderType: 'dine_in' | 'takeaway' | 'delivery';
  status: 'pending' | 'completed' | 'voided' | 'refunded';
  items: OrderItem[];
  subtotal: number;
  discountType?: 'percentage' | 'fixed';
  discountAmount?: number;
  tax: number;
  total: number;
  paymentMethod?: 'cash' | 'card' | 'split';
  amountReceived?: number;
  change?: number;
  notes?: string;
  tableId?: string;
  customerId?: string;
  customer?: Customer;
  createdAt: string;
  updatedAt: string;
}

export interface Table {
  id: string;
  tableNumber: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  totalOrders?: number;
  totalSpent?: number;
  membershipId?: string;
  membership?: Membership;
}

export interface Shift {
  id: string;
  openedAt: string;
  closedAt?: string;
  openingBalance: number;
  closingBalance?: number;
  expectedBalance?: number;
  totalSales?: number;
  variance?: number;
  user?: { firstName: string; lastName: string };
}

export interface Notification {
  id: string;
  type: 'low_stock' | 'order_alert' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  user?: { firstName: string; lastName: string; email: string };
  details?: string;
  createdAt: string;
}

export interface Merchant {
  id: string;
  businessName: string;
  phone?: string;
  address?: string;
  currency?: string;
  timezone?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  pricePerBranch: number;
  adminFee?: number;
  maxBranches?: number;
}

export interface Subscription {
  id: string;
  merchantId: string;
  merchant?: Merchant;
  planId: string;
  plan?: SubscriptionPlan;
  status: string;
  createdAt: string;
}

export interface Membership {
  id: string;
  name: string;
  code: string;
  benefitType: 'percentage_discount' | 'fixed_discount' | 'free_delivery' | 'custom_deal';
  benefitValue: number;
  description: string;
  isActive: boolean;
  validFrom?: string;
  validUntil?: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
