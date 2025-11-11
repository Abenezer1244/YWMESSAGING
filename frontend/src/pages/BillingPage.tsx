import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Check, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { getPlan, cancelSubscription } from '../api/billing';
import { SoftLayout, SoftCard, SoftButton } from '../components/SoftUI';

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
      <SoftLayout>
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
            <Loader className="w-8 h-8 text-primary" />
          </motion.div>
        </div>
      </SoftLayout>
    );
  }

  if (!planInfo) {
    return (
      <SoftLayout>
        <div className="px-4 md:px-8 py-8 w-full">
          <SoftCard className="text-center py-16">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Failed to Load Billing Information
            </h2>
            <p className="text-muted-foreground">
              Please try refreshing the page or contact support if the issue persists.
            </p>
          </SoftCard>
        </div>
      </SoftLayout>
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
          <span className="text-sm font-medium text-foreground">{label}</span>
          <span className="text-sm text-muted-foreground">
            {used} / {isUnlimited ? '∞' : limit}
          </span>
        </div>
        {!isUnlimited && (
          <div className="w-full bg-muted-foreground/20 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getUsageColor(percentage)}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        )}
        {isUnlimited && (
          <div className="text-sm text-success-500 dark:text-success-400">Unlimited</div>
        )}
      </div>
    );
  };

  return (
    <SoftLayout>
      <div className="px-4 md:px-8 py-8 w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Billing</span>
          </h1>
          <p className="text-muted-foreground">Manage your subscription and view usage</p>
        </motion.div>

        {/* Current Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <SoftCard>
            <h2 className="text-2xl font-bold text-foreground mb-6">Current Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Plan Card */}
              <SoftCard variant="gradient">
                <h3 className="text-xl font-bold text-foreground">
                  {planNameMap[planInfo.plan]} Plan
                </h3>
                <p className="text-3xl font-bold text-primary mt-2">
                  ${planInfo.limits.price / 100}
                  <span className="text-lg text-muted-foreground">/month</span>
                </p>
                <SoftButton
                  variant="primary"
                  onClick={() => navigate('/subscribe')}
                  fullWidth
                  className="mt-4"
                >
                  Change Plan
                </SoftButton>
                <SoftButton
                  variant="danger"
                  onClick={handleCancel}
                  disabled={isCancelling}
                  fullWidth
                  className="mt-3"
                >
                  {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
                </SoftButton>
              </SoftCard>

              {/* Plan Features */}
              <div className="md:col-span-2">
                <h4 className="font-semibold text-foreground mb-4">Features included:</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {planInfo.limits.features.map((feature, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-start gap-3"
                    >
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </SoftCard>
        </motion.div>

        {/* Usage Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <SoftCard>
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Current Usage ({new Date().toLocaleDateString()})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-foreground mb-4">Organization</h3>
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
                <h3 className="font-semibold text-foreground mb-4">Messaging</h3>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-border/40">
              <SoftCard variant="gradient">
                <p className="text-sm text-muted-foreground">Remaining Branches</p>
                <p className="text-2xl font-bold text-primary mt-2">
                  {planInfo.remaining.branches === 999999
                    ? '∞'
                    : planInfo.remaining.branches}
                </p>
              </SoftCard>

              <SoftCard variant="gradient">
                <p className="text-sm text-muted-foreground">Remaining Members</p>
                <p className="text-2xl font-bold text-green-400 mt-2">
                  {planInfo.remaining.members === 999999
                    ? '∞'
                    : planInfo.remaining.members}
                </p>
              </SoftCard>

              <SoftCard variant="gradient">
                <p className="text-sm text-muted-foreground">Remaining Messages</p>
                <p className="text-2xl font-bold text-cyan-400 mt-2">
                  {planInfo.remaining.messagesPerMonth === 999999
                    ? '∞'
                    : planInfo.remaining.messagesPerMonth}
                </p>
              </SoftCard>

              <SoftCard variant="gradient">
                <p className="text-sm text-muted-foreground">Remaining Co-Admins</p>
                <p className="text-2xl font-bold text-amber-400 mt-2">
                  {planInfo.remaining.coAdmins === 999999
                    ? '∞'
                    : planInfo.remaining.coAdmins}
                </p>
              </SoftCard>
            </div>
          </SoftCard>
        </motion.div>

        {/* Billing Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <SoftCard>
            <h2 className="text-2xl font-bold text-foreground mb-4">Billing Information</h2>
            <p className="text-muted-foreground mb-6">
              Your subscription is billed monthly. You can manage your payment method
              and invoices through Stripe.
            </p>
            <SoftButton variant="primary">
              Manage in Stripe
            </SoftButton>
          </SoftCard>
        </motion.div>
      </div>
    </SoftLayout>
  );
}

export default BillingPage;
