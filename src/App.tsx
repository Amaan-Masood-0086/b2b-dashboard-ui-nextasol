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
import ResetPasswordPage from "./pages/ResetPassword";
import DashboardPage from "./pages/Dashboard";
import POSPage from "./pages/POS";
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
import { AdminDashboard, AdminMerchants, AdminSubscriptions } from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected routes with dashboard layout */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/pos" element={<POSPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/modifiers" element={<ModifiersPage />} />
            <Route path="/tables" element={<TablesPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/shifts" element={<ShiftsPage />} />
            <Route path="/branches" element={<BranchesPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/merchants" element={<AdminMerchants />} />
            <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
