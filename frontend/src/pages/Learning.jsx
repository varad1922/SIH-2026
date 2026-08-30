import React, { useContext, useEffect, useState } from 'react';
import api from '../api/client';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from '../context/SocketContext';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  PlayCircle,
  Award,
} from 'lucide-react';

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
      socket.on('progress_updated', () => {
        fetchLearningPaths();
      });
      return () => socket.off('progress_updated');
    }
  }, [socket]);

  const handleAction = (pathId, moduleId, status) => {
    // If completed, we can review. If not, we start/continue
    navigate(`/learning-path/${pathId}/module/${moduleId}/lesson/start`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-border-main rounded w-1/3"></div>
          <div className="h-32 bg-border-main rounded w-full"></div>
          <div className="h-32 bg-border-main rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <p className="text-red-500 font-bold">{error}</p>
      </div>
    );
  }

  if (learningPaths.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <p className="text-text-secondary italic">No learning paths assigned yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
      {learningPaths.map((path) => (
        <div key={path.id} className="mb-16">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.2em] font-bold text-secondary-600 mb-3">
              Learning Path
            </p>
            <h1 className="text-3xl lg:text-4xl font-black text-text-main">
              {path.title}
            </h1>
            <p className="text-text-secondary text-lg mt-3">
              {path.description}
            </p>
            
            <div className="mt-4 flex items-center gap-4">
              <div className="flex-1 bg-border-main h-2 rounded-full overflow-hidden max-w-md">
                <div 
                  className="bg-secondary-600 h-full rounded-full transition-all"
                  style={{ width: `${path.progress}%` }}
                />
              </div>
              <span className="font-bold text-sm text-text-secondary">{path.progress}% Completed</span>
            </div>
          </div>

          <div className="space-y-5">
            {path.modules.map((module) => {
              const completed = module.status === 'Completed';
              const inProgress = module.status === 'In Progress';

              return (
                <div
                  key={module.id}
                  className="bg-card-bg border border-border-main rounded-2xl p-6 lg:p-7 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">

                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                        completed
                          ? 'bg-success-50 text-success-600'
                          : inProgress
                          ? 'bg-secondary-50 text-secondary-600'
                          : 'bg-gray-100 text-text-secondary'
                      }`}
                    >
                      {completed ? (
                        <CheckCircle2 className="w-8 h-8" />
                      ) : (
                        <BookOpen className="w-8 h-8" />
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-[0.18em] font-bold text-text-secondary mb-2">
                        Module {module.number}
                      </p>

                      <h2 className="text-xl font-bold text-text-main">
                        {module.title}
                      </h2>

                      <p className="text-text-secondary mt-2">
                        {module.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-5 mt-4">

                        <span className="flex items-center gap-2 text-sm text-text-secondary">
                          <Clock className="w-4 h-4" />
                          {module.duration || 'Unknown duration'}
                        </span>

                        {completed && (
                          <span className="flex items-center gap-2 text-sm font-bold text-success-600">
                            <CheckCircle2 className="w-4 h-4" />
                            Completed
                          </span>
                        )}

                        {inProgress && (
                          <span className="text-sm font-bold text-secondary-600">
                            In Progress
                          </span>
                        )}
                        
                        {!completed && !inProgress && (
                          <span className="text-sm font-bold text-text-secondary">
                            Not Started
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleAction(path.id, module.id, module.status)}
                      className={`min-w-[180px] px-6 py-3.5 rounded-xl font-bold transition-all inline-flex items-center justify-center gap-2 ${
                        completed
                          ? 'border border-secondary-300 text-secondary-700 hover:bg-secondary-50'
                          : 'bg-secondary-600 text-white hover:bg-secondary-700'
                      }`}
                    >
                      {completed ? (
                        <>
                          Review Material
                          <Award className="w-5 h-5" />
                        </>
                      ) : inProgress ? (
                        <>
                          Continue Module
                          <PlayCircle className="w-5 h-5" />
                        </>
                      ) : (
                        <>
                          Start Module
                          <PlayCircle className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Learning;