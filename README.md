<div align="center">

<img src="https://img.shields.io/badge/NextaSol-CloudPOS-0ea5e9?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMyAyTDMgMTRoOWwtMSA4IDEwLTEyaC05bDEtOHoiLz48L3N2Zz4=&logoColor=white" alt="NextaSol CloudPOS" />

# ☁️ CloudPOS — Cloud Point of Sale System

### **Enterprise-grade, multi-tenant SaaS POS frontend built by [NextaSol](https://nextasol.com)**

*Empowering restaurants, cafes, and retail businesses with a modern, scalable cloud POS experience.*

<br/>

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.x-61dafb?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646cff?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.x-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-latest-000000?style=flat-square&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](./LICENSE)

<br/>

[🚀 Live Demo](#demo) · [📖 Documentation](./DOCUMENTATION.md) · [🐛 Report Bug](https://github.com/Amaan-Masood-0086/b2b-dashboard-ui-nextasol/issues) · [💡 Request Feature](https://github.com/Amaan-Masood-0086/b2b-dashboard-ui-nextasol/issues)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [Screenshots](#-screenshots)
- [Demo](#-demo)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

---

## 🌟 Overview

**CloudPOS** is a production-ready, multi-tenant **SaaS Point of Sale frontend** engineered by **NextaSol**. It delivers a full-featured POS experience in the browser — no desktop software required.

Built for **restaurants, cafés, food chains, and retail businesses**, CloudPOS handles everything from the cashier terminal and kitchen display to shift tracking, inventory, analytics, and multi-branch administration — all under one roof with role-based access control.

> 💡 **Product Type:** B2B SaaS Dashboard / POS Frontend Template  
> 🎯 **Target Audience:** Merchants, Restaurant Chains, Retail Businesses, SaaS Developers  
> 🏢 **Built by:** NextaSol — System-focused software solutions

### Why CloudPOS?

| Challenge | CloudPOS Solution |
|-----------|------------------|
| Managing multiple branches | Centralized multi-branch dashboard |
| Real-time kitchen coordination | Built-in Kitchen Display System (KDS) |
| Staff access management | 6-tier role-based access control |
| Tracking sales & inventory | Integrated reports, charts & CSV export |
| Subscription management | Built-in billing & plan comparison UI |

---

## ✨ Features

### 🖥️ POS Terminal
- Full point-of-sale interface with product grid + cart
- Category filters, product search by name or SKU
- Modifier selection dialog (required/optional groups)
- Customer attachment with auto-applied membership discounts
- Order types: **Dine-in**, **Takeaway**, **Delivery**
- Table assignment for dine-in orders
- Delivery address field for delivery orders
- Cash / Card / **Split payment** support
- Quick cash buttons for fast cash handling
- Hold & recall orders (parked orders)
- Auto-generated receipt dialog with print support
- Shift enforcement — checkout blocked without an active shift

### 🍳 Kitchen Display System (KDS)
- Real-time order cards with color-coded status
- Status flow: `New → Preparing → Ready`
- One-click status advancement
- Order type badges and item modifier display
- Auto-refresh for new incoming orders

### 📦 Orders Management
- Paginated order list with status, date, and type filters
- Full order detail view with tax breakdown
- Void, refund, and complete actions
- Reprint receipt from order history
- CSV export

### 🛒 Menu, Categories & Modifiers
- Full CRUD for products (name, price, cost, SKU, stock, image)
- Category management with sort order
- Modifier groups with multiple options and price adjustments
- Active/inactive product toggles

### 📊 Reports & Analytics
- Sales revenue over time (line chart)
- Top-selling products (bar chart)
- Payment method breakdown (pie chart)
- Custom date range filter
- CSV export for all reports

### 👥 Customers & Memberships
- Customer database with full CRUD
- Membership/loyalty programs with discount types:
  - Percentage discount
  - Fixed amount discount
  - Free delivery
  - Custom deals
- Membership validity periods with auto-expiry enforcement in POS

### 🏢 Multi-Branch Management
- Add and manage unlimited branches
- Per-branch tax rate and currency
- Branch selector in top navigation for context switching

### 👤 Users & Roles (RBAC)
| Role | Scope | Access |
|------|-------|--------|
| `super_admin` | Platform | Full admin panel |
| `billing_admin` | Platform | Payments & subscriptions |
| `support_admin` | Platform | Merchant support |
| `root_owner` | Merchant | Full merchant control |
| `branch_manager` | Branch | Branch operations & reports |
| `cashier` | Branch | POS, Kitchen, Orders, Shifts |

### 💳 Billing & Subscriptions
- Current plan display (Starter / Professional / Enterprise)
- 14-day trial countdown banner
- Plan comparison table with upgrade flow
- Payment history and invoice management

### 🔒 Security
- JWT token-based authentication (localStorage)
- `ProtectedRoute` with role validation on every route
- Session timeout with warning dialog before auto-logout
- Axios interceptors — auto-attaches auth token, handles 401
- `UpgradeGate` — blocks features beyond plan limits

### ⚡ Developer Experience
- Dark mode with CSS custom properties (design tokens)
- Keyboard shortcuts for power users (`?` key)
- CSV export across Orders, Customers, Inventory, Reports
- Fully typed with TypeScript interfaces for all models
- Zustand for local state, TanStack React Query for server state

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 18 + TypeScript |
| **Build Tool** | Vite 5 |
| **Styling** | Tailwind CSS 3 + tailwindcss-animate |
| **UI Components** | shadcn/ui (Radix UI primitives, 50+ components) |
| **State Management** | Zustand (client state) |
| **Server State** | TanStack React Query v5 |
| **Routing** | React Router DOM v6 |
| **Charts** | Recharts |
| **Forms** | React Hook Form + Zod validation |
| **HTTP Client** | Axios (with interceptors) |
| **Icons** | Lucide React |
| **Notifications** | Sonner (toast) |
| **Date Utils** | date-fns |
| **Testing** | Vitest + React Testing Library |
| **Linting** | ESLint + TypeScript ESLint |

---

## 🏗️ Architecture

```
b2b-dashboard-ui-nextasol/
├── public/                    # Static assets
├── src/
│   ├── pages/                 # 30 route-level page components
│   │   ├── Dashboard.tsx      # KPI cards, charts, recent orders
│   │   ├── POS.tsx            # Full POS terminal
│   │   ├── Kitchen.tsx        # Kitchen Display System
│   │   ├── Orders.tsx         # Order management
│   │   ├── Menu.tsx           # Product/menu management
│   │   ├── Reports.tsx        # Sales & analytics
│   │   ├── Billing.tsx        # Subscription & billing
│   │   ├── Admin.tsx          # Super admin panel
│   │   └── ...                # 22 more pages
│   │
│   ├── components/
│   │   ├── ui/                # 50+ shadcn/ui primitives
│   │   ├── layout/            # AppSidebar, DashboardLayout, TopBar
│   │   ├── pos/               # ReceiptDialog
│   │   ├── ProtectedRoute.tsx # Auth + RBAC route guard
│   │   ├── EmptyState.tsx     # Empty list placeholder
│   │   ├── SessionWarning.tsx # Session timeout dialog
│   │   ├── UpgradeGate.tsx    # Plan-limit feature gate
│   │   └── LiveOrderTicker.tsx
│   │
│   ├── stores/                # Zustand global state
│   │   ├── auth-store.ts      # Auth state + persistence
│   │   ├── cart-store.ts      # POS cart with full business logic
│   │   └── notification-store.ts
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── use-mobile.tsx
│   │   ├── use-session-timeout.ts
│   │   ├── use-realtime-notifications.ts
│   │   ├── use-sound.ts
│   │   ├── use-theme.ts
│   │   └── use-toast.ts
│   │
│   ├── lib/                   # Utilities & shared logic
│   │   ├── api.ts             # Axios client with interceptors
│   │   ├── types.ts           # TypeScript interfaces (15+ models)
│   │   ├── demo-data.ts       # Mock data for all entities
│   │   ├── csv-export.ts      # CSV generation & download
│   │   ├── currency.ts        # Dynamic currency formatting
│   │   └── utils.ts           # cn() helper
│   │
│   ├── App.tsx                # Root component with all routes
│   ├── index.css              # Design tokens + Tailwind base
│   └── main.tsx               # React entry point
│
├── .env.example               # Environment variable reference
├── DOCUMENTATION.md           # Full technical documentation
├── package.json
├── tailwind.config.ts
├── vite.config.ts
└── tsconfig.json
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x (or `bun`)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Amaan-Masood-0086/b2b-dashboard-ui-nextasol.git

# 2. Navigate into the project
cd b2b-dashboard-ui-nextasol

# 3. Install dependencies
npm install

# 4. Copy environment variables
cp .env.example .env.local

# 5. Start the development server
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server (hot reload) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint checks |
| `npm test` | Run test suite (Vitest) |
| `npm run test:watch` | Run tests in watch mode |

---

## 🔐 Environment Variables

Create a `.env.local` file in the root directory. Reference `.env.example` for all available options:

```env
# API Configuration
VITE_API_BASE_URL=https://api.yourbackend.com/v1

# App Settings
VITE_APP_NAME=CloudPOS
VITE_APP_VERSION=1.0.0

# Demo Mode (set to true to use mock data without a backend)
VITE_DEMO_MODE=true

# Session Settings (in minutes)
VITE_SESSION_TIMEOUT_MINUTES=30
```

> **Note:** All environment variables must be prefixed with `VITE_` to be accessible in the browser. Never commit your `.env.local` file to version control.

---

## 📸 Screenshots

> *(Screenshots will be added after first production deployment)*

| Dashboard | POS Terminal |
|-----------|-------------|
| ![Dashboard](./public/screenshots/dashboard.png) | ![POS](./public/screenshots/pos.png) |

| Kitchen Display | Reports |
|----------------|---------|
| ![Kitchen](./public/screenshots/kitchen.png) | ![Reports](./public/screenshots/reports.png) |

---

## 🎮 Demo

> 🚧 **Demo Coming Soon**  
> A live demo environment with pre-seeded mock data is being deployed.  
> Contact [NextaSol](mailto:hello@nextasol.com) for early access.

**Demo Credentials (local demo mode):**

| Role | Email | Password |
|------|-------|----------|
| Root Owner | `owner@demo.com` | `demo1234` |
| Branch Manager | `manager@demo.com` | `demo1234` |
| Cashier | `cashier@demo.com` | `demo1234` |
| Super Admin | `admin@demo.com` | `demo1234` |

---

## 🗺️ Roadmap

### Phase 1 — Current (v1.0)
- [x] Full POS terminal with split payments
- [x] Kitchen Display System
- [x] Multi-branch management
- [x] RBAC with 6 roles
- [x] Sales reports & analytics
- [x] Membership & loyalty programs
- [x] Billing & subscription management
- [x] Dark mode + keyboard shortcuts

### Phase 2 — In Progress (v1.1)
- [ ] Real-time order updates via WebSocket
- [ ] Offline-first mode (PWA with service workers)
- [ ] Product image upload via cloud storage
- [ ] Multi-language / i18n support
- [ ] Barcode scanner integration (USB/Bluetooth)

### Phase 3 — Planned (v2.0)
- [ ] Mobile cashier app (React Native companion)
- [ ] Customer-facing display screen
- [ ] Advanced analytics with AI-driven insights
- [ ] Third-party integrations (Stripe, PayPal, Grab, Spotify for Kitchen BGM)
- [ ] Franchise management panel
- [ ] White-label / custom branding per merchant
- [ ] Native receipt printer support (ESC/POS)

---

## 🤝 Contributing

We welcome contributions from the community! This project follows standard open-source contribution practices.

### How to Contribute

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature-name`
3. **Commit** your changes: `git commit -m "feat: add your feature"`
4. **Push** to the branch: `git push origin feature/your-feature-name`
5. **Open** a Pull Request

### Contribution Guidelines

- Follow the existing code style (TypeScript strict, ESLint rules)
- Ensure all components are fully typed
- Write tests for new utility functions
- Update `DOCUMENTATION.md` for any new features
- Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`

### Reporting Issues

Found a bug or have a feature request? [Open an issue](https://github.com/Amaan-Masood-0086/b2b-dashboard-ui-nextasol/issues) with a clear description and steps to reproduce.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

## 👤 Author

<div align="center">

**Built & maintained by [NextaSol](https://nextasol.com)**

*System-focused software solutions for modern businesses*

[![GitHub](https://img.shields.io/badge/GitHub-Amaan--Masood--0086-181717?style=flat-square&logo=github)](https://github.com/Amaan-Masood-0086)
[![Email](https://img.shields.io/badge/Email-hello%40nextasol.com-0ea5e9?style=flat-square&logo=gmail&logoColor=white)](mailto:hello@nextasol.com)

</div>

---

<div align="center">

**[NextaSol](https://nextasol.com)** — *Engineering reliable systems, one product at a time.*

⭐ If CloudPOS helped you, please consider giving it a star!

</div>
