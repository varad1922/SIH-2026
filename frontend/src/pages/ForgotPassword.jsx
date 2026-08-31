import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
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
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center p-4 selection:bg-primary-100 animate-in fade-in duration-500">
      <div className="max-w-md w-full bg-card-bg rounded-3xl shadow-sm border border-border-main p-8 relative overflow-hidden">
        
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -mr-20 -mt-20 pointer-events-none" />

        {!success ? (
          <div className="relative z-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-black text-text-main tracking-tight">Reset Password</h1>
              <p className="text-text-secondary mt-2">Enter your email and we'll send you instructions to reset your password.</p>
            </div>

            {error && <div className="bg-error-50 text-error-600 p-4 rounded-xl mb-6 text-sm font-bold border border-error-100">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-card-alt border border-border-main rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none text-text-main font-medium placeholder-secondary-400"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white font-bold py-3.5 rounded-xl hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50">
                {loading ? 'Sending Instructions...' : 'Send Reset Link'}
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center relative z-10">
            <div className="w-16 h-16 bg-success-100 rounded-full mx-auto flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-success-600" />
            </div>
            <h2 className="text-2xl font-black text-text-main mb-2">Check your email</h2>
            <p className="text-text-secondary mb-8 leading-relaxed">
              We've sent password reset instructions to <span className="font-bold text-text-main">{email}</span>. 
              <br/><br/>
              <span className="text-xs font-medium text-secondary-500 bg-secondary-50 p-2 rounded-lg border border-border-main inline-block">
                (Note for prototype: Check backend console for the simulated token)
              </span>
            </p>
          </div>
        )}

        <div className="mt-8 text-center relative z-10">
          <Link to="/login" className="inline-flex items-center text-sm font-bold text-secondary-500 hover:text-primary-600 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
