// Demo mode flag - set to true to bypass backend and use mock data
export const DEMO_MODE = true;

export const DEMO_USER = {
  id: 'demo-user-001',
  email: 'demo@cloudpos.com',
  firstName: 'Demo',
  lastName: 'Owner',
  role: 'root_owner' as const,
  merchantId: 'demo-merchant-001',
  branchId: 'demo-branch-001',
};

export const DEMO_TOKEN = 'demo-jwt-token';

export const DEMO_BRANCHES = [
  { id: 'demo-branch-001', name: 'Main Branch', address: '123 Main Street', phone: '+1234567890', taxRate: 16, currency: 'USD', isActive: true, createdAt: '2026-01-01' },
  { id: 'demo-branch-002', name: 'Downtown Branch', address: '456 Downtown Ave', phone: '+1234567891', taxRate: 16, currency: 'USD', isActive: true, createdAt: '2026-01-15' },
];

export const DEMO_CATEGORIES = [
  { id: 'cat-001', name: 'Burgers', sortOrder: 0 },
  { id: 'cat-002', name: 'Beverages', sortOrder: 1 },
  { id: 'cat-003', name: 'Sides', sortOrder: 2 },
  { id: 'cat-004', name: 'Desserts', sortOrder: 3 },
];

export const DEMO_MODIFIER_GROUPS = [
  { id: 'mod-001', name: 'Size', isRequired: true, maxSelect: 1, options: [
    { id: 'opt-001', name: 'Small', priceAdjustment: 0, sortOrder: 0 },
    { id: 'opt-002', name: 'Medium', priceAdjustment: 1.5, sortOrder: 1 },
    { id: 'opt-003', name: 'Large', priceAdjustment: 3.0, sortOrder: 2 },
  ]},
  { id: 'mod-002', name: 'Toppings', isRequired: false, maxSelect: 3, options: [
    { id: 'opt-004', name: 'Extra Cheese', priceAdjustment: 1.0, sortOrder: 0 },
    { id: 'opt-005', name: 'Bacon', priceAdjustment: 2.0, sortOrder: 1 },
    { id: 'opt-006', name: 'Jalapeños', priceAdjustment: 0.5, sortOrder: 2 },
  ]},
];

