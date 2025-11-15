import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Loader, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { getProfile, updateProfile } from '../api/admin';
import { getCurrentNumber } from '../api/numbers';
import CoAdminPanel from '../components/admin/CoAdminPanel';
import ActivityLogsPanel from '../components/admin/ActivityLogsPanel';
import { PhoneNumberManager } from '../components/admin/PhoneNumberManager';
import PhoneNumberPurchaseModal from '../components/PhoneNumberPurchaseModal';
import { SoftLayout, SoftCard, SoftButton } from '../components/SoftUI';
import Input from '../components/ui/Input';

// Email validation regex (RFC 5322 simplified)
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Profile interface for type safety
interface ChurchProfile {
  id: string;
  name: string;
  email: string;
  subscriptionStatus: string;
  createdAt: string;
}

export function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'coadmins' | 'logs' | 'numbers'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<ChurchProfile | null>(null);
  const [currentPhoneNumber, setCurrentPhoneNumber] = useState<string | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isLoadingNumber, setIsLoadingNumber] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  // Load profile on mount
  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await getProfile();
      setProfile(data);
      setFormData({
        name: data.name || '',
        email: data.email || '',
      });
    } catch (error) {
      // Show generic error message without exposing backend details
      toast.error('Failed to load profile. Please refresh the page.');
      if (process.env.NODE_ENV === 'development') {
        console.debug('Profile load error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load current phone number
  const loadPhoneNumber = async () => {
    try {
      setIsLoadingNumber(true);
      const data = await getCurrentNumber();
      setCurrentPhoneNumber(data.telnyxPhoneNumber);
    } catch (error) {
      // No phone number assigned yet
      setCurrentPhoneNumber(null);
    } finally {
      setIsLoadingNumber(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadProfile();
    loadPhoneNumber();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Church name is required');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Email address is required');
      return;
    }

    if (!isValidEmail(formData.email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setIsSaving(true);
      await updateProfile({
        name: formData.name.trim(),
        email: formData.email.trim(),
      });
      toast.success('Profile updated successfully');
      loadProfile();
    } catch (error) {
      // Show generic error message without exposing backend details
      toast.error('Failed to update profile. Please try again.');
      if (process.env.NODE_ENV === 'development') {
        console.debug('Profile update error:', error);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
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
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Settings</span>
          </h1>
          <p className="text-muted-foreground">Manage your church account and permissions</p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <SoftCard>
            <div className="border-b border-border/40">
              <div className="flex flex-wrap">
                {(['profile', 'coadmins', 'numbers', 'logs'] as const).map((tab, idx) => (
                  <motion.button
                    key={tab}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 min-w-[120px] px-4 py-4 text-center font-medium border-b-2 transition ${
                      activeTab === tab
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab === 'profile' && 'Church Profile'}
                    {tab === 'coadmins' && 'Co-Admins'}
                    {tab === 'numbers' && 'Phone Numbers'}
                    {tab === 'logs' && 'Activity Logs'}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {/* Church Profile Tab */}
              {activeTab === 'profile' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-bold text-foreground mb-6">Church Profile</h2>

                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
                        <Loader className="w-8 h-8 text-primary" />
                      </motion.div>
                    </div>
                  ) : (
                    <form onSubmit={handleSaveProfile} className="max-w-2xl">
                      {/* Church Name */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-6"
                      >
                        <Input
                          label="Church Name"
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="Your church name"
                        />
                      </motion.div>

                      {/* Email */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="mb-6"
                      >
                        <Input
                          label="Email Address"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          placeholder="contact@church.com"
                        />
                      </motion.div>

                      {/* Account Info */}
                      {profile && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="mb-6"
                        >
                          <SoftCard variant="gradient">
                            <h3 className="font-semibold text-foreground mb-3">Account Information</h3>
                            <div className="space-y-2 text-sm">
                              <p>
                                <span className="text-muted-foreground">Status:</span>{' '}
                                <span className="font-medium text-foreground">
                                  {profile.subscriptionStatus}
                                </span>
                              </p>
                              <p>
                                <span className="text-muted-foreground">Created:</span>{' '}
                                <span className="font-medium text-foreground">
                                  {new Date(profile.createdAt).toLocaleDateString()}
                                </span>
                              </p>
                            </div>
                          </SoftCard>
                        </motion.div>
                      )}

                      {/* Save Button */}
                      <SoftButton
                        type="submit"
                        variant="primary"
                        disabled={isSaving}
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </SoftButton>
                    </form>
                  )}
                </motion.div>
              )}

              {/* Co-Admins Tab */}
              {activeTab === 'coadmins' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <CoAdminPanel />
                </motion.div>
              )}

              {/* Phone Numbers Tab */}
              {activeTab === 'numbers' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-bold text-foreground mb-6">Phone Numbers</h2>

                  {isLoadingNumber ? (
                    <div className="flex justify-center py-12">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
                        <Loader className="w-8 h-8 text-primary" />
                      </motion.div>
                    </div>
                  ) : (
                    <div className="max-w-2xl space-y-6">
                      {/* Phone Number Manager */}
                      <div className="mb-6">
                        <PhoneNumberManager
                          currentPhoneNumber={currentPhoneNumber}
                          onSuccess={(phoneNumber, webhookId) => {
                            setCurrentPhoneNumber(phoneNumber);
                            loadPhoneNumber();
                            if (phoneNumber) {
                              toast.success('Phone number linked successfully!');
                            } else {
                              toast.success('Phone number deleted (30-day recovery window)');
                            }
                          }}
                        />
                      </div>

                      {/* Current Number Card */}
                      <SoftCard variant="gradient">
                        <div className="flex items-center gap-3 mb-4">
                          <Phone className="w-5 h-5 text-primary" />
                          <h3 className="font-semibold text-foreground">Current Phone Number</h3>
                        </div>

                        {currentPhoneNumber ? (
                          <div className="space-y-3">
                            <div className="text-2xl font-bold text-primary">{currentPhoneNumber}</div>
                            <p className="text-sm text-muted-foreground">
                              Your active Telnyx phone number for receiving SMS messages and conversations.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-muted-foreground">
                              No phone number linked yet. Link a number you've purchased from Telnyx above or buy one to start.
                            </p>
                            <SoftButton
                              variant="primary"
                              onClick={() => setShowPurchaseModal(true)}
                            >
                              Buy Phone Number
                            </SoftButton>
                          </div>
                        )}
                      </SoftCard>

                      {/* Info Card */}
                      <SoftCard variant="default">
                        <h3 className="font-semibold text-foreground mb-3">About Phone Numbers</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex gap-2">
                            <span className="text-primary font-bold">•</span>
                            <span>Each church gets one dedicated phone number for receiving member conversations</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary font-bold">•</span>
                            <span>Members text your number to start conversations with your church</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary font-bold">•</span>
                            <span>When you link a number, we automatically create a webhook for receiving messages</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary font-bold">•</span>
                            <span>Numbers are powered by Telnyx for reliable SMS/MMS delivery</span>
                          </li>
                        </ul>
                      </SoftCard>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Activity Logs Tab */}
              {activeTab === 'logs' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <ActivityLogsPanel />
                </motion.div>
              )}
            </div>
          </SoftCard>
        </motion.div>
      </div>
    </SoftLayout>
    <PhoneNumberPurchaseModal
      isOpen={showPurchaseModal}
      onClose={() => setShowPurchaseModal(false)}
      onPurchaseComplete={(phoneNumber) => {
        setCurrentPhoneNumber(phoneNumber);
        setShowPurchaseModal(false);
        toast.success('Phone number purchased successfully!');
      }}
    />
    </>
  );
}

export default AdminSettingsPage;
