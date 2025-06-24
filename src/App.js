import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar/Sidebar';
import ChatInterface from './components/ChatInterface/ChatInterface';
import './App.css';

const SYSTEM_PROMPT = `
  You are ChatV, an advanced AI assistant designed to provide intelligent, helpful, and engaging responses.
  - Deliver accurate, contextual answers with clarity and precision
  - Maintain a friendly, professional tone while being conversational
  - Break down complex topics into digestible information
  - Admit uncertainty when needed and suggest reliable sources
  - Keep conversation context for seamless dialogue
  - Current date and time: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}
`;

const MODELS = {
  'gpt-4': { name: 'GPT-4', icon: '🧠', color: 'text-purple-600' },
  'mistral': { name: 'Mistral', icon: '⚡', color: 'text-blue-600' },
  'llama3': { name: 'LLaMA 3', icon: '🦙', color: 'text-green-600' },
  'gemma': { name: 'Gemma', icon: '💎', color: 'text-pink-600' }
};

function App() {
  const [sessions, setSessions] = useState(() => ({ 'default-session': { id: 'default-session', title: 'New Chat', messages: [], createdAt: new Date().toISOString() } }));
  const [currentSessionId, setCurrentSessionId] = useState('default-session');
  const [input, setInput] = useState('');
  const [model, setModel] = useState('gpt-4');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [editingMessageIndex, setEditingMessageIndex] = useState(null);
  const [editInput, setEditInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const currentSession = sessions[currentSessionId];
  const messages = currentSession?.messages || [];

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Dark mode toggle
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Handle sidebar visibility on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else if (!sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Send message with streaming simulation
  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input, timestamp: new Date().toISOString() };
    const newMessages = [...messages, userMessage];
    
    setSessions(prev => ({
      ...prev,
      [currentSessionId]: {
        ...prev[currentSessionId],
        messages: newMessages,
        title: prev[currentSessionId]?.title === 'New Chat' ? input.slice(0, 50) : prev[currentSessionId]?.title,
        updatedAt: new Date().toISOString()
      }
    }));

    setInput('');
    setLoading(true);
    setStreamingMessage('');

    try {
      const response = await axios.post('http://localhost:11434/api/chat', {
        model: model === 'gpt-4' ? 'mistral' : model,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...newMessages],
        stream: false,
      });

      const assistantMessage = response.data.message?.content || 'I apologize, but I encountered an issue processing your request.';
      
      const words = assistantMessage.split(' ');
      let currentText = '';
      
      for (let i = 0; i < words.length; i++) {
        currentText += (i > 0 ? ' ' : '') + words[i];
        setStreamingMessage(currentText);
        await new Promise(resolve => setTimeout(resolve, 30));
      }

      setSessions(prev => ({
        ...prev,
        [currentSessionId]: {
          ...prev[currentSessionId],
          messages: [...newMessages, { 
            role: 'assistant', 
            content: assistantMessage, 
            timestamp: new Date().toISOString(),
            model: model
          }]
        }
      }));

      setStreamingMessage('');
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = 'I apologize, but I\'m having trouble connecting to the server. Please try again.';
      
      setSessions(prev => ({
        ...prev,
        [currentSessionId]: {
          ...prev[currentSessionId],
          messages: [...newMessages, { 
            role: 'assistant', 
            content: errorMessage, 
            timestamp: new Date().toISOString(),
            isError: true
          }]
        }
      }));
      setStreamingMessage('');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, messages, model, currentSessionId, loading]);

  // Edit message functions
  const startEditing = useCallback((index, content) => {
    setEditingMessageIndex(index);
    setEditInput(content);
  }, []);

  const saveEdit = useCallback((index) => {
    if (!editInput.trim()) return;
    setSessions(prev => ({
      ...prev,
      [currentSessionId]: {
        ...prev[currentSessionId],
        messages: prev[currentSessionId].messages.map((msg, i) =>
          i === index ? { ...msg, content: editInput } : msg
        )
      }
    }));
    setEditingMessageIndex(null);
    setEditInput('');
  }, [editInput, currentSessionId]);

  const cancelEdit = useCallback(() => {
    setEditingMessageIndex(null);
    setEditInput('');
  }, []);

  // Create new session
  const newSession = useCallback(() => {
    const newId = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const newSession = {
      id: newId,
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString()
    };
    
    setSessions(prev => ({ ...prev, [newId]: newSession }));
    setCurrentSessionId(newId);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }, []);

  // Delete session
  const deleteSession = useCallback((id) => {
    setSessions(prev => {
      const newSessions = { ...prev };
      delete newSessions[id];
      
      if (id === currentSessionId) {
        const remainingIds = Object.keys(newSessions);
        if (remainingIds.length > 0) {
          setCurrentSessionId(remainingIds[0]);
        } else {
          const defaultSession = {
            id: 'default-session',
            title: 'New Chat',
            messages: [],
            createdAt: new Date().toISOString()
          };
          newSessions['default-session'] = defaultSession;
          setCurrentSessionId('default-session');
        }
      }
      
      return newSessions;
    });
  }, [currentSessionId]);

  // Export chat
  const exportChat = useCallback(() => {
    const sessionData = sessions[currentSessionId];
    const exportData = {
      title: sessionData.title,
      messages: sessionData.messages,
      exportedAt: new Date().toISOString(),
      model: model
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chatv-${sessionData.title.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sessions, currentSessionId, model]);

  // Clear current session
  const clearSession = useCallback(() => {
    setSessions(prev => ({
      ...prev,
      [currentSessionId]: {
        ...prev[currentSessionId],
        messages: [],
        title: 'New Chat'
      }
    }));
  }, [currentSessionId]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            newSession();
            break;
          case 'k':
            e.preventDefault();
            clearSession();
            break;
          case 'e':
            e.preventDefault();
            exportChat();
            break;
          case 'b':
            e.preventDefault();
            setSidebarOpen(prev => !prev);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [newSession, clearSession, exportChat]);

  // Memoized session list
  const sessionList = useMemo(() => {
    return Object.values(sessions)
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .map(session => (
        <div
          key={session.id}
          className={`group relative p-3 rounded-lg cursor-pointer flex items-center justify-between transition-all duration-200 ${
            session.id === currentSessionId 
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          onClick={() => {
            setCurrentSessionId(session.id);
            if (window.innerWidth < 1024) setSidebarOpen(false);
          }}
        >
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{session.title}</div>
            <div className={`text-sm opacity-70 ${session.id === currentSessionId ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>
              {session.messages.length} messages
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500 hover:text-white transition-all duration-200"
            title="Delete session"
          >
            🗑️
          </button>
        </div>
      ));
  }, [sessions, currentSessionId, deleteSession]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'sidebar-visible' : 'sidebar-hidden'} lg:sidebar-visible`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">ChatV</h1>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Close sidebar"
              >
                ✕
              </button>
            </div>
            <button
              onClick={newSession}
              className="w-full flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
              aria-label="Start new chat"
            >
              + New Chat
            </button>
          </div>
          
          {/* Session List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {sessionList}
          </div>
          
          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-full flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Ctrl+N: New • Ctrl+K: Clear • Ctrl+E: Export
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Toggle sidebar"
            >
              ☰
            </button>
            <div className="flex items-center gap-2">
              <span className={MODELS[model].color}>{MODELS[model].icon}</span>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="bg-transparent font-medium focus:outline-none cursor-pointer text-gray-900 dark:text-gray-100"
                aria-label="Select AI model"
              >
                {Object.entries(MODELS).map(([key, { name }]) => (
                  <option key={key} value={key} className="bg-white dark:bg-gray-800">
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportChat}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              title="Export chat (Ctrl+E)"
              aria-label="Export chat"
            >
              📥
            </button>
            <button
              onClick={clearSession}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              title="Clear chat (Ctrl+K)"
              aria-label="Clear chat"
            >
              🗑️
            </button>
          </div>
        </div>
        
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto chat-container chat-scroll">
          <div className="max-w-4xl mx-auto p-6 space-y-6">
            {messages.length === 0 && !streamingMessage && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🤖</div>
                <h2 className="text-3xl font-bold mb-3">Welcome to ChatV</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">Your intelligent AI assistant is ready to help with any questions or tasks.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {['💡 Creative writing', '📚 Research assistance', '🔧 Problem solving', '💼 Professional tasks'].map((suggestion, i) => (
                    <button
                      key={i}
                      className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 text-left"
                      onClick={() => setInput(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {messages.map((message, index) =>
              editingMessageIndex === index && message.role === 'user' ? (
                <div key={index} className="flex justify-end message-animation">
                  <div className="max-w-[80%] rounded-2xl px-4 py-3 shadow-sm message-user text-white">
                    <textarea
                      value={editInput}
                      onChange={(e) => setEditInput(e.target.value)}
                      className="w-full resize-none rounded-lg border-0 bg-white/20 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      rows={Math.min(Math.max(editInput.split('\n').length, 1), 5)}
                      aria-label="Edit message"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => saveEdit(index)}
                        className="p-1 text-sm text-blue-100 hover:bg-blue-700 rounded"
                        aria-label="Save edited message"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-1 text-sm text-blue-100 hover:bg-blue-700 rounded"
                        aria-label="Cancel editing"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  key={index}
                  className={`message-animation flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  onDoubleClick={() => message.role === 'user' && startEditing(index, message.content)}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm relative group ${
                      message.role === 'user'
                        ? 'message-user text-white'
                        : `message-assistant text-gray-800 dark:text-gray-200 ${message.isError ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : ''}`
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div
                      className={`text-xs mt-2 opacity-70 flex justify-between items-center ${
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      <span>{`${message.role === 'user' ? 'You' : 'ChatV'} • ${new Date(message.timestamp).toLocaleTimeString()}`}</span>
                      {message.role === 'user' && (
                        <button
                          onClick={() => startEditing(index, message.content)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-xs"
                          aria-label="Edit message"
                        >
                          ✏️
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            )}
            
            {streamingMessage && (
              <div className="flex justify-start message-animation">
                <div className="max-w-[80%] message-assistant text-gray-800 dark:text-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="whitespace-pre-wrap">{streamingMessage}</div>
                  <div className="inline-block w-2 h-4 bg-blue-500 ml-1 typing-indicator" />
                </div>
              </div>
            )}
            
            {loading && !streamingMessage && (
              <div className="flex justify-start">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">ChatV is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Type your message... (Shift+Enter for new line)"
                  className="w-full resize-none rounded-2xl border-0 bg-gray-100 dark:bg-gray-700 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 chat-input"
                  rows={Math.min(Math.max(input.split('\n').length, 1), 5)}
                  disabled={loading}
                  aria-label="Message input"
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-2xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                {loading ? '⏳' : '🚀'}
              </button>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
              ChatV may produce inaccurate information. Please verify important details.
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}

export default App;
