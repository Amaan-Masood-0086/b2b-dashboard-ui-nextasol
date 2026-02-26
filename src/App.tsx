import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import OnboardingPage from "./pages/Onboarding";
import ForgotPasswordPage from "./pages/ForgotPassword";
import VerifyEmailPage from "./pages/VerifyEmail";
import ResetPasswordPage from "./pages/ResetPassword";
import DashboardPage from "./pages/Dashboard";
import POSPage from "./pages/POS";
import KitchenPage from "./pages/Kitchen";
import OrdersPage from "./pages/Orders";
import MenuPage from "./pages/Menu";
import CategoriesPage from "./pages/Categories";
import ModifiersPage from "./pages/Modifiers";
import TablesPage from "./pages/Tables";
import InventoryPage from "./pages/Inventory";
import CustomersPage from "./pages/Customers";
import ShiftsPage from "./pages/Shifts";
import BranchesPage from "./pages/Branches";
import UsersPage from "./pages/Users";
import ReportsPage from "./pages/Reports";
import SettingsPage from "./pages/Settings";
import AuditLogsPage from "./pages/AuditLogs";
import BillingPage from "./pages/Billing";
import { AdminDashboard, AdminMerchants, AdminSubscriptions } from "./pages/Admin";
import AdminUsersPage from "./pages/AdminUsers";
import AdminPaymentsPage from "./pages/AdminPayments";
import AdminMerchantDetailPage from "./pages/AdminMerchantDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ADMIN_ROLES = ['super_admin', 'billing_admin', 'support_admin'] as const;
const MERCHANT_ALL = ['root_owner', 'branch_manager', 'cashier'] as const;
const MERCHANT_MGMT = ['root_owner', 'branch_manager'] as const;
const OWNER_ONLY = ['root_owner'] as const;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected routes with dashboard layout */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            {/* Merchant routes */}
            <Route path="/" element={<ProtectedRoute allowedRoles={[...MERCHANT_MGMT]}><DashboardPage /></ProtectedRoute>} />
            <Route path="/pos" element={<ProtectedRoute allowedRoles={[...MERCHANT_ALL]}><POSPage /></ProtectedRoute>} />
            <Route path="/kitchen" element={<ProtectedRoute allowedRoles={[...MERCHANT_ALL]}><KitchenPage /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute allowedRoles={[...MERCHANT_ALL]}><OrdersPage /></ProtectedRoute>} />
            <Route path="/tables" element={<ProtectedRoute allowedRoles={[...MERCHANT_ALL]}><TablesPage /></ProtectedRoute>} />
            <Route path="/shifts" element={<ProtectedRoute allowedRoles={[...MERCHANT_ALL]}><ShiftsPage /></ProtectedRoute>} />
            <Route path="/customers" element={<ProtectedRoute allowedRoles={[...MERCHANT_ALL]}><CustomersPage /></ProtectedRoute>} />
            <Route path="/menu" element={<ProtectedRoute allowedRoles={[...MERCHANT_MGMT]}><MenuPage /></ProtectedRoute>} />
            <Route path="/categories" element={<ProtectedRoute allowedRoles={[...MERCHANT_MGMT]}><CategoriesPage /></ProtectedRoute>} />
            <Route path="/modifiers" element={<ProtectedRoute allowedRoles={[...MERCHANT_MGMT]}><ModifiersPage /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute allowedRoles={[...MERCHANT_MGMT]}><InventoryPage /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute allowedRoles={[...MERCHANT_MGMT]}><ReportsPage /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute allowedRoles={[...MERCHANT_MGMT]}><UsersPage /></ProtectedRoute>} />
            <Route path="/branches" element={<ProtectedRoute allowedRoles={[...OWNER_ONLY]}><BranchesPage /></ProtectedRoute>} />
            <Route path="/billing" element={<ProtectedRoute allowedRoles={[...OWNER_ONLY]}><BillingPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute allowedRoles={[...OWNER_ONLY]}><SettingsPage /></ProtectedRoute>} />
            <Route path="/audit-logs" element={<ProtectedRoute allowedRoles={[...OWNER_ONLY, ...ADMIN_ROLES]}><AuditLogsPage /></ProtectedRoute>} />

            {/* Admin routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={[...ADMIN_ROLES]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/merchants" element={<ProtectedRoute allowedRoles={['super_admin', 'support_admin']}><AdminMerchants /></ProtectedRoute>} />
            <Route path="/admin/merchants/:id" element={<ProtectedRoute allowedRoles={['super_admin', 'support_admin']}><AdminMerchantDetailPage /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['super_admin', 'support_admin']}><AdminUsersPage /></ProtectedRoute>} />
            <Route path="/admin/payments" element={<ProtectedRoute allowedRoles={['super_admin', 'billing_admin']}><AdminPaymentsPage /></ProtectedRoute>} />
            <Route path="/admin/subscriptions" element={<ProtectedRoute allowedRoles={['super_admin', 'billing_admin']}><AdminSubscriptions /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
