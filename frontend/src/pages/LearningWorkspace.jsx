import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { 
  ArrowLeft, CheckCircle2, PlayCircle, Lock, Menu, X, ChevronRight, CheckCircle
} from 'lucide-react';

const LearningWorkspace = () => {
  const { pathId, moduleId } = useParams();
  const navigate = useNavigate();
  
  const [path, setPath] = useState(null);
  const [module, setModule] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [currentLessonId, setCurrentLessonId] = useState('');

  useEffect(() => {
    fetchData();
  }, [pathId, moduleId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [pathRes, moduleRes] = await Promise.all([
        api.get(`/learning-path/${pathId}`),
        api.get(`/learning-path/${pathId}/modules/${moduleId}`)
      ]);
      
      setPath(pathRes.data.path);
      setModule(moduleRes.data.module);
      setProgress(moduleRes.data.progress);
      
      const lessons = moduleRes.data.module.lessons;
      if (lessons && lessons.length > 0) {
        // If there's a saved current lesson, use it, else default to first uncompleted or first overall
        let startingLessonId = moduleRes.data.progress?.currentLessonId;
        
        if (!startingLessonId) {
          const completedSet = new Set(moduleRes.data.progress?.completedLessons || []);
          const firstUncompleted = lessons.find(l => !completedSet.has(l.id));
          startingLessonId = firstUncompleted ? firstUncompleted.id : lessons[0].id;
        }
        
        setCurrentLessonId(startingLessonId);
      }
    } catch (err) {
      console.error('Error fetching learning workspace data:', err);
      setError(err.response?.data?.message || 'Failed to load learning workspace.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteLesson = async () => {
    if (!module || !currentLessonId) return;
    
    const currentIndex = module.lessons.findIndex(l => l.id === currentLessonId);
    const nextLesson = module.lessons[currentIndex + 1];
    
    try {
      await api.post(`/learning-path/${pathId}/modules/${moduleId}/lessons/${currentLessonId}/complete`, {
        nextLessonId: nextLesson ? nextLesson.id : null
      });
      
      if (nextLesson) {
        // Go to next lesson
        await fetchData(); // refresh progress
        setCurrentLessonId(nextLesson.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Module finished!
        navigate(`/learning/${pathId}`);
      }
    } catch (err) {
      console.error("Failed to complete lesson", err);
      alert("Failed to save progress.");
    }
  };

  const handleLessonSelect = (lessonId) => {
    setCurrentLessonId(lessonId);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-main space-y-4">
        <div className="w-16 h-16 border-4 border-border-main border-t-secondary-600 rounded-full animate-spin"></div>
        <p className="text-text-secondary font-bold animate-pulse">Loading Workspace...</p>
      </div>
    );
  }

  if (error || !module || !path) {
    return (
      <div className="max-w-2xl mx-auto mt-20 p-8 bg-red-50 border border-red-200 rounded-xl text-center">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Error Loading Workspace</h2>
        <p className="text-red-600 mb-6">{error || 'Data missing.'}</p>
        <button 
          onClick={() => navigate(`/learning/${pathId}`)}
          className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
        >
          Return to Learning Path
        </button>
      </div>
    );
  }

  const currentLesson = module.lessons.find(l => l.id === currentLessonId) || module.lessons[0];
  const completedSet = new Set(progress?.completedLessons || []);
  const currentIndex = module.lessons.findIndex(l => l.id === currentLesson?.id);
  const prevLesson = currentIndex > 0 ? module.lessons[currentIndex - 1] : null;
  const isLastLesson = currentIndex === module.lessons.length - 1;
  const isLessonCompleted = completedSet.has(currentLesson?.id);
  
  // Calculate module progress
  const moduleProgressPercent = Math.round((completedSet.size / module.lessons.length) * 100) || 0;

  return (
    <div className="flex h-screen bg-bg-main overflow-hidden font-sans pt-16">
      
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-14 h-14 bg-secondary-600 text-white rounded-full flex items-center justify-center shadow-lg border border-secondary-500"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar (Left Pane) */}
      <div className={`
        fixed inset-y-0 left-0 pt-16 z-40 w-80 bg-card-bg border-r border-border-main transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:pt-0 overflow-y-auto flex flex-col shadow-sm
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-border-main bg-card-alt">
          <button 
            onClick={() => navigate(`/learning/${pathId}`)}
            className="flex items-center text-sm font-bold text-text-secondary hover:text-secondary-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Path
          </button>
          <p className="text-xs font-bold uppercase tracking-widest text-secondary-600 mb-1">Learning Path</p>
          <h2 className="text-xl font-bold text-text-main leading-tight">{path.title}</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {path.modules.map((m, mIdx) => {
            const isCurrentModule = m.id.toString() === moduleId.toString();
            
            return (
              <div key={m.id} className="space-y-2">
                <div className={`flex items-start justify-between px-2 ${isCurrentModule ? 'opacity-100' : 'opacity-60 grayscale'}`}>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Module {mIdx + 1}</p>
                    <h3 className={`font-bold text-sm ${isCurrentModule ? 'text-primary-800' : 'text-text-main'}`}>{m.title}</h3>
                  </div>
                  {m.status === 'Completed' || m.status === 'Reviewed' ? (
                    <CheckCircle2 className="w-5 h-5 text-success-500" />
                  ) : m.status === 'Locked' ? (
                    <Lock className="w-4 h-4 text-text-secondary" />
                  ) : null}
                </div>
                
                {isCurrentModule && (
                  <div className="mt-3 space-y-1 pl-2 border-l-2 border-secondary-200 ml-2">
                    {module.lessons.map((lesson, lIdx) => {
                      const isActive = lesson.id === currentLessonId;
                      const isCompleted = completedSet.has(lesson.id);
                      
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => handleLessonSelect(lesson.id)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all ${
                            isActive 
                              ? 'bg-secondary-50 border border-secondary-200 shadow-sm' 
                              : 'hover:bg-card-alt hover:border-border-main border border-transparent'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border ${
                              isCompleted ? 'bg-success-500 border-success-600 text-white' :
                              isActive ? 'bg-secondary-600 border-secondary-700 text-white' :
                              'bg-card-bg border-border-main text-text-secondary'
                            }`}>
                              {isCompleted ? <CheckCircle className="w-3.5 h-3.5" /> : 
                               isActive ? <PlayCircle className="w-3 h-3" /> : 
                               <span className="text-[10px] font-bold">{lIdx + 1}</span>}
                            </div>
                            <span className={`text-sm font-medium ${
                              isActive ? 'text-secondary-800 font-bold' : 
                              isCompleted ? 'text-text-main' : 'text-text-secondary'
                            }`}>
                              {lesson.title}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content (Right Pane) */}
      <div className="flex-1 flex flex-col h-full bg-bg-main relative">
        
        {/* Top Header */}
        <div className="bg-card-bg border-b border-border-main p-4 lg:px-10 flex items-center justify-between shadow-sm z-10 shrink-0">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-1">
              Module {module.moduleNumber} of {path.modules.length}
            </p>
            <h1 className="text-xl font-bold text-text-main truncate pr-4">{module.title}</h1>
          </div>
          <div className="hidden md:block w-48 text-right">
            <div className="flex justify-between items-center text-xs font-bold text-text-secondary mb-1">
              <span>Progress</span>
              <span className="text-secondary-700">{moduleProgressPercent}%</span>
            </div>
            <div className="h-2 w-full bg-border-main rounded-full overflow-hidden">
              <div 
                className="h-full bg-secondary-500 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${moduleProgressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Scrollable Lesson Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-12 custom-scrollbar">
          <div className="max-w-3xl mx-auto pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <span className="inline-block px-3 py-1 bg-secondary-50 text-secondary-700 text-xs font-black uppercase tracking-widest rounded-lg border border-secondary-100 mb-4">
                Lesson {currentIndex + 1}
              </span>
              <h2 className="text-3xl font-black text-text-main tracking-tight leading-tight mb-6">
                {currentLesson?.title}
              </h2>
            </div>
            
            <div 
              className="prose prose-lg max-w-none text-text-secondary leading-relaxed prose-headings:text-text-main prose-headings:font-bold prose-a:text-secondary-600 prose-strong:text-text-main"
              dangerouslySetInnerHTML={{ __html: currentLesson?.content || '<p>No content available.</p>' }}
            />
          </div>
        </div>

        {/* Bottom Navigation Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-card-bg border-t border-border-main p-4 lg:px-10 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-20">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            
            <div>
              {prevLesson ? (
                <button 
                  onClick={() => handleLessonSelect(prevLesson.id)}
                  className="flex items-center text-text-secondary font-bold hover:text-text-main transition-colors px-4 py-2"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" /> Previous
                </button>
              ) : (
                <div className="w-24"></div> // spacer
              )}
            </div>

            <div className="flex items-center space-x-4">
              {!isLessonCompleted ? (
                <button 
                  onClick={handleCompleteLesson}
                  className="px-6 py-2.5 bg-secondary-600 text-white font-bold rounded-xl hover:bg-secondary-700 transition-all shadow-sm flex items-center"
                >
                  <CheckCircle className="w-5 h-5 mr-2" /> Mark as Complete
                </button>
              ) : (
                <button 
                  onClick={handleCompleteLesson}
                  className="px-6 py-2.5 bg-success-100 text-success-700 font-bold rounded-xl border border-success-200 hover:bg-success-200 transition-all flex items-center"
                >
                  {isLastLesson ? 'Finish Module' : 'Next Lesson'} <ChevronRight className="w-5 h-5 ml-2" />
                </button>
              )}
            </div>

          </div>
        </div>
        
      </div>
      
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default LearningWorkspace;
