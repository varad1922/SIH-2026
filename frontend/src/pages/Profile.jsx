import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import api from '../api/client';
import { ArrowLeft, BookOpen, Clock, Award, TrendingUp, LogOut } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/analytics/overview');
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const { socket } = useContext(SocketContext);

  useEffect(() => {
    if (socket) {
      socket.on('progress_updated', fetchAnalytics);
      socket.on('quiz_completed', fetchAnalytics);
      return () => {
        socket.off('progress_updated', fetchAnalytics);
        socket.off('quiz_completed', fetchAnalytics);
      };
    }
  }, [socket]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-main tracking-tight">My Profile</h1>
          <p className="text-text-secondary mt-1 text-lg">Manage your account and view your learning stats.</p>
        </div>
      </header>

      {/* Profile Info */}
      <section className="bg-card-bg border border-border-main rounded-3xl p-8 shadow-sm relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-100 to-secondary-50 opacity-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
         <div className="relative z-10">
          <h2 className="text-xs uppercase tracking-widest font-bold text-text-secondary mb-6">Profile Information</h2>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-24 h-24 rounded-3xl bg-primary-50 flex items-center justify-center text-primary-600 font-black text-4xl border border-primary-100 shadow-sm shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Name</p>
                  <p className="text-lg font-bold text-text-main">{user?.name || 'Learner'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Email</p>
                  <p className="font-medium text-text-main">{user?.email || 'No email provided'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Role</p>
                  <p className="font-medium text-text-main capitalize inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-secondary-100 text-secondary-800">
                    {user?.role || 'Learner'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Department</p>
                  <p className="font-medium text-text-main capitalize">
                    {user?.department || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          </div>
         </div>
      </section>

      {/* Stats */}
      <section className="bg-card-bg border border-border-main rounded-3xl p-8 shadow-sm">
        <h2 className="text-xs uppercase tracking-widest font-bold text-text-secondary mb-6">Learning Statistics</h2>
        
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-card-alt rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-card-alt border border-border-main">
              <BookOpen className="w-6 h-6 text-primary-600 mb-3" />
              <p className="text-sm font-bold text-text-secondary mb-1">Courses Completed</p>
              <p className="text-3xl font-black text-text-main">{analytics?.coursesCompleted || 0}</p>
            </div>
            
            <div className="p-5 rounded-2xl bg-card-alt border border-border-main">
              <Clock className="w-6 h-6 text-secondary-600 mb-3" />
              <p className="text-sm font-bold text-text-secondary mb-1">Learning Hours</p>
              <p className="text-3xl font-black text-text-main">{analytics?.learningHours || 0}</p>
            </div>
            
            <div className="p-5 rounded-2xl bg-card-alt border border-border-main">
              <Award className="w-6 h-6 text-accent-600 mb-3" />
              <p className="text-sm font-bold text-text-secondary mb-1">Skill Badges</p>
              <p className="text-3xl font-black text-text-main">{analytics?.skillBadges || 0}</p>
            </div>
            
            <div className="p-5 rounded-2xl bg-card-alt border border-border-main">
              <TrendingUp className="w-6 h-6 text-success-600 mb-3" />
              <p className="text-sm font-bold text-text-secondary mb-1">Competency</p>
              <p className="text-3xl font-black text-text-main">{analytics?.completionPercentage || 0}%</p>
            </div>
          </div>
        )}
      </section>
      
      <div className="pt-2 pb-8 flex justify-end">
        <button 
          onClick={handleLogout}
          className="inline-flex items-center gap-2.5 px-6 py-3 bg-error-50 text-error-600 hover:bg-error-100 rounded-xl font-bold transition-colors border border-error-100 shadow-sm"
        >
          <LogOut className="w-5 h-5" />
          Logout Securely
        </button>
      </div>
    </div>
  );
};

export default Profile;
