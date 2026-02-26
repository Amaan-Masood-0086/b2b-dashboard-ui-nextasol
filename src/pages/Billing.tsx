import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, CreditCard, Building2, Users, Zap, Crown, Rocket, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { formatCurrency } from '@/lib/currency';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  pricePerBranch: number;
  maxBranches: number | null;
  maxProducts: number | null;
  maxUsers: number | null;
  features: string[];
  popular?: boolean;
}

interface SubscriptionInfo {
  id: string;
  planId: string;
  plan: Plan;
  status: 'active' | 'trialing' | 'past_due' | 'canceled';
  currentPeriodEnd: string;
  branchCount: number;
  productCount: number;
  userCount: number;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  description: string;
}

const PLAN_ICONS: Record<string, React.ElementType> = {
  Starter: Rocket,
  Pro: Zap,
  Enterprise: Crown,
};

export default function BillingPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: subscription } = useQuery<SubscriptionInfo>({
    queryKey: ['billing-subscription'],
    queryFn: () => api.get('/billing/subscription').then((r: any) => r.data),
  });

  const { data: plans } = useQuery<Plan[]>({
    queryKey: ['billing-plans'],
    queryFn: () => api.get('/billing/plans').then((r: any) => r.data),
  });

  const { data: invoices } = useQuery<Invoice[]>({
    queryKey: ['billing-invoices'],
    queryFn: () => api.get('/billing/invoices').then((r: any) => r.data),
  });

  const upgradePlan = useMutation({
    mutationFn: (planId: string) => api.post('/billing/upgrade', { planId }),
    onSuccess: () => {
      toast.success('Plan upgraded successfully!');
      queryClient.invalidateQueries({ queryKey: ['billing-subscription'] });
    },
    onError: () => toast.error('Failed to upgrade plan'),
  });

  const currentPlanId = subscription?.planId;

  const usageLimits = [
    {
      label: 'Branches',
      icon: Building2,
      used: subscription?.branchCount ?? 0,
      max: subscription?.plan?.maxBranches,
    },
    {
      label: 'Products',
      icon: CreditCard,
      used: subscription?.productCount ?? 0,
      max: subscription?.plan?.maxProducts,
    },
    {
      label: 'Team Members',
      icon: Users,
      used: subscription?.userCount ?? 0,
      max: subscription?.plan?.maxUsers,
    },
  ];

  const isTrialing = subscription?.status === 'trialing';
  const trialDaysLeft = isTrialing && subscription?.currentPeriodEnd
    ? Math.max(0, Math.ceil((new Date(subscription.currentPeriodEnd).getTime() - Date.now()) / 86400000))
    : 0;

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your plan, usage limits, and invoices</p>
      </div>

      {/* Trial Banner */}
      {isTrialing && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 flex-wrap">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
              <div className="flex-1">
                <p className="font-semibold">Free Trial — {trialDaysLeft} days remaining</p>
                <p className="text-sm text-muted-foreground">Your Starter trial ends on {new Date(subscription!.currentPeriodEnd).toLocaleDateString()}. Upgrade to keep all features.</p>
              </div>
              <Button size="sm" onClick={() => document.getElementById('plans-section')?.scrollIntoView({ behavior: 'smooth' })}>
                Upgrade Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="plan" className="space-y-6">
        <TabsList>
          <TabsTrigger value="plan">Plan & Usage</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="plan" className="space-y-6">
          {/* Current plan banner */}
          {subscription && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      {(() => { const Icon = PLAN_ICONS[subscription.plan.name] || Zap; return <Icon className="h-5 w-5 text-primary" />; })()}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{subscription.plan.name} Plan</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(subscription.plan.pricePerBranch)}/branch/month
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={subscription.status === 'active' ? 'default' : subscription.status === 'past_due' ? 'destructive' : 'secondary'} className="capitalize">
                      {subscription.status === 'past_due' && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {subscription.status.replace('_', ' ')}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Usage limits */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Usage</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {usageLimits.map((item) => {
                const percent = item.max ? Math.min((item.used / item.max) * 100, 100) : 0;
                const isNearLimit = item.max ? percent >= 80 : false;
                return (
                  <Card key={item.label}>
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <item.icon className="h-4 w-4 text-muted-foreground" />
                          {item.label}
                        </div>
                        <span className={`text-sm font-semibold ${isNearLimit ? 'text-destructive' : ''}`}>
                          {item.used}{item.max ? `/${item.max}` : ''}
                        </span>
                      </div>
                      {item.max ? (
                        <Progress value={percent} className={`h-2 ${isNearLimit ? '[&>div]:bg-destructive' : ''}`} />
                      ) : (
                        <p className="text-xs text-muted-foreground">Unlimited</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Plan tiers */}
          <div id="plans-section">
            <h2 className="text-lg font-semibold mb-3">Available Plans</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {(plans ?? []).map((plan) => {
                const isCurrent = plan.id === currentPlanId;
                const Icon = PLAN_ICONS[plan.name] || Zap;
                return (
                  <Card key={plan.id} className={`relative ${plan.popular ? 'border-primary shadow-md' : ''} ${isCurrent ? 'ring-2 ring-primary' : ''}`}>
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-2">
                      <div className="mx-auto h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <CardDescription>
                        <span className="text-3xl font-bold text-foreground">{formatCurrency(plan.pricePerBranch)}</span>
                        <span className="text-muted-foreground"> /branch/mo</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <ul className="space-y-2 text-sm">
                        {plan.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="text-xs text-muted-foreground space-y-1 pt-2">
                        <p>Up to {plan.maxBranches ?? '∞'} branches</p>
                        <p>Up to {plan.maxProducts ?? '∞'} products</p>
                        <p>Up to {plan.maxUsers ?? '∞'} team members</p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full"
                        variant={isCurrent ? 'outline' : plan.popular ? 'default' : 'outline'}
                        disabled={isCurrent || upgradePlan.isPending}
                        onClick={() => upgradePlan.mutate(plan.id)}
                      >
                        {isCurrent ? 'Current Plan' : 'Upgrade'}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Billing History</CardTitle>
              <CardDescription>View and download your past invoices</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(invoices ?? []).map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="text-sm">{new Date(inv.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-sm">{inv.description}</TableCell>
                      <TableCell>
                        <Badge variant={inv.status === 'paid' ? 'default' : inv.status === 'pending' ? 'secondary' : 'destructive'} className="capitalize">
                          {inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(inv.amount)}</TableCell>
                    </TableRow>
                  ))}
                  {(!invoices || invoices.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No invoices yet</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
