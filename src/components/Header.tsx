"use client";

import React from "react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="py-4 px-6 backdrop-blur-lg bg-slate-900/60 border-b border-slate-800/50 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between">
        <Link
          href="/"
          className="text-white flex items-center space-x-2 mb-4 sm:mb-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
          </div>
          <span className="text-xl font-bold">Loomify</span>
        </Link>

        <nav className="flex items-center space-x-1 sm:space-x-3">
          <Link
            href="/"
            className="px-4 py-2 text-white/90 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium"
          >
            Dashboard
          </Link>
          <Link
            href="/submit"
            className="px-4 py-2 text-white/90 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium"
          >
            Submit Video
          </Link>
          <Link
            href="https://github.com/BrianElionDev/Loomify"
            target="_blank"
            className="px-4 py-2 text-white/90 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium"
          >
            GitHub
          </Link>
        </nav>
      </div>
    </header>
  );
}
