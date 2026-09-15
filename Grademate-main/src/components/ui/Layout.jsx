import React from 'react';
import Header from './Header';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col h-screen w-full bg-neutral-50">
      <Header />
      
      {/* Main content */}
      <main className="flex-1 p-6 ">
        <div className="container mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;