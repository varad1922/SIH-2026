import React, { useState, useEffect } from 'react';
import api from '../api/client';
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
  <div className="bg-card-bg p-6 rounded-xl border border-primary-200 hover:border-primary-300 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
    <div className="flex justify-between items-start relative z-10">
      <div>
        <p className="text-text-secondary text-sm font-semibold tracking-wide uppercase">{title}</p>
        <h3 className="text-3xl font-bold mt-3 text-text-main tracking-tight">{value}</h3>
        <p className="text-sm font-medium mt-2 flex items-center">
          <span className={subtitle.includes('+') ? 'text-success-600' : 'text-text-secondary'}>{subtitle}</span>
        </p>
      </div>
      <div className={`p-3 rounded-lg ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = React.useContext(AuthContext);
  const [recommendedCourses, setRecommendedCourses] = useState([]);

  useEffect(() => {
    api.get('/courses/recommendations')
      .then(res => setRecommendedCourses(res.data.slice(0, 3)))
      .catch(err => console.error("Failed to fetch recommendations", err));
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-text-main tracking-tight">Welcome back, {user?.name || 'Learner'} 👋</h1>
        <p className="text-lg text-text-secondary mt-1">Here's your learning and competency overview for today.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Overall Competency" value="76%" subtitle="+2% from last month" icon={TrendingUp} colorClass="bg-primary-50 text-primary-700" />
        <StatCard title="Courses Completed" value="12" subtitle="+2 this week" icon={Book} colorClass="bg-accent-50 text-accent-700" />
        <StatCard title="Skill Badges" value="8" subtitle="Top 15% in department" icon={Award} colorClass="bg-primary-50 text-primary-700" />
        <StatCard title="Learning Hours" value="45h" subtitle="In the last 30 days" icon={Clock} colorClass="bg-secondary-50 text-secondary-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="bg-card-bg p-8 rounded-xl border border-border-main hover:border-secondary-300 transition-colors shadow-sm">
          <h2 className="text-xl font-bold text-text-main mb-6 tracking-tight">Competency Radar</h2>
          <div className="h-80 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={competencyData}>
                <PolarGrid stroke="#D9E1EA" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Competency" dataKey="A" stroke="#132B55" strokeWidth={2} fill="#1E5FB8" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card-bg p-8 rounded-xl border border-border-main hover:border-secondary-300 transition-colors shadow-sm">
          <h2 className="text-xl font-bold text-text-main mb-6 tracking-tight">Recommended Courses</h2>
          <div className="space-y-4">
            {recommendedCourses.length > 0 ? recommendedCourses.map((item, idx) => {
              const course = item.course;
              const gap = item.score > 80 ? 'Critical' : item.score > 50 ? 'High' : 'Medium';
              
              return (
                <div key={course._id || idx} className="flex items-center justify-between p-4 rounded-lg bg-card-alt border border-border-main hover:border-secondary-300 hover:shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer group">
                  <div>
                    <h3 className="font-semibold text-text-main group-hover:text-secondary-700 transition-colors">{course.title}</h3>
                    <p className="text-sm text-text-secondary mt-1">{course.provider || course.category}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded text-xs font-bold tracking-wide uppercase ${
                      gap === 'Critical' 
                        ? 'bg-red-100 text-red-700' 
                        : gap === 'High' 
                          ? 'bg-secondary-100 text-secondary-700' 
                          : 'bg-primary-100 text-primary-700'
                    }`}>
                      {gap} Gap
                    </span>
                    <p className="text-xs font-bold text-text-main mt-2">{item.score}% Match</p>
                  </div>
                </div>
              );
            }) : (
              <div className="p-8 text-center text-text-secondary bg-card-alt rounded-lg border border-dashed border-border-main">
                <Book className="w-10 h-10 mx-auto text-primary-300 mb-3" />
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
