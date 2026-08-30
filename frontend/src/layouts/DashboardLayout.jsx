import React from 'react';
import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-bg-main font-sans selection:bg-secondary-200 selection:text-primary-900">
      <div className="w-full">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
