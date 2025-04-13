"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLinkActive = (path: string) => {
    return pathname === path;
  };

  const links = [
    { path: "/", label: "Dashboard" },
    { path: "/projects", label: "Projects" },
    { path: "/submit", label: "Submit Video" },
    {
      path: "https://github.com/BrianElionDev/Loomify",
      label: "GitHub",
      external: true,
    },
  ];

  return (
    <header className="py-3 sm:py-4 px-4 sm:px-6 backdrop-blur-lg bg-slate-900/80 border-b border-slate-800/50 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-white flex items-center space-x-2 group">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg relative group-hover:shadow-indigo-500/30 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 opacity-75 blur-md rounded-xl -z-10 group-hover:opacity-100 transition-opacity"></div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 sm:h-5 sm:w-5 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
          </motion.div>
          <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white via-white to-indigo-200 text-transparent bg-clip-text">
            Loomify
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2">
          {links.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className={`px-4 py-2 text-white/90 rounded-lg transition-all duration-300 text-sm font-medium relative overflow-hidden ${
                isLinkActive(link.path)
                  ? "bg-white/10 text-white"
                  : "hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="relative z-10">{link.label}</span>
              {isLinkActive(link.path) && (
                <motion.span
                  layoutId="activeNavIndicator"
                  className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 -z-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden flex items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden"
          >
            <div className="px-2 py-3 space-y-1">
              {links.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  onClick={() => {
                    if (!link.external) {
                      // For internal links: delay closing the menu until after navigation
                      setTimeout(() => {
                        setMobileMenuOpen(false);
                      }, 150);
                    } else {
                      // For external links: close immediately
                      setMobileMenuOpen(false);
                    }
                  }}
                  className={`block px-4 py-3 rounded-lg text-white/90 transition-all duration-300 text-sm font-medium ${
                    isLinkActive(link.path)
                      ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white"
                      : "hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
