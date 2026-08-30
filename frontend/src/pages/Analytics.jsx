import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, TrendingUp, Award, Activity } from 'lucide-react';

const analyticsData = [
  { name: 'Jan', compliance: 65, avgScore: 70 },
  { name: 'Feb', compliance: 68, avgScore: 72 },
  { name: 'Mar', compliance: 75, avgScore: 76 },
  { name: 'Apr', compliance: 82, avgScore: 79 },
  { name: 'May', compliance: 85, avgScore: 82 },
  { name: 'Jun', compliance: 90, avgScore: 86 },
];

const deptData = [
  { name: 'Statistics', score: 85 },
  { name: 'Economics', score: 78 },
  { name: 'IT', score: 92 },
  { name: 'HR', score: 70 },
  { name: 'Finance', score: 81 },
];

const StatCard = ({ title, value, trend, icon: Icon, colorClass }) => (
  <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/50 relative overflow-hidden group">
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-150 ${colorClass.split(' ')[0]}`} />
    <div className="flex justify-between items-start relative z-10">
      <div>
        <p className="text-gray-500 font-medium mb-1">{title}</p>
        <h3 className="text-4xl font-black text-gray-900">{value}</h3>
        <p className="text-sm text-success-600 font-bold mt-2 flex items-center">
          <TrendingUp className="w-4 h-4 mr-1" /> {trend}
        </p>
      </div>
      <div className={`p-4 rounded-2xl ${colorClass}`}>
        <Icon className="w-8 h-8" />
      </div>
    </div>
  </div>
);

const Analytics = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Platform Analytics</h1>
        <p className="text-gray-500">System-wide overview of learning metrics and competencies.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Learners" value="1,248" trend="+12% this month" icon={Users} colorClass="bg-primary-100 text-primary-600" />
        <StatCard title="Avg. Competency" value="78%" trend="+5% this quarter" icon={Award} colorClass="bg-secondary-100 text-secondary-600" />
        <StatCard title="Courses Completed" value="8,402" trend="+24% YoY" icon={Activity} colorClass="bg-success-100 text-success-600" />
        <StatCard title="Overall Compliance" value="92%" trend="+2% this month" icon={TrendingUp} colorClass="bg-secondary-100 text-secondary-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-sm border border-white/50">
          <h2 className="text-xl font-bold text-gray-800 mb-8">System Competency Trend</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                <Tooltip cursor={{ stroke: '#e5e7eb', strokeWidth: 2 }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="avgScore" name="Avg Score" stroke="#3b82f6" strokeWidth={4} dot={{ strokeWidth: 4, r: 4 }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="compliance" name="Compliance" stroke="#10b981" strokeWidth={4} dot={{ strokeWidth: 4, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-sm border border-white/50">
          <h2 className="text-xl font-bold text-gray-800 mb-8">Department Performance</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontWeight: 500 }} />
                <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="score" name="Score" fill="#6366f1" radius={[0, 8, 8, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
