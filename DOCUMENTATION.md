# CloudPOS — Complete Frontend Documentation (A to Z)

> **Last Updated:** February 2026
> **Tech Stack:** React 18 + TypeScript + Vite + Tailwind CSS + Zustand + TanStack React Query + React Router v6 + shadcn/ui + Recharts

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture & Folder Structure](#2-architecture--folder-structure)
3. [Authentication & Authorization](#3-authentication--authorization)
4. [Routing & Navigation](#4-routing--navigation)
5. [State Management](#5-state-management)
6. [Pages — Complete List](#6-pages--complete-list)
7. [POS Terminal (Point of Sale)](#7-pos-terminal-point-of-sale)
8. [Kitchen Display System (KDS)](#8-kitchen-display-system-kds)
9. [Orders Management](#9-orders-management)
10. [Menu, Categories & Modifiers](#10-menu-categories--modifiers)
11. [Inventory Management](#11-inventory-management)
12. [Tables Management](#12-tables-management)
13. [Customers & Memberships](#13-customers--memberships)
14. [Shifts Management](#14-shifts-management)
15. [Reports & Analytics](#15-reports--analytics)
16. [Dashboard](#16-dashboard)
17. [Billing & Subscriptions](#17-billing--subscriptions)
18. [Branches Management](#18-branches-management)
19. [Users Management](#19-users-management)
20. [Settings](#20-settings)
21. [Admin Panel (Super Admin)](#21-admin-panel-super-admin)
22. [Audit Logs](#22-audit-logs)
23. [Reusable Components](#23-reusable-components)
24. [Custom Hooks](#24-custom-hooks)
25. [Utility Libraries](#25-utility-libraries)
26. [Design System & Theming](#26-design-system--theming)
27. [Security Features](#27-security-features)
28. [Keyboard Shortcuts](#28-keyboard-shortcuts)
29. [Data Flow Diagram](#29-data-flow-diagram)

---

## 1. Project Overview

**CloudPOS** is a full-featured, multi-tenant cloud-based Point of Sale system built entirely on the frontend with React. It is designed for restaurants, cafes, and retail businesses with support for:

- Multi-branch operations
- Role-based access control (6 roles)
- Real-time kitchen display
- Membership & loyalty programs
- Shift management with cash tracking
- Tax calculation per branch
- Split payments (Cash + Card)
- Held/parked orders
- CSV data export
- Dark mode support
- Keyboard shortcuts for power users
- Session timeout & security warnings

---

## 2. Architecture & Folder Structure

```
src/
├── pages/              # 30 page components (each route = one page)
├── components/
│   ├── ui/             # 50+ shadcn/ui primitives (Button, Dialog, Table, etc.)
│   ├── layout/         # AppSidebar, DashboardLayout, TopBar
│   ├── pos/            # ReceiptDialog
│   ├── EmptyState.tsx
│   ├── KeyboardShortcutsDialog.tsx
│   ├── LiveOrderTicker.tsx
│   ├── NavLink.tsx
│   ├── ProtectedRoute.tsx
│   ├── SessionWarning.tsx
│   └── UpgradeGate.tsx
├── stores/             # Zustand state stores
│   ├── auth-store.ts
│   ├── cart-store.ts
│   └── notification-store.ts
├── hooks/              # Custom React hooks
│   ├── use-mobile.tsx
│   ├── use-realtime-notifications.ts
│   ├── use-session-timeout.ts
│   ├── use-sound.ts
│   ├── use-theme.ts
│   └── use-toast.ts
├── lib/                # Utilities & shared logic
│   ├── api.ts          # Axios API client with interceptors
│   ├── csv-export.ts   # CSV file generation
│   ├── currency.ts     # Dynamic currency formatting
│   ├── demo-data.ts    # Mock/demo data for all entities
│   ├── types.ts        # TypeScript interfaces for all models
│   └── utils.ts        # cn() helper, misc utilities
├── App.tsx             # Root component with all routes
├── App.css             # Global styles
├── index.css           # Tailwind + CSS custom properties (design tokens)
└── main.tsx            # React entry point
```

---

## 3. Authentication & Authorization

### Auth Flow
| Page | Route | Purpose |
|------|-------|---------|
| Login | `/login` | Email + password login |
| Register | `/register` | New merchant signup with business info |
| Onboarding | `/onboarding` | Post-registration setup wizard |
| Forgot Password | `/forgot-password` | Password reset request |
| Reset Password | `/reset-password` | Set new password via token |
| Verify Email | `/verify-email` | Email verification page |

### Auth Store (`src/stores/auth-store.ts`)
- **State:** `user`, `token`, `isAuthenticated`, `currency`, `selectedBranchId`
- **Actions:** `login()`, `logout()`, `setUser()`, `setCurrency()`, `setSelectedBranchId()`
- **Persistence:** `localStorage` for token, user, currency, selectedBranchId
- **User Model:** `id`, `email`, `firstName`, `lastName`, `role`, `merchantId`, `branchId`

### Role-Based Access Control (RBAC)
6 user roles with hierarchical permissions:

| Role | Scope | Access |
|------|-------|--------|
| `super_admin` | Platform | Full admin panel, all merchants |
| `billing_admin` | Platform | Payments, subscriptions |
| `support_admin` | Platform | Merchants, users support |
| `root_owner` | Merchant | Everything for their merchant |
| `branch_manager` | Branch | Branch operations, reports |
| `cashier` | Branch | POS, Kitchen, Orders, Shifts only |

### ProtectedRoute Component
- Wraps routes requiring authentication
- Checks `isAuthenticated` from auth store
- Validates `allowedRoles` array against user role
- Redirects unauthorized users to `/login`

---

## 4. Routing & Navigation

### Route Groups

**Public Routes (No Auth):**
- `/login`, `/register`, `/onboarding`
- `/forgot-password`, `/verify-email`, `/reset-password`

**Merchant Routes (Inside DashboardLayout):**
- `/` — Dashboard (owner, manager)
- `/pos` — POS Terminal (all merchant roles)
- `/kitchen` — Kitchen Display (all merchant roles)
- `/orders` — Order Management (all merchant roles)
- `/tables` — Table Management (all merchant roles)
- `/shifts` — Shift Management (all merchant roles)
- `/customers` — Customer Database (all merchant roles)
- `/memberships` — Membership Programs (owner, manager)
- `/menu` — Product/Menu Management (owner, manager)
- `/categories` — Category Management (owner, manager)
- `/modifiers` — Modifier Groups (owner, manager)
- `/inventory` — Stock Management (owner, manager)
- `/reports` — Sales & Analytics (owner, manager)
- `/users` — Staff Management (owner, manager)
- `/branches` — Multi-Branch (owner only)
- `/billing` — Subscription & Billing (owner only)
- `/settings` — Business Settings (owner only)
- `/audit-logs` — Activity Logs (owner + admins)

**Admin Routes:**
- `/admin` — Admin Dashboard
- `/admin/merchants` — Merchant Management
- `/admin/merchants/:id` — Merchant Detail
- `/admin/users` — Platform User Management
- `/admin/payments` — Payment Tracking
- `/admin/subscriptions` — Subscription Management

### Navigation Components
- **AppSidebar:** Collapsible sidebar with grouped menu items, role-filtered
- **TopBar:** Branch selector, notifications bell, user menu, theme toggle
- **DashboardLayout:** Sidebar + TopBar + main content area with `<Outlet />`

---

## 5. State Management

### Zustand Stores

#### 1. Auth Store (`auth-store.ts`)
Global authentication state with localStorage persistence.

#### 2. Cart Store (`cart-store.ts`)
POS cart with full business logic:

| Feature | Detail |
|---------|--------|
| Cart Items | Add, remove, update quantity, per-item notes |
| Modifiers | Per-item modifier groups with price adjustments |
| Order Type | `dine_in`, `takeaway`, `delivery` |
| Table Assignment | Link to table for dine-in |
| Customer Link | Attach customer for loyalty/membership |
| Discount | Percentage or fixed amount |
| Tax Calculation | `(subtotal - discount) × taxRate / 100` |
| Delivery Address | Text field for delivery orders |
| Held Orders | Park current cart, recall later |
| Computed Values | `getSubtotal()`, `getDiscountValue()`, `getTax()`, `getTotal()` |

#### 3. Notification Store (`notification-store.ts`)
In-app notification bell with read/unread state.

### React Query
Used for server state (API calls) with caching, refetching, and optimistic updates.

---

## 6. Pages — Complete List

| # | Page | File | Description |
|---|------|------|-------------|
| 1 | Login | `Login.tsx` | Email/password authentication |
| 2 | Register | `Register.tsx` | New merchant signup |
| 3 | Onboarding | `Onboarding.tsx` | Post-signup setup wizard |
| 4 | Forgot Password | `ForgotPassword.tsx` | Password reset request |
| 5 | Reset Password | `ResetPassword.tsx` | New password form |
| 6 | Verify Email | `VerifyEmail.tsx` | Email confirmation |
| 7 | Dashboard | `Dashboard.tsx` | KPI cards, charts, recent orders |
| 8 | POS | `POS.tsx` | Full point of sale terminal |
| 9 | Kitchen | `Kitchen.tsx` | Kitchen display system |
| 10 | Orders | `Orders.tsx` | Order list + detail + reprint |
| 11 | Menu | `Menu.tsx` | Product CRUD |
| 12 | Categories | `Categories.tsx` | Category management |
| 13 | Modifiers | `Modifiers.tsx` | Modifier group + option CRUD |
| 14 | Inventory | `Inventory.tsx` | Stock levels + adjustments |
| 15 | Tables | `Tables.tsx` | Table layout management |
| 16 | Customers | `Customers.tsx` | Customer database + membership link |
| 17 | Memberships | `Memberships.tsx` | Loyalty program CRUD |
| 18 | Shifts | `Shifts.tsx` | Open/close shifts, cash tracking |
| 19 | Reports | `Reports.tsx` | Sales, products, payments analytics |
| 20 | Users | `Users.tsx` | Staff management |
| 21 | Branches | `Branches.tsx` | Multi-branch management |
| 22 | Billing | `Billing.tsx` | Subscription, plan, trial info |
| 23 | Settings | `Settings.tsx` | Business configuration |
| 24 | Audit Logs | `AuditLogs.tsx` | Activity history |
| 25 | Admin Dashboard | `Admin.tsx` | Platform overview |
| 26 | Admin Merchant Detail | `AdminMerchantDetail.tsx` | Individual merchant view |
| 27 | Admin Users | `AdminUsers.tsx` | Platform user management |
| 28 | Admin Payments | `AdminPayments.tsx` | Payment tracking |
| 29 | Not Found | `NotFound.tsx` | 404 page |
| 30 | Index | `Index.tsx` | Landing/redirect |

---

## 7. POS Terminal (Point of Sale)

**File:** `src/pages/POS.tsx`

The core of CloudPOS — a full-featured POS terminal.

### Layout
- **Left Panel (70%):** Product grid with category filters + search bar
- **Right Panel (30%):** Cart, customer selector, order type, checkout

### Features

| Feature | Description |
|---------|-------------|
| **Product Grid** | Filterable by category, searchable by name + SKU |
| **Category Tabs** | Quick filter buttons at the top |
| **Cart Management** | Add/remove items, adjust quantities, per-item notes |
| **Modifier Selection** | Dialog for choosing modifiers with required/optional groups |
| **Customer Selection** | Search & attach customer, auto-apply membership discount |
| **Membership Validation** | Checks `validFrom`/`validUntil` — expired = no discount + toast warning |
| **Order Type** | Toggle between Dine-in, Takeaway, Delivery |
| **Table Selection** | Dropdown for dine-in orders |
| **Delivery Address** | Text field appears for delivery orders |
| **Discount** | Manual percentage or fixed discount |
| **Tax Calculation** | Auto-calculated from branch `taxRate` |
| **Shift Enforcement** | Checkout disabled without active shift |
| **Payment Methods** | Cash, Card, Split (Cash + Card) |
| **Quick Cash Buttons** | Exact, +10, +50, +100 for fast cash handling |
| **Split Payment** | Specify cash amount, card auto-calculates remainder |
| **Hold Order** | Park current cart for later recall |
| **Held Orders Panel** | View & recall parked orders |
| **Receipt** | Auto-generated with full breakdown |
| **Order Notes** | Per-order notes field |

### Checkout Flow
1. Cashier adds items to cart
2. Optionally selects customer (membership auto-discount)
3. Selects order type (dine-in → table, delivery → address)
4. Applies manual discount if needed
5. System calculates: subtotal → discount → tax → total
6. Selects payment method (cash/card/split)
7. For cash: enters amount received, system shows change
8. For split: enters cash portion, card auto-fills
9. Checkout creates order → receipt dialog opens
10. Receipt shows full breakdown with print option

### Receipt (`src/components/pos/ReceiptDialog.tsx`)
Displays:
- Business name + branch name
- Date/time
- Order number + order type
- Customer name + membership name
- Itemized list with modifiers + per-item notes
- Subtotal, discount (with membership benefit label), tax, total
- Payment method + split breakdown
- Amount received + change (for cash)
- Order notes
- "Thank you" footer
- Print button

---

## 8. Kitchen Display System (KDS)

**File:** `src/pages/Kitchen.tsx`

### Features
- Real-time order cards with status colors
- Status flow: `New` → `Preparing` → `Ready`
- One-click status advancement
- Order type badge (dine-in/takeaway/delivery)
- Item list with modifiers
- Auto-refresh for new orders
- Visual priority indicators

---

## 9. Orders Management

**File:** `src/pages/Orders.tsx`

### Features
- Paginated order list with filters (status, date range, order type)
- Order detail view with full breakdown
- Status management (complete, void, refund)
- **Reprint Receipt** button on each order
- Tax line display in order summary
- CSV export functionality
- Search by order number

---

## 10. Menu, Categories & Modifiers

### Menu/Products (`Menu.tsx`)
- Full CRUD for products
- Fields: name, description, price, cost price, SKU, category, stock, image URL
- Active/inactive toggle
- Modifier group assignment
- Low stock threshold

### Categories (`Categories.tsx`)
- CRUD for product categories
- Sort order management
- Used as filter tabs in POS

### Modifiers (`Modifiers.tsx`)
- Modifier groups with multiple options
- Each option has name + price adjustment
- Required/optional toggle per group
- Max selection limit
- Sort order for options

---

## 11. Inventory Management

**File:** `src/pages/Inventory.tsx`

### Features
- Stock level overview for all products
- Low stock alerts (visual indicators)
- Stock adjustment (add/subtract with reason)
- Cost price tracking
- SKU display
- CSV export

---

## 12. Tables Management

**File:** `src/pages/Tables.tsx`

### Features
- Visual table grid/list
- CRUD for tables (number, capacity)
- Status: Available, Occupied, Reserved
- Used in POS for dine-in order assignment

---

## 13. Customers & Memberships

### Customers (`Customers.tsx`)
- Customer database with CRUD
- Fields: name, email, phone, notes
- Membership assignment dropdown
- Total orders & total spent tracking
- Search & filter
- CSV export

### Memberships (`Memberships.tsx`)
- Loyalty program CRUD
- Benefit types:
  - `percentage_discount` — e.g., 15% off
  - `fixed_discount` — e.g., $5 off
  - `free_delivery`
  - `custom_deal`
- Validity period: `validFrom` → `validUntil`
- Active/inactive toggle
- Unique membership code
- Description field

### POS Integration
- Customer selected in POS → membership checked
- Valid membership → discount auto-applied + toast notification
- Expired membership → no discount + warning toast
- Receipt shows membership name + benefit description

---

## 14. Shifts Management

**File:** `src/pages/Shifts.tsx`

### Features
- Open shift with opening balance
- Close shift with closing balance
- Expected balance calculation (opening + sales)
- Variance tracking (expected vs actual)
- Shift history with user info
- **POS Enforcement:** Checkout disabled without active shift

---

## 15. Reports & Analytics

**File:** `src/pages/Reports.tsx`

### Report Types
- **Sales Report:** Revenue over time (line chart)
- **Product Performance:** Top selling items (bar chart)
- **Payment Methods:** Cash vs Card vs Split breakdown (pie chart)
- **Date Range Filter:** Custom period selection
- **CSV Export:** Download report data

### Charts
Built with **Recharts** library:
- Line charts for trends
- Bar charts for comparisons
- Pie charts for distributions

---

## 16. Dashboard

**File:** `src/pages/Dashboard.tsx`

### KPI Cards
- Total Revenue
- Total Orders
- Average Order Value
- Active Tables

### Widgets
- Revenue trend chart
- Recent orders list
- Top selling products
- Order type breakdown
- Live order ticker

---

## 17. Billing & Subscriptions

**File:** `src/pages/Billing.tsx`

### Features
- Current plan display (Starter, Professional, Enterprise)
- 14-day trial countdown banner
- Price per branch breakdown
- Plan comparison table
- Upgrade/downgrade flow
- Payment history
- Invoice management

---

## 18. Branches Management

**File:** `src/pages/Branches.tsx`

### Features
- Multi-branch CRUD
- Fields: name, address, phone, tax rate, currency
- Active/inactive toggle
- Branch selector in TopBar for context switching
- Each branch has independent tax rate & currency

---

## 19. Users Management

**File:** `src/pages/Users.tsx`

### Features
- Staff CRUD
- Role assignment (owner, manager, cashier)
- Branch assignment
- Email + name fields
- Active/inactive toggle

---

## 20. Settings

**File:** `src/pages/Settings.tsx`

### Sections
- Business information (name, phone, address)
- Default currency
- Timezone
- Notification preferences
- Theme preferences

---

## 21. Admin Panel (Super Admin)

For platform administrators managing all merchants.

### Admin Dashboard (`Admin.tsx`)
- Total merchants, users, revenue stats
- Recent signups
- Platform health metrics

### Admin Merchant Detail (`AdminMerchantDetail.tsx`)
- Merchant profile card
- Subscription status with plan info
- Branches table
- Recent orders
- Internal notes

### Admin Users (`AdminUsers.tsx`)
- Platform-wide user management
- Role filtering
- Search

### Admin Payments (`AdminPayments.tsx`)
- Payment tracking across merchants
- Status filters
- Revenue analytics

---

## 22. Audit Logs

**File:** `src/pages/AuditLogs.tsx`

### Features
- Complete activity history
- Tracks: user actions, data changes, login events
- Filterable by action type, user, date
- Shows: action, user, details, timestamp
- Accessible by owners + admin roles

---

## 23. Reusable Components

### Layout Components
| Component | Purpose |
|-----------|---------|
| `DashboardLayout` | Main app shell with sidebar + topbar + content outlet |
| `AppSidebar` | Collapsible navigation with role-filtered menu items |
| `TopBar` | Branch selector, notifications, user menu, theme toggle |

### Feature Components
| Component | Purpose |
|-----------|---------|
| `ProtectedRoute` | Auth + RBAC guard wrapper |
| `ReceiptDialog` | Full receipt display with print |
| `EmptyState` | Placeholder for empty lists/tables |
| `LiveOrderTicker` | Scrolling live order notifications |
| `NavLink` | Active-state-aware navigation link |
| `SessionWarning` | Session timeout warning dialog |
| `UpgradeGate` | Feature gating for plan limits |
| `KeyboardShortcutsDialog` | Shortcuts reference popup |

### UI Components (shadcn/ui — 50+)
Full shadcn/ui library including: Accordion, Alert, AlertDialog, Avatar, Badge, Breadcrumb, Button, Calendar, Card, Carousel, Chart, Checkbox, Collapsible, Command, ContextMenu, Dialog, Drawer, DropdownMenu, Form, HoverCard, Input, InputOTP, Label, Menubar, NavigationMenu, Pagination, Popover, Progress, RadioGroup, Resizable, ScrollArea, Select, Separator, Sheet, Sidebar, Skeleton, Slider, Sonner, Switch, Table, Tabs, Textarea, Toast, Toaster, Toggle, ToggleGroup, Tooltip.

---

## 24. Custom Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useMobile` | `use-mobile.tsx` | Detects mobile viewport for responsive layouts |
| `useRealtimeNotifications` | `use-realtime-notifications.ts` | Subscribes to live notification updates |
| `useSessionTimeout` | `use-session-timeout.ts` | Auto-logout after inactivity period |
| `useSound` | `use-sound.ts` | Play notification/alert sounds |
| `useTheme` | `use-theme.ts` | Dark/light mode toggle with persistence |
| `useToast` | `use-toast.ts` | Toast notification manager |

---

## 25. Utility Libraries

### API Client (`api.ts`)
- Axios instance with base URL configuration
- Auth token interceptor (auto-attaches Bearer token)
- Response error interceptor (401 → auto-logout)
- Typed API functions for all endpoints

### CSV Export (`csv-export.ts`)
- Generic CSV generator from array data
- Column mapping configuration
- Auto-download trigger
- Used in: Orders, Customers, Inventory, Reports

### Currency (`currency.ts`)
- `formatCurrency(amount, currency?)` function
- Dynamic currency from auth store
- Cached `Intl.NumberFormat` instances per currency
- Fallback to USD

### Demo Data (`demo-data.ts`)
- Mock data for all entities (products, orders, customers, etc.)
- Used for development & demo mode
- Realistic sample data

### Types (`types.ts`)
Complete TypeScript interfaces:
- `Branch`, `Category`, `ModifierOption`, `ModifierGroup`
- `Product`, `OrderItem`, `Order`
- `Table`, `Customer`, `Shift`
- `Notification`, `AuditLog`
- `Merchant`, `SubscriptionPlan`, `Subscription`
- `Membership`, `PaginatedResponse<T>`

### Utils (`utils.ts`)
- `cn()` — Tailwind class merger (clsx + tailwind-merge)

---

## 26. Design System & Theming

### CSS Custom Properties (Design Tokens)
Defined in `src/index.css` with HSL values:

```
--background, --foreground
--primary, --primary-foreground
--secondary, --secondary-foreground
--muted, --muted-foreground
--accent, --accent-foreground
--destructive, --destructive-foreground
--card, --card-foreground
--popover, --popover-foreground
--border, --input, --ring
--sidebar-* (sidebar-specific tokens)
--chart-1 through --chart-5
```

### Dark Mode
- Full dark mode via CSS `.dark` class
- Separate token values for dark theme
- Toggle in TopBar via `useTheme` hook
- Persisted in localStorage

### Tailwind Config
- Extended with design tokens from CSS variables
- Custom color palette mapped to HSL variables
- Animation utilities from `tailwindcss-animate`
- Custom border radius token

---

## 27. Security Features

| Feature | Implementation |
|---------|---------------|
| Token-based Auth | JWT stored in localStorage |
| Route Protection | `ProtectedRoute` with role checking |
| Session Timeout | `useSessionTimeout` hook — auto-logout on inactivity |
| Session Warning | `SessionWarning` dialog before timeout |
| API Interceptors | Auto-attach token, handle 401 |
| RBAC | 6-role hierarchy enforced on every route |
| Upgrade Gating | `UpgradeGate` blocks features beyond plan limits |

---

## 28. Keyboard Shortcuts

**Component:** `KeyboardShortcutsDialog.tsx`

Keyboard shortcuts for power users (cashiers, managers) to navigate and operate the POS faster. Accessible via `?` key or help menu.

---

## 29. Data Flow Diagram

```
User Action
    ↓
React Component (Page)
    ↓
Zustand Store (local state) ←→ React Query (server state)
    ↓                              ↓
UI Update                     API Client (axios)
                                   ↓
                              Backend API
```

### Cart Flow (POS)
```
Add Item → Cart Store → Recalculate Subtotal
                ↓
     Apply Discount (manual or membership)
                ↓
     Calculate Tax (branch taxRate)
                ↓
     Calculate Total (subtotal - discount + tax)
                ↓
     Checkout → Create Order API → Receipt Dialog
```

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total Pages | 30 |
| UI Components | 50+ |
| Custom Hooks | 6 |
| Zustand Stores | 3 |
| User Roles | 6 |
| TypeScript Interfaces | 15+ |
| Routes | 30+ |

---

*This document covers the complete frontend implementation of CloudPOS from authentication to admin panel, POS terminal to reporting.*
