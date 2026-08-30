import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, loginWithGoogle } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);

      await login(email, password);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to login. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setError('');
      setLoading(true);

      if (!credentialResponse?.credential) {
        throw new Error('Google credential not received');
      }

      await loginWithGoogle(credentialResponse.credential);
    } catch (err) {
      console.error('Google login error:', err);
      setError(
        err.response?.data?.message ||
          'Google Login failed. Please try again.'
      );
    }
  };

  const handleGoogleError = (errorResponse) => {
    console.error('Google Auth Error:', errorResponse);
    setError(
      'Google Sign-In failed. Ensure your Google Cloud Console Authorized JavaScript Origins matches this exact domain/URL.'
    );
  };

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center p-4">
      <div className="max-w-md w-full animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-card-bg rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-border-main p-8 relative overflow-hidden">
          {/* Header Accent */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-600 to-secondary-600" />

          <div className="text-center mb-8 mt-2">
              <img 
                src="/logo.png" 
                alt="AI Education Platform Logo" 
                className="w-14 h-14 object-contain shadow-sm rounded-xl border border-border-main mx-auto mb-4"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden w-14 h-14 bg-secondary-600 rounded-xl items-center justify-center text-white font-bold text-xl shadow-sm mx-auto mb-4">
                AI
              </div>
          </div>

          <h1 className="text-2xl font-bold text-[var(--color-text-main)] tracking-tight">
            Welcome Back
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Log in to continue your learning journey
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-start space-x-2 mb-6">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1.5">
              Email Address
            </label>

            <div className="relative">
              <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-card-alt border border-border-main rounded-xl focus:ring-2 focus:ring-secondary-500/50 focus:border-secondary-500 transition-all outline-none"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-medium text-[var(--color-text-main)]">
                Password
              </label>

              <Link
                to="/forgot-password"
                className="text-sm font-bold text-secondary-600 hover:text-secondary-700"
              >
                Forgot Password?
              </Link>
            </div>

            <div className="relative">
              <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-card-alt border border-border-main rounded-xl focus:ring-2 focus:ring-secondary-500/50 focus:border-secondary-500 transition-all outline-none"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary-600 text-white font-bold py-3 rounded-xl hover:bg-secondary-700 hover:-translate-y-0.5 transition-all shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <LogIn className="w-5 h-5" />

            <span>
              {loading ? 'Signing in...' : 'Sign In'}
            </span>
          </button>
        </form>

        <div className="mt-8 relative flex items-center justify-center mb-6">
          <div className="absolute inset-x-0 h-px bg-gray-200" />

          <span className="relative bg-[var(--color-card-bg)] px-4 text-sm text-[var(--color-text-secondary)] font-medium">
            Or continue with
          </span>
        </div>

        {/* Google Login */}
        <div className="flex justify-center w-full overflow-hidden">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            width={360}
            theme="outline"
            size="large"
            shape="rectangular"
            text="signin_with"
          />
        </div>

        <p className="mt-8 text-center text-[var(--color-text-secondary)]">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-bold text-primary-600 hover:text-primary-700"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;