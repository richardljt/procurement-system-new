import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { Outlet, useLocation } from 'react-router-dom';

const MainLayout: React.FC = () => {
  const location = useLocation();
  
  const getModuleFromPath = (path: string) => {
    if (path.startsWith('/supplier')) {
      return 'supplier';
    } else if (path.startsWith('/report')) {
      return 'report';
    } else {
      return 'procurement';
    }
  };

  const [activeModule, setActiveModule] = useState<'procurement' | 'supplier' | 'report'>(() => getModuleFromPath(location.pathname));

  useEffect(() => {
    setActiveModule(getModuleFromPath(location.pathname));
  }, [location.pathname]);

  return (
    <div className="h-screen bg-gray-50 font-sans flex flex-col">
      <Header activeModule={activeModule} setActiveModule={setActiveModule} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeModule={activeModule} />
        <main className="flex-1 overflow-y-auto h-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
