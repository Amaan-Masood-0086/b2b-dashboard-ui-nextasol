import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Search } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

export default function AuditLogsPage() {
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');

  const isAdmin = user?.role && ['super_admin', 'support_admin'].includes(user.role);
  const endpoint = isAdmin ? '/admin/audit-logs' : '/audit-logs';

  const { data } = useQuery({
    queryKey: ['audit-logs', page, action],
    queryFn: () => api.get(endpoint, { params: { page, limit: 20, action: action || undefined } }).then(r => r.data),
  });

  const logs = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Audit Logs</h1>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Filter by action..." className="pl-9" value={action} onChange={(e) => setAction(e.target.value)} />
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Action</TableHead><TableHead>User</TableHead><TableHead>Details</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
            <TableBody>
              {logs.map((l: any) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium capitalize">{l.action}</TableCell>
                  <TableCell>{l.user ? `${l.user.firstName} ${l.user.lastName}` : '—'}</TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">{l.details || '—'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{format(new Date(l.createdAt), 'MMM dd, HH:mm')}</TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No logs</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground self-center">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
