import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  DocumentTextIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Analysis', href: '/analysis', icon: DocumentTextIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`} role="dialog" aria-modal="true">
        {/* Overlay */}
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" aria-hidden="true" onClick={() => setSidebarOpen(false)}></div>

        {/* Sidebar */}
        <div className="relative flex flex-col w-full max-w-xs pt-5 pb-4 bg-primary-700">
          <div className="absolute top-0 right-0 pt-2 mr-2">
            <button
              type="button"
              className="flex items-center justify-center w-10 h-10 ml-1 rounded-md"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="w-6 h-6 text-white" aria-hidden="true" />
              <span className="sr-only">Close sidebar</span>
            </button>
          </div>

          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-2xl font-bold text-white">PRR Automation</h1>
          </div>
          <div className="flex-1 h-0 mt-5 overflow-y-auto">
            <nav className="px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                    location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href))
                      ? 'bg-primary-800 text-white'
                      : 'text-white hover:bg-primary-600'
                  }`}
                >
                  <item.icon className="w-6 h-6 mr-4 text-primary-300" aria-hidden="true" />
                  {item.name}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-2 py-2 text-base font-medium text-white rounded-md group hover:bg-primary-600"
              >
                <ArrowRightOnRectangleIcon className="w-6 h-6 mr-4 text-primary-300" aria-hidden="true" />
                Logout
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-1 min-h-0 bg-primary-700">
          <div className="flex items-center flex-shrink-0 h-16 px-4 bg-primary-800">
            <h1 className="text-xl font-bold text-white">PRR Automation</h1>
          </div>
          <div className="flex flex-col flex-1 overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href))
                      ? 'bg-primary-800 text-white'
                      : 'text-white hover:bg-primary-600'
                  }`}
                >
                  <item.icon className="w-6 h-6 mr-3 text-primary-300" aria-hidden="true" />
                  {item.name}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-2 py-2 text-sm font-medium text-white rounded-md group hover:bg-primary-600"
              >
                <ArrowRightOnRectangleIcon className="w-6 h-6 mr-3 text-primary-300" aria-hidden="true" />
                Logout
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col lg:pl-64">
        {/* Top navbar */}
        <div className="sticky top-0 z-10 flex flex-shrink-0 h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 text-gray-500 border-r border-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="w-6 h-6" aria-hidden="true" />
          </button>
          <div className="flex justify-between flex-1 px-4">
            <div className="flex flex-1">
              {/* Page title */}
              <h1 className="text-2xl font-semibold text-gray-900 my-auto">
                {navigation.find(
                  (item) => location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href))
                )?.name || 'Dashboard'}
              </h1>
            </div>
            <div className="flex items-center ml-4 md:ml-6">
              {/* Profile dropdown */}
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 mr-2">{currentUser?.username}</span>
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
                  {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;