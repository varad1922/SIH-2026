import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { TrendingUp, Book, Award, Clock } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const competencyData = [
  { subject: 'Python', A: 80, fullMark: 100 },
  { subject: 'R', A: 60, fullMark: 100 },
  { subject: 'SQL', A: 90, fullMark: 100 },
  { subject: 'Data Viz', A: 75, fullMark: 100 },
  { subject: 'Survey Design', A: 85, fullMark: 100 },
  { subject: 'Leadership', A: 65, fullMark: 100 },
];

const StatCard = ({ title, value, subtitle, icon: Icon, colorClass }) => (
  <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-white/50 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-[1.8] ${colorClass.split(' ')[0]}`} />
    <div className="flex justify-between items-start relative z-10">
      <div>
        <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</p>
        <h3 className="text-4xl font-black mt-2 text-gray-900 tracking-tight">{value}</h3>
        <p className="text-sm font-medium mt-3 flex items-center">
          <span className={subtitle.includes('+') ? 'text-success-500' : 'text-gray-500'}>{subtitle}</span>
        </p>
      </div>
      <div className={`p-4 rounded-2xl shadow-sm ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = React.useContext(AuthContext);
  const [recommendedCourses, setRecommendedCourses] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/courses/recommendations')
      .then(res => setRecommendedCourses(res.data.slice(0, 3)))
      .catch(err => console.error("Failed to fetch recommendations", err));
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-10 relative">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">{user?.name || 'Learner'}</span> 👋</h1>
        <p className="text-lg text-gray-500 mt-2 font-medium">Here's your learning and competency overview for today.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Overall Competency" value="76%" subtitle="+2% from last month" icon={TrendingUp} colorClass="bg-gradient-to-br from-primary-50 to-primary-100 text-primary-800 border border-primary-200" />
        <StatCard title="Courses Completed" value="12" subtitle="+2 this week" icon={Book} colorClass="bg-gradient-to-br from-success-50 to-success-100 text-success-600 border border-success-200" />
        <StatCard title="Skill Badges" value="8" subtitle="Top 15% in department" icon={Award} colorClass="bg-gradient-to-br from-secondary-50 to-secondary-100 text-secondary-800 border border-secondary-200" />
        <StatCard title="Learning Hours" value="45h" subtitle="In the last 30 days" icon={Clock} colorClass="bg-gradient-to-br from-accent-50 to-accent-100 text-accent-600 border border-accent-200" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-white/50 relative overflow-hidden group hover:border-primary-200 transition-colors">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 group-hover:opacity-50 transition-opacity" />
          <h2 className="text-2xl font-bold text-gray-900 mb-8 relative z-10 tracking-tight">Competency Radar</h2>
          <div className="h-80 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={competencyData}>
                <PolarGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 13, fontWeight: 500 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Competency" dataKey="A" stroke="#78350f" strokeWidth={3} fill="url(#colorUv)" fillOpacity={0.4} />
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#78350f" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-white/50 relative overflow-hidden hover:border-primary-200 transition-colors">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight">Recommended Courses</h2>
          <div className="space-y-4 relative z-10">
            {recommendedCourses.length > 0 ? recommendedCourses.map((item, idx) => {
              const course = item.course;
              // Generate mock gap for UI if backend doesn't provide it
              const gap = item.score > 80 ? 'Critical' : item.score > 50 ? 'High' : 'Medium';
              
              return (
                <div key={course._id || idx} className="flex items-center justify-between p-5 rounded-2xl bg-white border border-gray-100 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer group">
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-primary-800 transition-colors text-lg">{course.title}</h3>
                    <p className="text-sm font-medium text-gray-500 mt-1">{course.provider || course.category}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm ${
                      gap === 'Critical' 
                        ? 'bg-red-50 text-red-700 border border-red-200' 
                        : gap === 'High' 
                          ? 'bg-accent-50 text-accent-700 border border-accent-200' 
                          : 'bg-primary-50 text-primary-800 border border-primary-200'
                    }`}>
                      {gap} Gap
                    </span>
                    <p className="text-sm font-black text-gray-800 mt-3">{item.score}% Match</p>
                  </div>
                </div>
              );
            }) : (
              <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Book className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p>No recommendations available yet.</p>
                <p className="text-sm mt-1">Complete your skills profile to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
