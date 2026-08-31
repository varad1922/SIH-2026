import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import api from '../api/client';
import {
  BookOpen,
  Target,
  Clock,
  Award,
  ChevronRight,
  TrendingUp,
  PlayCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [data, setData] = useState({
    analytics: null,
    currentPath: null,
    recommendations: [],
    recentQuiz: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [analyticsRes, pathsRes, recsRes, quizzesRes] = await Promise.all([
        api.get('/analytics/overview').catch(() => ({ data: {} })),
        api.get('/learning-path').catch(() => ({ data: [] })),
        api.get('/courses/recommendations').catch(() => ({ data: [] })),
        api.get('/quizzes/history').catch(() => ({ data: { history: [] } }))
      ]);
      
      const paths = pathsRes.data || [];
      let current = paths.find(p => p.progress > 0 && p.progress < 100);
      if (!current && paths.length > 0) current = paths[0];

      setData({
        analytics: analyticsRes.data,
        currentPath: current || null,
        recommendations: Array.isArray(recsRes.data) ? recsRes.data.slice(0, 3) : [],
        recentQuiz: quizzesRes.data?.history?.[0] || null
      });
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Unable to load dashboard data. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const { socket } = useContext(SocketContext);

  useEffect(() => {
    if (socket) {
      socket.on('progress_updated', fetchDashboardData);
      socket.on('quiz_completed', fetchDashboardData);
      return () => {
        socket.off('progress_updated', fetchDashboardData);
        socket.off('quiz_completed', fetchDashboardData);
      };
    }
  }, [socket]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertCircle className="w-12 h-12 text-error-500 mb-4" />
        <h2 className="text-xl font-bold text-text-main mb-2">Something went wrong</h2>
        <p className="text-text-secondary mb-6">{error}</p>
        <button onClick={fetchDashboardData} className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700">Try Again</button>
      </div>
    );
  }

  const { analytics, currentPath, recommendations, recentQuiz } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-main tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || 'Learner'} 👋
          </h1>
          <p className="text-text-secondary mt-1 text-lg">
            Ready to continue your learning journey?
          </p>
        </div>
      </header>

      {/* Metrics Row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-card-bg p-5 rounded-2xl border border-border-main shadow-sm flex items-start space-x-4">
          <div className="p-3 bg-primary-50 text-primary-600 rounded-xl shrink-0"><TrendingUp className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-semibold text-text-secondary">Completion</p>
            {loading ? <div className="h-8 w-16 bg-card-alt rounded animate-pulse mt-1" /> : <p className="text-2xl font-bold text-text-main mt-0.5">{analytics?.completionPercentage || 0}%</p>}
          </div>
        </div>
        
        <div className="bg-card-bg p-5 rounded-2xl border border-border-main shadow-sm flex items-start space-x-4">
          <div className="p-3 bg-secondary-50 text-secondary-600 rounded-xl shrink-0"><Clock className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-semibold text-text-secondary">Hours Learned</p>
            {loading ? <div className="h-8 w-16 bg-card-alt rounded animate-pulse mt-1" /> : <p className="text-2xl font-bold text-text-main mt-0.5">{analytics?.learningHours || 0}</p>}
          </div>
        </div>

        <div className="bg-card-bg p-5 rounded-2xl border border-border-main shadow-sm flex items-start space-x-4">
          <div className="p-3 bg-accent-50 text-accent-600 rounded-xl shrink-0"><BookOpen className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-semibold text-text-secondary">Courses Done</p>
            {loading ? <div className="h-8 w-16 bg-card-alt rounded animate-pulse mt-1" /> : <p className="text-2xl font-bold text-text-main mt-0.5">{analytics?.coursesCompleted || 0}</p>}
          </div>
        </div>

        <div className="bg-card-bg p-5 rounded-2xl border border-border-main shadow-sm flex items-start space-x-4">
          <div className="p-3 bg-success-50 text-success-600 rounded-xl shrink-0"><Award className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-semibold text-text-secondary">Badges Earned</p>
            {loading ? <div className="h-8 w-16 bg-card-alt rounded animate-pulse mt-1" /> : <p className="text-2xl font-bold text-text-main mt-0.5">{analytics?.skillBadges || 0}</p>}
          </div>
        </div>
      </section>

      {/* Two Column Layout for the rest */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Primary Progress & Activity) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Primary Progress */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-text-main">Current Learning</h2>
              <Link to="/learning" className="text-sm font-semibold text-primary-600 hover:text-primary-700">View All</Link>
            </div>
            
            <div className="bg-card-bg border border-border-main rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60 pointer-events-none" />
              
              {loading ? (
                <div className="animate-pulse space-y-4 relative z-10">
                  <div className="h-5 w-32 bg-card-alt rounded" />
                  <div className="h-8 w-3/4 bg-card-alt rounded" />
                  <div className="h-2 w-full bg-card-alt rounded mt-6" />
                  <div className="h-10 w-40 bg-card-alt rounded mt-4" />
                </div>
              ) : currentPath ? (
                <div className="relative z-10">
                  <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-xs font-bold uppercase tracking-wider rounded-md mb-3">
                    {currentPath.type || 'Learning Path'}
                  </span>
                  <h3 className="text-2xl font-bold text-text-main mb-2">{currentPath.title}</h3>
                  <p className="text-text-secondary mb-6 max-w-xl line-clamp-2">{currentPath.description}</p>
                  
                  <div className="mb-6">
                    <div className="flex justify-between text-sm font-semibold mb-2">
                      <span className="text-text-secondary">Overall Progress</span>
                      <span className="text-text-main">{currentPath.progress}%</span>
                    </div>
                    <div className="w-full bg-card-alt rounded-full h-2.5 overflow-hidden">
                      <div className="bg-primary-600 h-full rounded-full transition-all duration-500" style={{ width: `${currentPath.progress}%` }} />
                    </div>
                  </div>
                  
                  <Link 
                    to={`/learning/${currentPath.id}`}
                    className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-sm"
                  >
                    Continue Learning <ChevronRight className="w-5 h-5 ml-1.5" />
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8 relative z-10">
                  <div className="w-16 h-16 bg-card-alt rounded-full flex items-center justify-center mx-auto mb-4 text-text-secondary">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-text-main mb-2">No Active Paths</h3>
                  <p className="text-text-secondary mb-6">You haven't started any learning paths yet.</p>
                  <Link to="/learning" className="inline-flex px-6 py-3 bg-card-alt text-text-main font-semibold rounded-xl hover:bg-border-main transition-colors">
                    Browse Paths
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* Recent Activity */}
          <section>
            <h2 className="text-xl font-bold text-text-main mb-4">Recent Assessment</h2>
            
            {loading ? (
              <div className="bg-card-bg border border-border-main rounded-2xl p-6 shadow-sm animate-pulse h-32" />
            ) : recentQuiz ? (
              <div className="bg-card-bg border border-border-main rounded-2xl p-6 shadow-sm flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                    (recentQuiz.score / recentQuiz.totalQuestions) >= 0.7 
                      ? 'bg-success-100 text-success-600' 
                      : 'bg-warning-100 text-warning-600'
                  }`}>
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-text-main">{recentQuiz.topic}</h4>
                    <p className="text-sm text-text-secondary mt-0.5">
                      Completed on {new Date(recentQuiz.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-text-main">{recentQuiz.score}/{recentQuiz.totalQuestions}</p>
                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Score</p>
                </div>
              </div>
            ) : (
              <div className="bg-card-bg border border-border-main rounded-2xl p-6 shadow-sm text-center">
                <p className="text-text-secondary mb-4">You haven't taken any assessments recently.</p>
                <Link to="/assessment" className="text-sm font-semibold text-primary-600 hover:text-primary-700">Take an assessment</Link>
              </div>
            )}
          </section>

        </div>

        {/* Right Column (Recommendations) */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-text-main">Recommended For You</h2>
          
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-card-bg border border-border-main rounded-2xl p-5 shadow-sm animate-pulse h-28" />
              ))}
            </div>
          ) : recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="bg-card-bg border border-border-main rounded-2xl p-5 shadow-sm hover:border-primary-300 transition-colors group cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-accent-600 bg-accent-50 px-2 py-1 rounded-md">
                      {rec.score}% Match
                    </span>
                    <PlayCircle className="w-5 h-5 text-border-main group-hover:text-primary-500 transition-colors" />
                  </div>
                  <h4 className="font-bold text-text-main mb-1 line-clamp-1">{rec.course?.title || rec.topic}</h4>
                  <p className="text-sm text-text-secondary line-clamp-2">{rec.reason}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card-bg border border-border-main rounded-2xl p-6 shadow-sm text-center">
              <p className="text-text-secondary text-sm">Keep learning to receive personalized recommendations!</p>
            </div>
          )}
          
          <div className="bg-gradient-to-br from-primary-900 to-primary-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-2">Need Help?</h3>
              <p className="text-primary-100 text-sm mb-4">Your AI Assistant is ready to help you plan your studies.</p>
              <Link to="/chat" className="inline-block bg-white text-primary-900 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-primary-50 transition-colors">
                Chat with AI
              </Link>
            </div>
            <Target className="absolute -bottom-4 -right-4 w-24 h-24 text-primary-500 opacity-20 pointer-events-none" />
          </div>
          
        </div>
        
      </div>
    </div>
  );
};

export default Dashboard;