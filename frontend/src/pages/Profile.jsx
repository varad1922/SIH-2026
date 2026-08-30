import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft, BookOpen, Clock, Award, TrendingUp, LogOut } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 lg:py-12 animate-in fade-in duration-500">
      <Link to="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-secondary-600 font-bold transition-colors mb-8">
        <ArrowLeft className="w-5 h-5" /> Back to Dashboard
      </Link>

      <h1 className="text-3xl font-black text-text-main tracking-tight mb-8">My Profile</h1>

      <div className="space-y-8">
        {/* Profile Info */}
        <section className="bg-card-bg border border-border-main rounded-3xl p-8 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-primary-100 to-secondary-50 opacity-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
           <div className="relative z-10">
            <h2 className="text-xs uppercase tracking-[0.2em] font-black text-text-secondary mb-6">Profile Information</h2>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-24 h-24 rounded-3xl bg-primary-100 flex items-center justify-center text-primary-700 font-black text-4xl border border-primary-200 shadow-sm shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'V'}
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Name</p>
                  <p className="text-xl font-bold text-text-main">{user?.name || 'Varad Shahane'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Email</p>
                  <p className="font-medium text-text-main">{user?.email || 'varad@example.com'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Role</p>
                  <p className="font-medium text-text-main capitalize">{user?.role || 'Learner'}</p>
                </div>
              </div>
            </div>
           </div>
        </section>

        {/* Stats */}
        <section className="bg-card-bg border border-border-main rounded-3xl p-8 shadow-sm">
          <h2 className="text-xs uppercase tracking-[0.2em] font-black text-text-secondary mb-6">Learning Statistics</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-card-alt border border-border-main">
              <BookOpen className="w-6 h-6 text-primary-500 mb-3" />
              <p className="text-sm font-bold text-text-secondary mb-1">Courses Completed</p>
              <p className="text-3xl font-black text-text-main">12</p>
            </div>
            
            <div className="p-5 rounded-2xl bg-card-alt border border-border-main">
              <Clock className="w-6 h-6 text-secondary-500 mb-3" />
              <p className="text-sm font-bold text-text-secondary mb-1">Learning Hours</p>
              <p className="text-3xl font-black text-text-main">45h</p>
            </div>
            
            <div className="p-5 rounded-2xl bg-card-alt border border-border-main">
              <Award className="w-6 h-6 text-accent-500 mb-3" />
              <p className="text-sm font-bold text-text-secondary mb-1">Skill Badges</p>
              <p className="text-3xl font-black text-text-main">8</p>
            </div>
            
            <div className="p-5 rounded-2xl bg-card-alt border border-border-main">
              <TrendingUp className="w-6 h-6 text-success-500 mb-3" />
              <p className="text-sm font-bold text-text-secondary mb-1">Competency</p>
              <p className="text-3xl font-black text-text-main">76%</p>
            </div>
          </div>
        </section>
        
        <div className="pt-4 pb-8">
          <button 
            onClick={handleLogout}
            className="inline-flex items-center gap-2.5 px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout Securely
          </button>
        </div>

      </div>
    </div>
  );
};

export default Profile;