export const DEMO_PRODUCTS = [
  { id: 'prod-001', name: 'Classic Burger', description: 'Juicy beef patty with lettuce and tomato', categoryId: 'cat-001', category: { id: 'cat-001', name: 'Burgers', sortOrder: 0 }, price: 8.99, costPrice: 3.5, stock: 45, lowStockThreshold: 10, sku: 'BRG-001', imageUrl: '', isActive: true, modifierGroups: [DEMO_MODIFIER_GROUPS[0], DEMO_MODIFIER_GROUPS[1]] },
  { id: 'prod-002', name: 'Chicken Burger', description: 'Crispy chicken with special sauce', categoryId: 'cat-001', category: { id: 'cat-001', name: 'Burgers', sortOrder: 0 }, price: 9.49, costPrice: 4.0, stock: 38, lowStockThreshold: 10, sku: 'BRG-002', imageUrl: '', isActive: true, modifierGroups: [DEMO_MODIFIER_GROUPS[0]] },
  { id: 'prod-003', name: 'Veggie Burger', description: 'Plant-based patty with avocado', categoryId: 'cat-001', category: { id: 'cat-001', name: 'Burgers', sortOrder: 0 }, price: 10.99, costPrice: 4.5, stock: 22, lowStockThreshold: 10, sku: 'BRG-003', imageUrl: '', isActive: true, modifierGroups: [] },
  { id: 'prod-004', name: 'Cola', description: 'Refreshing cola drink', categoryId: 'cat-002', category: { id: 'cat-002', name: 'Beverages', sortOrder: 1 }, price: 2.49, costPrice: 0.5, stock: 120, lowStockThreshold: 20, sku: 'BEV-001', imageUrl: '', isActive: true, modifierGroups: [DEMO_MODIFIER_GROUPS[0]] },
  { id: 'prod-005', name: 'Orange Juice', description: 'Fresh squeezed orange juice', categoryId: 'cat-002', category: { id: 'cat-002', name: 'Beverages', sortOrder: 1 }, price: 3.99, costPrice: 1.2, stock: 60, lowStockThreshold: 15, sku: 'BEV-002', imageUrl: '', isActive: true, modifierGroups: [DEMO_MODIFIER_GROUPS[0]] },
  { id: 'prod-006', name: 'French Fries', description: 'Crispy golden fries', categoryId: 'cat-003', category: { id: 'cat-003', name: 'Sides', sortOrder: 2 }, price: 3.49, costPrice: 0.8, stock: 80, lowStockThreshold: 15, sku: 'SDE-001', imageUrl: '', isActive: true, modifierGroups: [] },
  { id: 'prod-007', name: 'Onion Rings', description: 'Crispy battered onion rings', categoryId: 'cat-003', category: { id: 'cat-003', name: 'Sides', sortOrder: 2 }, price: 4.49, costPrice: 1.0, stock: 5, lowStockThreshold: 10, sku: 'SDE-002', imageUrl: '', isActive: true, modifierGroups: [] },
  { id: 'prod-008', name: 'Chocolate Cake', description: 'Rich chocolate layer cake', categoryId: 'cat-004', category: { id: 'cat-004', name: 'Desserts', sortOrder: 3 }, price: 5.99, costPrice: 2.0, stock: 15, lowStockThreshold: 5, sku: 'DES-001', imageUrl: '', isActive: true, modifierGroups: [] },
  { id: 'prod-009', name: 'Ice Cream Sundae', description: 'Vanilla ice cream with toppings', categoryId: 'cat-004', category: { id: 'cat-004', name: 'Desserts', sortOrder: 3 }, price: 4.99, costPrice: 1.5, stock: 30, lowStockThreshold: 8, sku: 'DES-002', imageUrl: '', isActive: true, modifierGroups: [] },
  { id: 'prod-010', name: 'Double Cheeseburger', description: 'Double patty with extra cheese', categoryId: 'cat-001', category: { id: 'cat-001', name: 'Burgers', sortOrder: 0 }, price: 12.99, costPrice: 5.5, stock: 3, lowStockThreshold: 10, sku: 'BRG-004', imageUrl: '', isActive: true, modifierGroups: [DEMO_MODIFIER_GROUPS[0], DEMO_MODIFIER_GROUPS[1]] },
];

export const DEMO_TABLES = [
  { id: 'tbl-001', tableNumber: 'T-01', capacity: 4, status: 'available' as const },
  { id: 'tbl-002', tableNumber: 'T-02', capacity: 2, status: 'occupied' as const },
  { id: 'tbl-003', tableNumber: 'T-03', capacity: 6, status: 'available' as const },
  { id: 'tbl-004', tableNumber: 'T-04', capacity: 4, status: 'reserved' as const },
  { id: 'tbl-005', tableNumber: 'T-05', capacity: 8, status: 'available' as const },
  { id: 'tbl-006', tableNumber: 'T-06', capacity: 2, status: 'occupied' as const },
  { id: 'tbl-007', tableNumber: 'T-07', capacity: 4, status: 'available' as const },
  { id: 'tbl-008', tableNumber: 'T-08', capacity: 6, status: 'available' as const },
];

