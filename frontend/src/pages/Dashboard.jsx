import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserCircle, BookOpen, Target, Activity, MessageSquare, LogOut, Clock, Award } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navCards = [
    { name: 'Profile', icon: UserCircle, path: '/profile', color: 'text-primary-600', bg: 'bg-primary-50', hover: 'hover:border-primary-300' },
    { name: 'My Learning', icon: BookOpen, path: '/learning', color: 'text-secondary-600', bg: 'bg-secondary-50', hover: 'hover:border-secondary-300' },
    { name: 'Skill Assessment', icon: Target, path: '/assessment', color: 'text-accent-600', bg: 'bg-accent-50', hover: 'hover:border-accent-300' },
    { name: 'Analytics', icon: Activity, path: '/analytics', color: 'text-success-600', bg: 'bg-success-50', hover: 'hover:border-success-300' },
    { name: 'AI Assistant', icon: MessageSquare, path: '/chat', color: 'text-primary-600', bg: 'bg-primary-50', hover: 'hover:border-primary-300' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 lg:py-12 animate-in fade-in duration-500">
      
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
        
        {/* LEFT COLUMN: Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-black text-text-main tracking-tight">
              Hi {user?.name || 'Varad Shahane'} 👋
            </h1>
            <p className="text-text-secondary mt-2 font-medium text-lg">
              Welcome back! Here's your learning and competency overview.
            </p>
          </div>

          {/* Profile / Welcome Info Card */}
          <div className="bg-card-bg border border-border-main rounded-3xl p-8 shadow-sm relative overflow-hidden mb-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-secondary-100 to-primary-50 opacity-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-5 mb-10">
                <div className="w-16 h-16 rounded-2xl bg-secondary-100 flex items-center justify-center text-secondary-700 font-black text-2xl border border-secondary-200 shadow-sm shrink-0">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'V'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-main tracking-tight">{user?.name || 'Varad Shahane'}</h2>
                  <p className="text-secondary-600 font-bold mt-0.5">Data Science Track</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] font-black text-text-secondary mb-2">Competency</p>
                  <p className="text-3xl font-bold text-text-main">76%</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] font-black text-text-secondary mb-2">Hours</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-secondary-500" />
                    <p className="text-3xl font-bold text-text-main">45</p>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] font-black text-text-secondary mb-2">Courses</p>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary-500" />
                    <p className="text-3xl font-bold text-text-main">12</p>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] font-black text-text-secondary mb-2">Badges</p>
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-accent-500" />
                    <p className="text-3xl font-bold text-text-main">8</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Learning */}
          <div className="mb-12">
            <h3 className="text-xs uppercase tracking-[0.2em] font-black text-text-secondary mb-5">My Day / Today's Learning</h3>
            <div className="bg-card-bg border border-border-main rounded-3xl p-6 lg:p-8 shadow-sm hover:border-secondary-300 transition-colors group">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.15em] text-secondary-600 mb-2">In Progress</p>
                  <h4 className="text-xl font-bold text-text-main tracking-tight">Foundations of Study</h4>
                  <p className="text-sm font-medium text-text-secondary mt-1">Module 2: Practical Application Exercise</p>
                </div>
                <Link to="/learning" className="px-6 py-3.5 bg-secondary-600 text-white font-bold rounded-xl hover:bg-secondary-700 hover:-translate-y-0.5 shadow-sm transition-all shrink-0">
                  Continue Learning
                </Link>
              </div>
            </div>
          </div>

          {/* Logout */}
          <div className="mt-auto pt-4 pb-8">
            <button 
              onClick={handleLogout}
              className="inline-flex items-center gap-2.5 px-4 py-2.5 text-text-secondary hover:text-red-600 hover:bg-red-50 rounded-lg font-bold transition-colors -ml-4"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: Navigation Boxes */}
        <div className="lg:w-80 shrink-0">
          <h3 className="text-sm font-black text-text-main mb-5 uppercase tracking-[0.15em]">My Learning Hub</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {navCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link 
                  key={card.name} 
                  to={card.path}
                  className={`flex items-center gap-5 p-5 rounded-2xl bg-card-bg border border-border-main hover:shadow-md hover:-translate-y-1 transition-all duration-300 ${card.hover} group`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${card.bg} ${card.color} transition-colors`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-text-main text-lg group-hover:text-secondary-700 transition-colors">
                    {card.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
