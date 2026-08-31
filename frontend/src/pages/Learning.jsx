import React, { useContext, useEffect, useState } from 'react';
import api from '../api/client';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from '../context/SocketContext';
import { BookOpen, CheckCircle2, ChevronRight, LayoutList } from 'lucide-react';

const Learning = () => {
  const [learningPaths, setLearningPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchLearningPaths = async () => {
    try {
      setLoading(true);
      const res = await api.get('/learning-path');
      setLearningPaths(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch learning paths.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLearningPaths();
  }, []);

  const { socket } = useContext(SocketContext);

  useEffect(() => {
    if (socket) {
      socket.on('progress_updated', fetchLearningPaths);
      return () => socket.off('progress_updated', fetchLearningPaths);
    }
  }, [socket]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-card-alt rounded w-1/3 mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-card-alt rounded-2xl" />
          <div className="h-64 bg-card-alt rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-error-600 font-bold text-lg">{error}</p>
        <button onClick={fetchLearningPaths} className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold">Retry</button>
      </div>
    );
  }

  if (learningPaths.length === 0) {
    return (
      <div className="text-center py-20 bg-card-bg border border-border-main rounded-3xl">
        <BookOpen className="w-16 h-16 text-text-secondary mx-auto mb-4 opacity-50" />
        <h2 className="text-2xl font-bold text-text-main mb-2">No Learning Paths Yet</h2>
        <p className="text-text-secondary">You haven't been assigned any learning paths.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <header>
        <h1 className="text-3xl font-bold text-text-main">My Learning</h1>
        <p className="text-text-secondary mt-2 text-lg">Pick up where you left off or start something new.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {learningPaths.map((path) => {
          const isComplete = path.progress === 100;
          const isInProgress = path.progress > 0 && path.progress < 100;
          
          return (
            <div 
              key={path.id} 
              className="bg-card-bg border border-border-main rounded-3xl p-6 sm:p-8 hover:border-primary-300 transition-all flex flex-col shadow-sm group"
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`p-4 rounded-2xl ${isComplete ? 'bg-success-50 text-success-600' : 'bg-primary-50 text-primary-600'}`}>
                  {isComplete ? <CheckCircle2 className="w-8 h-8" /> : <BookOpen className="w-8 h-8" />}
                </div>
                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                  isComplete ? 'bg-success-100 text-success-700' : 
                  isInProgress ? 'bg-primary-100 text-primary-700' : 
                  'bg-card-alt text-text-secondary'
                }`}>
                  {isComplete ? 'Completed' : isInProgress ? 'In Progress' : 'Not Started'}
                </span>
              </div>

              <div className="flex-1 mb-8">
                <p className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">
                  {path.type || 'Learning Path'}
                </p>
                <h2 className="text-2xl font-bold text-text-main mb-3 line-clamp-2">
                  {path.title}
                </h2>
                <p className="text-text-secondary line-clamp-2">
                  {path.description}
                </p>
              </div>

              <div className="mt-auto space-y-6">
                <div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-text-secondary flex items-center gap-1.5">
                      <LayoutList className="w-4 h-4" /> {path.modules?.length || 0} Modules
                    </span>
                    <span className="text-text-main">{path.progress}%</span>
                  </div>
                  <div className="w-full bg-card-alt rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${isComplete ? 'bg-success-500' : 'bg-primary-600'}`}
                      style={{ width: `${path.progress}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/learning/${path.id}`)}
                  className={`w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors ${
                    isComplete 
                      ? 'bg-card-alt text-text-main hover:bg-border-main' 
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {isComplete ? 'Review Path' : isInProgress ? 'Continue Learning' : 'Start Path'}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Learning;