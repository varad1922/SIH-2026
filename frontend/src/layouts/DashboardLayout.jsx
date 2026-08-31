import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Target, 
  MessageSquare, 
  Activity, 
  UserCircle,
  Menu,
  X 
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'My Learning', path: '/learning', icon: BookOpen },
  { name: 'Assessment', path: '/assessment', icon: Target },
  { name: 'AI Assistant', path: '/chat', icon: MessageSquare },
  { name: 'Analytics', path: '/analytics', icon: Activity },
  { name: 'Profile', path: '/profile', icon: UserCircle },
];

const DashboardLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-main font-sans selection:bg-secondary-200 selection:text-primary-900 flex">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-card-bg border-r border-border-main transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          
          {/* Logo Area */}
          <div className="h-20 flex items-center px-8 border-b border-border-main shrink-0">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm mr-4">
              SI
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-main tracking-tight">Skill Intel</h1>
              <p className="text-xs text-text-secondary font-medium tracking-wider uppercase mt-0.5">Education</p>
            </div>
            <button 
              className="ml-auto lg:hidden p-2 text-text-secondary hover:bg-card-alt rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => 
                  `flex items-center px-4 py-3.5 rounded-xl font-semibold transition-all duration-200 group ${
                    isActive 
                      ? 'bg-primary-50 text-primary-700' 
                      : 'text-text-secondary hover:bg-card-alt hover:text-text-main'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-primary-600' : 'text-text-secondary group-hover:text-text-main'}`} />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-card-bg border-b border-border-main flex items-center px-4 shrink-0">
          <button 
            className="p-2 text-text-secondary hover:bg-card-alt rounded-lg"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="ml-4 font-bold text-text-main">Skill Intel</div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
