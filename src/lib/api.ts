import axios from 'axios';
import { DEMO_MODE, DEMO_USER, DEMO_TOKEN, DEMO_BRANCHES, DEMO_CATEGORIES, DEMO_PRODUCTS, DEMO_TABLES, DEMO_ORDERS, DEMO_CUSTOMERS, DEMO_SHIFTS, DEMO_SHIFT_HISTORY, DEMO_NOTIFICATIONS, DEMO_INVENTORY_LOGS, DEMO_USERS, DEMO_AUDIT_LOGS, DEMO_WEEKLY_SALES, DEMO_PAYMENT_BREAKDOWN, DEMO_ORDER_TYPES, DEMO_TOP_PRODUCTS, DEMO_DAILY_REPORT, DEMO_MERCHANT, DEMO_MODIFIER_GROUPS, DEMO_BILLING_PLANS, DEMO_BILLING_SUBSCRIPTION, DEMO_INVOICES } from './demo-data';

const API_URL = 'http://localhost:3000/api/v1';

function getDemoData(method: string, url: string): any {
  const u = url;

  // Auth
  if (u === '/auth/login') return { accessToken: DEMO_TOKEN, user: DEMO_USER };
  if (u === '/auth/register') return { accessToken: DEMO_TOKEN, user: DEMO_USER };
  if (u === '/auth/me') return DEMO_USER;
  if (u === '/auth/change-password') return { message: 'Password changed' };
  if (u === '/auth/forgot-password') return { message: 'Email sent' };
  if (u === '/auth/reset-password') return { message: 'Password reset' };
  if (u === '/auth/verify-email') return { message: 'Email verified' };
  if (u === '/auth/resend-verification') return { message: 'Code resent' };

  // Branches
  if (u === '/branches' && method === 'get') return DEMO_BRANCHES;
  if (u === '/branches' && method === 'post') return { ...DEMO_BRANCHES[0], id: 'new-' + Date.now() };
  if (/^\/branches\/[^/]+$/.test(u) && method !== 'delete') return DEMO_BRANCHES[0];
  if (/^\/branches\/[^/]+$/.test(u) && method === 'delete') return { message: 'Deactivated' };

  // Categories
  if (/\/categories$/.test(u) && method === 'get') return DEMO_CATEGORIES;
  if (/\/categories/.test(u)) return { id: 'new-cat', message: 'OK' };

  // Products
  if (/\/products$/.test(u) && method === 'get') return { data: DEMO_PRODUCTS, total: DEMO_PRODUCTS.length, page: 1, limit: 20, totalPages: 1 };
  if (/\/products/.test(u)) return DEMO_PRODUCTS[0];

  // Orders
  if (/\/orders$/.test(u) && method === 'get') return { data: DEMO_ORDERS, total: DEMO_ORDERS.length, page: 1, limit: 20, totalPages: 1 };
  if (/\/orders$/.test(u) && method === 'post') return { id: 'new-order', orderNumber: 'ORD-' + Math.floor(Math.random() * 9000 + 1000) };
  if (/\/checkout$/.test(u)) return { message: 'Checkout complete' };
  if (/\/void$/.test(u)) return { message: 'Voided' };
  if (/\/refund$/.test(u)) return { message: 'Refunded' };
  if (/^\/orders\/[^/]+$/.test(u)) return DEMO_ORDERS[0];

  // Tables
  if (/\/tables$/.test(u) && method === 'get') return DEMO_TABLES;
  if (/\/tables/.test(u)) return { id: 'new-tbl', status: 'available', message: 'OK' };

  // Customers
  if (u === '/customers' && method === 'get') return DEMO_CUSTOMERS;
  if (/^\/customers\/[^/]+$/.test(u)) return DEMO_CUSTOMERS[0];
  if (u === '/customers') return { id: 'new-cust', message: 'OK' };

  // Inventory
  if (/\/inventory\/low-stock$/.test(u)) return DEMO_PRODUCTS.filter(p => p.stock <= (p.lowStockThreshold || 10));
  if (/\/inventory\/logs$/.test(u)) return { data: DEMO_INVENTORY_LOGS, total: DEMO_INVENTORY_LOGS.length, page: 1, limit: 20, totalPages: 1 };
  if (/\/inventory\/adjust$/.test(u)) return { message: 'Adjusted' };

  // Modifiers
  if (/\/modifiers$/.test(u) && method === 'get') return DEMO_MODIFIER_GROUPS;
  if (/\/modifiers/.test(u)) return DEMO_MODIFIER_GROUPS[0];

  // Shifts
  if (/\/shifts\/current$/.test(u)) return DEMO_SHIFTS[0];
  if (/\/shifts\/history$/.test(u)) return DEMO_SHIFT_HISTORY;
  if (/\/shifts/.test(u)) return { message: 'OK' };

  // Reports
  if (/\/reports\/daily$/.test(u)) return DEMO_DAILY_REPORT;
  if (/\/reports\/weekly-sales$/.test(u)) return DEMO_WEEKLY_SALES;
  if (/\/reports\/payment-breakdown$/.test(u)) return DEMO_PAYMENT_BREAKDOWN;
  if (/\/reports\/order-types$/.test(u)) return DEMO_ORDER_TYPES;
  if (/\/reports\/top-products/.test(u)) return DEMO_TOP_PRODUCTS;

  // Notifications
  if (u === '/notifications' && method === 'get') return DEMO_NOTIFICATIONS;
  if (u === '/notifications/unread-count') return { count: DEMO_NOTIFICATIONS.filter(n => !n.isRead).length };
  if (/\/notifications/.test(u)) return { message: 'OK' };

  // Users
  if (u === '/users' && method === 'get') return DEMO_USERS;
  if (/\/users/.test(u)) return { message: 'OK' };

  // Merchant
  if (u === '/merchants/profile') return DEMO_MERCHANT;

  // Audit Logs
  if (u === '/audit-logs') return { data: DEMO_AUDIT_LOGS, total: DEMO_AUDIT_LOGS.length, page: 1, limit: 20, totalPages: 1 };

  // Billing
  if (u === '/billing/plans') return DEMO_BILLING_PLANS;
  if (u === '/billing/subscription') return DEMO_BILLING_SUBSCRIPTION;
  if (u === '/billing/invoices') return DEMO_INVOICES;
  if (u === '/billing/upgrade') return { message: 'Upgraded' };

  // Admin
  if (u === '/admin/dashboard') return { totalMerchants: 24, activeSubscriptions: 18, totalRevenue: 12500 };
  if (u === '/admin/merchants') return [DEMO_MERCHANT];
  if (u === '/subscription-plans') return [{ id: 'plan-1', name: 'Starter', pricePerBranch: 29 }, { id: 'plan-2', name: 'Pro', pricePerBranch: 59 }];
  if (u === '/admin/subscriptions') return [];

  return { message: 'OK' };
}

// Create a mock adapter for demo mode
function createDemoApi() {
  const mockRes = (url: string, method: string) => {
    const data = getDemoData(method, url);
    return Promise.resolve({ data, status: 200, statusText: 'OK', headers: {}, config: {} });
  };
  const instance = {
    get: (url: string, _config?: any) => mockRes(url, 'get'),
    post: (url: string, _data?: any, _config?: any) => mockRes(url, 'post'),
    patch: (url: string, _data?: any, _config?: any) => mockRes(url, 'patch'),
    put: (url: string, _data?: any, _config?: any) => mockRes(url, 'put'),
    delete: (url: string, _config?: any) => mockRes(url, 'delete'),
  };
  return instance as any;
}

let api: any;

if (DEMO_MODE) {
  api = createDemoApi();
} else {
  api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
  });

  api.interceptors.request.use((config: any) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (response: any) => response,
    (error: any) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
}

export default api;
export { API_URL };
