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
    <div className="w-64 bg-white/80 backdrop-blur-xl border-r border-gray-100 h-screen fixed left-0 top-0 flex flex-col z-50">
      <div className="p-6 flex items-center space-x-3 bg-gradient-to-r from-primary-50 to-transparent">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary-500/30">
          SI
        </div>
        <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 text-xl">Skill Intel</span>
      </div>
      
      <nav className="flex-1 py-8 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                isActive 
                  ? 'text-primary-700 font-semibold' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-secondary-50/30 -z-10" />
              )}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
              )}
              <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </div>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6">
        <button onClick={logout} className="flex items-center space-x-3 px-4 py-3 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl w-full transition-all duration-300 font-medium cursor-pointer">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-[#f4f7fb] flex font-sans text-gray-900 selection:bg-primary-100 selection:text-primary-900">
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-secondary-100/40 via-transparent to-transparent" />
      <Sidebar />
      <div className="flex-1 ml-64 p-8 relative">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
