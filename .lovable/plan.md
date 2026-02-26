

# CloudPOS Enhancement Plan: Production-Ready Polish

## Summary
The app is fully functional with all major features working correctly. The following enhancements will add production-ready polish and missing quality-of-life features.

## 1. Sound Alerts for Kitchen Display
Add an audio notification when new orders arrive on the KDS page to alert kitchen staff who may not be watching the screen.

- Play a short beep/chime sound when a new order appears
- Add a mute/unmute toggle button in the KDS header
- Use the Web Audio API (no external sound files needed) to generate a simple notification tone
- Store mute preference in localStorage

## 2. Print Receipt Support
Add a "Print" button to the receipt dialog that uses `window.print()` with a print-optimized stylesheet.

- Add print CSS media query to hide non-receipt elements
- Format receipt in a thermal-printer-friendly layout (80mm width)
- Include business name, order details, totals, and timestamp

## 3. Keyboard Shortcuts Help Modal
Add a "?" keyboard shortcut that shows all available shortcuts in a modal overlay.

- F2: Focus search in POS
- Enter: Proceed to checkout
- Delete: Clear cart
- Escape: Close dialogs
- Display as a floating help button in POS page footer

## 4. Order Status Sound Notifications
Extend the notification system to play distinct sounds for different event types:
- New order: short chime
- Low stock alert: warning tone
- Add a global sound toggle in Settings page

## 5. Responsive Mobile Improvements
Optimize the KDS and Dashboard pages for mobile/tablet viewing:
- KDS: Single column layout on mobile with larger touch targets
- Dashboard: Stack Quick Actions vertically on small screens
- Ensure all action buttons have minimum 44px touch targets

## Technical Details

### Files to Create
| File | Purpose |
|------|---------|
| `src/hooks/use-sound.ts` | Web Audio API hook for notification sounds |
| `src/components/KeyboardShortcutsDialog.tsx` | Shortcuts help modal |

### Files to Modify
| File | Changes |
|------|---------|
| `src/pages/Kitchen.tsx` | Add sound alerts on new order arrival, mute toggle |
| `src/components/pos/ReceiptDialog.tsx` | Add print button with print-optimized CSS |
| `src/pages/POS.tsx` | Add keyboard shortcuts help button |
| `src/index.css` | Add print media query styles for receipts |
| `src/pages/Settings.tsx` | Add sound notification toggle |

### Implementation Sequence
1. Create `use-sound` hook with Web Audio API
2. Add sound alerts to Kitchen Display
3. Add print receipt functionality
4. Create keyboard shortcuts dialog
5. Mobile responsiveness pass

