import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getPlan, cancelSubscription } from '../api/billing';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Spinner } from '../components/ui';

interface PlanInfo {
  plan: 'starter' | 'growth' | 'pro';
  limits: {
    name: string;
    price: number;
    currency: string;
    branches: number;
    members: number;
    messagesPerMonth: number;
    coAdmins: number;
    features: string[];
  };
  usage: {
    branches: number;
    members: number;
    messagesThisMonth: number;
    coAdmins: number;
  };
  remaining: {
    branches: number;
    members: number;
    messagesPerMonth: number;
    coAdmins: number;
  };
}

export function BillingPage() {
  const navigate = useNavigate();
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const loadPlanInfo = async () => {
      try {
        setIsLoading(true);
        const info = await getPlan();
        setPlanInfo(info);
      } catch (error) {
        toast.error((error as Error).message || 'Failed to load billing info');
      } finally {
        setIsLoading(false);
      }
    };

    loadPlanInfo();
  }, []);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    try {
      setIsCancelling(true);
      await cancelSubscription();
      toast.success('Subscription cancelled');
      navigate('/dashboard');
    } catch (error) {
      toast.error((error as Error).message || 'Failed to cancel subscription');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 dark:from-secondary-900 to-secondary-100 dark:to-secondary-950 p-6 transition-colors duration-normal">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" text="Loading billing information..." />
          </div>
        </div>
      </div>
    );
  }

  if (!planInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 dark:from-secondary-900 to-secondary-100 dark:to-secondary-950 p-6 transition-colors duration-normal">
        <div className="max-w-7xl mx-auto">
          <Card variant="highlight" className="text-center py-16">
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-50 mb-3">
              Failed to Load Billing Information
            </h2>
            <p className="text-secondary-600 dark:text-secondary-400">
              Please try refreshing the page or contact support if the issue persists.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  const planNameMap: Record<string, string> = {
    starter: 'Starter',
    growth: 'Growth',
    pro: 'Pro',
  };

  const getUsagePercentage = (used: number, limit: number): number => {
    if (limit > 100000) return 0; // unlimited
    return Math.round((used / limit) * 100);
  };

  const getUsageColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-danger-500';
    if (percentage >= 70) return 'bg-warning-500';
    return 'bg-success-500';
  };

  const UsageBar = ({
    label,
    used,
    limit,
  }: {
    label: string;
    used: number;
    limit: number;
  }) => {
    const percentage = getUsagePercentage(used, limit);
    const isUnlimited = limit > 100000;

    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-secondary-900 dark:text-secondary-50">{label}</span>
          <span className="text-sm text-secondary-600 dark:text-secondary-400">
            {used} / {isUnlimited ? '∞' : limit}
          </span>
        </div>
        {!isUnlimited && (
          <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getUsageColor(percentage)}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        )}
        {isUnlimited && (
          <div className="text-sm text-success-600 dark:text-success-400">Unlimited</div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 dark:from-secondary-900 to-secondary-100 dark:to-secondary-950 p-6 transition-colors duration-normal">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-secondary-900 dark:text-secondary-50 mb-2">💳 Billing Settings</h1>
          <p className="text-secondary-600 dark:text-secondary-400">Manage your subscription and view usage</p>
        </div>

        {/* Main Content */}
        {/* Current Plan */}
        <Card variant="default" className="mb-8">
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-50 mb-6">Current Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Plan Card */}
            <Card variant="highlight">
              <h3 className="text-xl font-bold text-secondary-900 dark:text-secondary-50">
                {planNameMap[planInfo.plan]} Plan
              </h3>
              <p className="text-3xl font-bold text-primary-600 dark:text-primary-400 mt-2">
                ${planInfo.limits.price / 100}
                <span className="text-lg text-secondary-600 dark:text-secondary-400">/month</span>
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/subscribe')}
                className="mt-4 w-full"
              >
                Change Plan
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={handleCancel}
                disabled={isCancelling}
                className="mt-2 w-full"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
              </Button>
            </Card>

            {/* Plan Features */}
            <div className="md:col-span-2">
              <h4 className="font-semibold text-secondary-900 dark:text-secondary-50 mb-4">Features included:</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {planInfo.limits.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-success-500 mr-3 mt-0.5">✓</span>
                    <span className="text-secondary-700 dark:text-secondary-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        {/* Usage Overview */}
        <Card variant="default" className="mb-8">
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-50 mb-6">
            Current Usage ({new Date().toLocaleDateString()})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-secondary-900 dark:text-secondary-50 mb-4">Organization</h3>
              <UsageBar
                label="Branches"
                used={planInfo.usage.branches}
                limit={planInfo.limits.branches}
              />
              <UsageBar
                label="Co-Admins"
                used={planInfo.usage.coAdmins}
                limit={planInfo.limits.coAdmins}
              />
            </div>

            <div>
              <h3 className="font-semibold text-secondary-900 dark:text-secondary-50 mb-4">Messaging</h3>
              <UsageBar
                label="Members"
                used={planInfo.usage.members}
                limit={planInfo.limits.members}
              />
              <UsageBar
                label="Messages (This Month)"
                used={planInfo.usage.messagesThisMonth}
                limit={planInfo.limits.messagesPerMonth}
              />
            </div>
          </div>

          {/* Remaining Capacity Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-secondary-200 dark:border-secondary-700">
            <Card variant="highlight" className="bg-primary-50 dark:bg-primary-900/30">
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Remaining Branches</p>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-2">
                {planInfo.remaining.branches === 999999
                  ? '∞'
                  : planInfo.remaining.branches}
              </p>
            </Card>

            <Card variant="highlight" className="bg-success-50 dark:bg-success-900/30">
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Remaining Members</p>
              <p className="text-2xl font-bold text-success-600 dark:text-success-400 mt-2">
                {planInfo.remaining.members === 999999
                  ? '∞'
                  : planInfo.remaining.members}
              </p>
            </Card>

            <Card variant="highlight" className="bg-info-50 dark:bg-info-900/30">
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Remaining Messages</p>
              <p className="text-2xl font-bold text-info-600 dark:text-info-400 mt-2">
                {planInfo.remaining.messagesPerMonth === 999999
                  ? '∞'
                  : planInfo.remaining.messagesPerMonth}
              </p>
            </Card>

            <Card variant="highlight" className="bg-warning-50 dark:bg-warning-900/30">
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Remaining Co-Admins</p>
              <p className="text-2xl font-bold text-warning-600 dark:text-warning-400 mt-2">
                {planInfo.remaining.coAdmins === 999999
                  ? '∞'
                  : planInfo.remaining.coAdmins}
              </p>
            </Card>
          </div>
        </Card>

        {/* Billing Info */}
        <Card variant="default">
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-50 mb-4">Billing Information</h2>
          <p className="text-secondary-600 dark:text-secondary-400">
            Your subscription is billed monthly. You can manage your payment method
            and invoices through Stripe.
          </p>
          <Button
            variant="primary"
            size="md"
            className="mt-4"
          >
            Manage in Stripe
          </Button>
        </Card>
      </div>
    </div>
  );
}

export default BillingPage;
