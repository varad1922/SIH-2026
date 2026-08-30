import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BookOpen, Star, Clock, ChevronRight, CheckCircle2 } from 'lucide-react';

const Learning = () => {
  const [courses, setCourses] = useState([]);
  
  // Dynamic mock state for the learning path so buttons work
  const [learningPath, setLearningPath] = useState([
    { id: 1, title: "Python Basics for Stats", status: "Completed", type: "Foundation" },
    { id: 2, title: "Advanced Data Visualization", status: "In Progress", type: "Core Skill" },
    { id: 3, title: "Machine Learning Fundamentals", status: "Locked", type: "Advanced" }
  ]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/courses')
      .then(res => setCourses(res.data))
      .catch(err => console.log(err));
  }, []);

  const handleContinue = (nodeId) => {
    setLearningPath(prev => prev.map(node => {
      if (node.id === nodeId) return { ...node, status: 'Completed' };
      // Unlock the next one if it was locked
      if (node.id === nodeId + 1 && node.status === 'Locked') return { ...node, status: 'In Progress' };
      return node;
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Learning Paths & Catalog</h1>
        <p className="text-gray-500 font-medium">Discover personalized recommendations based on your skill gaps.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Your Recommended Path</h2>
          
          <div className="relative border-l-2 border-primary-200 ml-4 space-y-8 pb-8 mt-6">
            {learningPath.map((node) => (
              <div key={node.id} className="relative pl-8 group">
                <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-4 border-white shadow-sm transition-colors duration-500 ${
                  node.status === 'Completed' ? 'bg-success-500' : 
                  node.status === 'In Progress' ? 'bg-primary-500' : 'bg-gray-300'
                }`} />
                <div className={`bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border transition-all duration-300 ${
                  node.status === 'Completed' ? 'border-success-200 hover:shadow-success-500/10' :
                  node.status === 'In Progress' ? 'border-primary-200 hover:shadow-primary-500/10 scale-[1.02]' :
                  'border-gray-100 opacity-75 grayscale'
                }`}>
                  <span className={`text-xs font-black uppercase tracking-wider mb-2 block ${
                    node.status === 'Completed' ? 'text-success-600' :
                    node.status === 'In Progress' ? 'text-primary-600' : 'text-gray-400'
                  }`}>{node.type}</span>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-1 tracking-tight">{node.title}</h3>
                  
                  <div className="flex items-center justify-between mt-4">
                    <span className={`text-sm font-bold flex items-center ${
                      node.status === 'Completed' ? 'text-success-600' : 
                      node.status === 'In Progress' ? 'text-primary-600' : 'text-gray-400'
                    }`}>
                      {node.status === 'Completed' && <CheckCircle2 className="w-4 h-4 mr-1.5" />}
                      {node.status}
                    </span>
                    
                    {node.status !== 'Locked' && (
                      <button 
                        onClick={() => handleContinue(node.id)}
                        className={`font-bold text-sm flex items-center transition-all px-4 py-2 rounded-xl ${
                          node.status === 'Completed' 
                            ? 'text-gray-500 hover:bg-gray-50' 
                            : 'bg-primary-600 text-white hover:bg-primary-700 shadow-md shadow-primary-600/30 hover:scale-105'
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
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Course Catalog</h2>
          <div className="space-y-4">
            {courses.map((course, idx) => (
              <div key={idx} className="bg-white/80 backdrop-blur-md p-5 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 group hover:border-secondary-300 hover:shadow-secondary-500/10 transition-all cursor-pointer">
                <div className="w-12 h-12 bg-secondary-50 rounded-2xl flex items-center justify-center text-secondary-600 mb-4 group-hover:scale-110 group-hover:bg-secondary-600 group-hover:text-white transition-all shadow-sm">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1 tracking-tight">{course.title}</h3>
                <p className="text-sm font-medium text-gray-500 mb-4">{course.category}</p>
                <div className="flex items-center space-x-4 text-xs font-bold text-gray-600">
                  <div className="flex items-center"><Star className="w-4 h-4 text-warning-500 mr-1" /> {course.difficulty}</div>
                  <div className="flex items-center"><Clock className="w-4 h-4 text-gray-400 mr-1" /> {course.duration}h</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learning;
