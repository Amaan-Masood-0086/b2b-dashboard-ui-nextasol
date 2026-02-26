import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import api from '@/lib/api';
import { DEMO_MODE, DEMO_USER, DEMO_TOKEN, DEMO_ADMIN_USER, DEMO_ADMIN_TOKEN } from '@/lib/demo-data';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => api.post('/auth/login', data) as Promise<{ data: any }>,
    onSuccess: (res: any) => {
      const { accessToken, user } = res.data;
      login(accessToken, user);
      toast.success('Welcome back!');
      navigate('/');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Login failed');
    },
  });

  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4"
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg">
            CP
          </div>
          <CardTitle className="text-2xl">Sign in to CloudPOS</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Sign In
            </Button>
            {DEMO_MODE && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    login(DEMO_TOKEN, DEMO_USER);
                    toast.success('Logged in with demo account!');
                    navigate('/');
                  }}
                >
                  🚀 Demo Login (Merchant Owner)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-primary/30 text-primary"
                  onClick={() => {
                    login(DEMO_ADMIN_TOKEN, DEMO_ADMIN_USER as any);
                    toast.success('Logged in as Platform Admin!');
                    navigate('/admin');
                  }}
                >
                  🛡️ Admin Login (Platform Admin)
                </Button>
              </>
            )}
            <div className="flex items-center justify-between w-full text-sm">
              <Link to="/forgot-password" className="text-primary hover:underline">Forgot password?</Link>
              <Link to="/register" className="text-primary hover:underline">Create account</Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
