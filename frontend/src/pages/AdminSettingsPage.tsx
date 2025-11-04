import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { getProfile, updateProfile } from '../api/admin';
import CoAdminPanel from '../components/admin/CoAdminPanel';
import ActivityLogsPanel from '../components/admin/ActivityLogsPanel';
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
  const [activeTab, setActiveTab] = useState<'profile' | 'coadmins' | 'logs'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<ChurchProfile | null>(null);
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

  // Initial load effect would go here in real implementation
  // useEffect(() => { loadProfile(); }, []);

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
            <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">Settings</span>
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
                {(['profile', 'coadmins', 'logs'] as const).map((tab, idx) => (
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
  );
}

export default AdminSettingsPage;
