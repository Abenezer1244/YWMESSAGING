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
  wantsPremiumDelivery?: boolean;
  dlcStatus?: string;
  deliveryRate?: number;
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
    // Delivery Tier Selection
    wantsPremiumDelivery: false,
    // 10DLC Brand Information
    ein: '',
    brandPhoneNumber: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    website: '',
    entityType: 'NON_PROFIT', // Telnyx supported: NON_PROFIT, PRIVATE_CORPORATION, PUBLIC_CORPORATION, GOVERNMENT_ENTITY
    vertical: 'NGO', // NGO is the Telnyx supported value for churches/nonprofits
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
        // Delivery Tier Selection
        wantsPremiumDelivery: data.wantsPremiumDelivery ?? false,
        // 10DLC Brand Information
        ein: data.ein || '',
        brandPhoneNumber: data.brandPhoneNumber || '',
        streetAddress: data.streetAddress || '',
        city: data.city || '',
        state: data.state || '',
        postalCode: data.postalCode || '',
        website: data.website || '',
        entityType: data.entityType || 'NON_PROFIT', // Telnyx supported types only
        vertical: data.vertical || 'NGO', // Telnyx supported value for churches
      });
    } catch (error) {
      // Show generic error message without exposing backend details
      toast.error('Failed to load profile. Please refresh the page.');
      if (import.meta.env.DEV) {
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

    // Validation - Basic Fields
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

    // Validation - 10DLC Fields (only required if choosing premium delivery)
    if (formData.wantsPremiumDelivery) {
      if (!formData.ein.trim()) {
        toast.error('EIN (Employer Identification Number) is required for premium 10DLC');
        return;
      }

      if (!/^\d+$/.test(formData.ein.trim())) {
        toast.error('EIN must contain only digits');
        return;
      }

      if (!formData.brandPhoneNumber.trim()) {
        toast.error('Brand contact phone number is required for premium 10DLC');
        return;
      }

      if (!/^\+1\d{10}$/.test(formData.brandPhoneNumber.trim())) {
        toast.error('Phone must be in format: +1XXXXXXXXXX');
        return;
      }

      if (!formData.streetAddress.trim()) {
        toast.error('Street address is required for premium 10DLC');
        return;
      }

      if (!formData.city.trim()) {
        toast.error('City is required for premium 10DLC');
        return;
      }

      if (!formData.state.trim() || formData.state.length !== 2) {
        toast.error('State must be 2-letter code (e.g., CA, NY)');
        return;
      }

      if (!formData.postalCode.trim()) {
        toast.error('Postal code is required for premium 10DLC');
        return;
      }

      if (!/^\d{5}(-\d{4})?$/.test(formData.postalCode.trim())) {
        toast.error('Postal code must be 5 digits or 5+4 format');
        return;
      }
    }

    try {
      setIsSaving(true);
      await updateProfile({
        name: formData.name.trim(),
        email: formData.email.trim(),
        // Delivery Tier Selection
        wantsPremiumDelivery: formData.wantsPremiumDelivery,
        // 10DLC Brand Information
        ein: formData.ein.trim() || undefined,
        brandPhoneNumber: formData.brandPhoneNumber.trim() || undefined,
        streetAddress: formData.streetAddress.trim() || undefined,
        city: formData.city.trim() || undefined,
        state: formData.state.trim().toUpperCase() || undefined,
        postalCode: formData.postalCode.trim() || undefined,
        website: formData.website.trim() || undefined,
        entityType: formData.entityType,
        vertical: formData.vertical,
      });
      toast.success('Profile updated successfully');
      loadProfile();
    } catch (error) {
      // Show generic error message without exposing backend details
      toast.error('Failed to update profile. Please try again.');
      if (import.meta.env.DEV) {
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

                      {/* Delivery Tier Selection */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.18 }}
                        className="mb-8"
                      >
                        <SoftCard variant="gradient">
                          <h3 className="font-semibold text-foreground mb-2">SMS Delivery Tier</h3>
                          <p className="text-sm text-muted-foreground mb-6">
                            Choose your SMS delivery performance level. Standard is recommended for most churches. You can upgrade to Premium anytime.
                          </p>

                          {/* Helpful Info Box */}
                          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-xs text-blue-900">
                              <strong>💡 Need help choosing?</strong> Standard works great for announcements and general messaging. Premium is best for time-sensitive or critical messages.
                            </p>
                          </div>

                          <div className="space-y-3">
                            {/* Shared Brand Option */}
                            <label className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary cursor-pointer transition" style={{ backgroundColor: !formData.wantsPremiumDelivery ? 'rgba(59, 130, 246, 0.05)' : '' }}>
                              <input
                                type="radio"
                                name="deliveryTier"
                                checked={!formData.wantsPremiumDelivery}
                                onChange={() => setFormData({ ...formData, wantsPremiumDelivery: false })}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="font-medium text-foreground flex items-center gap-2">
                                  📊 Standard Delivery
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Recommended</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  65% delivery rate • Instant activation • No EIN required
                                </p>
                                <div className="text-xs text-muted-foreground mt-2 space-y-1">
                                  <p>✓ Best for announcements, event notifications</p>
                                  <p>✓ No business information needed</p>
                                  <p>✓ Ready to use immediately</p>
                                </div>
                              </div>
                            </label>

                            {/* Premium 10DLC Option */}
                            <label className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary cursor-pointer transition" style={{ backgroundColor: formData.wantsPremiumDelivery ? 'rgba(34, 197, 94, 0.05)' : '' }}>
                              <input
                                type="radio"
                                name="deliveryTier"
                                checked={formData.wantsPremiumDelivery}
                                onChange={() => setFormData({ ...formData, wantsPremiumDelivery: true })}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="font-medium text-foreground flex items-center gap-2">
                                  🚀 Premium 10DLC
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Best Performance</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  99% delivery rate • 1-2 day approval • Requires EIN & business info
                                </p>
                                <div className="text-xs text-muted-foreground mt-2 space-y-1">
                                  <p>✓ Best for critical or time-sensitive messages</p>
                                  <p>✓ Highest delivery reliability (99%)</p>
                                  <p>✓ Individually verified brand</p>
                                </div>
                              </div>
                            </label>
                          </div>

                          {/* Current Status */}
                          {profile?.dlcStatus && (
                            <div className="mt-6 pt-6 border-t border-border">
                              <p className="text-xs text-muted-foreground mb-2">Current Status:</p>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-foreground">
                                  {profile.dlcStatus === 'shared_brand' && '📊 Standard Delivery (65%)'}
                                  {profile.dlcStatus === 'pending' && '⏳ Awaiting Approval (99%)'}
                                  {profile.dlcStatus === 'approved' && '✅ Premium Active (99%)'}
                                  {profile.dlcStatus === 'rejected' && '❌ Failed - Contact support'}
                                  {!['shared_brand', 'pending', 'approved', 'rejected'].includes(profile.dlcStatus) && profile.dlcStatus}
                                </span>
                                {profile.deliveryRate && (
                                  <span className="text-xs bg-muted px-2 py-1 rounded">
                                    {(profile.deliveryRate * 100).toFixed(0)}% delivery
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </SoftCard>
                      </motion.div>

                      {/* 10DLC Brand Information Section - Only shown if premium selected */}
                      {formData.wantsPremiumDelivery && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-8"
                      >
                        <SoftCard variant="gradient">
                          <h3 className="font-semibold text-foreground mb-4">10DLC Brand Information</h3>
                          <p className="text-sm text-muted-foreground mb-6">
                            Required for SMS messaging approval. Fill in your church's legal information.
                          </p>

                          {/* EIN */}
                          <div className="mb-6">
                            <Input
                              label="EIN (Employer Identification Number)"
                              type="text"
                              value={formData.ein}
                              onChange={(e) =>
                                setFormData({ ...formData, ein: e.target.value })
                              }
                              placeholder="123456789"
                              required
                            />
                          </div>

                          {/* Brand Phone Number */}
                          <div className="mb-6">
                            <Input
                              label="Brand Contact Phone"
                              type="tel"
                              value={formData.brandPhoneNumber}
                              onChange={(e) =>
                                setFormData({ ...formData, brandPhoneNumber: e.target.value })
                              }
                              placeholder="+12025551234"
                              required
                            />
                          </div>

                          {/* Street Address */}
                          <div className="mb-6">
                            <Input
                              label="Street Address"
                              type="text"
                              value={formData.streetAddress}
                              onChange={(e) =>
                                setFormData({ ...formData, streetAddress: e.target.value })
                              }
                              placeholder="123 Main Street"
                              required
                            />
                          </div>

                          {/* City and State Row */}
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <Input
                              label="City"
                              type="text"
                              value={formData.city}
                              onChange={(e) =>
                                setFormData({ ...formData, city: e.target.value })
                              }
                              placeholder="New York"
                              required
                            />
                            <Input
                              label="State (2-letter)"
                              type="text"
                              value={formData.state}
                              onChange={(e) =>
                                setFormData({ ...formData, state: e.target.value.toUpperCase().slice(0, 2) })
                              }
                              placeholder="NY"
                              maxLength={2}
                              required
                            />
                          </div>

                          {/* Postal Code */}
                          <div className="mb-6">
                            <Input
                              label="Postal Code"
                              type="text"
                              value={formData.postalCode}
                              onChange={(e) =>
                                setFormData({ ...formData, postalCode: e.target.value })
                              }
                              placeholder="10001"
                              required
                            />
                          </div>

                          {/* Website (Optional) */}
                          <div className="mb-6">
                            <Input
                              label="Church Website (Optional)"
                              type="url"
                              value={formData.website}
                              onChange={(e) =>
                                setFormData({ ...formData, website: e.target.value })
                              }
                              placeholder="https://yourchurch.com"
                            />
                          </div>

                          {/* Entity Type and Vertical */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-foreground mb-2">
                                Entity Type
                              </label>
                              <select
                                value={formData.entityType}
                                onChange={(e) =>
                                  setFormData({ ...formData, entityType: e.target.value })
                                }
                                className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground"
                              >
                                <option value="NON_PROFIT">Non-Profit (Recommended for churches)</option>
                                <option value="PRIVATE_CORPORATION">Private Corporation</option>
                                <option value="PUBLIC_CORPORATION">Public Corporation</option>
                                <option value="GOVERNMENT_ENTITY">Government Entity</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-foreground mb-2">
                                Industry Vertical
                              </label>
                              <select
                                value={formData.vertical}
                                onChange={(e) =>
                                  setFormData({ ...formData, vertical: e.target.value })
                                }
                                className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground"
                              >
                                <option value="NGO">Non-Governmental Organization (NGO) - For churches</option>
                                <option value="EDUCATION">Education</option>
                                <option value="HEALTHCARE">Healthcare</option>
                                <option value="FINANCE">Finance</option>
                              </select>
                            </div>
                          </div>
                        </SoftCard>
                      </motion.div>
                      )}

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
