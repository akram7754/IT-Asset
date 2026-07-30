import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans text-text">
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} onCloseMobileMenu={() => setIsMobileMenuOpen(false)} />
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Header onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-3 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
