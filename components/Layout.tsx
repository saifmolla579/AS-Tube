
import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  isAdmin: boolean;
  onAdminToggle: () => void;
  onSearch: (term: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, isAdmin, onAdminToggle, onSearch }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
        isAdmin={isAdmin}
        onAdminToggle={onAdminToggle}
        onSearch={onSearch}
      />
      <div className="flex flex-1 pt-16">
        <Sidebar isOpen={isSidebarOpen} />
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
