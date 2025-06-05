import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-slate-800 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-7 w-7 text-slate-300" />
            <h1 className="text-xl font-semibold tracking-tight">Local Ollama Chat</h1>
          </div>
          <span className="text-sm text-slate-400">Offline AI Assistant</span>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-6 flex justify-center items-start">
        <div className="w-full max-w-2xl">
          {children}
        </div>
      </main>
      <footer className="text-center py-4 text-sm text-gray-500 border-t bg-gray-50">
        Powered by Ollama & base44. Ensure Ollama is running locally.
      </footer>
    </div>
  );
}