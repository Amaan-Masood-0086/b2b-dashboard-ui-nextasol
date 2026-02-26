import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const pwSchema = z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(8) });

export default function SettingsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: merchant } = useQuery({
    queryKey: ['merchant-profile'],
    queryFn: () => api.get('/merchants/profile').then(r => r.data),
    enabled: user?.role === 'root_owner',
  });

  const updateMerchant = useMutation({
    mutationFn: (data: any) => api.patch('/merchants/profile', data),
    onSuccess: () => { toast.success('Profile updated'); queryClient.invalidateQueries({ queryKey: ['merchant-profile'] }); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const { register: regPw, handleSubmit: submitPw, formState: { errors: pwErrors }, reset: resetPw } = useForm({ resolver: zodResolver(pwSchema) });

  const changePw = useMutation({
    mutationFn: (data: any) => api.patch('/auth/change-password', data),
    onSuccess: () => { toast.success('Password changed'); resetPw(); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      {user?.role === 'root_owner' && merchant && (
        <Card>
          <CardHeader><CardTitle className="text-base">Business Profile</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); updateMerchant.mutate(Object.fromEntries(fd)); }} className="space-y-3">
              <div className="space-y-1.5"><Label>Business Name</Label><Input name="businessName" defaultValue={merchant.businessName} /></div>
              <div className="space-y-1.5"><Label>Phone</Label><Input name="phone" defaultValue={merchant.phone} /></div>
              <div className="space-y-1.5"><Label>Address</Label><Input name="address" defaultValue={merchant.address} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Currency</Label><Input name="currency" defaultValue={merchant.currency} /></div>
                <div className="space-y-1.5"><Label>Timezone</Label><Input name="timezone" defaultValue={merchant.timezone} /></div>
              </div>
              <Button type="submit" disabled={updateMerchant.isPending}>
                {updateMerchant.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Save
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Change Password</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submitPw((d) => changePw.mutate(d))} className="space-y-3">
            <div className="space-y-1.5"><Label>Current Password</Label><Input type="password" {...regPw('currentPassword')} />{pwErrors.currentPassword && <p className="text-xs text-destructive">{String(pwErrors.currentPassword.message)}</p>}</div>
            <div className="space-y-1.5"><Label>New Password</Label><Input type="password" {...regPw('newPassword')} />{pwErrors.newPassword && <p className="text-xs text-destructive">{String(pwErrors.newPassword.message)}</p>}</div>
            <Button type="submit" disabled={changePw.isPending}>
              {changePw.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Change Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
