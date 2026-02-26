

# Root Admin Panel with Full RBAC

## Overview
Build a comprehensive Root Admin panel where platform admins (`super_admin`) can manage all merchants, users, payments, and subscriptions. Enforce proper RBAC on all routes so each role only accesses what they're allowed to.

## 1. Enforce RBAC on All Routes

Currently all protected routes are accessible to any logged-in user. We'll add `allowedRoles` to every route in `App.tsx`.

**Changes to `App.tsx`:**
- Admin routes (`/admin/*`) restricted to `super_admin`, `billing_admin`, `support_admin`
- Business routes (`/billing`, `/settings`, `/branches`, `/audit-logs`) restricted to `root_owner`
- Management routes (`/menu`, `/categories`, `/modifiers`, `/inventory`, `/reports`, `/users`) restricted to `root_owner`, `branch_manager`
- Operational routes (`/pos`, `/orders`, `/kitchen`, `/tables`, `/shifts`, `/customers`) open to all merchant roles
- Dashboard restricted to `root_owner`, `branch_manager`

Each route will be wrapped: `<ProtectedRoute allowedRoles={[...]}><PageComponent /></ProtectedRoute>`

## 2. Enhanced Admin Users Page

**New file: `src/pages/AdminUsers.tsx`**
A full user management page for platform admins showing ALL users across ALL merchants:
- Table with columns: Name, Email, Role, Merchant, Branch, Status, Last Login, Actions
- Search/filter by name, email, role, merchant
- Actions: Edit role, activate/deactivate, reset password, view details
- Dialog for editing user details and changing roles
- Bulk actions: deactivate multiple users

## 3. Admin Payments & Revenue Page

**New file: `src/pages/AdminPayments.tsx`**
A detailed payments/revenue page for platform admins:
- Revenue overview cards: Total Revenue, Monthly Revenue, Active Subscriptions, MRR
- Revenue trend chart (monthly) using Recharts
- Payments table: all invoices across merchants with date, merchant, plan, amount, status
- Filter by date range, merchant, payment status
- Export payments to CSV

## 4. Admin Merchant Detail View

**New file: `src/pages/AdminMerchantDetail.tsx`**
When admin clicks a merchant in the merchants list:
- Business info card (name, address, currency, timezone)
- Subscription status and plan details
- List of branches under this merchant
- List of users/staff under this merchant
- Recent orders summary
- Actions: suspend merchant, change plan, add notes

## 5. Demo Data Additions

**Changes to `src/lib/demo-data.ts`:**
- Add `DEMO_ADMIN_USERS` with users across multiple merchants
- Add `DEMO_ADMIN_PAYMENTS` with payment/invoice records across merchants
- Add `DEMO_ADMIN_REVENUE_STATS` with MRR, revenue trends
- Add a second demo merchant for realistic admin view

**Changes to `src/lib/api.ts`:**
- Add demo endpoints: `/admin/users`, `/admin/payments`, `/admin/revenue`, `/admin/merchants/:id`

## 6. Admin Login Support

**Changes to `src/pages/Login.tsx`:**
- Add a second demo login button: "Admin Login" that logs in as `super_admin`

**Changes to `src/lib/demo-data.ts`:**
- Add `DEMO_ADMIN_USER` with role `super_admin`

## 7. Updated Sidebar for Admin

**Changes to `src/components/layout/AppSidebar.tsx`:**
- Add "Users" and "Payments" to `adminSections`
- Add "Audit Logs" to admin sections (platform-wide logs)

## 8. Route & Navigation Updates

**Changes to `App.tsx`:**
- Add routes: `/admin/users`, `/admin/payments`, `/admin/merchants/:id`
- Wrap all routes with appropriate `allowedRoles`

## 9. Role-Based Landing Page

**Changes to `ProtectedRoute.tsx` or `App.tsx`:**
- When `super_admin` logs in, redirect to `/admin` instead of `/`
- When `cashier` logs in, redirect to `/pos` instead of `/`

## Implementation Sequence

1. Update demo data with admin users, payments, and revenue stats
2. Update api.ts with new admin demo endpoints
3. Create AdminUsers.tsx page
4. Create AdminPayments.tsx page
5. Create AdminMerchantDetail.tsx page
6. Enforce RBAC on all routes in App.tsx
7. Update AppSidebar with new admin nav items
8. Add admin demo login button
9. Add role-based redirect after login

## Technical Details

### Files to Create
| File | Purpose |
|------|---------|
| `src/pages/AdminUsers.tsx` | Platform-wide user management |
| `src/pages/AdminPayments.tsx` | Revenue and payment tracking |
| `src/pages/AdminMerchantDetail.tsx` | Individual merchant detail view |

### Files to Modify
| File | Changes |
|------|---------|
| `src/App.tsx` | Add new admin routes, enforce RBAC on all routes |
| `src/lib/demo-data.ts` | Add admin demo data (users, payments, revenue) |
| `src/lib/api.ts` | Add admin demo endpoints |
| `src/components/layout/AppSidebar.tsx` | Add Users, Payments to admin sidebar |
| `src/pages/Login.tsx` | Add admin demo login button |
| `src/pages/Admin.tsx` | Update AdminMerchants to link to detail page |
| `src/components/ProtectedRoute.tsx` | Add role-based default redirect logic |

### Role Permission Matrix

```text
Page                 | super_admin | billing_admin | support_admin | root_owner | branch_manager | cashier
---------------------|-------------|---------------|---------------|------------|----------------|--------
Admin Dashboard      |     Y       |      Y        |      Y        |            |                |
Admin Merchants      |     Y       |               |      Y        |            |                |
Admin Users          |     Y       |               |      Y        |            |                |
Admin Payments       |     Y       |      Y        |               |            |                |
Admin Subscriptions  |     Y       |      Y        |               |            |                |
Dashboard            |             |               |               |     Y      |       Y        |
POS                  |             |               |               |     Y      |       Y        |   Y
Kitchen              |             |               |               |     Y      |       Y        |   Y
Orders               |             |               |               |     Y      |       Y        |   Y
Menu/Categories      |             |               |               |     Y      |       Y        |
Inventory/Reports    |             |               |               |     Y      |       Y        |
Branches             |             |               |               |     Y      |                |
Billing/Settings     |             |               |               |     Y      |                |
Staff                |             |               |               |     Y      |       Y        |
Audit Logs           |     Y       |               |      Y        |     Y      |                |
```
