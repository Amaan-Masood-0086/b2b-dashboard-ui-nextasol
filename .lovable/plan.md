
# Complete CloudPOS: Real-Time Notifications, Bug Fixes, and Remaining Features

## 1. Fix Build Error in Inventory.tsx
The `UpgradeGate` wrapper has mismatched JSX nesting -- the `<div>` closes before `</UpgradeGate>`. Fix the indentation/nesting so the closing tags are in the correct order.

## 2. Real-Time Notifications via Polling

Since there's no backend/WebSocket available (demo mode), implement a polling-based notification system that simulates real-time order sync across terminals.

### New: Notification Store (`src/stores/notification-store.ts`)
- Zustand store managing a live notification feed
- `addNotification(notification)` pushes to the list and shows a sonner toast
- `notifications`, `unreadCount`, `markRead`, `markAllRead`

### New: Notification Hook (`src/hooks/use-realtime-notifications.ts`)
- Polls `/notifications/unread-count` every 15 seconds using React Query
- When new notifications arrive (count changes), fetches full list and pushes to store
- Shows sonner toast for new notifications (order completed, low stock, etc.)

### New: Live Order Ticker (`src/components/LiveOrderTicker.tsx`)
- Small bar at the top of POS and Dashboard pages showing the latest order activity
- Polls `/orders` every 20 seconds with `refetchInterval`
- Shows "Order #ORD-XXXX just completed" with a fade animation

### Update: TopBar Notifications
- Connect the existing TopBar notification bell to the notification store for real-time count updates
- Add a subtle pulse animation on the bell icon when new notifications arrive

### Demo Data Enhancement
- Add a simulated event generator in demo-data that rotates through fake events (new order, stock alert, shift opened) to make polling feel alive

## 3. Email Verification Flow (Post-Registration)

### New: Email Verification Page (`src/pages/VerifyEmail.tsx`)
- Shows after registration: "We sent a verification code to your email"
- 6-digit OTP input using the existing `input-otp` component
- "Resend code" button with 60-second cooldown timer
- On success, redirect to `/onboarding`

### Updates
- `Register.tsx`: redirect to `/verify-email` instead of `/onboarding`
- `App.tsx`: add `/verify-email` route
- `api.ts` + `demo-data.ts`: add `/auth/verify-email` and `/auth/resend-verification` demo endpoints

## 4. Activity Feed on Dashboard

### Update: Dashboard.tsx
- Add a "Recent Activity" card below existing charts
- Shows last 5 audit log entries (fetched from `/audit-logs`)
- Each entry shows icon, action description, user name, and relative time ("2 min ago")
- Links to full Audit Logs page

## 5. Quick Actions Widget on Dashboard

### Update: Dashboard.tsx
- Add a "Quick Actions" card with shortcut buttons:
  - "New Order" -> `/pos`
  - "Add Product" -> `/menu`
  - "View Reports" -> `/reports`
  - "Manage Staff" -> `/users`
- Uses icon buttons in a 2x2 grid

## 6. Session Timeout / Auto-Logout

### New: Hook (`src/hooks/use-session-timeout.ts`)
- Tracks user activity (mouse, keyboard, scroll)
- After 30 minutes of inactivity, show a warning dialog
- After 5 more minutes, auto-logout via auth store
- Reset timer on any activity

### New: Session Warning Dialog
- "Your session is about to expire" with countdown
- "Stay Logged In" button resets timer
- "Logout" button logs out immediately

### Update: DashboardLayout.tsx
- Include the session timeout hook

## Implementation Sequence

1. **Fix Inventory.tsx build error** (nesting fix)
2. **Notification store + polling hook** (foundation for real-time)
3. **LiveOrderTicker + TopBar pulse animation**
4. **Email verification page + routing**
5. **Dashboard enhancements** (activity feed + quick actions)
6. **Session timeout hook + warning dialog**

## Technical Details

### Files to Create
| File | Purpose |
|------|---------|
| `src/stores/notification-store.ts` | Zustand store for live notifications |
| `src/hooks/use-realtime-notifications.ts` | Polling hook for notification updates |
| `src/components/LiveOrderTicker.tsx` | Animated order activity bar |
| `src/pages/VerifyEmail.tsx` | Email verification OTP page |
| `src/hooks/use-session-timeout.ts` | Inactivity auto-logout hook |
| `src/components/SessionWarning.tsx` | Session expiry warning dialog |

### Files to Modify
| File | Changes |
|------|---------|
| `src/pages/Inventory.tsx` | Fix JSX nesting build error |
| `src/components/layout/TopBar.tsx` | Pulse animation on bell, connect to notification store |
| `src/pages/Dashboard.tsx` | Add activity feed + quick actions cards |
| `src/pages/POS.tsx` | Add LiveOrderTicker |
| `src/pages/Register.tsx` | Redirect to `/verify-email` |
| `src/App.tsx` | Add `/verify-email` route |
| `src/lib/api.ts` | Add verify-email, resend-verification demo endpoints |
| `src/lib/demo-data.ts` | Add simulated notification events |
| `src/components/layout/DashboardLayout.tsx` | Add session timeout hook |
| `src/index.css` | Add pulse animation keyframes |
