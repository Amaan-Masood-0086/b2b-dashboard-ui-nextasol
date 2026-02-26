

# CloudPOS SaaS Enhancement Plan

## Overview
Implement 6 key SaaS-readiness features to make CloudPOS production-ready: Onboarding Wizard, Receipt Generation, Dynamic Currency Formatting, CSV Exports, Keyboard Shortcuts for POS, and Empty States for new accounts.

---

## 1. Post-Registration Onboarding Wizard

Create a new `/onboarding` page that guides new merchants through 4 steps after signup.

**Steps:**
1. Business Profile (timezone, currency, address)
2. Create First Branch (name, phone, address, tax rate)
3. Add First Category + Product
4. Open First Shift

**Implementation:**
- New file: `src/pages/Onboarding.tsx` -- multi-step wizard with a progress bar using the existing `Progress` component
- Add route `/onboarding` in `App.tsx`
- After registration in `Register.tsx`, redirect to `/onboarding` instead of `/`
- Each step calls the appropriate API endpoint; on completion, redirect to `/pos`
- Steps are skippable (except Step 1) with a "Skip for now" button

---

## 2. Receipt Generation (Post-Checkout)

After a successful POS checkout, show a printable receipt dialog.

**Implementation:**
- New component: `src/components/pos/ReceiptDialog.tsx`
- Contains: Business name, branch info, order number, date/time, itemized list with modifiers, subtotal, discount, tax, total, payment method, change (if cash), and a "Thank you" footer
- Two buttons: **Print** (`window.print()` with `@media print` CSS) and **Close**
- In `POS.tsx`, after `handleCheckout` succeeds, open receipt dialog with the order data
- Add print-specific CSS in `src/index.css` using `@media print` to hide everything except the receipt

---

## 3. Dynamic Currency Formatting

Replace all hardcoded `$` symbols with a locale-aware currency formatter.

**Implementation:**
- New utility: `src/lib/currency.ts` -- exports `formatCurrency(amount, currency?)` using `Intl.NumberFormat`
- Default currency read from a Zustand store or merchant config (fallback: `USD`)
- Add `currency` field to auth store from merchant profile
- Update all pages that display money: `POS.tsx`, `Orders.tsx`, `Dashboard.tsx`, `Reports.tsx`, `Menu.tsx`, `Inventory.tsx`, `Shifts.tsx`
- Replace patterns like `` `$${amount.toFixed(2)}` `` with `formatCurrency(amount)`

---

## 4. CSV Export for Orders, Menu, and Inventory

Add "Export CSV" buttons to three pages.

**Implementation:**
- New utility: `src/lib/csv-export.ts` -- generic `exportToCSV(data, columns, filename)` function that creates a Blob and triggers download
- **Orders page**: Export button downloads all filtered orders (order number, date, type, status, customer, total, payment method)
- **Menu page**: Export button downloads all products (name, category, price, cost price, stock, SKU, status)
- **Inventory page**: Export button downloads inventory logs (date, product, type, quantity, reason)
- Wire up existing `Download` icon buttons that are already imported in these pages

---

## 5. POS Keyboard Shortcuts

Add keyboard shortcuts for high-volume cashier usage.

**Implementation:**
- `useEffect` with `keydown` listener in `POS.tsx`
- Shortcuts:
  - `Enter` -- Open checkout dialog (when cart has items)
  - `Escape` -- Close any open dialog / clear search
  - `F2` -- Focus search input
  - `Delete` -- Clear cart (with confirmation)
- Small hint badge shown below the checkout button: "Press Enter to checkout"

---

## 6. Empty States for Fresh Accounts

Add friendly empty states with call-to-action buttons for pages with no data.

**Implementation:**
- New reusable component: `src/components/EmptyState.tsx` -- icon, title, description, CTA button
- Add to: Menu (no products -> "Add your first product"), Categories (no categories -> "Create a category"), Orders (no orders -> "Start taking orders"), Tables (no tables -> "Add a table"), Customers (no customers -> "Add customer"), Inventory (no stock alerts -> show positive message)

---

## Technical Details

### New Files
| File | Purpose |
|------|---------|
| `src/pages/Onboarding.tsx` | Multi-step onboarding wizard |
| `src/components/pos/ReceiptDialog.tsx` | Printable receipt component |
| `src/lib/currency.ts` | Currency formatting utility |
| `src/lib/csv-export.ts` | CSV export utility |
| `src/components/EmptyState.tsx` | Reusable empty state component |

### Modified Files
| File | Changes |
|------|---------|
| `src/App.tsx` | Add `/onboarding` route |
| `src/pages/Register.tsx` | Redirect to `/onboarding` |
| `src/pages/POS.tsx` | Receipt dialog, keyboard shortcuts, currency formatting |
| `src/pages/Orders.tsx` | CSV export, currency formatting |
| `src/pages/Menu.tsx` | CSV export, empty state, currency formatting |
| `src/pages/Dashboard.tsx` | Currency formatting |
| `src/pages/Reports.tsx` | Currency formatting |
| `src/pages/Inventory.tsx` | CSV export, empty state |
| `src/pages/Tables.tsx` | Empty state |
| `src/pages/Categories.tsx` | Empty state |
| `src/pages/Customers.tsx` | Empty state |
| `src/pages/Shifts.tsx` | Currency formatting |
| `src/stores/auth-store.ts` | Add `currency` field |
| `src/index.css` | Add `@media print` styles |
| `src/lib/api.ts` | Add demo data for onboarding endpoints |
| `src/lib/demo-data.ts` | Add onboarding demo responses |

### Execution Order
1. Currency utility + auth store update (foundation)
2. Empty state component (reusable)
3. CSV export utility + wire to pages
4. Onboarding wizard
5. Receipt dialog
6. Keyboard shortcuts
7. Apply currency formatting across all pages

