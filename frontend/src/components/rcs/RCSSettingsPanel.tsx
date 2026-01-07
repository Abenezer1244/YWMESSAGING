import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Loader,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Info,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';
import { SoftCard, SoftButton } from '../SoftUI';
import Input from '../ui/Input';
import { getRCSStatus, registerRCSAgent, RCSStatus } from '../../api/rcs';

export function RCSSettingsPanel() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<RCSStatus | null>(null);
  const [agentId, setAgentId] = useState('');

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setIsLoading(true);
      const data = await getRCSStatus();
      setStatus(data);
      if (data.agentId) {
        setAgentId(data.agentId);
      }
    } catch (error) {
      console.error('Failed to load RCS status:', error);
      // Don't show error toast - RCS might not be configured yet
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!agentId.trim()) {
      toast.error('Please enter your RCS Agent ID');
      return;
    }

    try {
      setIsSaving(true);
      await registerRCSAgent(agentId.trim());
      toast.success('RCS Agent registered successfully!');
      loadStatus();
    } catch (error) {
      toast.error((error as Error).message || 'Failed to register RCS Agent');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
          <Loader className="w-8 h-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">RCS Business Messaging</h2>

      {/* Status Card */}
      <SoftCard variant="gradient">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${status?.ready ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
            {status?.ready ? (
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            ) : (
              <Sparkles className="w-6 h-6 text-yellow-500" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">
              {status?.ready ? 'RCS Enabled' : 'RCS Not Configured'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {status?.message || 'Configure RCS to send rich cards, carousels, and interactive buttons'}
            </p>
            {status?.agentId && (
              <p className="text-sm text-foreground/80 mt-2">
                <span className="text-muted-foreground">Agent ID:</span>{' '}
                <code className="bg-muted px-2 py-0.5 rounded">{status.agentId}</code>
              </p>
            )}
          </div>
        </div>
      </SoftCard>

      {/* What is RCS? */}
      <SoftCard>
        <div className="flex items-start gap-3 mb-4">
          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-foreground mb-2">What is RCS Business Messaging?</h4>
            <p className="text-sm text-muted-foreground">
              RCS (Rich Communication Services) enables iMessage-like features for Android and iPhone users:
            </p>
          </div>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground ml-8">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Rich cards with images, titles, and action buttons
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Swipeable carousels for events and schedules
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Quick reply buttons (Yes/No/Maybe)
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Read receipts and typing indicators
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            HD images and videos (no compression)
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Automatic SMS fallback for non-RCS devices
          </li>
        </ul>
      </SoftCard>

      {/* Registration Form */}
      <SoftCard>
        <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          RCS Agent Configuration
        </h4>

        <div className="space-y-4">
          <div>
            <Input
              label="Telnyx RCS Agent ID"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              placeholder="Enter your RCS Agent ID from Telnyx"
            />
            <p className="text-xs text-muted-foreground mt-1">
              You can find this in your Telnyx Mission Control portal under RCS &gt; Agents
            </p>
          </div>

          <SoftButton
            variant="primary"
            onClick={handleRegister}
            disabled={isSaving || !agentId.trim()}
            icon={isSaving ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <Loader className="w-4 h-4" />
              </motion.div>
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          >
            {isSaving ? 'Saving...' : status?.configured ? 'Update RCS Agent' : 'Enable RCS'}
          </SoftButton>
        </div>
      </SoftCard>

      {/* Setup Instructions */}
      <SoftCard variant="default">
        <h4 className="font-medium text-foreground mb-4">How to Get an RCS Agent ID</h4>
        <ol className="space-y-3 text-sm text-muted-foreground">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">
              1
            </span>
            <span>
              Log in to{' '}
              <a
                href="https://portal.telnyx.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                Telnyx Mission Control <ExternalLink className="w-3 h-3" />
              </a>
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">
              2
            </span>
            <span>Navigate to Messaging &gt; RCS &gt; Agents</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">
              3
            </span>
            <span>Create a new RCS Agent with your church's branding (logo, name, description)</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">
              4
            </span>
            <span>Submit your agent for verification (typically takes 1-3 business days)</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">
              5
            </span>
            <span>Copy the Agent ID and paste it above</span>
          </li>
        </ol>

        <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            <strong>Note:</strong> RCS agent verification requires business verification. Have your church's
            EIN, address, and website ready.
          </p>
        </div>
      </SoftCard>
    </div>
  );
}

export default RCSSettingsPanel;
