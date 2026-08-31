import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Lock,
  PlayCircle,
  AlertTriangle,
  Clock,
} from 'lucide-react';

const LearningPathDetail = () => {
  const { learningPathId } = useParams();
  const navigate = useNavigate();

  const [path, setPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchPathDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/learning-path/${learningPathId}`);
      setPath(response.data.path);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load learning path details.');
    } finally {
      setLoading(false);
    }
  }, [learningPathId]);

  useEffect(() => {
    fetchPathDetails();
  }, [fetchPathDetails]);

  const openModule = async (moduleId, reviewMode = false) => {
    try {
      setUpdating(true);
      setError('');

      const response = await api.get(`/learning-path/${learningPathId}/modules/${moduleId}`);
      const moduleData = response.data?.module;
      const progressData = response.data?.progress;
      const lessons = moduleData?.lessons || [];

      if (!moduleData || lessons.length === 0) {
        throw new Error('This module does not contain any lessons.');
      }

      let targetLessonId = lessons[0].id;

      if (!reviewMode) {
        const completed = new Set(progressData?.completedLessons || []);
        if (progressData?.currentLessonId && lessons.some((lesson) => lesson.id === progressData.currentLessonId)) {
          targetLessonId = progressData.currentLessonId;
        } else {
          const firstIncomplete = lessons.find((lesson) => !completed.has(lesson.id));
          targetLessonId = firstIncomplete?.id || lessons[0].id;
        }
      }

      navigate(`/learning-path/${learningPathId}/module/${moduleId}/lesson/${targetLessonId}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to open this module.');
    } finally {
      setUpdating(false);
    }
  };

  const startModule = async (moduleId) => {
    try {
      setUpdating(true);
      await api.post(`/learning-path/${learningPathId}/modules/${moduleId}/status`, { status: 'In Progress' });
      await openModule(moduleId, false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start module.');
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse mt-8">
        <div className="h-48 bg-card-alt rounded-3xl" />
        <div className="h-24 bg-card-alt rounded-2xl" />
        <div className="h-24 bg-card-alt rounded-2xl" />
      </div>
    );
  }

  if (error && !path) {
    return (
      <div className="text-center mt-20 p-8 max-w-xl mx-auto bg-error-50 border border-error-200 rounded-xl">
        <AlertTriangle className="w-12 h-12 text-error-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-error-700 mb-3">Failed to load path</h2>
        <p className="text-error-600 mb-6">{error}</p>
        <button onClick={() => navigate('/learning')} className="px-5 py-3 rounded-lg bg-error-600 text-white font-bold hover:bg-error-700">
          Return to Learning
        </button>
      </div>
    );
  }

  if (!path) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      <button
        onClick={() => navigate('/learning')}
        className="flex items-center text-text-secondary hover:text-primary-600 transition-colors font-semibold text-sm"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Learning Paths
      </button>

      <section className="bg-card-bg p-8 rounded-3xl border border-border-main shadow-sm">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary-600 mb-3">
              {path.type || 'Learning Path'}
            </p>
            <h1 className="text-3xl font-bold text-text-main mb-4">{path.title}</h1>
            <p className="text-text-secondary text-lg max-w-2xl">{path.description}</p>
          </div>
          <div className="bg-primary-50 px-8 py-6 rounded-2xl text-center shrink-0 w-full md:w-auto">
            <span className="block text-4xl font-black text-primary-700">{path.progress || 0}%</span>
            <span className="text-xs font-bold text-primary-600 uppercase tracking-widest mt-1 block">Progress</span>
          </div>
        </div>
      </section>

      {error && (
        <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-xl flex items-center justify-between gap-4">
          <span className="font-medium">{error}</span>
          <button onClick={() => setError('')} className="font-bold hover:opacity-80">Dismiss</button>
        </div>
      )}

      <section className="pt-4">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-text-main">Modules</h2>
          <p className="text-text-secondary mt-1">Follow the timeline to complete this learning path.</p>
        </div>

        <div className="relative">
          {/* Vertical Timeline Line */}
          <div className="absolute left-6 top-10 bottom-10 w-0.5 bg-border-main hidden md:block" />

          <div className="space-y-6 relative">
            {path.modules.map((mod, idx) => {
              const completed = mod.status === 'Completed';
              const inProgress = mod.status === 'In Progress';
              const locked = mod.status === 'Locked';

              return (
                <div key={mod.id} className="relative flex flex-col md:flex-row gap-6 md:gap-8 group">
                  
                  {/* Timeline Node */}
                  <div className="hidden md:flex flex-col items-center shrink-0 z-10 pt-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-bg-main shadow-sm transition-colors ${
                      completed ? 'bg-success-500 text-white' :
                      inProgress ? 'bg-primary-600 text-white shadow-primary-500/30' :
                      locked ? 'bg-card-alt text-text-secondary border-border-main' : 'bg-card-bg border-border-main text-text-secondary'
                    }`}>
                      {completed ? <CheckCircle className="w-5 h-5" /> :
                       inProgress ? <PlayCircle className="w-5 h-5" /> :
                       locked ? <Lock className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                    </div>
                  </div>

                  {/* Module Card */}
                  <div className={`flex-1 p-6 rounded-2xl flex flex-col xl:flex-row xl:items-center justify-between border transition-all shadow-sm ${
                    completed ? 'bg-success-50/30 border-success-200' : 
                    inProgress ? 'bg-card-bg border-primary-300 ring-2 ring-primary-500/10' : 
                    locked ? 'bg-card-alt/50 border-border-main opacity-75' : 'bg-card-bg border-border-main hover:border-primary-300'
                  }`}>
                    
                    <div className="mb-6 xl:mb-0 xl:mr-6">
                      <span className={`text-xs font-bold uppercase tracking-widest block mb-2 ${
                        completed ? 'text-success-600' : inProgress ? 'text-primary-600' : 'text-text-secondary'
                      }`}>
                        Module {idx + 1}
                      </span>
                      <h3 className="font-bold text-xl text-text-main mb-2">{mod.title}</h3>
                      <div className="flex items-center text-sm text-text-secondary">
                        <Clock className="w-4 h-4 mr-1.5" /> {mod.duration || 'Self-paced'}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {mod.status === 'Not Started' && (
                        <button onClick={() => startModule(mod.id)} disabled={updating} className="w-full xl:w-auto px-6 py-3 text-sm font-bold text-white bg-text-main rounded-xl hover:bg-black transition-colors disabled:opacity-50 shadow-sm">
                          Start Module
                        </button>
                      )}
                      {inProgress && (
                        <button onClick={() => openModule(mod.id, false)} disabled={updating} className="w-full xl:w-auto px-6 py-3 text-sm font-bold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 shadow-sm">
                          Continue Module
                        </button>
                      )}
                      {completed && (
                        <button onClick={() => openModule(mod.id, true)} disabled={updating} className="w-full xl:w-auto px-6 py-3 text-sm font-bold text-success-700 bg-success-100 rounded-xl hover:bg-success-200 transition-colors disabled:opacity-50">
                          Review Material
                        </button>
                      )}
                      {locked && (
                        <button disabled className="w-full xl:w-auto px-6 py-3 text-sm font-bold text-text-secondary bg-card-alt rounded-xl cursor-not-allowed border border-border-main">
                          Locked
                        </button>
                      )}
                    </div>
                    
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LearningPathDetail;
