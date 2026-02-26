import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Lock, Zap } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface UpgradeGateProps {
  /** Features that require at least this plan */
  requiredPlan: 'Pro' | 'Enterprise';
  featureName: string;
  children: React.ReactNode;
}

export function UpgradeGate({ requiredPlan, featureName, children }: UpgradeGateProps) {
  const navigate = useNavigate();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['billing-subscription'],
    queryFn: () => api.get('/billing/subscription').then((r: any) => r.data),
  });

  if (isLoading) return null;

  const planHierarchy = ['Starter', 'Pro', 'Enterprise'];
  const currentPlanIndex = planHierarchy.indexOf(subscription?.plan?.name ?? 'Starter');
  const requiredPlanIndex = planHierarchy.indexOf(requiredPlan);

  if (currentPlanIndex >= requiredPlanIndex) {
    return <>{children}</>;
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <Card className="max-w-md w-full text-center">
        <CardContent className="pt-8 pb-8 space-y-4">
          <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-xl font-bold">{featureName} requires {requiredPlan}</h2>
          <p className="text-muted-foreground text-sm">
            Upgrade to the <strong>{requiredPlan} plan</strong> to unlock {featureName.toLowerCase()} and other advanced features.
          </p>
          <Button onClick={() => navigate('/billing')} className="gap-2">
            <Zap className="h-4 w-4" /> Upgrade Plan
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
