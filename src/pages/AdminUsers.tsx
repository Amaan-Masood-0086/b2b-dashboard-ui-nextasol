import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, UserCog, Shield, MoreHorizontal } from 'lucide-react';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const ROLE_COLORS: Record<string, string> = {
  root_owner: 'bg-primary/10 text-primary',
  branch_manager: 'bg-info/10 text-info',
  cashier: 'bg-muted text-muted-foreground',
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editUser, setEditUser] = useState<any>(null);
  const [editRole, setEditRole] = useState('');

  const { data } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users').then((r: any) => r.data),
  });

  const users = Array.isArray(data) ? data : [];

  const filtered = users.filter((u: any) => {
    const matchSearch = !search || `${u.firstName} ${u.lastName} ${u.email} ${u.merchantName}`.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleSaveRole = () => {
    toast.success(`Role updated to ${editRole.replace('_', ' ')} for ${editUser.firstName}`);
    setEditUser(null);
  };

  const handleToggleStatus = (user: any) => {
    toast.success(`${user.firstName} ${user.isActive ? 'deactivated' : 'activated'}`);
  };

  const handleResetPassword = (user: any) => {
    toast.success(`Password reset email sent to ${user.email}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Platform Users</h1>
        <Badge variant="secondary" className="ml-2">{users.length} total</Badge>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, email, or merchant..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="root_owner">Root Owner</SelectItem>
            <SelectItem value="branch_manager">Branch Manager</SelectItem>
            <SelectItem value="cashier">Cashier</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u: any) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.firstName} {u.lastName}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={ROLE_COLORS[u.role] || ''}>
                      {u.role?.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{u.merchantName}</TableCell>
                  <TableCell className="text-muted-foreground">{u.branchName}</TableCell>
                  <TableCell>
                    <Badge variant={u.isActive ? 'default' : 'secondary'}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {u.lastLogin ? formatDistanceToNow(new Date(u.lastLogin), { addSuffix: true }) : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditUser(u); setEditRole(u.role); }}>
                          <UserCog className="h-4 w-4 mr-2" /> Edit Role
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(u)}>
                          {u.isActive ? '🔒 Deactivate' : '🔓 Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleResetPassword(u)}>
                          🔑 Reset Password
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No users found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editUser} onOpenChange={(o) => !o && setEditUser(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit User Role</DialogTitle></DialogHeader>
          {editUser && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{editUser.firstName} {editUser.lastName} — {editUser.email}</p>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={editRole} onValueChange={setEditRole}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="root_owner">Root Owner</SelectItem>
                    <SelectItem value="branch_manager">Branch Manager</SelectItem>
                    <SelectItem value="cashier">Cashier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button onClick={handleSaveRole}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
