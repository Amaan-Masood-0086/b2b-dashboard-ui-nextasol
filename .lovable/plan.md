

# CloudPOS - Gaps & Must-Have Suggestions

## Kya Hai Abhi (Summary)
POS terminal, Kitchen Display, Orders management, Menu/Categories/Modifiers, Inventory, Tables, Customers with Memberships, Shifts, Reports, Dashboard, Billing, Admin panel, Audit logs, Users/Branches management.

---

## MUST-HAVE (Critical Gaps)

### 1. Tax Calculation Missing from POS
**Problem:** Branch model mein `taxRate` field hai lekin POS checkout mein tax calculate hi nahi ho raha. Cart store mein sirf subtotal - discount = total hai. Tax line receipt pe bhi nahi dikhta.

**Fix:** Cart store mein tax calculation add karo (subtotal after discount * taxRate), receipt mein tax line dikhao, checkout mein tax amount backend ko bhejo.

---

### 2. Split Payment Not Implemented
**Problem:** POS checkout mein "Split" payment option button hai lekin select karne pe kuch nahi hota -- sirf cash aur card ka logic hai. Split payment ka koi UI ya flow nahi.

**Fix:** Split payment dialog banao jahan cashier specify kare kitna cash aur kitna card se lena hai. Receipt pe bhi split breakdown dikhao.

---

### 3. Receipt Pe Membership/Tax Info Missing
**Problem:** Receipt mein na tax line hai, na membership discount ka naam. Sirf generic "Discount" likhta hai. Customer ka naam bhi nahi dikhta receipt pe.

**Fix:** Receipt mein add karo: customer name, membership name (e.g. "Gold Member - 15% off"), tax line, aur cashier/staff name.

---

### 4. Membership Expiry Validation Missing
**Problem:** POS pe customer select karte waqt membership discount auto-apply hota hai lekin `validFrom` aur `validUntil` dates check nahi hoti. Expired membership ka discount bhi lag jayega.

**Fix:** Customer select karte waqt membership ki validity check karo. Expired ho to discount apply na karo aur toast dikhao "Membership expired".

---

### 5. Order Notes Not Visible on Receipt
**Problem:** Cart mein per-item notes aur order-level notes dono ka field hai, lekin receipt pe sirf modifiers dikhte hain, notes nahi.

**Fix:** Receipt pe item notes aur order notes section add karo.

---

### 6. Shift Enforcement on POS
**Problem:** POS pe shift bar dikhata hai "Open" ya "No active shift", lekin bina shift ke bhi order bana sakte ho. Real POS mein shift open hona zaroori hota hai checkout ke liye.

**Fix:** Agar shift open nahi hai to checkout button disable karo aur message dikhao "Please open a shift first."

---

### 7. Held/Parked Orders
**Problem:** Real restaurant mein cashier ko order hold pe rakhna padta hai (e.g. customer paying later, waiting for more items). Abhi cart clear ya checkout ke alawa koi option nahi.

**Fix:** "Hold Order" button add karo cart mein. Held orders ki list side mein dikhao. Cashier kisi held order ko recall kar sake.

---

### 8. Order Reprint
**Problem:** Checkout ke baad receipt dialog band karne pe receipt dubara nahi nikaal sakte. Orders page pe bhi reprint ka button nahi hai.

**Fix:** Orders page pe "Print Receipt" button add karo order detail mein.

---

## SHOULD-HAVE (Important but Not Critical)

### 9. Barcode/SKU Scan Search
Product SKU field hai types mein lekin POS search bar sirf name se search karta hai. SKU/barcode scan support add karo.

### 10. Quick Cash Buttons
Cash payment mein manually amount type karna padta hai. Quick buttons add karo (exact amount, nearest 10, nearest 50, nearest 100).

### 11. Multi-Currency / Dynamic Currency from Branch
POS receipt aur cart hardcoded `formatCurrency` use karta hai. Branch ki currency setting dynamically use honi chahiye.

### 12. Table Assignment Auto-Status
Dine-in order banate waqt table select karte ho lekin table status "available" se "occupied" mein automatically nahi badalta.

### 13. Delivery Address Field
Order type "delivery" select karne pe koi address field nahi aata. Delivery orders ke liye address zaroori hai.

### 14. Customer Order History on POS
POS pe customer select karne ke baad uski pichli orders nahi dikhtein. Quick "last order" repeat button useful hoga.

### 15. Kitchen Display - Item-Level Status
KDS mein poori order ka status change hota hai (New > Preparing > Ready). Real kitchens mein item-level tracking hoti hai (e.g. burger ready but fries still cooking).

### 16. Staff Performance Report
Reports mein sirf sales/products/payment data hai. Staff wise orders count aur revenue breakdown nahi hai.

### 17. End-of-Day (EOD) Report
Shift close karte waqt sirf balance/variance dikhta hai. Detailed EOD summary (total orders, payment breakdown, voids, refunds, top items) honi chahiye.

---

## NICE-TO-HAVE (Polish)

### 18. POS Offline Mode
Internet down ho to orders locally save hon aur reconnect pe sync hon.

### 19. Multi-Language Support (i18n)
Abhi sab English mein hai. Arabic/Urdu UI toggle useful hoga for this market.

### 20. Favorites/Quick-Add Products
Cashier apne favorite products pin kar sake for faster access.

---

## Implementation Priority (Recommended Order)

| Priority | Feature | Effort |
|----------|---------|--------|
| 1 | Tax calculation in POS + receipt | Small |
| 2 | Membership expiry validation | Small |
| 3 | Shift enforcement on checkout | Small |
| 4 | Receipt improvements (customer, tax, membership, notes) | Medium |
| 5 | Split payment flow | Medium |
| 6 | Held/parked orders | Medium |
| 7 | Quick cash buttons | Small |
| 8 | Order reprint from Orders page | Small |
| 9 | Delivery address field | Small |
| 10 | Table auto-status update | Small |

---

## Technical Notes

**Files primarily affected:**
- `src/stores/cart-store.ts` -- tax calc, held orders state
- `src/pages/POS.tsx` -- shift enforcement, split payment, held orders UI, delivery address, quick cash
- `src/components/pos/ReceiptDialog.tsx` -- tax, membership, customer, notes display
- `src/lib/api.ts` + `src/lib/demo-data.ts` -- held orders endpoints, table status sync
- `src/pages/Orders.tsx` -- reprint button

Yeh plan sirf analysis hai -- agar koi specific feature implement karwana ho to bata do, main ek ek kar ke bana doon ga.
