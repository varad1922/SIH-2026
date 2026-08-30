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
      console.error('Error fetching learning path:', err);
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

      const response = await api.get(
        `/learning-path/${learningPathId}/modules/${moduleId}`
      );

      const moduleData = response.data?.module;
      const progressData = response.data?.progress;
      const lessons = moduleData?.lessons || [];

      if (!moduleData || lessons.length === 0) {
        throw new Error('This module does not contain any lessons.');
      }

      let targetLessonId = lessons[0].id;

      if (!reviewMode) {
        const completed = new Set(progressData?.completedLessons || []);

        if (
          progressData?.currentLessonId &&
          lessons.some((lesson) => lesson.id === progressData.currentLessonId)
        ) {
          targetLessonId = progressData.currentLessonId;
        } else {
          const firstIncomplete = lessons.find(
            (lesson) => !completed.has(lesson.id)
          );
          targetLessonId = firstIncomplete?.id || lessons[0].id;
        }
      }

      navigate(
        `/learning-path/${learningPathId}/module/${moduleId}/lesson/${targetLessonId}`
      );
    } catch (err) {
      console.error('Error opening module:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Unable to open this module. Please try again.'
      );
    } finally {
      setUpdating(false);
    }
  };

  const startModule = async (moduleId) => {
    try {
      setUpdating(true);
      await api.post(
        `/learning-path/${learningPathId}/modules/${moduleId}/status`,
        { status: 'In Progress' }
      );
      await openModule(moduleId, false);
    } catch (err) {
      console.error('Error starting module:', err);
      setError(err.response?.data?.message || 'Failed to start module.');
      setUpdating(false);
    }
  };

  const reviewModule = async (moduleId) => {
    try {
      setUpdating(true);
      await openModule(moduleId, true);
    } catch (err) {
      console.error('Error opening review material:', err);
      setError(err.response?.data?.message || 'Failed to open review material.');
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-border-main border-t-secondary-600 rounded-full animate-spin" />
        <p className="text-text-secondary font-semibold">Loading learning path...</p>
      </div>
    );
  }

  if (error && !path) {
    return (
      <div className="text-center mt-20 p-8 max-w-xl mx-auto bg-red-50 border border-red-200 rounded-xl">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-red-700 mb-3">Failed to load learning path details.</h2>
        <p className="text-red-600 mb-6">{error}</p>
        <button
          onClick={() => navigate('/learning')}
          className="px-5 py-3 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700"
        >
          Return to Learning Paths
        </button>
      </div>
    );
  }

  if (!path) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <button
        onClick={() => navigate('/learning')}
        className="flex items-center text-text-secondary hover:text-secondary-600 transition-colors font-semibold"
      >
        <ArrowLeft className="w-5 h-5 mr-2" /> Back to Learning Paths
      </button>

      <section className="bg-card-bg p-8 rounded-2xl border border-border-main shadow-sm">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-secondary-600 mb-2">
              Current Learning Path
            </p>
            <h1 className="text-3xl font-bold text-text-main mb-3">{path.title}</h1>
            <p className="text-text-secondary max-w-2xl">{path.description}</p>
          </div>
          <div className="bg-secondary-50 px-6 py-4 rounded-xl border border-secondary-100 text-center min-w-32">
            <span className="block text-3xl font-black text-secondary-700">{path.progress || 0}%</span>
            <span className="text-xs font-bold text-secondary-600 uppercase tracking-widest">Progress</span>
          </div>
        </div>
      </section>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between gap-4">
          <span>{error}</span>
          <button onClick={() => setError('')} className="font-bold">Dismiss</button>
        </div>
      )}

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-text-main">Modules</h2>
          <p className="text-text-secondary mt-1">Open a module to continue learning or review completed material.</p>
        </div>

        {path.modules.map((mod, idx) => {
          const completed = mod.status === 'Completed';

          return (
            <div
              key={mod.id}
              className={`p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between border gap-5 transition-all ${
                completed
                  ? 'bg-success-50/50 border-success-200'
                  : mod.status === 'In Progress'
                    ? 'bg-secondary-50 border-secondary-300 shadow-sm'
                    : mod.status === 'Locked'
                      ? 'bg-card-alt border-border-main opacity-60'
                      : 'bg-card-bg border-border-main hover:border-secondary-300'
              }`}
            >
              <div className="flex items-start md:items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  completed
                    ? 'bg-success-100 text-success-600'
                    : mod.status === 'In Progress'
                      ? 'bg-secondary-100 text-secondary-600'
                      : 'bg-card-alt text-text-secondary border border-border-main'
                }`}>
                  {completed ? <CheckCircle className="w-6 h-6" /> :
                    mod.status === 'In Progress' ? <PlayCircle className="w-6 h-6" /> :
                      mod.status === 'Locked' ? <Lock className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-text-secondary block mb-1">
                    Module {idx + 1}
                  </span>
                  <h3 className="font-bold text-lg text-text-main">{mod.title}</h3>
                  <span className="text-sm text-text-secondary flex items-center mt-2">
                    <Clock className="w-4 h-4 mr-1.5" /> {mod.duration || 'Self-paced'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {mod.status === 'Not Started' && (
                  <button
                    onClick={() => startModule(mod.id)}
                    disabled={updating}
                    className="px-5 py-2.5 text-sm font-bold text-white bg-primary-800 rounded-lg hover:bg-primary-900 disabled:opacity-50"
                  >
                    Start Module
                  </button>
                )}

                {mod.status === 'In Progress' && (
                  <button
                    onClick={() => openModule(mod.id, false)}
                    disabled={updating}
                    className="px-5 py-2.5 text-sm font-bold text-white bg-secondary-600 rounded-lg hover:bg-secondary-700 disabled:opacity-50"
                  >
                    Continue Module
                  </button>
                )}

                {mod.status === 'Completed' && (
                  <button
                    onClick={() => reviewModule(mod.id)}
                    disabled={updating}
                    className="px-5 py-2.5 text-sm font-bold text-success-700 bg-success-100 rounded-lg border border-success-200 hover:bg-success-200 disabled:opacity-50"
                  >
                    Review Material
                  </button>
                )}


                {mod.status === 'Locked' && (
                  <button disabled className="px-5 py-2.5 text-sm font-bold text-text-secondary bg-card-alt rounded-lg border border-border-main cursor-not-allowed">
                    Locked
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};

export default LearningPathDetail;
