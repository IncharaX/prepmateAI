import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithEmail } = useAuth();

  // Google/social sign-in removed to simplify auth; use email/password instead.

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginWithEmail(email, password);
      const fromPath = location.state?.from?.pathname || localStorage.getItem('postLoginRedirect') || '/dashboard';
      localStorage.removeItem('postLoginRedirect');
      navigate(fromPath, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                PrepMate AI
              </h1>
              <p className="text-gray-600">
                Your Personal Interview Coach
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6 text-sm">
                ⚠️ {error}
              </div>
            )}

            {/* Email login form */}
            <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-lg py-2 px-3"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-lg py-2 px-3"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Secure & Fast</span>
              </div>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Secure & Fast
                </span>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="flex items-center justify-center h-5 w-5 rounded-md bg-blue-500 text-white text-sm font-bold">
                    ✓
                  </div>
                </div>
                <p className="text-sm text-gray-700">
                  <strong>Secure Firebase Auth:</strong> Your credentials are protected
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="flex items-center justify-center h-5 w-5 rounded-md bg-blue-500 text-white text-sm font-bold">
                    ✓
                  </div>
                </div>
                <p className="text-sm text-gray-700">
                  <strong>AI-Powered Feedback:</strong> Get instant interview feedback
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="flex items-center justify-center h-5 w-5 rounded-md bg-blue-500 text-white text-sm font-bold">
                    ✓
                  </div>
                </div>
                <p className="text-sm text-gray-700">
                  <strong>Track Progress:</strong> Monitor your improvement over time
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                By signing in, you agree to our{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                  Terms of Service
                </a>
                {' '}and{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                  Privacy Policy
                </a>
              </p>
            </div>

            {/* Back to home */}
            <div className="mt-6 text-center pt-6 border-t border-gray-200">
              <div className="mb-3">
                <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium text-sm mr-4">
                  Don't have an account? Sign up
                </Link>
                <Link
                  to="/"
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                >
                  ← Back to Home
                </Link>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center text-gray-600 text-sm">
            <p className="mb-2">🎯 Free AI-powered interview coaching</p>
            <p className="mb-4">Start practicing and ace your interviews</p>
            <div className="inline-block bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-xs text-blue-800">
              Production-Grade Security • Real-Time Feedback • Analytics Dashboard
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Login;
