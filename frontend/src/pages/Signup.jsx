import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { signupWithEmail } = useAuth();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const data = await signupWithEmail(email, password, displayName || undefined);
      const fromPath = location.state?.from?.pathname || localStorage.getItem('postLoginRedirect') || '/dashboard';
      localStorage.removeItem('postLoginRedirect');
      navigate(fromPath, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Signup failed');
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
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
              <p className="text-gray-600">Join PrepMate AI and start practicing interviews</p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6 text-sm">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4 mb-6">
              <input
                type="text"
                placeholder="Full name (optional)"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg py-2 px-3"
              />
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
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-lg py-2 px-3"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg"
              >
                {loading ? 'Creating account...' : 'Sign up'}
              </button>
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                By signing up, you agree to our{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700 underline">Terms of Service</a> and{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700 underline">Privacy Policy</a>
              </p>
            </div>

            <div className="mt-6 text-center pt-6 border-t border-gray-200">
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors">
                ← Already have an account? Sign in
              </Link>
            </div>
          </div>

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

export default Signup;
