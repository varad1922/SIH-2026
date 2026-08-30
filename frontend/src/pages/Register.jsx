import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, Building, Briefcase } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Learner',
    department: '',
    jobRole: '',
  });

  const { register, loginWithGoogle } = useContext(AuthContext);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);

      await register(formData);
    } catch (err) {
      console.error('Registration error:', err);

      setError(
        err.response?.data?.message ||
          'Failed to register. Please try again.'
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
      navigate('/');
    } catch (err) {
      console.error('Google login error:', err);
      setError(
        err.response?.data?.message ||
          'Google Sign Up failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (errorResponse) => {
    console.error('Google Auth Error:', errorResponse);
    setError(
      'Google Sign-In failed. Ensure your Google Cloud Console Authorized JavaScript Origins matches this exact domain/URL.'
    );
  };

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center p-4 py-12">
      <div className="max-w-md w-full animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-card-bg rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-border-main p-8 relative overflow-hidden">
          {/* Header Accent */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-600 to-accent-500" />

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
            Create Account
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Join the AI Education Platform
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-start space-x-2 mb-6">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">
              Full Name
            </label>

            <div className="relative">
              <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" />

              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 bg-card-alt border border-border-main rounded-xl focus:ring-2 focus:ring-secondary-500/50 focus:border-secondary-500 transition-all outline-none"
                placeholder="Enter your full name"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">
              Email Address
            </label>

            <div className="relative">
              <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" />

              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 bg-card-alt border border-border-main rounded-xl focus:ring-2 focus:ring-secondary-500/50 focus:border-secondary-500 transition-all outline-none"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">
              Password
            </label>

            <div className="relative">
              <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" />

              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 bg-card-alt border border-border-main rounded-xl focus:ring-2 focus:ring-secondary-500/50 focus:border-secondary-500 transition-all outline-none"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Department and Job Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">
                Department
              </label>

              <div className="relative">
                <Building className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" />

                <input
                  name="department"
                  type="text"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-card-alt border border-border-main rounded-xl focus:ring-2 focus:ring-secondary-500/50 focus:border-secondary-500 transition-all outline-none"
                  placeholder="e.g. IT"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">
                Job Role
              </label>

              <div className="relative">
                <Briefcase className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" />

                <input
                  name="jobRole"
                  type="text"
                  value={formData.jobRole}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-card-alt border border-border-main rounded-xl focus:ring-2 focus:ring-secondary-500/50 focus:border-secondary-500 transition-all outline-none"
                  placeholder="e.g. Analyst"
                />
              </div>
            </div>

          </div>

          {/* Normal Sign Up */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary-600 text-white font-bold py-3 rounded-xl hover:bg-secondary-700 hover:-translate-y-0.5 transition-all shadow-sm mt-4 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>

        </form>

        {/* Divider */}
        <div className="mt-8 relative flex items-center justify-center mb-6">
          <div className="absolute inset-x-0 h-px bg-border-main" />

          <span className="relative bg-[var(--color-card-bg)] px-4 text-sm text-[var(--color-text-secondary)] font-medium">
            Or continue with
          </span>
        </div>

        {/* Google Sign Up */}
        <div className="flex justify-center w-full overflow-hidden">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            width={360}
            theme="outline"
            size="large"
            shape="rectangular"
            text="signup_with"
          />
        </div>

        <p className="mt-6 text-center text-[var(--color-text-secondary)]">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-bold text-secondary-600 hover:text-secondary-700"
          >
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Register;