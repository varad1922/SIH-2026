import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Star, Clock, ChevronRight, CheckCircle2 } from 'lucide-react';

const Learning = () => {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();
  
  const [learningPath, setLearningPath] = useState([
    { id: 1, title: "Foundations of Study", status: "Completed", type: "Foundation" },
    { id: 2, title: "Advanced Methods", status: "In Progress", type: "Core Skill" },
    { id: 3, title: "Mastery Integration", status: "Locked", type: "Advanced" }
  ]);

  useEffect(() => {
    api.get('/courses')
      .then(res => setCourses(res.data))
      .catch(err => console.error("Failed to fetch courses", err));
  }, []);

  const handleReviewOrContinue = (nodeId) => {
    navigate(`/learning/${nodeId}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-text-main tracking-tight mb-2">Learning Paths & Catalog</h1>
        <p className="text-text-secondary font-medium">Discover personalized recommendations based on your skill gaps.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-text-main tracking-tight">Your Recommended Path</h2>
          
          <div className="relative border-l-2 border-border-main ml-4 space-y-8 pb-8 mt-6">
            {learningPath.map((node) => (
              <div key={node.id} className="relative pl-8 group">
                <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-4 border-white shadow-sm transition-colors duration-300 ${
                  node.status === 'Completed' ? 'bg-success-600' : 
                  node.status === 'In Progress' ? 'bg-accent-600' : 'bg-border-main'
                }`} />
                <div className={`bg-card-bg p-6 rounded-xl border transition-all duration-300 ${
                  node.status === 'Completed' ? 'border-success-200 hover:border-success-400 hover:shadow-sm' :
                  node.status === 'In Progress' ? 'border-accent-300 hover:border-accent-500 hover:shadow-sm scale-[1.01]' :
                  'border-border-main opacity-75 grayscale'
                }`}>
                  <span className={`text-xs font-bold uppercase tracking-wider mb-2 block ${
                    node.status === 'Completed' ? 'text-success-700' :
                    node.status === 'In Progress' ? 'text-accent-700' : 'text-text-secondary'
                  }`}>{node.type}</span>
                  
                  <h3 className="text-lg font-bold text-text-main mb-1 tracking-tight">{node.title}</h3>
                  
                  <div className="flex items-center justify-between mt-4">
                    <span className={`text-sm font-semibold flex items-center ${
                      node.status === 'Completed' ? 'text-success-600' : 
                      node.status === 'In Progress' ? 'text-accent-600' : 'text-text-secondary'
                    }`}>
                      {node.status === 'Completed' && <CheckCircle2 className="w-4 h-4 mr-1.5" />}
                      {node.status}
                    </span>
                    
                    {node.status !== 'Locked' && (
                      <button 
                        onClick={() => handleReviewOrContinue(node.id)}
                        className={`font-semibold text-sm flex items-center transition-all px-4 py-2 rounded-lg ${
                          node.status === 'Completed' 
                            ? 'text-secondary-700 bg-secondary-50 border border-secondary-200 hover:bg-secondary-100 hover:-translate-y-0.5' 
                            : 'bg-secondary-600 text-white hover:bg-secondary-700 shadow-sm hover:-translate-y-0.5'
                        }`}
                      >
                        {node.status === 'Completed' ? 'Review' : 'Continue'} <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-text-main tracking-tight">Course Catalog</h2>
          <div className="space-y-4">
            {courses.length > 0 ? courses.map((course, idx) => (
              <div key={course._id || idx} className="bg-card-bg p-5 rounded-xl border border-border-main group hover:border-secondary-300 hover:shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer">
                <div className="w-10 h-10 bg-secondary-50 rounded-lg flex items-center justify-center text-secondary-600 mb-4 group-hover:bg-secondary-600 group-hover:text-white transition-colors">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-text-main mb-1">{course.title}</h3>
                <p className="text-sm text-text-secondary mb-4">{course.category}</p>
                <div className="flex items-center space-x-4 text-xs font-semibold text-text-secondary">
                  <div className="flex items-center"><Star className="w-4 h-4 text-amber-500 mr-1" /> {course.difficulty}</div>
                  <div className="flex items-center"><Clock className="w-4 h-4 text-secondary-400 mr-1" /> {course.duration}h</div>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-text-secondary bg-card-alt rounded-xl border border-dashed border-border-main">
                <BookOpen className="w-10 h-10 mx-auto text-primary-300 mb-3" />
                <p>No courses available right now.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learning;
