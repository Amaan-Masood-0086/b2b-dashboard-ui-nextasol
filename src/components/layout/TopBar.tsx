import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, ChevronDown, LogOut, User, Key, Building2, Moon, Sun } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { useNotificationStore } from '@/stores/notification-store';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Branch, Notification } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTheme } from '@/hooks/use-theme';

export function TopBar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout, selectedBranchId, setSelectedBranchId } = useAuthStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { unreadCount: liveUnreadCount, notifications: liveNotifications, markRead: liveMarkRead, markAllRead: liveMarkAllRead } = useNotificationStore();

  const isPlatformAdmin = user?.role && ['super_admin', 'billing_admin', 'support_admin'].includes(user.role);

  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: () => api.get('/branches').then((r) => r.data),
    enabled: !isPlatformAdmin,
  });

  const { data: unreadCount } = useQuery({
    queryKey: ['notifications-unread'],
    queryFn: () => api.get('/notifications/unread-count').then((r) => r.data?.count ?? 0),
    refetchInterval: 30000,
    enabled: !isPlatformAdmin,
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then((r) => r.data),
    enabled: notifOpen && !isPlatformAdmin,
  });

  const markAllRead = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markRead = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const branchList: Branch[] = Array.isArray(branches) ? branches : branches?.data ?? [];
  const notifList: Notification[] = Array.isArray(notifications) ? notifications : notifications?.data ?? [];

  return (
    <header className="flex h-14 items-center gap-3 border-b bg-card px-4">
      <SidebarTrigger />

      {!isPlatformAdmin && branchList.length > 0 && (
        <Select value={selectedBranchId || ''} onValueChange={setSelectedBranchId}>
          <SelectTrigger className="w-[200px] h-9">
            <Building2 className="h-4 w-4 mr-1 text-muted-foreground" />
            <SelectValue placeholder="Select branch" />
          </SelectTrigger>
          <SelectContent>
            {branchList.map((b: Branch) => (
              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className="flex-1" />

      <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9">
        {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </Button>

      {!isPlatformAdmin && (
        <Popover open={notifOpen} onOpenChange={setNotifOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className={`h-5 w-5 ${(unreadCount ?? 0) + liveUnreadCount > 0 ? 'animate-pulse-bell' : ''}`} />
              {((unreadCount ?? 0) + liveUnreadCount) > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-destructive text-destructive-foreground">
                  {(unreadCount ?? 0) + liveUnreadCount > 99 ? '99+' : (unreadCount ?? 0) + liveUnreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h4 className="font-semibold text-sm">Notifications</h4>
              {((unreadCount ?? 0) + liveUnreadCount) > 0 && (
                <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => { markAllRead.mutate(); liveMarkAllRead(); }}>
                  Mark all read
                </Button>
              )}
            </div>
            <ScrollArea className="h-[300px]">
              {notifList.length === 0 && liveNotifications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No notifications</p>
              ) : (
                <>
                  {liveNotifications.map((n) => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 border-b cursor-pointer hover:bg-muted/50 transition-colors ${!n.isRead ? 'bg-primary/5' : ''}`}
                      onClick={() => !n.isRead && liveMarkRead(n.id)}
                    >
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                    </div>
                  ))}
                  {notifList.map((n: Notification) => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 border-b cursor-pointer hover:bg-muted/50 transition-colors ${!n.isRead ? 'bg-primary/5' : ''}`}
                      onClick={() => !n.isRead && markRead.mutate(n.id)}
                    >
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                    </div>
                  ))}
                </>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 h-9">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <span className="text-sm hidden sm:inline">{user?.firstName}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => navigate('/settings')}>
            <User className="h-4 w-4 mr-2" /> Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/settings')}>
            <Key className="h-4 w-4 mr-2" /> Change Password
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-destructive">
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
