

# Analysis: Kya Complete Hai, Kya Remaining Hai

## Current Status

### Signup/Registration Flow
Abhi signup ka flow yeh hai:
```text
Register --> Verify Email (OTP) --> Onboarding (4 steps) --> POS/Dashboard
```

**Problem:** Demo mode mein register karne pe har baar same DEMO_USER return hota hai -- form ka data (business name, email etc.) use nahi hota. Real backend ke bina signup sirf simulation hai.

**Subscription ka masla:** Signup ke baad koi subscription automatically create nahi hoti. Merchant ko manually Billing page pe jaa kar plan select karna parega. Koi free trial ya default plan assign nahi ho raha.

### Merchant Detail Page (AdminMerchantDetail) -- Missing Fields
Abhi sirf yeh dikhta hai:
- Plan name, Branch count, Staff count (cards)
- Business info (address, phone, currency, timezone)
- Staff table
- Suspend/Reactivate button

**Missing:**
- Branches ki list (sirf count hai, actual branches nahi)
- Subscription details (billing dates, payment history, plan pricing)
- Recent orders summary
- "Change Plan" button for admin
- Notes/comments section
- Logo/business type fields

---

## Plan: Complete the Gaps

### 1. Signup Flow with Auto Subscription
Register karne ke baad merchant ko automatically "Starter" plan (free trial 14 days) assign ho.

**Changes:**
- `src/lib/demo-data.ts`: Register endpoint mein dynamic user create karo (form data use karo, unique IDs generate karo)
- `src/lib/api.ts`: `/auth/register` response mein `subscription` object bhi return karo with trial status
- `src/pages/Onboarding.tsx`: Step 1 mein plan selection add karo (Starter free trial pre-selected) ya Onboarding complete hone ke baad Billing page suggest karo

### 2. Enhanced Merchant Detail Page
AdminMerchantDetail mein missing sections add karo:

**Changes to `src/pages/AdminMerchantDetail.tsx`:**
- **Subscription Card**: Plan name, price, status (active/trial/past_due), billing period, next renewal date
- **Branches Table**: List of all branches with name, address, status (not just count)
- **Recent Orders**: Last 5 orders summary with total revenue
- **Change Plan Dialog**: Admin can upgrade/downgrade merchant's plan
- **Notes Section**: Admin can add internal notes about the merchant
- **Business Logo Placeholder**: Show business type / category

**Changes to `src/lib/demo-data.ts`:**
- Add `DEMO_MERCHANT_BRANCHES` mapped by merchant ID
- Add `DEMO_MERCHANT_ORDERS_SUMMARY` with recent order stats
- Add subscription details to each merchant object (planPrice, trialEnd, nextBillingDate)

**Changes to `src/lib/api.ts`:**
- Add endpoints: `/admin/merchants/:id/branches`, `/admin/merchants/:id/orders`, `/admin/merchants/:id/notes`
- Add `PATCH /admin/merchants/:id/plan` for plan changes

### 3. Register Page with Dynamic User Creation
Register form ka data actually use ho -- unique merchant + user create ho demo mode mein bhi.

**Changes to `src/lib/api.ts`:**
- `/auth/register` endpoint mein form data se dynamic user object banao (random ID, submitted email/name)
- New merchant object bhi create karo with submitted business name

**Changes to `src/pages/Register.tsx`:**
- Dark mode toggle add karo (same as Login page)
- Password confirmation field add karo
- Terms & conditions checkbox

### 4. Post-Signup Subscription Activation
Billing page pe in-app subscription activate karne ka proper flow:

**Changes to `src/pages/Billing.tsx`:**
- "Activate Trial" banner for new merchants without active subscription
- Trial countdown (14 days remaining)
- Upgrade CTA more prominent for trial users

### 5. Auth Pages Consistency
Register, ForgotPassword, ResetPassword pages mein bhi dark mode toggle add karo (Login mein already hai).

**Changes:**
- `src/pages/Register.tsx`: Dark mode toggle (top-right)
- `src/pages/ForgotPassword.tsx`: Dark mode toggle
- `src/pages/ResetPassword.tsx`: Dark mode toggle
- `src/pages/VerifyEmail.tsx`: Dark mode toggle

---

## Technical Details

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/AdminMerchantDetail.tsx` | Add branches list, subscription card, recent orders, change plan dialog, notes |
| `src/lib/demo-data.ts` | Add merchant branches, order summaries, subscription details, dynamic register |
| `src/lib/api.ts` | Dynamic register response, new merchant detail endpoints |
| `src/pages/Register.tsx` | Dark mode toggle, password confirm, terms checkbox |
| `src/pages/Billing.tsx` | Trial banner, upgrade CTA for new merchants |
| `src/pages/ForgotPassword.tsx` | Dark mode toggle |
| `src/pages/ResetPassword.tsx` | Dark mode toggle |
| `src/pages/VerifyEmail.tsx` | Dark mode toggle |

### Updated Merchant Detail Sections

```text
+---------------------------+
| Header: Name + Status     |
+---------------------------+
| Plan | Branches | Staff   |  <-- stat cards (existing)
+---------------------------+
| Subscription Details      |  <-- NEW: plan, price, trial/active, renewal date
+---------------------------+
| Business Information      |  <-- existing
+---------------------------+
| Branches (table)          |  <-- NEW: actual branch list
+---------------------------+
| Recent Orders             |  <-- NEW: last 5 orders + revenue
+---------------------------+
| Staff (table)             |  <-- existing
+---------------------------+
| Admin Notes               |  <-- NEW: internal notes
+---------------------------+
| Actions                   |  <-- existing + Change Plan button
+---------------------------+
```

### Signup Flow (Updated)

```text
Register (form data used)
    |
    v
Verify Email (6-digit OTP)
    |
    v
Onboarding (4 steps: Profile, Branch, Product, Shift)
    |
    v
Dashboard (Starter trial auto-assigned)
    |
    v
Billing page --> Upgrade to Pro/Enterprise
```

### Implementation Sequence

1. Update demo-data with merchant branches, subscription details, order summaries
2. Update api.ts with dynamic register + new merchant detail endpoints
3. Enhance AdminMerchantDetail with all missing sections
4. Update Register page (dark toggle, password confirm, terms)
5. Update Billing page with trial banner
6. Add dark mode toggle to remaining auth pages

