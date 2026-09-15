import React from 'react';
import { Link } from 'react-router-dom';

const AuthLayout = ({ children }) => {
  return (
    <div className="flex flex-col h-screen w-full bg-neutral-50">
      <div className="bg-white border-b border-neutral-100 shadow-soft z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl mr-2">👨‍🏫</span>
              <h1 className="text-lg font-semibold text-neutral-800">Grade-Mate</h1>
            </div>
            <nav>
              <Link 
                to="/" 
                className="text-neutral-600 hover:text-neutral-800 p-2 rounded-md"
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="text-neutral-600 hover:text-neutral-800 p-2 rounded-md ml-2"
              >
                Sign Up
              </Link>
            </nav>
          </div>
        </div>
      </div>
      <main className="flex-1 p-6">
        <div className="container mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
