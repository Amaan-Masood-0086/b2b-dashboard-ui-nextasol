import { useLocation } from 'react-router-dom';
import {
  LayoutDashboard, MonitorSmartphone, ShoppingCart, UtensilsCrossed,
  Package, Tags, Layers, Warehouse, Users, Building2, BarChart3,
  Settings, ScrollText, Shield, CreditCard, Store, Bell, Clock, ChefHat
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuthStore, UserRole } from '@/stores/auth-store';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  roles?: UserRole[];
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: 'Main',
    items: [
      { title: 'Dashboard', url: '/', icon: LayoutDashboard, roles: ['root_owner', 'branch_manager'] },
      { title: 'POS Terminal', url: '/pos', icon: MonitorSmartphone },
    ],
  },
  {
    label: 'Operations',
    items: [
      { title: 'Orders', url: '/orders', icon: ShoppingCart },
      { title: 'Kitchen', url: '/kitchen', icon: ChefHat },
      { title: 'Tables', url: '/tables', icon: UtensilsCrossed },
      { title: 'Shifts', url: '/shifts', icon: Clock },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { title: 'Products', url: '/menu', icon: Package, roles: ['root_owner', 'branch_manager'] },
      { title: 'Categories', url: '/categories', icon: Tags, roles: ['root_owner', 'branch_manager'] },
      { title: 'Modifiers', url: '/modifiers', icon: Layers, roles: ['root_owner', 'branch_manager'] },
    ],
  },
  {
    label: 'Management',
    items: [
      { title: 'Inventory', url: '/inventory', icon: Warehouse, roles: ['root_owner', 'branch_manager'] },
      { title: 'Customers', url: '/customers', icon: Users },
    ],
  },
  {
    label: 'Business',
    items: [
      { title: 'Reports', url: '/reports', icon: BarChart3, roles: ['root_owner', 'branch_manager'] },
      { title: 'Branches', url: '/branches', icon: Building2, roles: ['root_owner'] },
      { title: 'Staff', url: '/users', icon: Users, roles: ['root_owner', 'branch_manager'] },
    ],
  },
  {
    label: 'System',
    items: [
      { title: 'Billing', url: '/billing', icon: CreditCard, roles: ['root_owner'] },
      { title: 'Settings', url: '/settings', icon: Settings, roles: ['root_owner'] },
      { title: 'Audit Logs', url: '/audit-logs', icon: ScrollText, roles: ['root_owner'] },
    ],
  },
];

const adminSections: NavSection[] = [
  {
    label: 'Platform Admin',
    items: [
      { title: 'Admin Dashboard', url: '/admin', icon: Shield },
      { title: 'Merchants', url: '/admin/merchants', icon: Store },
      { title: 'Users', url: '/admin/users', icon: Users },
      { title: 'Payments', url: '/admin/payments', icon: CreditCard },
      { title: 'Subscriptions', url: '/admin/subscriptions', icon: CreditCard },
      { title: 'Audit Logs', url: '/audit-logs', icon: ScrollText },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { user } = useAuthStore();

  const isPlatformAdmin = user?.role && ['super_admin', 'billing_admin', 'support_admin'].includes(user.role);

  const filterByRole = (items: NavItem[]) => {
    if (!user) return [];
    return items.filter((item) => !item.roles || item.roles.includes(user.role));
  };

  const sections = isPlatformAdmin ? adminSections : navSections;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            CP
          </div>
          {!collapsed && <span className="font-semibold text-lg">CloudPOS</span>}
        </div>
      </SidebarHeader>
      <SidebarContent className="scrollbar-thin">
        {sections.map((section) => {
          const filteredItems = filterByRole(section.items);
          if (filteredItems.length === 0) return null;
          return (
            <SidebarGroup key={section.label}>
              <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredItems.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                        <NavLink to={item.url} end className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                          <item.icon className="h-4 w-4" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-2">
        {!collapsed && user && (
          <div className="px-2 py-1">
            <p className="text-xs font-medium truncate">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-muted-foreground truncate">{user.role.replace('_', ' ')}</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
