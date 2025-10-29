import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, church, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const daysUntilTrialEnd = church ? Math.ceil(
    (new Date(church.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  ) : 0;

  const trialStatus = daysUntilTrialEnd > 0 ? 'active' : 'expired';
  const trialColor = daysUntilTrialEnd >= 8 ? 'green' : daysUntilTrialEnd >= 4 ? 'yellow' : 'red';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Connect YW Dashboard</h1>
            <p className="text-gray-600">{church?.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Trial Banner */}
        <div
          className={`rounded-lg p-4 mb-8 text-white ${
            trialColor === 'green'
              ? 'bg-green-500'
              : trialColor === 'yellow'
              ? 'bg-yellow-500'
              : 'bg-red-500'
          }`}
        >
          <p className="font-semibold">
            Trial Status: {daysUntilTrialEnd > 0 ? `${daysUntilTrialEnd} days remaining` : 'Expired'}
          </p>
        </div>

        {/* Welcome Card */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome, {user?.firstName}!
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">User Info</h3>
              <p className="text-gray-600">
                <strong>Name:</strong> {user?.firstName} {user?.lastName}
              </p>
              <p className="text-gray-600">
                <strong>Email:</strong> {user?.email}
              </p>
              <p className="text-gray-600">
                <strong>Role:</strong> {user?.role}
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Church Info</h3>
              <p className="text-gray-600">
                <strong>Name:</strong> {church?.name}
              </p>
              <p className="text-gray-600">
                <strong>Email:</strong> {church?.email}
              </p>
              <p className="text-gray-600">
                <strong>Trial Ends:</strong> {new Date(church?.trialEndsAt || '').toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Placeholder Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">0</div>
            <p className="text-gray-600">Branches</p>
            <p className="text-sm text-gray-500 mt-2">Coming soon</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">0</div>
            <p className="text-gray-600">Members</p>
            <p className="text-sm text-gray-500 mt-2">Coming soon</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">0</div>
            <p className="text-gray-600">Messages Sent</p>
            <p className="text-sm text-gray-500 mt-2">Coming soon</p>
          </div>
        </div>

        {/* Features Coming Soon */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Coming Soon</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Multi-branch management</li>
            <li>Member management with CSV import</li>
            <li>SMS messaging to groups and individuals</li>
            <li>Message templates and automation</li>
            <li>Analytics and reporting</li>
            <li>Billing and subscription management</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
