import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  UserCircle,
  BookOpen,
  Target,
  Activity,
  MessageSquare,
  LogOut,
  Clock,
  Award,
  ChevronRight,
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigationCards = [
    {
      name: 'My Learning',
      description: 'Continue your learning modules',
      icon: BookOpen,
      path: '/learning',
    },
    {
      name: 'Skill Assessment',
      description: 'Test your knowledge and skills',
      icon: Target,
      path: '/assessment',
    },
    {
      name: 'Analytics',
      description: 'View your learning progress',
      icon: Activity,
      path: '/analytics',
    },
    {
      name: 'AI Assistant',
      description: 'Get personalised learning help',
      icon: MessageSquare,
      path: '/chat',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 lg:py-10">

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">

        {/* LEFT SIDE */}
        <section className="min-w-0">

          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.2em] font-bold text-secondary-600 mb-3">
              Skill Intel Learning Platform
            </p>

            <h1 className="text-3xl lg:text-4xl font-black text-text-main">
              Hi {user?.name || 'Learner'} 👋
            </h1>

            <p className="text-text-secondary text-lg mt-3">
              Welcome back. Continue building your skills and track your
              learning progress.
            </p>
          </div>

          {/* PROFILE SUMMARY */}
          <div className="bg-card-bg border border-border-main rounded-3xl p-6 lg:p-8 mb-8">

            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-secondary-100 text-secondary-700 flex items-center justify-center text-2xl font-black">
                {user?.name
                  ? user.name.charAt(0).toUpperCase()
                  : 'U'}
              </div>

              <div>
                <h2 className="text-2xl font-bold text-text-main">
                  {user?.name || 'Learner'}
                </h2>

                <p className="text-text-secondary">
                  Personal Learning Dashboard
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-text-secondary mb-2">
                  Competency
                </p>
                <p className="text-3xl font-black text-text-main">
                  76%
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-text-secondary mb-2">
                  Learning Hours
                </p>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-secondary-600" />
                  <p className="text-3xl font-black text-text-main">
                    45
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-text-secondary mb-2">
                  Courses
                </p>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-secondary-600" />
                  <p className="text-3xl font-black text-text-main">
                    12
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-text-secondary mb-2">
                  Badges
                </p>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-secondary-600" />
                  <p className="text-3xl font-black text-text-main">
                    8
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* CURRENT LEARNING */}
          <div className="bg-card-bg border border-border-main rounded-3xl p-6 lg:p-8">

            <div className="flex items-center justify-between gap-5 mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] font-bold text-secondary-600 mb-2">
                  Continue Learning
                </p>

                <h2 className="text-2xl font-bold text-text-main">
                  Your Learning Journey
                </h2>
              </div>

              <BookOpen className="w-8 h-8 text-secondary-600" />
            </div>

            <p className="text-text-secondary mb-6">
              Start or continue your current modules. Your progress is saved
              automatically.
            </p>

            <Link
              to="/learning"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-secondary-600 text-white rounded-xl font-bold hover:bg-secondary-700 transition-all"
            >
              Open My Learning
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          {/* BOTTOM LEFT ACTIONS */}
          <div className="mt-8 flex flex-wrap items-center gap-3">

            <Link
              to="/profile"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-main text-text-secondary hover:bg-secondary-50 hover:text-secondary-700 font-bold transition-all"
            >
              <UserCircle className="w-5 h-5" />
              Profile
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-text-secondary hover:bg-red-50 hover:text-red-600 font-bold transition-all"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>

          </div>
        </section>

        {/* RIGHT SIDE BOXES */}
        <aside>
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-secondary-600 mb-3">
            Quick Access
          </p>

          <h2 className="text-2xl font-black text-text-main mb-6">
            My Learning Hub
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">

            {navigationCards.map((card) => {
              const Icon = card.icon;

              return (
                <Link
                  key={card.name}
                  to={card.path}
                  className="group bg-card-bg border border-border-main rounded-2xl p-5 hover:border-secondary-300 hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-center gap-4">

                    <div className="w-14 h-14 rounded-2xl bg-secondary-50 text-secondary-600 flex items-center justify-center shrink-0 group-hover:bg-secondary-600 group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-bold text-text-main">
                        {card.name}
                      </h3>

                      <p className="text-sm text-text-secondary mt-1">
                        {card.description}
                      </p>
                    </div>

                  </div>
                </Link>
              );
            })}

          </div>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;