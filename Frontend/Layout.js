import React from "react";
import { motion } from "framer-motion";

function Sidebar() {
  return (
    <aside className="h-screen w-64 bg-gradient-to-b from-blue-700 to-blue-900 text-blue-100 flex flex-col border-r border-blue-800/40 shadow-xl">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-blue-800/40">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-xl">R</span>
        </div>
        <span className="text-2xl font-extrabold tracking-tight text-blue-100">ronna</span>
      </div>
      <button className="mx-4 my-6 flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-800 hover:bg-blue-700 transition font-semibold text-blue-100 shadow">
        <span className="text-lg">＋</span> New chat
      </button>
      <div className="flex-1 overflow-y-auto px-4">
        <div className="text-blue-200/70 text-sm mt-2">(Chat history here)</div>
      </div>
      <div className="px-6 py-4 border-t border-blue-800/40 text-xs text-blue-200/60">Ronna.ai &copy; 2024</div>
    </aside>
  );
}

export default function Layout({ children }) {
  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900">
        <div className="w-full max-w-2xl h-[90vh] min-h-[600px] flex flex-col rounded-2xl shadow-2xl border border-transparent bg-transparent overflow-hidden mt-8 mb-8">
          {children}
        </div>
      </main>
    </div>
  );
}