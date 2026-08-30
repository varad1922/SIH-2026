import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-main)] flex items-center justify-center p-4 selection:bg-primary-100">
      <div className="max-w-md w-full bg-[var(--color-card-bg)] rounded-3xl shadow-xl p-8 border border-gray-100">
        {!success ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-black text-[var(--color-text-main)] tracking-tight">Reset Password</h1>
              <p className="text-[var(--color-text-secondary)] mt-2">Enter your email and we'll send you instructions to reset your password.</p>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm font-medium border border-red-100">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all outline-none"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white font-bold py-3.5 rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/30 disabled:opacity-50">
                {loading ? 'Sending Instructions...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-success-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-success-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
            <p className="text-gray-500 mb-8">We've sent password reset instructions to <span className="font-semibold text-gray-800">{email}</span>. (Check backend console for token in prototype)</p>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-primary-600 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
