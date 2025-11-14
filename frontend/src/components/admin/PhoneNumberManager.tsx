import React, { useState } from 'react';
import { Phone, Loader, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { linkPhoneNumber } from '../../api/admin';
import { SoftButton } from '../SoftUI';
import Input from '../ui/Input';

interface PhoneNumberManagerProps {
  currentPhoneNumber?: string | null;
  onSuccess?: (phoneNumber: string, webhookId: string | null) => void;
}

export function PhoneNumberManager({
  currentPhoneNumber,
  onSuccess,
}: PhoneNumberManagerProps) {
  const [phoneNumber, setPhoneNumber] = useState(currentPhoneNumber || '');
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(!currentPhoneNumber);
  const [linkedPhoneNumber, setLinkedPhoneNumber] = useState(currentPhoneNumber);
  const [webhookStatus, setWebhookStatus] = useState<'auto' | 'manual' | null>(null);

  const handleLinkPhoneNumber = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!phoneNumber.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    try {
      setIsLoading(true);
      const result = await linkPhoneNumber(phoneNumber);

      if (result.success) {
        setLinkedPhoneNumber(result.data.phoneNumber);
        setWebhookStatus(result.data.webhookId ? 'auto' : 'manual');
        setShowForm(false);
        setPhoneNumber('');

        toast.success(result.data.message);
        onSuccess?.(result.data.phoneNumber, result.data.webhookId);
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      toast.error(errorMessage || 'Failed to link phone number');
      setWebhookStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Current Phone Number Display */}
      {linkedPhoneNumber && !showForm && (
        <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">Phone Number Linked</p>
                <p className="text-lg font-bold text-green-500 mt-1">{linkedPhoneNumber}</p>
                {webhookStatus === 'auto' && (
                  <p className="text-xs text-green-600 mt-2">✅ Webhook auto-created successfully</p>
                )}
                {webhookStatus === 'manual' && (
                  <p className="text-xs text-yellow-600 mt-2">
                    ⚠️ Please configure webhook manually in Telnyx dashboard
                  </p>
                )}
              </div>
            </div>
            <SoftButton
              variant="secondary"
              size="sm"
              onClick={() => setShowForm(true)}
              className="flex-shrink-0"
            >
              Change
            </SoftButton>
          </div>
        </div>
      )}

      {/* Link Phone Number Form */}
      {showForm && (
        <form onSubmit={handleLinkPhoneNumber} className="space-y-4 p-4 bg-muted/50 rounded-lg border border-border/40">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Telnyx Phone Number
            </label>
            <Input
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={phoneNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhoneNumber(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter the phone number you purchased from Telnyx (in any format)
            </p>
          </div>

          <div className="flex gap-2">
            <SoftButton
              variant="primary"
              type="submit"
              disabled={isLoading || !phoneNumber.trim()}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2 inline" />
                  Linking...
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4 mr-2 inline" />
                  Link Phone Number
                </>
              )}
            </SoftButton>
            {linkedPhoneNumber && (
              <SoftButton
                variant="secondary"
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setPhoneNumber('');
                }}
                disabled={isLoading}
              >
                Cancel
              </SoftButton>
            )}
          </div>

          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex gap-2">
            <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-600">
              When you link a phone number, we'll automatically create a webhook in your Telnyx account.
              Members can then start texting this number to send messages and media!
            </p>
          </div>
        </form>
      )}

      {/* Info Box */}
      {!showForm && linkedPhoneNumber && (
        <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <p className="text-xs text-primary/80">
            <strong>What happens next?</strong> Your congregation can now text <strong>{linkedPhoneNumber}</strong> to
            start conversations with you. Messages and media will appear in your Conversations dashboard!
          </p>
        </div>
      )}
    </div>
  );
}
