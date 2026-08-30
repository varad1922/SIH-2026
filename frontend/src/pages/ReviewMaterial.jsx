import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  Star, 
  List, 
  BookMarked 
} from 'lucide-react';

const CollapsibleSection = ({ title, icon: Icon, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-card-bg border border-border-main rounded-xl overflow-hidden mb-6 shadow-sm transition-all hover:border-secondary-300">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 bg-card-alt hover:bg-secondary-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="bg-secondary-100 text-secondary-600 p-2 rounded-lg">
            <Icon className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-text-main tracking-tight">{title}</h2>
        </div>
        {isOpen ? <ChevronUp className="text-secondary-600" /> : <ChevronDown className="text-secondary-600" />}
      </button>
      
      {isOpen && (
        <div className="p-6 border-t border-border-main animate-in fade-in duration-300">
          {children}
        </div>
      )}
    </div>
  );
};

const ReviewMaterial = () => {
  const { pathId, moduleId } = useParams();
  const navigate = useNavigate();
  
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [readProgress, setReadProgress] = useState(0);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await api.get(`/learning-path/${pathId}/modules/${moduleId}`);
        
        setModule(response.data.module);
      } catch (err) {
        console.error('Error fetching module material:', err);
        setError(err.response?.data?.message || 'Failed to load learning material. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterial();
  }, [pathId, moduleId]);

  // Scroll Progress Indicator
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = `${totalScroll / windowHeight}`;
      setReadProgress(Math.min(Number(scroll) * 100, 100));
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMarkReviewed = async () => {
    if (updating) return;
    try {
      setUpdating(true);
      await api.post(`/learning-path/${pathId}/modules/${moduleId}/status`, { status: 'Reviewed' });
      navigate(`/learning/${pathId}`);
    } catch (err) {
      console.error('Error marking as reviewed:', err);
      alert('Failed to mark as reviewed. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 border-4 border-border-main border-t-secondary-600 rounded-full animate-spin"></div>
        <p className="text-text-secondary font-bold animate-pulse">Loading study material...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-20 p-8 bg-red-50 border border-red-200 rounded-xl text-center">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Error Loading Material</h2>
        <p className="text-red-600 mb-6">{error}</p>
        <button 
          onClick={() => navigate(`/learning/${pathId}`)}
          className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
        >
          Return to Learning Path
        </button>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-2xl font-bold text-text-main mb-4">Module not found</h2>
        <button onClick={() => navigate(`/learning/${pathId}`)} className="text-secondary-600 font-bold hover:underline">
          Return to Learning Path
        </button>
      </div>
    );
  }

  const { content } = module;

  return (
    <div className="relative pb-20 animate-in fade-in duration-500">
      {/* Read Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1.5 bg-card-alt z-50">
        <div 
          className="h-full bg-accent-600 transition-all duration-150 ease-out" 
          style={{ width: `${readProgress}%` }}
        />
      </div>

      <div className="max-w-4xl mx-auto space-y-6 pt-4">
        <button 
          onClick={() => navigate(`/learning/${pathId}`)}
          className="flex items-center text-secondary-600 font-bold hover:text-secondary-800 transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Modules
        </button>

        {/* Header Section */}
        <div className="bg-card-bg p-8 rounded-xl shadow-sm border border-border-main mb-8 relative overflow-hidden">
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="inline-block px-3 py-1 bg-secondary-50 text-secondary-800 text-xs font-black uppercase tracking-widest rounded-lg mb-4 border border-secondary-100">
                Module {module.moduleNumber}
              </span>
              <h1 className="text-4xl font-black text-text-main mb-3 tracking-tight">{module.title}</h1>
              <p className="text-text-secondary max-w-2xl text-lg">{module.description}</p>
            </div>
            
            <div className="flex items-center space-x-4 bg-card-alt px-6 py-4 rounded-xl border border-border-main">
              <div className="flex flex-col items-center">
                <Clock className="w-6 h-6 text-secondary-600 mb-1" />
                <span className="text-sm font-bold text-text-main">{module.duration}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Content Sections */}
        
        {content.overview && (
          <CollapsibleSection title="Overview" icon={BookOpen}>
            <p className="text-text-secondary leading-relaxed text-lg">
              {content.overview}
            </p>
          </CollapsibleSection>
        )}

        {content.objectives && content.objectives.length > 0 && (
          <CollapsibleSection title="Learning Objectives" icon={CheckCircle}>
            <ul className="space-y-3">
              {content.objectives.map((obj, idx) => (
                <li key={idx} className="flex items-start">
                  <div className="mt-1 mr-3 w-5 h-5 rounded-full bg-success-100 text-success-600 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-3 h-3" />
                  </div>
                  <span className="text-text-main font-medium">{obj}</span>
                </li>
              ))}
            </ul>
          </CollapsibleSection>
        )}

        {content.keyConcepts && content.keyConcepts.length > 0 && (
          <CollapsibleSection title="Key Concepts" icon={Lightbulb}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {content.keyConcepts.map((concept, idx) => (
                <div key={idx} className="bg-card-alt p-5 rounded-xl border border-border-main">
                  <h3 className="font-bold text-primary-800 mb-2">{concept.title}</h3>
                  <p className="text-text-secondary text-sm">{concept.description}</p>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {content.studyMaterial && content.studyMaterial.length > 0 && (
          <CollapsibleSection title="Study Material" icon={BookMarked}>
            <div className="space-y-6">
              {content.studyMaterial.map((material, idx) => (
                <div key={idx} className="prose max-w-none">
                  <h3 className="text-xl font-bold text-text-main mb-3">{material.heading}</h3>
                  <p className="text-text-secondary leading-relaxed text-lg">{material.content}</p>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {content.importantTerms && content.importantTerms.length > 0 && (
          <CollapsibleSection title="Important Terms" icon={List} defaultOpen={false}>
            <div className="divide-y divide-border-main">
              {content.importantTerms.map((item, idx) => (
                <div key={idx} className="py-4 first:pt-0 last:pb-0">
                  <dt className="font-bold text-secondary-700 text-lg mb-1">{item.term}</dt>
                  <dd className="text-text-secondary">{item.definition}</dd>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {content.examples && content.examples.length > 0 && (
          <CollapsibleSection title="Examples in Practice" icon={Star} defaultOpen={false}>
            <div className="space-y-4">
              {content.examples.map((ex, idx) => (
                <div key={idx} className="bg-card-bg p-5 rounded-xl border-l-4 border-l-accent-500 shadow-sm border-t border-r border-b border-border-main">
                  <h4 className="font-bold text-text-main mb-2">{ex.title}</h4>
                  <p className="text-text-secondary italic">{ex.description}</p>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Footer Actions */}
        <div className="mt-12 flex justify-between items-center bg-card-bg p-6 rounded-xl border border-border-main shadow-sm">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-text-secondary font-bold hover:text-secondary-600 transition-colors"
          >
            Back to Top
          </button>
          
          <button 
            onClick={handleMarkReviewed}
            disabled={updating}
            className="px-6 py-3 bg-secondary-600 text-white font-bold rounded-xl hover:bg-secondary-700 transition-colors shadow-sm flex items-center disabled:opacity-50"
          >
            <CheckCircle className="w-5 h-5 mr-2" /> {updating ? 'Saving...' : 'Mark as Reviewed'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ReviewMaterial;
