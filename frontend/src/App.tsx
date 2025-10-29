import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </Router>
  );
}

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Connect YW Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Church SMS Communication Platform
          </p>
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
            <p className="text-gray-700 mb-6">
              Foundation setup in progress. Checkpoint 1 initialization.
            </p>
            <div className="animate-pulse">
              <div className="h-2 bg-blue-500 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
