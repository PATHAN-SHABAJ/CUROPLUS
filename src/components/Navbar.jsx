import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HeartHandshake, Hospital, UserCheck, Sparkles, MapPin, AlertTriangle } from 'lucide-react';

export default function Navbar({ selectedCity, setSelectedCity, onOpenEmergency }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-teal-100 shadow-xs">
      {/* Top emergency announcement bar */}
      <div className="bg-gradient-to-r from-teal-800 to-teal-700 text-white text-xs sm:text-sm py-1.5 px-4 flex justify-between items-center">
        <div className="flex items-center gap-2 container mx-auto">
          <span className="bg-amber-400 text-slate-900 font-bold px-2 py-0.5 rounded-full text-xs uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 inline" /> Emergency Advice
          </span>
          <span className="truncate">
            For medical emergencies (severe chest pain, breathing difficulty, heavy bleeding), call <strong>108 / 102</strong> immediately.
          </span>
        </div>
        <button 
          onClick={onOpenEmergency}
          aria-label="View emergency numbers"
          className="text-teal-100 hover:text-white underline text-xs font-semibold whitespace-nowrap ml-2 cursor-pointer"
        >
          Emergency Help
        </button>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo & Tagline */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-md shadow-teal-700/20 group-hover:scale-105 transition-transform">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight font-['Outfit']">
                CURO<span className="text-teal-700">PLUS</span>
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 hidden sm:block">
              Right Hospital. Right Doctor. Right Time.
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/"
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
              isActive('/') 
                ? 'bg-teal-50 text-teal-800 font-bold' 
                : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50'
            }`}
          >
            Home
          </Link>
          <Link
            to="/hospitals"
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors ${
              isActive('/hospitals') 
                ? 'bg-teal-50 text-teal-800 font-bold' 
                : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50'
            }`}
          >
            <Hospital className="w-4 h-4" />
            Hospitals
          </Link>
          <Link
            to="/doctors"
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors ${
              isActive('/doctors') 
                ? 'bg-teal-50 text-teal-800 font-bold' 
                : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Doctors
          </Link>
          <Link
            to="/ai-guide"
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors ${
              isActive('/ai-guide') 
                ? 'bg-gradient-to-r from-teal-700 to-cyan-700 text-white shadow-xs' 
                : 'text-teal-700 hover:bg-teal-50 border border-teal-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            AI Symptom Guide
          </Link>
          <Link
            to="/about"
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors ${
              isActive('/about') 
                ? 'bg-teal-50 text-teal-800 font-bold' 
                : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50'
            }`}
          >
            About
          </Link>
        </nav>

        {/* City Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 hover:bg-teal-50 border border-slate-200 rounded-xl p-1 transition-colors">
            <MapPin className="w-4 h-4 text-teal-700 ml-2 mr-1" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              aria-label="Select City"
              className="bg-transparent text-xs sm:text-sm font-bold text-slate-800 pr-3 py-1 cursor-pointer focus:outline-hidden"
            >
              <option value="All">All Cities</option>
              <option value="Nandyal">Nandyal</option>
              <option value="Kurnool">Kurnool</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile bottom nav bar */}
      <div className="md:hidden flex items-center justify-around bg-white border-t border-slate-200 py-2 px-2 text-xs font-semibold text-slate-600">
        <Link to="/" className={`flex flex-col items-center gap-0.5 ${isActive('/') ? 'text-teal-700 font-bold' : ''}`}>
          <span>Home</span>
        </Link>
        <Link to="/hospitals" className={`flex flex-col items-center gap-0.5 ${isActive('/hospitals') ? 'text-teal-700 font-bold' : ''}`}>
          <span>Hospitals</span>
        </Link>
        <Link to="/doctors" className={`flex flex-col items-center gap-0.5 ${isActive('/doctors') ? 'text-teal-700 font-bold' : ''}`}>
          <span>Doctors</span>
        </Link>
        <Link to="/ai-guide" className={`flex flex-col items-center gap-0.5 ${isActive('/ai-guide') ? 'text-teal-700 font-bold' : ''}`}>
          <span className="text-teal-700 font-bold">AI Guide</span>
        </Link>
        <Link to="/about" className={`flex flex-col items-center gap-0.5 ${isActive('/about') ? 'text-teal-700 font-bold' : ''}`}>
          <span>About</span>
        </Link>
      </div>
    </header>
  );
}
