import { useState } from 'react';
import toast from 'react-hot-toast';
import { getProfile, updateProfile } from '../api/admin';
import CoAdminPanel from '../components/admin/CoAdminPanel';
import ActivityLogsPanel from '../components/admin/ActivityLogsPanel';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import { Spinner } from '../components/ui';

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
    <div className="min-h-screen bg-gradient-to-b from-white to-primary-50 dark:from-primary-950 dark:to-primary-900 p-6 transition-colors duration-normal">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary-900 dark:text-primary-50 mb-2">⚙️ Admin Settings</h1>
          <p className="text-primary-600 dark:text-primary-400">Manage your church account and permissions</p>
        </div>

        {/* Tab Navigation */}
        <Card variant="default" className="mb-8 border border-primary-200 dark:border-primary-800">
          <div className="border-b border-primary-200 dark:border-primary-800">
            <div className="flex">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 px-4 py-4 text-center font-medium border-b-2 transition ${
                  activeTab === 'profile'
                    ? 'border-accent-500 text-accent-600 dark:text-accent-400'
                    : 'border-transparent text-primary-700 dark:text-primary-300 hover:text-primary-900 dark:hover:text-white'
                }`}
              >
                ⛪ Church Profile
              </button>
              <button
                onClick={() => setActiveTab('coadmins')}
                className={`flex-1 px-4 py-4 text-center font-medium border-b-2 transition ${
                  activeTab === 'coadmins'
                    ? 'border-accent-500 text-accent-600 dark:text-accent-400'
                    : 'border-transparent text-primary-700 dark:text-primary-300 hover:text-primary-900 dark:hover:text-white'
                }`}
              >
                👥 Co-Admins
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`flex-1 px-4 py-4 text-center font-medium border-b-2 transition ${
                  activeTab === 'logs'
                    ? 'border-accent-500 text-accent-600 dark:text-accent-400'
                    : 'border-transparent text-primary-700 dark:text-primary-300 hover:text-primary-900 dark:hover:text-white'
                }`}
              >
                📋 Activity Logs
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* Church Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-bold text-primary-900 dark:text-primary-50 mb-6">Church Profile</h2>

                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Spinner size="lg" text="Loading profile..." />
                  </div>
                ) : (
                  <form onSubmit={handleSaveProfile} className="max-w-2xl">
                    {/* Church Name */}
                    <Input
                      label="⛪ Church Name"
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Your church name"
                      className="mb-6"
                    />

                    {/* Email */}
                    <Input
                      label="📧 Email Address"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="contact@church.com"
                      className="mb-6"
                    />

                    {/* Account Info */}
                    {profile && (
                      <Card variant="highlight" className="mb-6 bg-accent-50 dark:bg-accent-900/30 border border-accent-200 dark:border-accent-800">
                        <h3 className="font-semibold text-primary-900 dark:text-primary-50 mb-3">Account Information</h3>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="text-primary-600 dark:text-primary-400">Status:</span>{' '}
                            <span className="font-medium text-primary-900 dark:text-primary-50">
                              {profile.subscriptionStatus}
                            </span>
                          </p>
                          <p>
                            <span className="text-primary-600 dark:text-primary-400">Created:</span>{' '}
                            <span className="font-medium text-primary-900 dark:text-primary-50">
                              {new Date(profile.createdAt).toLocaleDateString()}
                            </span>
                          </p>
                        </div>
                      </Card>
                    )}

                    {/* Save Button */}
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      isLoading={isSaving}
                      disabled={isSaving}
                    >
                      💾 Save Changes
                    </Button>
                  </form>
                )}
              </div>
            )}

            {/* Co-Admins Tab */}
            {activeTab === 'coadmins' && <CoAdminPanel />}

            {/* Activity Logs Tab */}
            {activeTab === 'logs' && <ActivityLogsPanel />}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default AdminSettingsPage;
