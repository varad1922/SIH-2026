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
  Loader2,
  ArrowRight,
  AlertTriangle
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

  // Quiz states
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);
  const [currentQuizQ, setCurrentQuizQ] = useState(0);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

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

  const handleMarkAsCompleteClick = async () => {
    if (!currentLesson || saving) return;
    
    try {
      setIsGeneratingQuiz(true);
      setShowQuiz(true);
      setQuizQuestions([]);
      setQuizAnswers({});
      setQuizScore(null);
      setCurrentQuizQ(0);
      
      const response = await api.post(
        `/learning-path/${pathId}/modules/${moduleId}/lessons/${currentLesson.id}/generate-quiz`
      );
      
      setQuizQuestions(response.data.questions);
    } catch (err) {
      console.error('Failed to generate quiz:', err);
      alert(err.response?.data?.message || 'Failed to generate quiz.');
      setShowQuiz(false);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const submitQuiz = async () => {
    let s = 0;
    quizQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctAnswer) s++;
    });
    setQuizScore(s);

    if (s >= 7) {
      try {
        setSaving(true);
        const response = await api.post(
          `/learning-path/${pathId}/modules/${moduleId}/lessons/${currentLesson.id}/complete`,
          { nextLessonId: nextLesson?.id || null }
        );

        try {
          await api.post('/quizzes/attempt', {
            topic: `Lesson: ${currentLesson.title}`,
            score: Math.round((s / 10) * 100),
            totalQuestions: 10,
            correctAnswers: s
          });
        } catch (e) {
          console.error('Failed to save lesson quiz attempt', e);
        }

        setProgress(response.data.progress);
        
        setTimeout(() => {
          setShowQuiz(false);
          if (nextLesson) {
            selectLesson(nextLesson.id);
          } else {
            navigate(`/learning/${pathId}`);
          }
        }, 2000);
      } catch (err) {
        console.error('Failed to save lesson progress:', err);
        setError(err.response?.data?.message || 'Failed to save lesson progress.');
      } finally {
        setSaving(false);
      }
    }
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
        navigate(`/learning/${pathId}`);
      }
    } catch (err) {
      console.error('Failed to save lesson progress:', err);
      setError(err.response?.data?.message || 'Failed to save lesson progress.');
    } finally {
      setSaving(false);
    }
  };

  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);

  const generateNotes = async () => {
    if (!currentLesson || isGeneratingNotes) return;
    try {
      setIsGeneratingNotes(true);
      const response = await api.post(
        `/learning-path/${pathId}/modules/${moduleId}/lessons/${currentLesson.id}/generate-notes`
      );
      
      // Update the local state with the new content
      setModule(prevModule => {
        const updatedLessons = prevModule.lessons.map(l => 
          l.id === currentLesson.id ? { ...l, content: response.data.content } : l
        );
        return { ...prevModule, lessons: updatedLessons };
      });
      
    } catch (err) {
      console.error('Failed to generate notes:', err);
      alert(err.response?.data?.message || 'Failed to generate AI notes.');
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  useEffect(() => {
    if (currentLesson && (!currentLesson.content || currentLesson.content.length < 100)) {
      // Auto-generate notes if the content is empty or very short (placeholder)
      generateNotes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLesson?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-border-main border-t-primary-600 rounded-full animate-spin" />
        <p className="font-semibold text-text-secondary">Loading your learning workspace...</p>
      </div>
    );
  }

  if (error || !path || !module || !currentLesson) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-card-bg border border-error-200 rounded-2xl p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-error-700 mb-3">Unable to open learning material</h1>
          <p className="text-error-600 mb-6">{error || 'The requested lesson could not be found.'}</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={loadWorkspace}
              className="px-5 py-3 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate(`/learning`)}
              className="px-5 py-3 rounded-xl border border-border-main text-text-main font-bold hover:bg-card-alt"
            >
              Return to Learning
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
        <div className="p-6 border-b border-border-main relative">
          <button
            onClick={() => navigate(`/learning/${pathId}`)}
            className="flex items-center text-sm font-bold text-text-secondary hover:text-primary-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to learning path
          </button>
          <button 
            className="absolute top-6 right-6 lg:hidden text-text-secondary"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
          <p className="text-xs uppercase tracking-[0.18em] font-black text-primary-600 mb-2">Skill Intel Education</p>
          <h2 className="font-bold text-text-main leading-tight line-clamp-2">{path.title}</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <p className="px-2 mb-3 text-[11px] uppercase tracking-[0.18em] font-black text-text-secondary">Modules</p>
          {path.modules.map((pathModule, moduleIndex) => {
            const active = String(pathModule.id) === String(moduleId);
            return (
              <div key={pathModule.id} className="mb-5">
                <div className={`px-3 py-3 rounded-xl transition-colors ${active ? 'bg-primary-50 border border-primary-100' : 'hover:bg-card-alt'}`}>
                  <p className="text-[10px] uppercase tracking-widest font-black text-text-secondary">Module {moduleIndex + 1}</p>
                  <p className={`mt-1 text-sm font-bold ${active ? 'text-primary-800' : 'text-text-main'}`}>{pathModule.title}</p>
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
                          <span className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
                            lessonCompleted ? 'bg-success-100 text-success-700 border-success-200' : 
                            activeLesson ? 'bg-primary-600 text-white border-primary-600 shadow-sm' : 
                            'border-border-main bg-card-bg'
                          }`}>
                            {lessonCompleted ? <Check className="w-4 h-4" /> : activeLesson ? <Play className="w-3.5 h-3.5 fill-current" /> : index + 1}
                          </span>
                          <span className="text-sm font-medium line-clamp-2">{lesson.title}</span>
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

      <main className="flex-1 min-w-0 min-h-screen flex flex-col bg-bg-main relative">
        <header className="h-16 bg-card-bg border-b border-border-main flex items-center justify-between px-4 lg:px-8 shrink-0 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-card-alt text-text-secondary"
              aria-label="Open lesson menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0 flex flex-col justify-center">
              <p className="text-[10px] sm:text-xs font-bold text-text-secondary uppercase tracking-widest">
                Module {module.moduleNumber || path.modules.findIndex((m) => String(m.id) === String(moduleId)) + 1} · Lesson {currentIndex + 1} of {lessons.length}
              </p>
              <h1 className="font-bold text-text-main truncate text-sm sm:text-base">{module.title}</h1>
            </div>
          </div>
          <div className="hidden sm:block w-48">
            <div className="flex justify-between text-xs font-bold text-text-secondary mb-1.5">
              <span>Overall Progress</span>
              <span className="text-primary-600">{progressPercent}%</span>
            </div>
            <div className="h-2 bg-border-main rounded-full overflow-hidden">
              <div className="h-full bg-primary-600 transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-8 lg:px-16 lg:py-12 pb-32">
          <article className="max-w-3xl mx-auto">
            <div className="mb-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-primary-50 text-primary-700 border border-primary-100 self-start">
                  Lesson {currentIndex + 1}
                </span>
                <button
                  onClick={generateNotes}
                  disabled={isGeneratingNotes}
                  className="flex items-center gap-2 px-4 py-2 bg-accent-50 text-accent-700 border border-accent-200 rounded-xl font-bold text-sm hover:bg-accent-100 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isGeneratingNotes ? (
                    <>
                      <div className="w-4 h-4 border-2 border-accent-300 border-t-accent-700 rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <span className="text-xl leading-none">✨</span> Generate AI Notes
                    </>
                  )}
                </button>
              </div>
              <h2 className="text-3xl lg:text-4xl font-black text-text-main tracking-tight leading-tight">
                {currentLesson.title}
              </h2>
            </div>

            {isGeneratingNotes ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-border-main border-t-accent-600 rounded-full animate-spin mb-4" />
                <p className="text-text-secondary font-medium">Generating comprehensive notes using Gemini AI...</p>
              </div>
            ) : (
              <div
                className="prose prose-lg max-w-none text-text-secondary leading-loose prose-headings:text-text-main prose-headings:font-bold prose-strong:text-text-main prose-a:text-primary-600 prose-blockquote:border-primary-300 prose-blockquote:bg-primary-50/50 prose-blockquote:not-italic prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg"
                dangerouslySetInnerHTML={{ __html: currentLesson.content || '<p>Lesson content is coming soon.</p>' }}
              />
            )}
          </article>
        </div>

        <footer className="absolute bottom-0 left-0 right-0 bg-card-bg/80 backdrop-blur-md border-t border-border-main px-4 py-4 lg:px-8">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            {previousLesson ? (
              <button 
                onClick={() => selectLesson(previousLesson.id)} 
                className="flex items-center gap-2 px-4 py-2 font-bold text-text-secondary hover:text-text-main transition-colors rounded-xl hover:bg-card-alt"
              >
                <ChevronLeft className="w-5 h-5" /> <span className="hidden sm:inline">Previous Lesson</span>
              </button>
            ) : <div />}

            <button
              onClick={isCompleted ? completeCurrentLesson : handleMarkAsCompleteClick}
              disabled={saving}
              className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed ${
                isCompleted 
                  ? 'bg-card-bg border border-border-main text-text-main hover:bg-card-alt' 
                  : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-md'
              }`}
            >
              {isCompleted ? (nextLesson ? 'Next Lesson' : 'Finish Module') : 'Mark as Complete'}
              {isCompleted ? <ChevronRight className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </button>
          </div>
        </footer>
      </main>

      {/* Quiz Modal */}
      {showQuiz && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-card-bg w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-border-main animate-in fade-in zoom-in-95">
            {isGeneratingQuiz ? (
              <div className="flex flex-col items-center justify-center h-96 p-8 text-center">
                <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
                <h3 className="text-xl font-bold text-text-main mb-2">Generating Knowledge Check...</h3>
                <p className="text-text-secondary">Our AI is reading the lesson and preparing 10 questions to test your understanding.</p>
              </div>
            ) : quizQuestions.length > 0 ? (
              quizScore === null ? (
                <div className="flex flex-col h-full overflow-y-auto custom-scrollbar p-6 md:p-10">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-text-main">Knowledge Check</h2>
                      <p className="text-text-secondary mt-1">Score at least 7/10 to mark this lesson as complete.</p>
                    </div>
                    <button onClick={() => setShowQuiz(false)} className="p-2 hover:bg-card-alt rounded-full">
                      <X className="w-6 h-6 text-text-secondary" />
                    </button>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-primary-600 uppercase tracking-widest">Question {currentQuizQ + 1} of 10</span>
                      <span className="text-sm font-bold text-text-secondary">{Math.round((currentQuizQ / 10) * 100)}%</span>
                    </div>
                    <div className="w-full bg-primary-100 rounded-full h-2">
                      <div className="bg-primary-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(currentQuizQ / 10) * 100}%` }} />
                    </div>
                  </div>

                  <h3 className="text-xl md:text-2xl font-bold text-text-main mb-8">{quizQuestions[currentQuizQ].text}</h3>

                  <div className="space-y-4 mb-10 flex-1">
                    {quizQuestions[currentQuizQ].options.map((opt, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setQuizAnswers(prev => ({ ...prev, [currentQuizQ]: opt }))}
                        className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
                          quizAnswers[currentQuizQ] === opt 
                            ? 'border-primary-600 bg-primary-50 shadow-sm' 
                            : 'border-border-main hover:border-primary-300 hover:bg-card-alt bg-card-bg'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${quizAnswers[currentQuizQ] === opt ? 'border-primary-600' : 'border-secondary-300'}`}>
                            {quizAnswers[currentQuizQ] === opt && <div className="w-3 h-3 bg-primary-600 rounded-full" />}
                          </div>
                          <span className="text-lg text-text-main font-medium">{opt}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-border-main">
                    {currentQuizQ > 0 ? (
                      <button onClick={() => setCurrentQuizQ(prev => prev - 1)} className="px-6 py-3 rounded-xl font-bold text-text-secondary hover:text-text-main hover:bg-card-alt transition-colors border border-border-main">
                        Previous
                      </button>
                    ) : <div></div>}
                    
                    {currentQuizQ < 9 ? (
                      <button 
                        onClick={() => setCurrentQuizQ(prev => prev + 1)} 
                        disabled={!quizAnswers[currentQuizQ]}
                        className="px-8 py-3 rounded-xl font-bold bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-sm flex items-center"
                      >
                        Next <ArrowRight className="w-4 h-4 ml-2" />
                      </button>
                    ) : (
                      <button 
                        onClick={submitQuiz}
                        disabled={Object.keys(quizAnswers).length !== 10 || saving}
                        className="px-8 py-3 rounded-xl font-bold bg-success-600 text-white hover:bg-success-700 disabled:opacity-50 transition-colors shadow-sm"
                      >
                        {saving ? 'Verifying...' : 'Submit Answers'}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-10 text-center">
                  {quizScore >= 7 ? (
                    <>
                      <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mb-6 text-success-600">
                        <CheckCircle2 className="w-10 h-10" />
                      </div>
                      <h2 className="text-3xl font-black text-text-main mb-2">Lesson Completed!</h2>
                      <p className="text-text-secondary mb-8">You scored {quizScore}/10. Excellent work!</p>
                      <div className="flex items-center text-primary-600 font-bold animate-pulse">
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Moving to next lesson...
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-error-100 rounded-full flex items-center justify-center mb-6 text-error-600">
                        <AlertTriangle className="w-10 h-10" />
                      </div>
                      <h2 className="text-3xl font-black text-text-main mb-2">Almost there!</h2>
                      <p className="text-text-secondary mb-2">You scored {quizScore}/10. You need at least 7/10 to pass.</p>
                      <p className="text-text-secondary mb-8">Review the lesson material and try again.</p>
                      <div className="flex gap-4">
                        <button onClick={() => setShowQuiz(false)} className="px-6 py-3 rounded-xl font-bold border border-border-main hover:bg-card-alt text-text-main">
                          Review Lesson
                        </button>
                        <button onClick={handleMarkAsCompleteClick} className="px-6 py-3 rounded-xl font-bold bg-primary-600 text-white hover:bg-primary-700 shadow-sm">
                          Retry Quiz
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )
            ) : (
               <div className="flex justify-center p-10">
                 <p className="text-error-600">Failed to generate quiz. <button onClick={() => setShowQuiz(false)} className="underline">Close</button></p>
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningWorkspace;
