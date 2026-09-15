import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/grading', label: 'Grading', icon: '📝' },
    { path: '/plagiarism', label: 'Plagiarism', icon: '🔍' },
  ];

  return (
    <>
      <div className="bg-white border-b border-neutral-100 shadow-soft z-10 sticky top-0">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <img 
                src="/public/gm_logo-removebg.png" 
                alt="Grade-Mate Logo" 
                className="h-10 mr-2" 
              />
              <h1 className="text-lg font-semibold text-neutral-800">Grade-Mate</h1>
            </div>
            
            <nav className="hidden md:block">
              <ul className="flex space-x-1">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                        location.pathname === item.path
                          ? 'bg-gradient-to-r from-primary-50 to-success-50 text-primary-700 border-b-2 border-primary-600'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      <span className="text-lg mr-2">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            
            <div className="flex items-center space-x-3">
              <Link 
                to="/" 
                className="text-danger-600 hover:text-danger-700 p-2 rounded-md ml-2 flex items-center"
                title="Logout"
              >
                <span role="img" aria-label="Logout">🚪 Logout</span>
              </Link>
              
              <button 
                className="md:hidden p-2 rounded-md text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>
          
          {mobileMenuOpen && (
            <nav className="md:hidden py-3 border-t border-neutral-100">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                        location.pathname === item.path
                          ? 'bg-gradient-to-r from-primary-50 to-success-50 text-primary-700 border-l-4 border-primary-600'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="text-lg mr-3">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-primary-600 to-success-600 text-white shadow-soft py-3 px-6 z-10 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">
            {navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
          </h2>
        </div>
      </div>
    </>
  );
};

export default Header;
