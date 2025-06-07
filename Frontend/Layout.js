import React from "react";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-900 via-blue-700 to-cyan-700 flex items-center justify-center font-sans">
      {/* Animated background blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400 opacity-30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-400 opacity-30 rounded-full blur-3xl animate-pulse" />
      </div>
      {/* Main chat card */}
      <div className="w-full max-w-2xl min-h-[80vh] flex flex-col rounded-3xl shadow-2xl glass-effect border border-white/10 backdrop-blur-xl bg-white/10">
        {/* Header */}
        <header className="w-full py-6 flex justify-center items-center border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">R</span>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent tracking-tight">ronna</h1>
              <p className="text-blue-100 text-sm font-medium">Your AI assistant</p>
            </div>
          </div>
        </header>
        {/* Main chat area */}
        <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
      </div>
    </div>
  );
}