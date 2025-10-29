import { useState } from 'react';
import toast from 'react-hot-toast';
import { getProfile, updateProfile } from '../api/admin';
import CoAdminPanel from '../components/admin/CoAdminPanel';
import ActivityLogsPanel from '../components/admin/ActivityLogsPanel';

export function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'coadmins' | 'logs'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
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
        name: data.name,
        email: data.email,
      });
    } catch (error) {
      toast.error((error as Error).message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load effect would go here in real implementation
  // useEffect(() => { loadProfile(); }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    try {
      setIsSaving(true);
      await updateProfile({
        name: formData.name,
        email: formData.email,
      });
      toast.success('Profile updated successfully');
      loadProfile();
    } catch (error) {
      toast.error((error as Error).message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
          <p className="text-gray-600 mt-2">Manage your church account and permissions</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 px-4 py-4 text-center font-medium border-b-2 transition ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-700 hover:text-gray-900'
                }`}
              >
                Church Profile
              </button>
              <button
                onClick={() => setActiveTab('coadmins')}
                className={`flex-1 px-4 py-4 text-center font-medium border-b-2 transition ${
                  activeTab === 'coadmins'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-700 hover:text-gray-900'
                }`}
              >
                Co-Admins
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`flex-1 px-4 py-4 text-center font-medium border-b-2 transition ${
                  activeTab === 'logs'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-700 hover:text-gray-900'
                }`}
              >
                Activity Logs
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* Church Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Church Profile</h2>

                {isLoading ? (
                  <p className="text-gray-500">Loading profile...</p>
                ) : (
                  <form onSubmit={handleSaveProfile} className="max-w-2xl">
                    {/* Church Name */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Church Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Your church name"
                      />
                    </div>

                    {/* Email */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="contact@church.com"
                      />
                    </div>

                    {/* Account Info */}
                    {profile && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-gray-900 mb-3">Account Information</h3>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="text-gray-600">Status:</span>{' '}
                            <span className="font-medium text-gray-900">
                              {profile.subscriptionStatus}
                            </span>
                          </p>
                          <p>
                            <span className="text-gray-600">Created:</span>{' '}
                            <span className="font-medium text-gray-900">
                              {new Date(profile.createdAt).toLocaleDateString()}
                            </span>
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Save Button */}
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Co-Admins Tab */}
            {activeTab === 'coadmins' && <CoAdminPanel />}

            {/* Activity Logs Tab */}
            {activeTab === 'logs' && <ActivityLogsPanel />}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminSettingsPage;
