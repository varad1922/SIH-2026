import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckCircle, Lock, PlayCircle } from 'lucide-react';

const mockPathDetails = {
  1: {
    title: "Foundations of Study",
    description: "Build a strong base in your chosen field. This module covers all the prerequisite knowledge you need.",
    progress: 100,
    modules: [
      { id: 101, title: "Introduction and Overview", status: "Completed", duration: "45 min" },
      { id: 102, title: "Basic Concepts & Terminology", status: "Completed", duration: "1.5 hrs" },
      { id: 103, title: "Fundamental Frameworks", status: "Completed", duration: "2 hrs" }
    ]
  },
  2: {
    title: "Advanced Methods",
    description: "Deep dive into complex methodologies and practical applications.",
    progress: 33,
    modules: [
      { id: 201, title: "Intermediate Techniques", status: "Completed", duration: "2 hrs" },
      { id: 202, title: "Practical Application Exercise", status: "In Progress", duration: "3 hrs" },
      { id: 203, title: "Advanced Theory", status: "Locked", duration: "2.5 hrs" }
    ]
  },
  3: {
    title: "Mastery Integration",
    description: "Synthesize everything you've learned into a final capstone project.",
    progress: 0,
    modules: [
      { id: 301, title: "Capstone Briefing", status: "Locked", duration: "1 hr" },
      { id: 302, title: "Project Execution", status: "Locked", duration: "10 hrs" },
      { id: 303, title: "Final Review", status: "Locked", duration: "1 hr" }
    ]
  }
};

const LearningPathDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const path = mockPathDetails[id];

  if (!path) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Path Not Found</h2>
        <button onClick={() => navigate('/learning')} className="text-primary-600 font-bold hover:underline">
          Return to Learning Paths
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <button 
        onClick={() => navigate('/learning')}
        className="flex items-center text-text-secondary hover:text-primary-700 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" /> Back to Learning Paths
      </button>

      <div className="bg-card-bg p-8 rounded-xl border border-border-main shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-main mb-2 tracking-tight">{path.title}</h1>
            <p className="text-text-secondary max-w-2xl">{path.description}</p>
          </div>
          <div className="bg-secondary-50 px-4 py-3 rounded-lg border border-secondary-100 text-center">
            <span className="block text-2xl font-bold text-secondary-700">{path.progress}%</span>
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Completed</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 mt-8">
        <h2 className="text-xl font-bold text-text-main tracking-tight mb-4">Modules</h2>
        {path.modules.map((mod, idx) => (
          <div key={mod.id} className={`p-5 rounded-xl flex items-center justify-between border transition-all ${
            mod.status === 'Completed' ? 'bg-success-50/50 border-success-200' :
            mod.status === 'In Progress' ? 'bg-secondary-50 border-secondary-300 shadow-sm' :
            'bg-card-alt border-border-main opacity-60'
          }`}>
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                mod.status === 'Completed' ? 'bg-success-100 text-success-600' :
                mod.status === 'In Progress' ? 'bg-secondary-100 text-secondary-600' :
                'bg-gray-200 text-gray-400'
              }`}>
                {mod.status === 'Completed' ? <CheckCircle className="w-6 h-6" /> :
                 mod.status === 'In Progress' ? <PlayCircle className="w-6 h-6" /> :
                 <Lock className="w-6 h-6" />}
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-1 block">Module {idx + 1}</span>
                <h3 className={`font-semibold text-lg ${mod.status === 'Locked' ? 'text-text-secondary' : 'text-text-main'}`}>{mod.title}</h3>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <span className="text-sm font-medium text-text-secondary flex items-center">
                <BookOpen className="w-4 h-4 mr-1.5" /> {mod.duration}
              </span>
              
              {mod.status === 'Completed' && (
                <button 
                  onClick={() => navigate(`/learning-path/${id}/module/${mod.id}/review`)}
                  className="px-4 py-2 text-sm font-semibold text-success-700 bg-success-100 rounded-lg border border-success-200 hover:bg-success-200 transition-colors"
                >
                  Review Material
                </button>
              )}
              {mod.status === 'In Progress' && (
                <button className="px-5 py-2 text-sm font-semibold text-white bg-secondary-600 rounded-lg hover:bg-secondary-700 hover:-translate-y-0.5 shadow-sm transition-all">
                  Continue Module
                </button>
              )}
              {mod.status === 'Locked' && (
                <button disabled className="px-4 py-2 text-sm font-semibold text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed">
                  Locked
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearningPathDetail;
