
# CloudPOS — Complete Frontend Build Plan

## Overview
Build the entire CloudPOS frontend — a multi-tenant point-of-sale system with 18+ pages, connecting to your existing REST API at `http://localhost:3000/api/v1`. Clean & minimal design with white backgrounds, subtle shadows, and modern SaaS aesthetics.

---

## Foundation & Layout

### API Client & Auth Infrastructure
- Axios instance with JWT interceptor (token from localStorage)
- React Query setup for all data fetching
- Zustand store for auth state (user, token, role) and cart state (POS)
- Protected route wrapper that redirects unauthenticated users to login
- Role-based access control (hide/show pages based on user role)

### App Shell Layout
- **Sidebar** (collapsible) with navigation grouped by section:
  - *Main*: Dashboard, POS
  - *Operations*: Orders, Tables, Shifts
  - *Catalog*: Menu (Products), Categories, Modifiers
  - *Management*: Inventory, Customers
  - *Business*: Reports, Branches, Users
  - *System*: Settings, Audit Logs
- **Top Bar**: Branch selector dropdown, notification bell (with unread count badge polling every 30s), user avatar with dropdown (profile, change password, logout)
- Active route highlighting and role-based menu filtering (cashiers only see POS, Orders, Tables)

---

## Auth Pages (Public, No Sidebar)

### Login Page
- Email + password form with validation
- "Forgot Password?" link
- Stores JWT token and user data on success, redirects to dashboard

### Register Page
- Merchant registration: business name, owner name, email, password, phone
- Creates merchant + root owner account
- Auto-login after registration

### Forgot Password Page
- Email input → calls forgot-password API
- Success message with instructions

### Reset Password Page
- New password form (with token from URL)
- Redirects to login on success

---

## Dashboard (Home Page)
- **Stats Cards**: Today's revenue, total orders, average order value, active tables
- **Weekly Sales Chart** (line/bar chart via Recharts) — 7-day trend
- **Payment Breakdown** (pie/donut chart) — cash vs card vs split
- **Order Type Distribution** (pie chart) — dine-in vs takeaway vs delivery
- **Top Selling Products** (horizontal bar chart or ranked list)
- Date picker to change the report date

---

## POS Terminal
- **Category tabs/filters** across the top
- **Product grid** (cards with image, name, price) — searchable
- **Cart sidebar** on the right:
  - Line items with quantity +/- controls, notes, modifier details
  - Discount input (percentage or fixed)
  - Subtotal, discount, tax, total calculation
  - Order type selector (dine-in, takeaway, delivery)
  - Table selector (for dine-in)
  - Customer selector (optional)
- **Modifier selection dialog**: When adding a product with modifiers, show a modal to pick required/optional modifiers before adding to cart
- **Checkout dialog**: Payment method selection, amount received input (for cash), change calculation
- **Shift bar** at the top: Shows current shift status, open/close shift button, cash movement button

---

## Orders Page
- **Orders table** with columns: Order #, Type, Status, Items count, Total, Payment Method, Date
- **Filters**: Status, payment method, date range, customer
- **Pagination**
- **Order detail dialog/page**: Full order breakdown with items, modifiers, notes, timestamps
- **Actions**: Void order, Refund order (with reason dialog) — for managers/owners only
- **Export CSV** button

---

## Menu (Products) Page
- **Products table**: Name, Category, Price, Cost, Stock, SKU, Status
- **Search & filter** by category, low stock
- **Create/Edit product dialog**: Form with all fields including image upload, category select, modifier group linking
- **Soft-delete** (deactivate) with confirmation
- **Export CSV** button

---

## Categories Management
- Simple list/table of categories with name and sort order
- Inline create/edit/delete

---

## Modifiers Page
- **Modifier groups list**: Name, Required flag, Max selections, Options count
- **Create/Edit modifier group dialog**: Name, isRequired, maxSelect, inline options editor (add/remove options with name, price adjustment, sort order)
- **Delete** modifier group with confirmation

---

## Inventory Page
- **Low stock alerts** section at the top
- **Stock adjustment form**: Select product, quantity, type (add/subtract/adjustment), reason
- **Inventory logs table**: Product, change type, quantity, reason, date — filterable by product and date
- **Export CSV** button

---

## Tables Page (Dine-In)
- **Visual grid** of tables as cards showing: table number, capacity, status (color-coded: green=available, red=occupied, yellow=reserved)
- **Create table dialog**: Table number, capacity
- **Status toggle** on each table card
- **Delete** table with confirmation

---

## Customers (CRM) Page
- **Customers table**: Name, Email, Phone, Total Orders, Total Spent
- **Search** by name/email/phone
- **Create/Edit customer dialog**
- **Customer detail view**: Profile info + order history

---

## Shifts Page
- **Current shift status** card (if open): Opening balance, current expected balance, total sales, cash in/out
- **Open/Close shift dialogs** with balance input
- **Cash movement dialog**: Type (in/out), amount, reason
- **Shift history table**: Open/close times, opening/closing balance, expected balance, variance, total sales

---

## Branches Page
- **Branches table**: Name, Address, Phone, Tax Rate, Currency, Status
- **Create/Edit branch dialog**: All fields
- **Deactivate** branch with confirmation

---

## Users (Staff) Page
- **Users table**: Name, Email, Role, Branch, Status
- **Create user dialog**: Email, password, name, phone, role (cashier/branch_manager), branch assignment
- **Edit user** and **Enable/Disable** toggle

---

## Reports Page
- **Date range selector**
- **Daily summary cards**: Revenue, orders, avg order value
- **Monthly breakdown table/chart**
- **Top products chart**
- **Weekly sales trend chart**
- **Payment method breakdown chart**
- **Order type distribution chart**

---

## Settings Page
- **Merchant profile form**: Business name, phone, address, currency, timezone
- **Change password form**

---

## Audit Logs Page
- **Logs table**: Action, User, Details, Timestamp
- **Filters**: Action type, date
- **Pagination**

---

## Admin Pages (Platform Admin)

### Admin Dashboard
- Platform-wide stats: Total merchants, active subscriptions, revenue

### Merchants Management
- **Merchants table** with details view

### Subscriptions Management
- **Subscription plans list** with create plan
- **Active subscriptions table** with activate/suspend actions

---

## Notifications
- **Bell icon** in top bar with unread count (polled every 30s)
- **Dropdown panel** showing recent notifications
- Mark as read / Mark all as read
- Notification types: Low stock alerts, order alerts, system messages

---

## Design System
- Clean white backgrounds with subtle gray borders
- Consistent card-based layouts with soft shadows
- Primary accent color for CTAs and active states
- Status colors: Green (success/available), Red (error/occupied), Yellow (warning/reserved), Blue (info/pending)
- Responsive design — works on desktop and tablet (POS optimized for tablet landscape)
