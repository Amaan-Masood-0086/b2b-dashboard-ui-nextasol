import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Building2, CreditCard, Users, MapPin, Phone, Globe } from 'lucide-react';
import api from '@/lib/api';
import { DEMO_ADMIN_USERS } from '@/lib/demo-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export default function AdminMerchantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: merchant } = useQuery({
    queryKey: ['admin-merchant', id],
    queryFn: () => api.get(`/admin/merchants/${id}`).then((r: any) => r.data),
  });

  const merchantUsers = DEMO_ADMIN_USERS.filter((u) => u.merchantId === id);

  if (!merchant) return <div className="p-6 text-muted-foreground">Loading...</div>;

  const handleSuspend = () => toast.success(`${merchant.businessName} ${merchant.status === 'suspended' ? 'reactivated' : 'suspended'}`);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/merchants')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{merchant.businessName}</h1>
          <p className="text-sm text-muted-foreground">Merchant ID: {merchant.id}</p>
        </div>
        <Badge variant={merchant.status === 'active' ? 'default' : 'destructive'} className="capitalize text-sm">
          {merchant.status}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Plan</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{merchant.planName}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Branches</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{merchant.branchCount}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{merchant.userCount}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Business Information</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" /> {merchant.address}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" /> {merchant.phone}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Globe className="h-4 w-4 text-muted-foreground" /> {merchant.currency} · {merchant.timezone}
          </div>
          <Separator />
          <p className="text-xs text-muted-foreground">Created: {merchant.createdAt}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Staff ({merchantUsers.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {merchantUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.firstName} {u.lastName}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{u.role.replace('_', ' ')}</Badge></TableCell>
                  <TableCell><Badge variant={u.isActive ? 'default' : 'secondary'}>{u.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                </TableRow>
              ))}
              {merchantUsers.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No users found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant={merchant.status === 'suspended' ? 'default' : 'destructive'} onClick={handleSuspend}>
          {merchant.status === 'suspended' ? 'Reactivate Merchant' : 'Suspend Merchant'}
        </Button>
      </div>
    </div>
  );
}
