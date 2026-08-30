import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Menu,
  Play,
  X,
} from 'lucide-react';

const LearningWorkspace = () => {
  const { pathId, moduleId, lessonId } = useParams();
  const navigate = useNavigate();

  const [path, setPath] = useState(null);
  const [module, setModule] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadWorkspace = async () => {
    try {
      setLoading(true);
      setError('');

      const [pathResponse, moduleResponse] = await Promise.all([
        api.get(`/learning-path/${pathId}`),
        api.get(`/learning-path/${pathId}/modules/${moduleId}`),
      ]);

      const loadedPath = pathResponse.data?.path;
      const loadedModule = moduleResponse.data?.module;
      const loadedProgress = moduleResponse.data?.progress;

      if (!loadedPath || !loadedModule || !Array.isArray(loadedModule.lessons)) {
        throw new Error('Learning content is incomplete.');
      }

      if (!loadedModule.lessons.some((lesson) => lesson.id === lessonId)) {
        const firstLesson = loadedModule.lessons[0];
        if (firstLesson) {
          navigate(
            `/learning-path/${pathId}/module/${moduleId}/lesson/${firstLesson.id}`,
            { replace: true }
          );
          return;
        }
      }

      setPath(loadedPath);
      setModule(loadedModule);
      setProgress(loadedProgress || { completedLessons: [] });
    } catch (err) {
      console.error('Learning workspace error:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to load learning workspace.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspace();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathId, moduleId, lessonId]);

  const lessons = module?.lessons || [];
  const currentLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === lessonId) || lessons[0] || null,
    [lessons, lessonId]
  );
  const currentIndex = currentLesson
    ? lessons.findIndex((lesson) => lesson.id === currentLesson.id)
    : -1;
  const completedSet = useMemo(
    () => new Set(progress?.completedLessons || []),
    [progress]
  );
  const previousLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 ? lessons[currentIndex + 1] : null;
  const isCompleted = currentLesson ? completedSet.has(currentLesson.id) : false;
  const progressPercent = lessons.length
    ? Math.round((completedSet.size / lessons.length) * 100)
    : 0;

  const selectLesson = (targetLessonId) => {
    navigate(`/learning-path/${pathId}/module/${moduleId}/lesson/${targetLessonId}`);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const completeCurrentLesson = async () => {
    if (!currentLesson || saving) return;

    try {
      setSaving(true);
      const response = await api.post(
        `/learning-path/${pathId}/modules/${moduleId}/lessons/${currentLesson.id}/complete`,
        { nextLessonId: nextLesson?.id || null }
      );

      setProgress(response.data.progress);

      if (nextLesson) {
        selectLesson(nextLesson.id);
      } else {
        navigate(`/learning`);
      }
    } catch (err) {
      console.error('Failed to save lesson progress:', err);
      setError(err.response?.data?.message || 'Failed to save lesson progress.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-border-main border-t-secondary-600 rounded-full animate-spin" />
        <p className="font-semibold text-text-secondary">Loading your learning workspace...</p>
      </div>
    );
  }

  if (error || !path || !module || !currentLesson) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-card-bg border border-red-200 rounded-2xl p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-red-700 mb-3">Unable to open learning material</h1>
          <p className="text-red-600 mb-6">{error || 'The requested lesson could not be found.'}</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={loadWorkspace}
              className="px-5 py-3 rounded-xl bg-secondary-600 text-white font-bold"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate(`/learning`)}
              className="px-5 py-3 rounded-xl border border-border-main text-text-main font-bold"
            >
              Return to Learning Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-main flex overflow-hidden">
      {sidebarOpen && (
        <button
          aria-label="Close lesson menu"
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-card-bg border-r border-border-main flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-border-main">
          <button
            onClick={() => navigate(`/learning`)}
            className="flex items-center text-sm font-bold text-text-secondary hover:text-secondary-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to learning hub
          </button>
          <p className="text-xs uppercase tracking-[0.18em] font-black text-secondary-600 mb-2">AI Education Platform</p>
          <h2 className="font-bold text-text-main leading-tight">{path.title}</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <p className="px-2 mb-3 text-[11px] uppercase tracking-[0.18em] font-black text-text-secondary">Modules</p>
          {path.modules.map((pathModule, moduleIndex) => {
            const active = String(pathModule.id) === String(moduleId);
            return (
              <div key={pathModule.id} className="mb-5">
                <div className={`px-3 py-3 rounded-xl ${active ? 'bg-secondary-50 border border-secondary-200' : ''}`}>
                  <p className="text-[10px] uppercase tracking-widest font-black text-text-secondary">Module {moduleIndex + 1}</p>
                  <p className={`mt-1 text-sm font-bold ${active ? 'text-secondary-800' : 'text-text-main'}`}>{pathModule.title}</p>
                </div>

                {active && (
                  <div className="mt-2 space-y-1">
                    {lessons.map((lesson, index) => {
                      const activeLesson = lesson.id === currentLesson.id;
                      const lessonCompleted = completedSet.has(lesson.id);
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => selectLesson(lesson.id)}
                          className={`w-full flex items-center gap-3 text-left px-3 py-3 rounded-xl transition-colors ${activeLesson ? 'bg-primary-50 text-primary-800' : 'hover:bg-card-alt text-text-secondary'}`}
                        >
                          <span className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold border ${lessonCompleted ? 'bg-success-100 text-success-700 border-success-200' : activeLesson ? 'bg-secondary-600 text-white border-secondary-600' : 'border-border-main bg-card-bg'}`}>
                            {lessonCompleted ? <Check className="w-4 h-4" /> : activeLesson ? <Play className="w-3.5 h-3.5" /> : index + 1}
                          </span>
                          <span className="text-sm font-medium">{lesson.title}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      <main className="flex-1 min-w-0 min-h-screen flex flex-col">
        <header className="h-16 bg-card-bg border-b border-border-main flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-card-alt"
              aria-label="Open lesson menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <p className="text-xs text-text-secondary">Module {module.moduleNumber || path.modules.findIndex((m) => String(m.id) === String(moduleId)) + 1} · Lesson {currentIndex + 1} of {lessons.length}</p>
              <h1 className="font-bold text-text-main truncate">{module.title}</h1>
            </div>
          </div>
          <div className="hidden sm:block w-44">
            <div className="flex justify-between text-xs font-bold text-text-secondary mb-1"><span>Progress</span><span>{progressPercent}%</span></div>
            <div className="h-2 bg-border-main rounded-full overflow-hidden"><div className="h-full bg-secondary-600 transition-all" style={{ width: `${progressPercent}%` }} /></div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-8 lg:px-16 lg:py-12 pb-32">
          <article className="max-w-3xl mx-auto">
            <div className="mb-8">
              <span className="inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-secondary-50 text-secondary-700 border border-secondary-100">Lesson {currentIndex + 1}</span>
              <h2 className="mt-4 text-3xl lg:text-4xl font-black text-text-main tracking-tight">{currentLesson.title}</h2>
            </div>

            <div
              className="prose prose-lg max-w-none text-text-secondary leading-relaxed prose-headings:text-text-main prose-headings:font-bold prose-strong:text-text-main"
              dangerouslySetInnerHTML={{ __html: currentLesson.content || '<p>Lesson content is coming soon.</p>' }}
            />
          </article>
        </div>

        <footer className="sticky bottom-0 bg-card-bg border-t border-border-main px-4 py-3 lg:px-8">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
            {previousLesson ? (
              <button onClick={() => selectLesson(previousLesson.id)} className="flex items-center gap-2 px-3 py-2 font-bold text-text-secondary hover:text-text-main">
                <ChevronLeft className="w-5 h-5" /> Previous
              </button>
            ) : <div />}

            <button
              onClick={completeCurrentLesson}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-secondary-600 text-white font-bold hover:bg-secondary-700 disabled:opacity-60"
            >
              {isCompleted ? (nextLesson ? 'Next Lesson' : 'Finish Module') : 'Mark as Complete'}
              {isCompleted ? <ChevronRight className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default LearningWorkspace;
