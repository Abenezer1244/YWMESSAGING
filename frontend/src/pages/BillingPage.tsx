import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getPlan, cancelSubscription } from '../api/billing';

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
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900">Billing Settings</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-gray-500">Loading billing information...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!planInfo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900">Billing Settings</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-red-600">Failed to load billing information</p>
          </div>
        </main>
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
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
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
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm text-gray-600">
            {used} / {isUnlimited ? '∞' : limit}
          </span>
        </div>
        {!isUnlimited && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getUsageColor(percentage)}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        )}
        {isUnlimited && (
          <div className="text-sm text-green-600">Unlimited</div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Billing Settings</h1>
          <p className="text-gray-600 mt-2">Manage your subscription and view usage</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Plan */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Current Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Plan Card */}
            <div className="md:col-span-1 border rounded-lg p-6 bg-blue-50">
              <h3 className="text-xl font-bold text-gray-900">
                {planNameMap[planInfo.plan]} Plan
              </h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                ${planInfo.limits.price / 100}
                <span className="text-lg text-gray-600">/month</span>
              </p>
              <button
                onClick={() => navigate('/subscribe')}
                className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
              >
                Change Plan
              </button>
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="mt-2 w-full bg-red-100 text-red-700 py-2 px-4 rounded-lg hover:bg-red-200 transition disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
              </button>
            </div>

            {/* Plan Features */}
            <div className="md:col-span-2">
              <h4 className="font-semibold text-gray-900 mb-4">Features included:</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {planInfo.limits.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-green-500 mr-3 mt-0.5">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Usage Overview */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Current Usage ({new Date().toLocaleDateString()})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Organization</h3>
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
              <h3 className="font-semibold text-gray-900 mb-4">Messaging</h3>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8 pt-8 border-t">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Remaining Branches</p>
              <p className="text-2xl font-bold text-blue-600">
                {planInfo.remaining.branches === 999999
                  ? '∞'
                  : planInfo.remaining.branches}
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Remaining Members</p>
              <p className="text-2xl font-bold text-green-600">
                {planInfo.remaining.members === 999999
                  ? '∞'
                  : planInfo.remaining.members}
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Remaining Messages</p>
              <p className="text-2xl font-bold text-purple-600">
                {planInfo.remaining.messagesPerMonth === 999999
                  ? '∞'
                  : planInfo.remaining.messagesPerMonth}
              </p>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Remaining Co-Admins</p>
              <p className="text-2xl font-bold text-orange-600">
                {planInfo.remaining.coAdmins === 999999
                  ? '∞'
                  : planInfo.remaining.coAdmins}
              </p>
            </div>
          </div>
        </div>

        {/* Billing Info */}
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Billing Information</h2>
          <p className="text-gray-600">
            Your subscription is billed monthly. You can manage your payment method
            and invoices through Stripe.
          </p>
          <button className="mt-4 bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition">
            Manage in Stripe
          </button>
        </div>
      </main>
    </div>
  );
}

export default BillingPage;
