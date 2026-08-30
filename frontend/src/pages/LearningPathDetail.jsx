import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { ArrowLeft, BookOpen, CheckCircle, Lock, PlayCircle, RotateCcw, AlertTriangle } from 'lucide-react';

const LearningPathDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [path, setPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchPathDetails();
  }, [id]);

  const fetchPathDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/learning-path/${id}`);
      setPath(response.data.path);
    } catch (err) {
      console.error('Error fetching learning path:', err);
      setError(err.response?.data?.message || 'Failed to load learning path details.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (moduleId, newStatus, navigateToModule = false) => {
    if (updating) return;
    
    // Add confirmation for Mark as Unreviewed
    if (newStatus === 'Not Started' && !window.confirm('Are you sure you want to mark this module as unreviewed? This will reset your progress.')) {
      return;
    }

    try {
      setUpdating(true);
      await api.post(`/learning-path/${id}/modules/${moduleId}/status`, { status: newStatus });
      
      if (navigateToModule) {
        navigate(`/learning-path/${id}/module/${moduleId}/review`);
      } else {
        await fetchPathDetails(); // Refresh the list
      }
    } catch (err) {
      console.error('Error updating module status:', err);
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 border-4 border-border-main border-t-secondary-600 rounded-full animate-spin"></div>
        <p className="text-text-secondary font-bold animate-pulse">Loading path details...</p>
      </div>
    );
  }

  if (error || !path) {
    return (
      <div className="text-center mt-20 p-8 max-w-xl mx-auto bg-red-50 border border-red-200 rounded-xl">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-red-700 mb-4">{error || 'Path Not Found'}</h2>
        <button onClick={() => navigate('/learning')} className="text-secondary-600 font-bold hover:underline">
          Return to Learning Paths
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <button 
        onClick={() => navigate('/learning')}
        className="flex items-center text-text-secondary hover:text-secondary-600 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" /> Back to Learning Paths
      </button>

      <div className="bg-card-bg p-8 rounded-xl border border-border-main shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6 relative z-10">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-text-main mb-2 tracking-tight">{path.title}</h1>
            <p className="text-text-secondary max-w-2xl">{path.description}</p>
          </div>
          <div className="bg-secondary-50 px-6 py-4 rounded-xl border border-secondary-100 text-center flex-shrink-0">
            <span className="block text-3xl font-black text-secondary-700">{path.progress || 0}%</span>
            <span className="text-xs font-bold text-secondary-600 uppercase tracking-widest mt-1 block">Completed</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 mt-8">
        <h2 className="text-xl font-bold text-text-main tracking-tight mb-4">Modules</h2>
        {path.modules.map((mod, idx) => (
          <div key={mod.id} className={`p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between border transition-all gap-4 ${
            (mod.status === 'Completed' || mod.status === 'Reviewed') ? 'bg-success-50/50 border-success-200' :
            mod.status === 'In Progress' ? 'bg-secondary-50 border-secondary-300 shadow-sm' :
            mod.status === 'Not Started' ? 'bg-card-bg border-border-main hover:border-secondary-300' :
            'bg-card-alt border-border-main opacity-60'
          }`}>
            <div className="flex items-start md:items-center space-x-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                (mod.status === 'Completed' || mod.status === 'Reviewed') ? 'bg-success-100 text-success-600' :
                mod.status === 'In Progress' ? 'bg-secondary-100 text-secondary-600' :
                'bg-card-alt text-text-secondary border border-border-main'
              }`}>
                {(mod.status === 'Completed' || mod.status === 'Reviewed') ? <CheckCircle className="w-6 h-6" /> :
                 mod.status === 'In Progress' ? <PlayCircle className="w-6 h-6" /> :
                 mod.status === 'Not Started' ? <BookOpen className="w-6 h-6" /> :
                 <Lock className="w-6 h-6" />}
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-1 block">Module {idx + 1}</span>
                <h3 className={`font-semibold text-lg ${mod.status === 'Locked' ? 'text-text-secondary' : 'text-text-main'}`}>{mod.title}</h3>
                <span className="text-sm font-medium text-text-secondary flex items-center mt-1 md:hidden">
                  <Clock className="w-4 h-4 mr-1.5" /> {mod.duration}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-3 md:space-y-0 md:space-x-6 mt-4 md:mt-0 w-full md:w-auto">
              <span className="text-sm font-medium text-text-secondary hidden md:flex items-center">
                <Clock className="w-4 h-4 mr-1.5" /> {mod.duration}
              </span>
              
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                {mod.status === 'Not Started' && (
                  <button 
                    onClick={() => handleUpdateStatus(mod.id, 'In Progress', true)}
                    disabled={updating}
                    className="w-full md:w-auto px-5 py-2.5 text-sm font-bold text-white bg-primary-800 rounded-lg hover:bg-primary-900 transition-colors shadow-sm disabled:opacity-50"
                  >
                    Start Module
                  </button>
                )}

                {mod.status === 'In Progress' && (
                  <button 
                    onClick={() => navigate(`/learning-path/${id}/module/${mod.id}/review`)}
                    disabled={updating}
                    className="w-full md:w-auto px-5 py-2.5 text-sm font-bold text-white bg-secondary-600 rounded-lg hover:bg-secondary-700 hover:-translate-y-0.5 shadow-sm transition-all disabled:opacity-50"
                  >
                    Continue Module
                  </button>
                )}

                {mod.status === 'Completed' && (
                  <button 
                    onClick={() => navigate(`/learning-path/${id}/module/${mod.id}/review`)}
                    disabled={updating}
                    className="w-full md:w-auto px-5 py-2.5 text-sm font-bold text-success-700 bg-success-100 rounded-lg border border-success-200 hover:bg-success-200 transition-colors disabled:opacity-50"
                  >
                    Review Material
                  </button>
                )}

                {mod.status === 'Reviewed' && (
                  <>
                    <button 
                      onClick={() => navigate(`/learning-path/${id}/module/${mod.id}/review`)}
                      disabled={updating}
                      className="flex-1 md:flex-none px-5 py-2.5 text-sm font-bold text-success-700 bg-success-100 rounded-lg border border-success-200 hover:bg-success-200 transition-colors disabled:opacity-50"
                    >
                      Review Material
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(mod.id, 'Not Started')}
                      disabled={updating}
                      title="Mark as Unreviewed"
                      className="px-4 py-2.5 text-sm font-bold text-text-secondary bg-card-bg rounded-lg border border-border-main hover:bg-card-alt transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      <RotateCcw className="w-4 h-4 mr-1.5" /> Reset
                    </button>
                  </>
                )}

                {mod.status === 'Locked' && (
                  <button disabled className="w-full md:w-auto px-5 py-2.5 text-sm font-bold text-text-secondary bg-card-alt rounded-lg border border-border-main cursor-not-allowed">
                    Locked
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearningPathDetail;
