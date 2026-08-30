import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, Building, Briefcase } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'Learner', department: '', jobRole: ''
  });
  const { register, loginWithGoogle } = useContext(AuthContext);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await register(formData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await loginWithGoogle(credentialResponse.credential);
    } catch (err) {
      setError(err.response?.data?.message || 'Google Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-main)] flex items-center justify-center p-4 py-12 selection:bg-primary-100">
      <div className="max-w-lg w-full bg-[var(--color-card-bg)] rounded-3xl shadow-xl p-8 border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-600 to-accent-500" />
        
        <div className="text-center mb-8 mt-2">
          <h1 className="text-3xl font-black text-[var(--color-text-main)] tracking-tight">Create Account</h1>
          <p className="text-[var(--color-text-secondary)] mt-2">Join Skill Intel to accelerate your career.</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm font-medium border border-red-100">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">Full Name</label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input name="name" type="text" onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all outline-none" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input name="email" type="email" onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all outline-none" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input name="password" type="password" onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all outline-none" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">Department</label>
              <div className="relative">
                <Building className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input name="department" type="text" onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">Job Role</label>
              <div className="relative">
                <Briefcase className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input name="jobRole" type="text" onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all outline-none" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white font-bold py-3.5 rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/30 mt-4 disabled:opacity-50">
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-8 relative flex items-center justify-center mb-6">
          <div className="absolute inset-x-0 h-px bg-gray-200"></div>
          <span className="relative bg-[var(--color-card-bg)] px-4 text-sm text-[var(--color-text-secondary)] font-medium">Or continue with</span>
        </div>

        <div className="flex justify-center w-full">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              setError('Google Login Failed');
            }}
            useOneTap
            width="100%"
          />
        </div>

        <p className="mt-6 text-center text-[var(--color-text-secondary)]">
          Already have an account? <Link to="/login" className="font-bold text-primary-600 hover:text-primary-700">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
