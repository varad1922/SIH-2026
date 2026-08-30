import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Target, Activity, LogOut, MessageSquare } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { logout } = React.useContext(AuthContext);
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Home className="w-5 h-5" /> },
    { name: 'My Learning', path: '/learning', icon: <BookOpen className="w-5 h-5" /> },
    { name: 'Skill Assessment', path: '/assessment', icon: <Target className="w-5 h-5" /> },
    { name: 'Analytics', path: '/analytics', icon: <Activity className="w-5 h-5" /> },
    { name: 'AI Assistant', path: '/chat', icon: <MessageSquare className="w-5 h-5" /> },
  ];

  return (
    <div className="w-64 bg-card-bg border-r border-border-main h-screen fixed left-0 top-0 flex flex-col z-50 shadow-sm">
      <div className="p-6 flex items-center justify-center border-b border-border-main">
          <img 
            src="/logo.png" 
            alt="AI Education Platform Logo" 
            className="w-8 h-8 object-contain rounded-md border border-border-main"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <span className="hidden text-xl font-bold text-text-main tracking-tight">AI Edu</span>
      </div>
      
      <nav className="flex-1 py-6 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 group relative ${
                isActive 
                  ? 'bg-secondary-50 text-secondary-700 font-semibold border border-secondary-200' 
                  : 'text-text-secondary hover:bg-card-alt hover:text-text-main border border-transparent'
              }`}
            >
              <div className={`transition-transform duration-200 ${isActive ? 'text-secondary-600' : 'text-primary-400 group-hover:text-accent-600'}`}>
                {item.icon}
              </div>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border-main">
        <button onClick={logout} className="flex items-center space-x-3 px-4 py-3 text-text-secondary hover:bg-red-50 hover:text-red-700 rounded-lg w-full transition-colors duration-200 font-medium cursor-pointer">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

const DashboardLayout = () => {
  return (
    <div className="min-h-screen flex font-sans selection:bg-secondary-200 selection:text-primary-900">
      <Sidebar />
      <div className="flex-1 ml-64 p-8 relative">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
