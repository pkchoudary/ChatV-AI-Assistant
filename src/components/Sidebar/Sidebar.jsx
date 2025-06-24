import React from 'react';
import './Sidebar.css';

const Sidebar = ({ 
  sidebarOpen, 
  setSidebarOpen,
  darkMode,
  setDarkMode,
  sessions,
  currentSessionId,
  setCurrentSessionId,
  deleteSession,
  newSession,
  exportChat
}) => {
  return (
    <>
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'sidebar-visible' : 'sidebar-hidden'
      } lg:translate-x-0`}>
        {/* ... rest of your sidebar JSX ... */}
      </div>
    </>
  );
};

export default Sidebar;