export const DEMO_ORDERS = [
  { id: 'ord-001', orderNumber: 'ORD-1001', orderType: 'dine_in' as const, status: 'completed' as const, items: [{ id: 'oi-1', productId: 'prod-001', product: { name: 'Classic Burger' }, quantity: 2, unitPrice: 8.99, notes: '' }], subtotal: 17.98, tax: 2.88, total: 20.86, paymentMethod: 'cash' as const, amountReceived: 25, change: 4.14, createdAt: '2026-02-26T10:30:00Z', updatedAt: '2026-02-26T10:32:00Z' },
  { id: 'ord-002', orderNumber: 'ORD-1002', orderType: 'takeaway' as const, status: 'completed' as const, items: [{ id: 'oi-2', productId: 'prod-004', product: { name: 'Cola' }, quantity: 3, unitPrice: 2.49, notes: '' }], subtotal: 7.47, tax: 1.20, total: 8.67, paymentMethod: 'card' as const, createdAt: '2026-02-26T11:15:00Z', updatedAt: '2026-02-26T11:16:00Z' },
  { id: 'ord-003', orderNumber: 'ORD-1003', orderType: 'dine_in' as const, status: 'pending' as const, items: [{ id: 'oi-3', productId: 'prod-003', product: { name: 'Veggie Burger' }, quantity: 1, unitPrice: 10.99, notes: 'No onions' }], subtotal: 10.99, tax: 1.76, total: 12.75, createdAt: '2026-02-26T12:00:00Z', updatedAt: '2026-02-26T12:00:00Z' },
  { id: 'ord-004', orderNumber: 'ORD-1004', orderType: 'delivery' as const, status: 'completed' as const, items: [{ id: 'oi-4', productId: 'prod-010', product: { name: 'Double Cheeseburger' }, quantity: 1, unitPrice: 12.99, notes: '' }, { id: 'oi-5', productId: 'prod-006', product: { name: 'French Fries' }, quantity: 2, unitPrice: 3.49, notes: '' }], subtotal: 19.97, tax: 3.20, total: 23.17, paymentMethod: 'cash' as const, amountReceived: 30, change: 6.83, createdAt: '2026-02-25T14:30:00Z', updatedAt: '2026-02-25T14:35:00Z' },
  { id: 'ord-005', orderNumber: 'ORD-1005', orderType: 'dine_in' as const, status: 'voided' as const, items: [{ id: 'oi-6', productId: 'prod-008', product: { name: 'Chocolate Cake' }, quantity: 1, unitPrice: 5.99, notes: '' }], subtotal: 5.99, tax: 0.96, total: 6.95, createdAt: '2026-02-25T16:00:00Z', updatedAt: '2026-02-25T16:05:00Z' },
  { id: 'ord-006', orderNumber: 'ORD-1006', orderType: 'takeaway' as const, status: 'refunded' as const, items: [{ id: 'oi-7', productId: 'prod-002', product: { name: 'Chicken Burger' }, quantity: 2, unitPrice: 9.49, notes: '' }], subtotal: 18.98, tax: 3.04, total: 22.02, paymentMethod: 'card' as const, createdAt: '2026-02-24T09:00:00Z', updatedAt: '2026-02-24T10:00:00Z' },
];

