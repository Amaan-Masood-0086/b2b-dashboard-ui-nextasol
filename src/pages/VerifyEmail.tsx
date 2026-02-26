import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Loader2, Mail, RotateCw } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const verifyMutation = useMutation({
    mutationFn: (otp: string) => api.post('/auth/verify-email', { code: otp }) as Promise<any>,
    onSuccess: () => {
      toast.success('Email verified successfully!');
      navigate('/onboarding');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Invalid code');
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => api.post('/auth/resend-verification') as Promise<any>,
    onSuccess: () => {
      toast.success('Verification code resent!');
      setCooldown(60);
    },
    onError: () => toast.error('Failed to resend code'),
  });

  const handleComplete = (value: string) => {
    setCode(value);
    if (value.length === 6) {
      verifyMutation.mutate(value);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">Verify your email</CardTitle>
          <CardDescription>We sent a 6-digit verification code to your email address</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={code} onChange={handleComplete}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            onClick={() => verifyMutation.mutate(code)}
            disabled={code.length !== 6 || verifyMutation.isPending}
            className="w-full"
          >
            {verifyMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Verify Email
          </Button>

          <div className="text-sm text-muted-foreground">
            Didn't receive the code?{' '}
            <Button
              variant="link"
              className="p-0 h-auto text-sm"
              disabled={cooldown > 0 || resendMutation.isPending}
              onClick={() => resendMutation.mutate()}
            >
              <RotateCw className="h-3 w-3 mr-1" />
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
