import React, { useState } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import ChatInterface from './components/ChatInterface/ChatInterface';
import './App.css';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
      <ChatInterface 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        darkMode={darkMode}
      />
    </div>
  );
}