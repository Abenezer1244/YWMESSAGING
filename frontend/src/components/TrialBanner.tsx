import { useEffect, useState } from 'react';
import { getTrial } from '../api/billing';

export function TrialBanner() {
  const [trialStatus, setTrialStatus] = useState<{
    onTrial: boolean;
    daysRemaining: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTrialStatus = async () => {
      try {
        setIsLoading(true);
        const status = await getTrial();
        setTrialStatus(status);
      } catch (error) {
        console.error('Failed to load trial status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTrialStatus();
  }, []);

  if (isLoading || !trialStatus) {
    return null;
  }

  if (!trialStatus.onTrial) {
    return null;
  }

  const daysRemaining = trialStatus.daysRemaining;
  const isExpiringSoon = daysRemaining <= 3;
  const isExpired = daysRemaining <= 0;

  let bgColor = 'bg-green-50 border-green-200';
  let textColor = 'text-green-800';
  let icon = '✓';

  if (isExpired) {
    bgColor = 'bg-red-50 border-red-200';
    textColor = 'text-red-800';
    icon = '⚠';
  } else if (isExpiringSoon) {
    bgColor = 'bg-yellow-50 border-yellow-200';
    textColor = 'text-yellow-800';
    icon = '!';
  }

  return (
    <div className={`${bgColor} border rounded-lg p-4 mb-6`}>
      <div className="flex items-start gap-3">
        <span className={`text-lg font-bold ${textColor}`}>{icon}</span>
        <div>
          <h3 className={`font-semibold ${textColor}`}>
            {isExpired ? 'Trial Expired' : 'Free Trial Active'}
          </h3>
          <p className={`text-sm ${textColor} mt-1`}>
            {isExpired
              ? 'Your trial has expired. Please subscribe to continue using the platform.'
              : daysRemaining === 1
              ? 'Your trial expires tomorrow. Subscribe now to keep your account active.'
              : `${daysRemaining} days remaining in your trial`}
          </p>
          {!isExpired && (
            <button
              onClick={() => window.location.href = '/subscribe'}
              className="mt-2 text-sm font-semibold hover:underline"
            >
              View Plans →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TrialBanner;
