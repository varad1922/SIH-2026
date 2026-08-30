import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Star, Clock, ChevronRight, CheckCircle2 } from 'lucide-react';

const Learning = () => {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();
  
  // Keep the structure for the learning path, but ideally this would also be fetched.
  // We'll leave it as a state block that users can interact with for the demo.
  const [learningPath, setLearningPath] = useState([
    { id: 1, title: "Foundations of Study", status: "Completed", type: "Foundation" },
    { id: 2, title: "Advanced Methods", status: "In Progress", type: "Core Skill" },
    { id: 3, title: "Mastery Integration", status: "Locked", type: "Advanced" }
  ]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/courses')
      .then(res => setCourses(res.data))
      .catch(err => console.error("Failed to fetch courses", err));
  }, []);

  const handleReviewOrContinue = (nodeId) => {
    navigate(`/learning/${nodeId}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-black text-text-main tracking-tight mb-2">Learning Paths & Catalog</h1>
        <p className="text-text-secondary font-medium">Discover personalized recommendations based on your skill gaps.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-text-main tracking-tight">Your Recommended Path</h2>
          
          <div className="relative border-l-2 border-primary-200 ml-4 space-y-8 pb-8 mt-6">
            {learningPath.map((node) => (
              <div key={node.id} className="relative pl-8 group">
                <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-4 border-white shadow-sm transition-colors duration-500 ${
                  node.status === 'Completed' ? 'bg-success-500' : 
                  node.status === 'In Progress' ? 'bg-accent-500' : 'bg-gray-300'
                }`} />
                <div className={`bg-card-bg p-6 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border transition-all duration-300 ${
                  node.status === 'Completed' ? 'border-success-200 hover:shadow-success-500/10' :
                  node.status === 'In Progress' ? 'border-accent-300 hover:shadow-accent-500/10 scale-[1.02]' :
                  'border-gray-200 opacity-75 grayscale'
                }`}>
                  <span className={`text-xs font-black uppercase tracking-wider mb-2 block ${
                    node.status === 'Completed' ? 'text-success-600' :
                    node.status === 'In Progress' ? 'text-accent-600' : 'text-gray-400'
                  }`}>{node.type}</span>
                  
                  <h3 className="text-lg font-bold text-text-main mb-1 tracking-tight">{node.title}</h3>
                  
                  <div className="flex items-center justify-between mt-4">
                    <span className={`text-sm font-bold flex items-center ${
                      node.status === 'Completed' ? 'text-success-600' : 
                      node.status === 'In Progress' ? 'text-accent-600' : 'text-gray-400'
                    }`}>
                      {node.status === 'Completed' && <CheckCircle2 className="w-4 h-4 mr-1.5" />}
                      {node.status}
                    </span>
                    
                    {node.status !== 'Locked' && (
                      <button 
                        onClick={() => handleReviewOrContinue(node.id)}
                        className={`font-bold text-sm flex items-center transition-all px-4 py-2 rounded-xl ${
                          node.status === 'Completed' 
                            ? 'text-primary-700 bg-primary-50 border border-primary-200 hover:bg-primary-100' 
                            : 'bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:scale-105'
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
              <div key={course._id || idx} className="bg-card-bg p-5 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-primary-100 group hover:border-primary-300 hover:shadow-primary-500/10 transition-all cursor-pointer">
                <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 mb-4 group-hover:scale-110 group-hover:bg-primary-600 group-hover:text-white transition-all shadow-sm">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-text-main mb-1 tracking-tight">{course.title}</h3>
                <p className="text-sm font-medium text-text-secondary mb-4">{course.category}</p>
                <div className="flex items-center space-x-4 text-xs font-bold text-text-secondary">
                  <div className="flex items-center"><Star className="w-4 h-4 text-accent-500 mr-1" /> {course.difficulty}</div>
                  <div className="flex items-center"><Clock className="w-4 h-4 text-primary-400 mr-1" /> {course.duration}h</div>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-text-secondary bg-primary-50 rounded-2xl border border-dashed border-primary-200">
                <BookOpen className="w-12 h-12 mx-auto text-primary-300 mb-3" />
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