export const DEMO_CUSTOMERS = [
  { id: 'cust-001', name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+1-555-0101', notes: 'Prefers no onions', totalOrders: 12, totalSpent: 156.50 },
  { id: 'cust-002', name: 'Mike Chen', email: 'mike@example.com', phone: '+1-555-0102', notes: '', totalOrders: 8, totalSpent: 98.20 },
  { id: 'cust-003', name: 'Emily Davis', email: 'emily@example.com', phone: '+1-555-0103', notes: 'VIP customer', totalOrders: 25, totalSpent: 430.75 },
  { id: 'cust-004', name: 'Ahmed Khan', email: 'ahmed@example.com', phone: '+1-555-0104', notes: '', totalOrders: 5, totalSpent: 62.30 },
];

export const DEMO_SHIFTS = [
  { id: 'shift-001', openedAt: '2026-02-26T08:00:00Z', closedAt: null, openingBalance: 200, closingBalance: null, expectedBalance: 520.50, totalSales: 320.50, variance: null, user: { firstName: 'Demo', lastName: 'Owner' } },
];

export const DEMO_SHIFT_HISTORY = [
  { id: 'shift-h1', openedAt: '2026-02-25T08:00:00Z', closedAt: '2026-02-25T18:00:00Z', openingBalance: 200, closingBalance: 680, expectedBalance: 695.20, totalSales: 495.20, variance: -15.20, user: { firstName: 'Demo', lastName: 'Owner' } },
  { id: 'shift-h2', openedAt: '2026-02-24T08:00:00Z', closedAt: '2026-02-24T17:30:00Z', openingBalance: 150, closingBalance: 590, expectedBalance: 585.00, totalSales: 435.00, variance: 5.00, user: { firstName: 'John', lastName: 'Cashier' } },
  { id: 'shift-h3', openedAt: '2026-02-23T09:00:00Z', closedAt: '2026-02-23T17:00:00Z', openingBalance: 200, closingBalance: 720, expectedBalance: 718.50, totalSales: 518.50, variance: 1.50, user: { firstName: 'Demo', lastName: 'Owner' } },
];

export const DEMO_NOTIFICATIONS = [
  { id: 'notif-001', type: 'low_stock' as const, title: 'Low Stock Alert', message: 'Onion Rings stock is critically low (5 remaining)', isRead: false, createdAt: '2026-02-26T12:00:00Z' },
  { id: 'notif-002', type: 'low_stock' as const, title: 'Low Stock Alert', message: 'Double Cheeseburger stock is low (3 remaining)', isRead: false, createdAt: '2026-02-26T11:30:00Z' },
  { id: 'notif-003', type: 'order_alert' as const, title: 'Order Voided', message: 'Order ORD-1005 was voided', isRead: true, createdAt: '2026-02-25T16:05:00Z' },
  { id: 'notif-004', type: 'system' as const, title: 'System Update', message: 'CloudPOS has been updated to v2.1', isRead: true, createdAt: '2026-02-24T08:00:00Z' },
];

export const DEMO_INVENTORY_LOGS = [
  { id: 'inv-001', product: { name: 'Classic Burger' }, type: 'sale', quantity: -2, reason: 'Order ORD-1001', createdAt: '2026-02-26T10:32:00Z' },
  { id: 'inv-002', product: { name: 'Cola' }, type: 'sale', quantity: -3, reason: 'Order ORD-1002', createdAt: '2026-02-26T11:16:00Z' },
  { id: 'inv-003', product: { name: 'French Fries' }, type: 'manual_add', quantity: 50, reason: 'Restocked from supplier', createdAt: '2026-02-25T07:00:00Z' },
  { id: 'inv-004', product: { name: 'Onion Rings' }, type: 'sale', quantity: -5, reason: 'Order ORD-998', createdAt: '2026-02-25T13:00:00Z' },
];

export const DEMO_USERS = [
  { id: 'user-001', email: 'demo@cloudpos.com', firstName: 'Demo', lastName: 'Owner', phone: '+1234567890', role: 'root_owner', branchId: 'demo-branch-001', isActive: true },
  { id: 'user-002', email: 'john@cloudpos.com', firstName: 'John', lastName: 'Cashier', phone: '+1234567891', role: 'cashier', branchId: 'demo-branch-001', isActive: true },
  { id: 'user-003', email: 'jane@cloudpos.com', firstName: 'Jane', lastName: 'Manager', phone: '+1234567892', role: 'branch_manager', branchId: 'demo-branch-002', isActive: true },
  { id: 'user-004', email: 'bob@cloudpos.com', firstName: 'Bob', lastName: 'Cashier', phone: '+1234567893', role: 'cashier', branchId: 'demo-branch-002', isActive: false },
];

export const DEMO_AUDIT_LOGS = [
  { id: 'aud-001', action: 'login', userId: 'user-001', user: { firstName: 'Demo', lastName: 'Owner', email: 'demo@cloudpos.com' }, details: 'Logged in from 192.168.1.1', createdAt: '2026-02-26T08:00:00Z' },
  { id: 'aud-002', action: 'checkout', userId: 'user-001', user: { firstName: 'Demo', lastName: 'Owner', email: 'demo@cloudpos.com' }, details: 'Order ORD-1001 completed, total: $20.86', createdAt: '2026-02-26T10:32:00Z' },
  { id: 'aud-003', action: 'product_update', userId: 'user-001', user: { firstName: 'Demo', lastName: 'Owner', email: 'demo@cloudpos.com' }, details: 'Updated price of Classic Burger', createdAt: '2026-02-25T14:00:00Z' },
  { id: 'aud-004', action: 'void_order', userId: 'user-001', user: { firstName: 'Demo', lastName: 'Owner', email: 'demo@cloudpos.com' }, details: 'Voided order ORD-1005, reason: Customer cancelled', createdAt: '2026-02-25T16:05:00Z' },
  { id: 'aud-005', action: 'stock_adjust', userId: 'user-003', user: { firstName: 'Jane', lastName: 'Manager', email: 'jane@cloudpos.com' }, details: 'Added 50 units of French Fries', createdAt: '2026-02-25T07:00:00Z' },
];

export const DEMO_WEEKLY_SALES = [
  { date: '2026-02-20', revenue: 380, orderCount: 22 },
  { date: '2026-02-21', revenue: 520, orderCount: 31 },
  { date: '2026-02-22', revenue: 410, orderCount: 25 },
  { date: '2026-02-23', revenue: 690, orderCount: 42 },
  { date: '2026-02-24', revenue: 550, orderCount: 35 },
  { date: '2026-02-25', revenue: 495, orderCount: 30 },
  { date: '2026-02-26', revenue: 320, orderCount: 18 },
];

export const DEMO_PAYMENT_BREAKDOWN = [
  { paymentMethod: 'cash', count: 85, total: 1820 },
  { paymentMethod: 'card', count: 95, total: 2450 },
  { paymentMethod: 'split', count: 8, total: 295 },
];

export const DEMO_ORDER_TYPES = [
  { orderType: 'dine_in', count: 95 },
  { orderType: 'takeaway', count: 65 },
  { orderType: 'delivery', count: 28 },
];

export const DEMO_TOP_PRODUCTS = [
  { name: 'Classic Burger', totalSold: 145 },
  { name: 'French Fries', totalSold: 120 },
  { name: 'Cola', totalSold: 110 },
  { name: 'Chicken Burger', totalSold: 85 },
  { name: 'Chocolate Cake', totalSold: 60 },
];

export const DEMO_DAILY_REPORT = {
  totalRevenue: 320.50,
  totalOrders: 18,
  avgOrderValue: 17.81,
};

export const DEMO_MERCHANT = {
  id: 'demo-merchant-001',
  businessName: 'CloudPOS Demo Restaurant',
  phone: '+1-555-0100',
  address: '123 Main Street, City',
  currency: 'USD',
  timezone: 'America/New_York',
};

export const DEMO_BILLING_PLANS = [
  { id: 'plan-starter', name: 'Starter', pricePerBranch: 19, maxBranches: 2, maxProducts: 50, maxUsers: 5, features: ['POS Terminal', 'Basic Reports', 'Email Support', 'Order Management'], popular: false },
  { id: 'plan-pro', name: 'Pro', pricePerBranch: 49, maxBranches: 10, maxProducts: 500, maxUsers: 25, features: ['Everything in Starter', 'Advanced Reports', 'Inventory Management', 'Customer CRM', 'Priority Support'], popular: true },
  { id: 'plan-enterprise', name: 'Enterprise', pricePerBranch: 99, maxBranches: null, maxProducts: null, maxUsers: null, features: ['Everything in Pro', 'Unlimited Everything', 'Dedicated Support', 'Custom Integrations', 'API Access', 'White-label Options'], popular: false },
];

export const DEMO_BILLING_SUBSCRIPTION = {
  id: 'sub-001',
  planId: 'plan-pro',
  plan: DEMO_BILLING_PLANS[1],
  status: 'active' as const,
  currentPeriodEnd: '2026-03-26T00:00:00Z',
  branchCount: 2,
  productCount: 10,
  userCount: 4,
};

export const DEMO_INVOICES = [
  { id: 'inv-001', date: '2026-02-01', amount: 98, status: 'paid' as const, description: 'Pro Plan — 2 branches × $49' },
  { id: 'inv-002', date: '2026-01-01', amount: 98, status: 'paid' as const, description: 'Pro Plan — 2 branches × $49' },
  { id: 'inv-003', date: '2025-12-01', amount: 49, status: 'paid' as const, description: 'Pro Plan — 1 branch × $49' },
  { id: 'inv-004', date: '2025-11-01', amount: 19, status: 'paid' as const, description: 'Starter Plan — 1 branch × $19' },
];
