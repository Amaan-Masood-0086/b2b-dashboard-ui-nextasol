import { Timer, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SessionWarningProps {
  open: boolean;
  secondsLeft: number;
  onStayLoggedIn: () => void;
  onLogout: () => void;
}

export function SessionWarning({ open, secondsLeft, onStayLoggedIn, onLogout }: SessionWarningProps) {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
            <Timer className="h-6 w-6 text-warning" />
          </div>
          <AlertDialogTitle className="text-center">Session About to Expire</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Your session will expire in{' '}
            <span className="font-bold text-foreground">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </span>{' '}
            due to inactivity. Would you like to stay logged in?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row gap-2 sm:justify-center">
          <Button variant="outline" onClick={onLogout} className="gap-2">
            <LogOut className="h-4 w-4" /> Logout
          </Button>
          <Button onClick={onStayLoggedIn}>Stay Logged In</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
