import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { TopBar } from '@/components/layout/TopBar';
import { SessionWarning } from '@/components/SessionWarning';
import { useSessionTimeout } from '@/hooks/use-session-timeout';
import { useRealtimeNotifications } from '@/hooks/use-realtime-notifications';

export function DashboardLayout() {
  const { showWarning, secondsLeft, stayLoggedIn, logout } = useSessionTimeout();
  useRealtimeNotifications();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
      <SessionWarning
        open={showWarning}
        secondsLeft={secondsLeft}
        onStayLoggedIn={stayLoggedIn}
        onLogout={logout}
      />
    </SidebarProvider>
  );
}
